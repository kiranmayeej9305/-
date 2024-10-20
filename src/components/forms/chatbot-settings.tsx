'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import {
  saveActivityLogsNotification,
  upsertAndFetchChatbotData,
  deleteChatbot,
} from '@/lib/queries';
import Loading from '@/components/global/loading';
import { useModal } from '@/providers/modal-provider';
import { Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Account, Chatbot } from '@prisma/client';

// Add this interface
interface ChatbotWithSettings extends Chatbot {
  ChatbotSettings?: {
    welcomeMessage?: string;
    aiModelId?: string;
    chatbotTypeId?: string;
    knowledgeSources?: string;
    creativityLevel?: number;
    customPrompts?: string;
  };
}

interface ChatbotSettingsProps {
  accountDetails: Account;
  details?: Partial<ChatbotWithSettings>;
  userId: string;
  userName: string;
}

const ChatbotSettings: React.FC<ChatbotSettingsProps> = ({
  details,
  accountDetails,
  userId,
  userName,
}) => {
  const { toast } = useToast();
  const { setClose } = useModal();
  const [deletingChatbot, setDeletingChatbot] = useState(false);
  const router = useRouter();

  const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: details?.name || '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const chatbotId = details.id;

      const fullChatbotData = await upsertAndFetchChatbotData(
        {
          id: chatbotId,
          name: values.name,
          createdAt: details.createdAt,
          updatedAt: new Date(),
          accountId: accountDetails.id,
          connectAccountId: '',
          goal: 5000,
        },
        {
          welcomeMessage: details?.ChatbotSettings?.welcomeMessage || '',
          aiModelId: details?.ChatbotSettings?.aiModelId || '',
          chatbotTypeId: details?.ChatbotSettings?.chatbotTypeId || '',
          knowledgeSources: details?.ChatbotSettings?.knowledgeSources || 'both',
          creativityLevel: details?.ChatbotSettings?.creativityLevel || 0.5,
          customPrompts: details?.ChatbotSettings?.customPrompts || '',
          createdAt: details.createdAt,
          updatedAt: new Date(),
        },
        false
      );

      await saveActivityLogsNotification({
        accountId: fullChatbotData.accountId,
        description: `${userName} | updated chatbot | ${fullChatbotData.name}`,
        chatbotId: fullChatbotData.id,
      });

      toast({
        title: 'Chatbot details saved',
        description: 'Successfully saved your Chatbot details.',
      });

      setClose();
      router.refresh();
    } catch (error) {
      console.log('🔴 Error in onSubmit:', error);
      toast({
        variant: 'destructive',
        title: 'Oops!',
        description: 'Could not save chatbot details.',
      });
    }
  }

  const handleDeleteChatbot = async () => {
    if (!details?.id) return;
    setDeletingChatbot(true);
    try {
      await deleteChatbot(details.id);
      toast({
        title: 'Deleted Chatbot',
        description: 'Deleted your chatbot and all related data.',
      });
      router.refresh();
    } catch (error) {
      console.log('Error during chatbot deletion:', error);
      toast({
        variant: 'destructive',
        title: 'Oops!',
        description: 'Could not delete your chatbot.',
      });
    }
    setDeletingChatbot(false);
  };

  const isLoading = form.formState.isSubmitting;

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-3xl p-8 my-10 bg-white rounded-lg shadow-lg">
        <Card className="w-full">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-2xl font-semibold">Update Chatbot Information</CardTitle>
            <CardDescription>Please update the chatbot information below.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Chatbot Name</FormLabel>
                      <FormControl>
                        <Input required placeholder="Your chatbot name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? <Loading /> : 'Save Chatbot Information'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Separate Delete Chatbot Card */}
        {details?.id && (
          <Card className="w-full mt-10 border-red-300">
            <CardHeader className="bg-red-50 text-red-700 border-b border-red-300 pb-4">
              <CardTitle className="text-2xl font-semibold">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col items-start space-y-4">
                <p className="text-gray-600">
                  Deleting your chatbot is a permanent action and cannot be undone.
                  All data related to this chatbot will be lost.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={deletingChatbot}>
                      {deletingChatbot ? 'Deleting...' : 'Delete Chatbot'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your
                        chatbot and all related data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        disabled={deletingChatbot}
                        className="bg-red-600 hover:bg-red-700"
                        onClick={handleDeleteChatbot}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ChatbotSettings;

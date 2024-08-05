'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { v4 } from 'uuid';
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
import { Textarea } from '@/components/ui/textarea';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import {
  saveActivityLogsNotification,
  upsertAndFetchChatbotData,
  getAIModels,
  getChatbotTypes,
  getDefaultPromptByChatbotTypeId,
} from '@/lib/queries';
import Loading from '@/components/global/loading';
import { useModal } from '@/providers/modal-provider';

const formSchema = z.object({
  name: z.string().nonempty(),
  welcomeMessage: z.string().nonempty(),
  aiModelId: z.string().nonempty(),
  chatbotTypeId: z.string().nonempty(),
  knowledgeSources: z.enum(['training', 'generic', 'both']),
  creativityLevel: z.number().min(0).max(1),
  customPrompts: z.string().optional(),
});

interface ChatbotDetailsProps {
  accountDetails: Account;
  details?: Partial<Chatbot>;
  userId: string;
  userName: string;
}

const ChatbotDetails: React.FC<ChatbotDetailsProps> = ({
  details,
  accountDetails,
  userId,
  userName,
}) => {
  const { toast } = useToast();
  const { setClose } = useModal();
  const [aiModels, setAiModels] = useState([]);
  const [chatbotTypes, setChatbotTypes] = useState([]);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: details?.name || '',
      welcomeMessage: details?.welcomeMessage || '',
      aiModelId: details?.aiModelId || '',
      chatbotTypeId: details?.chatbotTypeId || '',
      knowledgeSources: 'both',
      creativityLevel: 0.5,
      customPrompts: details?.customPrompts || '',
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      const aiModelData = await getAIModels();
      const chatbotTypeData = await getChatbotTypes();
      setAiModels(aiModelData);
      setChatbotTypes(chatbotTypeData);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchDefaultPrompt = async () => {
      const selectedChatbotTypeId = form.watch('chatbotTypeId');
      if (selectedChatbotTypeId) {
        const defaultPrompt = await getDefaultPromptByChatbotTypeId(selectedChatbotTypeId);
        if (defaultPrompt) {
          form.setValue('customPrompts', defaultPrompt);
        }
      }
    };
    fetchDefaultPrompt();
  }, [form.watch('chatbotTypeId')]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const chatbotId = details?.id || v4();
      console.log('Submitting with chatbot ID:', chatbotId);

      const fullChatbotData = await upsertAndFetchChatbotData(
        {
          id: chatbotId,
          name: values.name,
          createdAt: new Date(),
          updatedAt: new Date(),
          accountId: accountDetails.id,
          connectAccountId: '',
          goal: 5000,
        },
        {
          welcomeMessage: values.welcomeMessage,
          aiModelId: values.aiModelId,
          chatbotTypeId: values.chatbotTypeId,
          knowledgeSources: values.knowledgeSources,
          creativityLevel: values.creativityLevel,
          customPrompts: values.customPrompts,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      );

      console.log('Full Chatbot Data:', fullChatbotData);

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

  const isLoading = form.formState.isSubmitting;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Let's start by creating a custom chatbot!</CardTitle>
        <CardDescription>Please enter business details</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            <FormField
              control={form.control}
              name="welcomeMessage"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Welcome Message</FormLabel>
                  <FormControl>
                    <Input required placeholder="Welcome message" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="aiModelId"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>AI Model</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select AI Model" />
                      </SelectTrigger>
                      <SelectContent>
                        {aiModels.map((model) => (
                          <SelectItem key={model.id} value={model.id}>
                            {model.name} - {model.provider}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="chatbotTypeId"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Chatbot Type</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Chatbot Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {chatbotTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="knowledgeSources"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Knowledge Sources</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Knowledge Source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="training">Training Only</SelectItem>
                        <SelectItem value="generic">Generic AI Knowledge</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="creativityLevel"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Creativity Level</FormLabel>
                  <FormControl>
                    <Input type="range" min="0" max="1" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="customPrompts"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Custom Prompts</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Custom Prompts" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loading /> : 'Save Chatbot Information'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ChatbotDetails;

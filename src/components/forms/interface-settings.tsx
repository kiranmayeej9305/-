'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import FileUpload from '@/components/global/file-upload';
import { upsertInterfaceSettings, getInterfaceSettings } from '@/lib/queries';
import { v4 } from 'uuid';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import Loading from '../global/loading';
import ChatBubblePreview from './preview/chat-bubble-preview';
import Preview from './preview/preview';

const interfaceSchema = z.object({
  id: z.string().optional(),
  icon: z.string().optional(),
  userAvatar: z.string().optional(),
  chatbotAvatar: z.string().optional(),
  chatIcon: z.string().optional(),
  background: z.string().optional(),
  userMsgBackgroundColour: z.string().optional(),
  chatbotMsgBackgroundColour: z.string().optional(),
  userTextColor: z.string().optional(),
  chatbotTextColor: z.string().optional(),
  helpdesk: z.boolean().default(false),
  copyRightMessage: z.string().optional().refine(val => {
    return val?.split('|').length === 3;
  }, "Format must be: Text | Link Text | Link URL"),
  footerText: z.string().optional().refine(val => {
    return val?.split('|').length === 3;
  }, "Format must be: Text | Link Text | Link URL"),
  messagePlaceholder: z.string().optional(),
  suggestedMessage: z.string().optional(),
  themeColor: z.string().optional(),
  botDisplayName: z.string().optional(),
  botDisplayNameColor: z.string().optional(), // New field for bot display name color
  chatBubbleButtonColor: z.string().optional(),
  helpdeskLiveAgentColor: z.string().optional(),
  chatbotId: z.string(),
  isLiveAgentEnabled: z.boolean().optional(),
});

export type InterfaceForm = z.infer<typeof interfaceSchema>;

type Props = {
  chatbotId: string;
};

const InterfaceSettings = ({ chatbotId }: Props) => {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const form = useForm<InterfaceForm>({
    resolver: zodResolver(interfaceSchema),
    defaultValues: {
      id: '',
      icon: '',
      userAvatar: '',
      chatbotAvatar: '',
      chatIcon: '',
      background: '#ffffff',
      userMsgBackgroundColour: '#ffffff',
      chatbotMsgBackgroundColour: '#f0f0f0',
      userTextColor: '#000000',
      chatbotTextColor: '#000000',
      botDisplayNameColor: '#000000', // Default value for bot display name color
      helpdesk: false,
      copyRightMessage: '',
      footerText: '',
      messagePlaceholder: '',
      suggestedMessage: '',
      themeColor: '#3b82f6',
      botDisplayName: 'Chatbot',
      chatBubbleButtonColor: '#3b82f6',
      helpdeskLiveAgentColor: '#ff0000',
      chatbotId: chatbotId,
      isLiveAgentEnabled: false,
    },
  });

  // Fetch existing settings from the database
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await getInterfaceSettings(chatbotId);
        if (settings) {
          form.reset({ ...settings });
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load settings.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [chatbotId, form, toast]);

  const onSubmit = async (values: InterfaceForm) => {
    try {
      await upsertInterfaceSettings({
        ...values,
        id: values.id || v4(),
      });
      toast({
        title: 'Success',
        description: 'Settings saved successfully',
      });
      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed',
        description: 'Error saving settings',
      });
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-7xl p-4 md:p-8 my-4 md:my-10 bg-white rounded-lg shadow-lg">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-8">
          <Card className="shadow-md border border-gray-200">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-lg md:text-xl font-semibold">Chatbot Interface Settings</CardTitle>
              <CardDescription className="text-gray-500">
                Customize the appearance and settings of your chatbot interface.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    <FormField
                      control={form.control}
                      name="botDisplayName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bot Display Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter bot display name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormItem className="flex items-center">
                      <FormLabel className="mr-2">Live Agent</FormLabel>
                      <FormField
                        control={form.control}
                        name="isLiveAgentEnabled"
                        render={({ field }) => (
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        )}
                      />
                    </FormItem>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="themeColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Theme Color</FormLabel>
                          <FormControl>
                            <Input type="color" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="chatBubbleButtonColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Chat Bubble Button Color</FormLabel>
                          <FormControl>
                            <Input type="color" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="background"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Background Color</FormLabel>
                          <FormControl>
                            <Input type="color" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="userMsgBackgroundColour"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>User Message Background</FormLabel>
                          <FormControl>
                            <Input type="color" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="chatbotMsgBackgroundColour"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Chatbot Message Background</FormLabel>
                          <FormControl>
                            <Input type="color" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="botDisplayNameColor" // New color picker for bot display name
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bot Display Name Color</FormLabel>
                          <FormControl>
                            <Input type="color" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="userTextColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>User Text Color</FormLabel>
                          <FormControl>
                            <Input type="color" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="chatbotTextColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Chatbot Text Color</FormLabel>
                          <FormControl>
                            <Input type="color" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="suggestedMessage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Suggested Message</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter suggested message" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="messagePlaceholder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message Placeholder</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Type your message..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="footerText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Footer Text</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter footer text in format: By chatting, you agree to our | Privacy Policy | https://example.com/privacy-policy" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="copyRightMessage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Copyright Message</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter copyright message in format: Powered By | Your Company | https://example.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* File Uploads in a responsive layout */}
                  <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4">
                    <FormField
                      control={form.control}
                      name="userAvatar"
                      render={({ field }) => (
                        <FormItem className="flex-1 min-w-[100px] sm:min-w-[120px]">
                          <FormLabel>User Avatar</FormLabel>
                          <FormControl>
                            <FileUpload
                              apiEndpoint="avatar"
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="chatbotAvatar"
                      render={({ field }) => (
                        <FormItem className="flex-1 min-w-[100px] sm:min-w-[120px]">
                          <FormLabel>Chatbot Avatar</FormLabel>
                          <FormControl>
                            <FileUpload
                              apiEndpoint="avatar"
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="chatIcon"
                      render={({ field }) => (
                        <FormItem className="flex-1 min-w-[100px] sm:min-w-[120px]">
                          <FormLabel>Chat Icon</FormLabel>
                          <FormControl>
                            <FileUpload
                              apiEndpoint="avatar"
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      disabled={form.formState.isSubmitting}
                      type="submit"
                      className="mt-4"
                    >
                      {form.formState.isSubmitting ? <Loading /> : 'Save Settings'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card className="shadow-md border border-gray-200">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-lg md:text-xl font-semibold">Chatbot Preview</CardTitle>
              <CardDescription className="text-gray-500">
                See how your chatbot will look for users based on your settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <Preview settings={form.watch()} />
              <div className="flex justify-end mt-4">
                <ChatBubblePreview color={form.watch('chatBubbleButtonColor')} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InterfaceSettings;

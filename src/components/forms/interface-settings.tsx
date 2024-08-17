'use client';

import React from 'react';
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
import { upsertInterfaceSettings } from '@/lib/queries';
import { v4 } from 'uuid';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import Loading from '../global/loading';

const interfaceSchema = z.object({
  id: z.string().optional(),
  icon: z.string().optional(),
  userAvtar: z.string().optional(),
  chatbotAvtar: z.string().optional(),
  background: z.string().optional(),
  textColor: z.string().optional(),
  userMsgBackGroundColour: z.string().optional(),
  chatbotMsgBackGroundColour: z.string().optional(),
  helpdesk: z.boolean().default(false),
  copyRightMessage: z.string().optional(),
  chatbotId: z.string(),
});

type InterfaceForm = z.infer<typeof interfaceSchema>;

type Props = {
  data: InterfaceForm;
  chatbotId: string;
};

const InterfaceSettings = ({ data, chatbotId }: Props) => {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<InterfaceForm>({
    resolver: zodResolver(interfaceSchema),
    defaultValues: { ...data, chatbotId },
  });

  const onSubmit = async (values: InterfaceForm) => {
    try {
      const settingsResponse = await upsertInterfaceSettings({
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

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-3xl p-8 my-10 bg-white rounded-lg shadow-lg">
    <Card className="w-full lg:max-w-4xl mx-auto shadow-md border border-gray-200">
      <CardHeader className="border-b pb-4">
        <CardTitle className="text-xl font-semibold">Chatbot Interface Settings</CardTitle>
        <CardDescription className="text-gray-500">
          Customize the appearance and settings of your chatbot interface.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
      <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon</FormLabel>
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
              name="userAvtar"
              render={({ field }) => (
                <FormItem>
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
              name="chatbotAvtar"
              render={({ field }) => (
                <FormItem>
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
              name="background"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Background</FormLabel>
                  <FormControl>
                    <Input type="color" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="textColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Text Color</FormLabel>
                  <FormControl>
                    <Input type="color" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="userMsgBackGroundColour"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User Message Background Color</FormLabel>
                  <FormControl>
                    <Input type="color" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="chatbotMsgBackGroundColour"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chatbot Message Background Color</FormLabel>
                  <FormControl>
                    <Input type="color" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="helpdesk"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Helpdesk</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
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
                    <Input {...field} placeholder="Enter copyright message" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
    </div>
    </div>
  );
};

export default InterfaceSettings;

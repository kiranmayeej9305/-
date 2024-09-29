'use client';

import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
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
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { getChatbotTypes, getDefaultPromptByChatbotTypeId, upsertAndFetchChatbotData } from '@/lib/queries';
import Loading from '@/components/global/loading';
import { useModal } from '@/providers/modal-provider';
import { useQuantitativeFeature } from '@/context/use-quantitative-feature-context'; // Importing the quantitative feature context for usage tracking
import { usePlanAddOn } from '@/context/use-plan-addon-context'; // Importing plan context

const formSchema = z.object({
  name: z.string().nonempty(),
  chatbotTypeId: z.string().nonempty(),
  customPrompts: z.string().optional(),
});

interface ChatbotCreateProps {
  accountId: string;
  userId: string;
  userName: string;
}

const ChatbotCreate: React.FC<ChatbotCreateProps> = ({ accountId, userId, userName }) => {
  const { toast } = useToast();
  const { setClose } = useModal();
  const [chatbotTypes, setChatbotTypes] = useState([]);
  const [defaultPrompt, setDefaultPrompt] = useState('');
  const [showCustomPrompts, setShowCustomPrompts] = useState(false);
  const router = useRouter();
  const { plan } = usePlanAddOn(); // Get the current plan details
  const { incrementFeatureUsage, checkLimitExceeded } = useQuantitativeFeature(); // Import context

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      chatbotTypeId: '',
      customPrompts: '',
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      const chatbotTypeData = await getChatbotTypes();
      setChatbotTypes(chatbotTypeData);
    };
    fetchData();
  }, []);

  const handleChatbotTypeChange = async (value: string) => {
    form.setValue('chatbotTypeId', value);
    const selectedType = chatbotTypes.find(type => type.id === value);
    const isCustom = selectedType?.name === 'Custom';
    setShowCustomPrompts(isCustom);

    if (!isCustom) {
      const defaultPrompt = await getDefaultPromptByChatbotTypeId(value);
      setDefaultPrompt(defaultPrompt || 'Default Prompt');
      form.setValue('customPrompts', defaultPrompt || 'Default Prompt');
    } else {
      setDefaultPrompt('Default Prompt for Custom');
      form.setValue('customPrompts', '');
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const chatbotId = uuidv4(); // Generate a new ID for the chatbot
      console.log(plan);
      // Find the planFeatureId for 'chatbots' from the current plan
      const chatbotPlanFeature = plan.features.find((feature: any) => feature.identifier === 'chatbots');

      if (!chatbotPlanFeature) {
        throw new Error('Chatbot feature not found in the current plan');
      }

      // Check if the limit is exceeded
      const limitExceeded = await checkLimitExceeded(chatbotPlanFeature.planFeatureId, 'account', accountId);
      if (limitExceeded) {
        toast({
          variant: 'destructive',
          title: 'Chatbot Limit Reached',
          description: 'You have reached the maximum number of chatbots allowed under your current plan. To create more chatbots, please consider upgrading your plan for additional features and capabilities.',
        });        
        return;
      }

      const fullChatbotData = await upsertAndFetchChatbotData(
        {
          id: chatbotId,
          name: values.name,
          createdAt: new Date(),
          updatedAt: new Date(),
          accountId,
          connectAccountId: '',
          goal: 5000,
        },
        {
          welcomeMessage: 'Welcome to our chatbot!',
          aiModelId: "1", // Adjust this as needed
          chatbotTypeId: values.chatbotTypeId,
          knowledgeSources: 'both',
          creativityLevel: 0.5,
          customPrompts: values.customPrompts || defaultPrompt, // Insert default prompt if not provided
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        true // Flag indicating creation
      );

      // Increment chatbot usage after successful creation
      await incrementFeatureUsage(chatbotPlanFeature.planFeatureId, 'account', accountId);

      toast({
        title: 'Chatbot created',
        description: 'Successfully created your Chatbot.',
      });

      setClose();
      router.refresh();
    } catch (error) {
      console.error('Error creating chatbot:', error);
      toast({
        variant: 'destructive',
        title: 'Oops!',
        description: 'Could not create chatbot.',
      });
    }
  }

  const isLoading = form.formState.isSubmitting;

  return (
    <Card className="w-full">
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
              name="chatbotTypeId"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Chatbot Type</FormLabel>
                  <FormControl>
                    <Select onValueChange={handleChatbotTypeChange} value={field.value}>
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
            {showCustomPrompts && (
              <FormField
                control={form.control}
                name="customPrompts"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Custom Prompts</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide specific instructions for the chatbot to follow. E.g., 'Greet users with their first name and offer assistance with their queries.'"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loading /> : 'Create Chatbot'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ChatbotCreate;

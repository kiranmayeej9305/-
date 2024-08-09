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
  getFilteredQuestions,
  saveFilteredQuestions,
} from '@/lib/queries';
import Loading from '@/components/global/loading';
import { useModal } from '@/providers/modal-provider';
import { Plus, Trash2 } from 'lucide-react';

const formSchema = z.object({
  name: z.string().nonempty(),
  welcomeMessage: z.string().optional(),
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
  const [defaultPrompt, setDefaultPrompt] = useState('');
  const [filteredQuestions, setFilteredQuestions] = useState([{ question: '' }]);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: details?.name || '',
      welcomeMessage: details?.ChatbotSettings?.welcomeMessage || '',
      aiModelId: details?.ChatbotSettings?.aiModelId || '',
      chatbotTypeId: details?.ChatbotSettings?.chatbotTypeId || '',
      knowledgeSources: details?.ChatbotSettings?.knowledgeSources || 'both',
      creativityLevel: details?.ChatbotSettings?.creativityLevel || 0.5,
      customPrompts: details?.ChatbotSettings?.customPrompts || '',
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      const aiModelData = await getAIModels();
      const chatbotTypeData = await getChatbotTypes();
      setAiModels(aiModelData);
      setChatbotTypes(chatbotTypeData);

      if (details?.id) {
        const questions = await getFilteredQuestions(details.id);
        setFilteredQuestions(questions.length ? questions : [{ question: '' }]);
      }
    };
    fetchData();
  }, [details?.id]);

  const handleChatbotTypeChange = async (value: string) => {
    form.setValue('chatbotTypeId', value);
    const selectedChatbotType = chatbotTypes.find((type) => type.id === value);

    if (value === details?.ChatbotSettings?.chatbotTypeId) {
      form.setValue('customPrompts', details?.ChatbotSettings?.customPrompts || '');
    } else {
      if (selectedChatbotType?.name !== 'Custom') {
        const defaultPrompt = await getDefaultPromptByChatbotTypeId(value);
        setDefaultPrompt(defaultPrompt || 'Default Prompt');
        form.setValue('customPrompts', defaultPrompt || 'Default Prompt');
      } else {
        setDefaultPrompt('Default Prompt for Custom');
        form.setValue('customPrompts', '');
      }
    }
  };

  const handleQuestionChange = (e, index) => {
    const newQuestions = [...filteredQuestions];
    newQuestions[index].question = e.target.value;
    setFilteredQuestions(newQuestions);
  };

  const handleAddQuestion = () => {
    setFilteredQuestions([...filteredQuestions, { question: '' }]);
  };

  const handleRemoveQuestion = (index) => {
    const newQuestions = filteredQuestions.filter((_, i) => i !== index);
    setFilteredQuestions(newQuestions);
  };

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
          welcomeMessage: values.welcomeMessage,
          aiModelId: values.aiModelId,
          chatbotTypeId: values.chatbotTypeId,
          knowledgeSources: values.knowledgeSources,
          creativityLevel: values.creativityLevel,
          customPrompts: values.customPrompts || defaultPrompt,
          createdAt: details.createdAt,
          updatedAt: new Date(),
        },
        false
      );

      await saveFilteredQuestions(chatbotId, filteredQuestions);

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
        <CardTitle>Update Chatbot Details</CardTitle>
        <CardDescription>Please update the chatbot details</CardDescription>
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
                    <Input placeholder="Welcome message" {...field} />
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
                        {Array.isArray(aiModels) &&
                          aiModels.map((model) => (
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
                    <Select onValueChange={handleChatbotTypeChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Chatbot Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(chatbotTypes) &&
                          chatbotTypes.map((type) => (
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
                    <Textarea
                      placeholder="Provide specific instructions for the chatbot to follow. E.g., 'Greet users with their first name and offer assistance with their queries.'"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-4">
              <FormLabel>Filtered Questions</FormLabel>
              {filteredQuestions.map((question, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={question.question}
                    onChange={(e) => handleQuestionChange(e, index)}
                    placeholder={`Question ${index + 1}`}
                  />
                  <Button
                    onClick={() => handleRemoveQuestion(index)}
                    variant="ghost"
                    type="button"
                    size="icon"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button onClick={handleAddQuestion} variant="outline" type="button">
                <Plus className="h-4 w-4" />
                Add Question
              </Button>
            </div>
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

// src/app/(main)/chatbot/[chatbotId]/support/support-form.tsx
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

export default function SupportForm({ userEmail, chatbotData, accountData }: { userEmail: string, chatbotData: any, accountData: any }) {
  const [email, setEmail] = useState(userEmail || '');
  const [relatedAccount, setRelatedAccount] = useState(accountData?.name || '');
  const [relatedChatbot, setRelatedChatbot] = useState(chatbotData?.name || '');
  const [selectedProblem, setSelectedProblem] = useState('General Inquiries');
  const [selectedSeverity, setSelectedSeverity] = useState('Low');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description) {
      toast({
        title: 'Error',
        description: 'Please include a description before submitting your request.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch('/api/send-support-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          relatedAccount: relatedAccount.trim(),
          relatedChatbot: relatedChatbot.trim(),
          selectedProblem,
          selectedSeverity,
          subject: subject.trim(),
          description: description.trim(),
        }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Your support request has been submitted successfully.',
        });
        setEmail(userEmail || '');
        setRelatedAccount(accountData?.name || '');
        setRelatedChatbot(chatbotData?.name || '');
        setSelectedProblem('General Inquiries');
        setSelectedSeverity('Low');
        setSubject('');
        setDescription('');
      } else {
        toast({
          title: 'Error',
          description: 'There was an error submitting your request. Please try again later.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'There was an error submitting your request. Please try again later.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 dark:bg-black p-8 sm:p-6">
      <div className="w-full max-w-xl">
        <Card className="w-full p-8 sm:p-8 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-xl font-semibold">
              Submit a case to our support team.
            </CardTitle>
            <CardDescription className="text-sm">
              Please fill out the form below to submit your request. Our support team will get back to you as soon as possible.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="email" className="text-sm">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="border-gray-300 text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="relatedAccount" className="text-sm">Related Account</Label>
                <Input
                  id="relatedAccount"
                  value={relatedAccount}
                  disabled
                  className="border-gray-300 text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="relatedChatbot" className="text-sm">Related Chatbots</Label>
                <Input
                  id="relatedChatbot"
                  value={relatedChatbot}
                  disabled
                  className="border-gray-300 text-sm"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 space-y-1">
                  <Label htmlFor="selectedProblem" className="text-sm">Selected Problem</Label>
                  <Select onValueChange={(value) => setSelectedProblem(value)}>
                    <SelectTrigger id="selectedProblem" className="border-gray-300 text-sm">
                      <SelectValue placeholder="Select a problem..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General Inquiries">General Inquiries</SelectItem>
                      <SelectItem value="Technical Issues">Technical Issues</SelectItem>
                      <SelectItem value="Billing Questions">Billing Questions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 space-y-1">
                  <Label htmlFor="selectedSeverity" className="text-sm">Selected Severity</Label>
                  <Select onValueChange={(value) => setSelectedSeverity(value)}>
                    <SelectTrigger id="selectedSeverity" className="border-gray-300 text-sm">
                      <SelectValue placeholder="Select severity..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="subject" className="text-sm">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Enter the subject of your request"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="border-gray-300 text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="description" className="text-sm">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Please include all information relevant to your issue."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="border-gray-300 h-32 text-sm"
                />
              </div>

              <CardFooter className="flex justify-end">
                <Button type="submit" className="bg-black text-white hover:bg-gray-800 text-sm">
                  Submit
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

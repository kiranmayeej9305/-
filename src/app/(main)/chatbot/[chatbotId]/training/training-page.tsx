'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TextForm from '@/components/forms/text-form';
import FileForm from '@/components/forms/file-form';
import QAForm from '@/components/forms/qa-form';
import WebsiteForm from '@/components/forms/website-form';
import TrainingHistory from '@/components/forms/training-history-form';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { FileTextIcon, FileIcon, MessageSquare, GlobeIcon } from 'lucide-react';
import { useTrainingContext } from '@/context/use-training-context';
import { trainChatbot } from '@/lib/train-chatbot';
import { getChatbotTrainingsByType } from '@/lib/queries';
import { uploadToS3 } from '@/lib/s3-upload';
import { toast } from 'react-hot-toast';

const TrainingPage = ({ params }) => {
  const { chatbotId } = params;
  const router = useRouter();
  const { trainData, setTrainData, summary, setSummary, valid, setValid } = useTrainingContext();
  const [selectedTab, setSelectedTab] = useState('text');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const data = await getChatbotTrainingsByType(chatbotId, selectedTab);
      setHistory(data);
    };
    fetchHistory();
  }, [chatbotId, selectedTab]);

  const handleTrain = async () => {
    const activeData = trainData[0]; // Assuming trainData is an array with one item.

    console.log("Training data being sent:", activeData);

    if (activeData && activeData.type === 'file' && activeData.content) {
      const file = activeData.content;
      const uploadResult = await uploadToS3(file, file.name); // upload the file to S3

      if (uploadResult?.file_key && uploadResult.file_name) {
        activeData.content = uploadResult.file_key; // use the S3 key as content
        toast.success("File uploaded successfully");
      } else {
        toast.error("Failed to upload file");
        return;
      }
    }

    try {
      await trainChatbot(chatbotId, activeData); // send the S3 key to the server
      router.refresh();
    } catch (error) {
      console.error("Error in trainChatbot:", error.response?.data || error.message);
      toast.error("Failed to train chatbot");
    }
  };

  const handleFormChange = (data, type) => {
    const isValid = data.length > 0;
    setValid(isValid);

    setTrainData((prevData) => {
      const newData = prevData.filter((d) => d.type !== type);
      return [...newData, { content: data, type }];
    });

    setSummary((prevSummary) => {
      const updatedSummary = { ...prevSummary };
      updatedSummary[type] = { count: data.content ? 1 : 0 };
      return updatedSummary;
    });
  };

  useEffect(() => {
    setTrainData([]);
    setValid(false);
  }, [selectedTab]);

  return (
          <CardHeader className="border-b pb-4">
          <CardTitle>Train your chatbot</CardTitle>
          <CardDescription>Train your chatbot from different sources</CardDescription>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-2/3">
            <Tabs defaultValue="text" className="w-full">
              <TabsList className="grid grid-cols-4 gap-4">
                <TabsTrigger value="text" onClick={() => setSelectedTab('text')}>
                  <FileTextIcon className="mr-2 h-5 w-5" />Text
                </TabsTrigger>
                <TabsTrigger value="file" onClick={() => setSelectedTab('file')}>
                  <FileIcon className="mr-2 h-5 w-5" />File
                </TabsTrigger>
                <TabsTrigger value="qa" onClick={() => setSelectedTab('qa')}>
                  <MessageSquare className="mr-2 h-5 w-5" />Q&A
                </TabsTrigger>
                <TabsTrigger value="website" onClick={() => setSelectedTab('website')}>
                  <GlobeIcon className="mr-2 h-5 w-5" />Website
                </TabsTrigger>
              </TabsList>
              <TabsContent value="text">
                <Card>
                  <CardHeader className="text-xl font-semibold">Text Input</CardHeader>
                  <CardContent>
                    <TextForm onFormChange={handleFormChange} setValid={setValid} />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="file">
                <Card>
                  <CardHeader className="text-xl font-semibold">File Upload</CardHeader>
                  <CardContent>
                    <FileForm onFormChange={handleFormChange} setValid={setValid} />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="qa">
                <Card>
                  <CardHeader className="text-xl font-semibold">Q&A Input</CardHeader>
                  <CardContent>
                    <QAForm onFormChange={handleFormChange} setValid={setValid} />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="website">
                <Card>
                  <CardHeader className="text-xl font-semibold">Website Input</CardHeader>
                  <CardContent>
                    <WebsiteForm onFormChange={handleFormChange} setValid={setValid} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          <div className="lg:w-1/3 flex flex-col gap-6">
            <Card className="text-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
              <CardHeader className="text-2xl font-semibold">Training Summary</CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-2">
                  <FileTextIcon className="h-6 w-6" />
                  <span>Text Inputs: {summary.text?.count || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileIcon className="h-6 w-6" />
                  <span>Files: {summary.file?.count || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-6 w-6" />
                  <span>Q&As: {summary.qa?.count || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <GlobeIcon className="h-6 w-6" />
                  <span>Websites: {summary.website?.count || 0}</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button onClick={handleTrain} className="bg-white text-blue-500 hover:bg-gray-200" disabled={!valid}>
                  Train Chatbot
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader className="text-xl font-semibold">Training History</CardHeader>
              <CardContent>
                <TrainingHistory history={history} sourceType={selectedTab.toUpperCase()} />
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </CardHeader>
  );
};

export default TrainingPage;

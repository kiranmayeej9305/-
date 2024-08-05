'use client'

import BlurPage from '@/components/global/blur-page'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import TextForm from '@/components/forms/text-form'
import FileForm from '@/components/forms/file-form'
import QAForm from '@/components/forms/qa-form'
import WebsiteForm from '@/components/forms/website-form'
import TrainingHistory from '@/components/forms/training-history-form'
import { Button } from '@/components/ui/button'
import React, { useState, useEffect } from 'react'
import { createTraining, getChatbotTrainingsByType } from '@/lib/queries'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardContent, CardFooter, CardDescription, CardTitle } from '@/components/ui/card'
import { FileTextIcon, FileIcon, MessageSquare, GlobeIcon } from 'lucide-react'

type Props = {
  params: { chatbotId: string }
}

const TrainingPage = ({ params }: Props) => {
  const { chatbotId } = params
  const router = useRouter()
  const [trainData, setTrainData] = useState([])
  const [summary, setSummary] = useState({
    text: { count: 0, chars: 0, maxChars: 5000 },
    file: { count: 0, chars: 0, maxChars: 0 },
    qa: { count: 0, chars: 0, maxChars: 1000 },
    website: { count: 0, chars: 0, maxChars: 0 },
  })
  const [selectedTab, setSelectedTab] = useState('text')
  const [history, setHistory] = useState([])
  const [valid, setValid] = useState(false)

  useEffect(() => {
    const fetchHistory = async () => {
      const data = await getChatbotTrainingsByType(chatbotId, selectedTab)
      setHistory(data)
    }
    fetchHistory()
  }, [chatbotId, selectedTab])

  const handleTrain = async () => {
    for (const data of trainData) {
      await createTraining(chatbotId, data)
    }
    router.refresh()
  }

  const handleFormChange = (data: any, type: string) => {
    const isValid = data.length > 0 && data.every(item => item.valid !== false)
    setValid(isValid)
    setTrainData((prevData) => {
      const newData = [...prevData.filter(d => d.type !== type), ...data.map(d => ({ ...d, type }))]
      return newData
    })
    // Update summary
    setSummary(prevSummary => {
      const updatedSummary = { ...prevSummary }
      updatedSummary[type].count = data.length
      if (type === 'text') {
        updatedSummary[type].chars = data.reduce((acc, curr) => acc + curr.content.length, 0)
      }
      return updatedSummary
    })
  }

  useEffect(() => {
    setTrainData([])
    setValid(false)
  }, [selectedTab])

  return (
    <BlurPage>
      <CardHeader>
        <CardTitle>Train your chatbot</CardTitle>
        <CardDescription>Train your chatbot from different sources</CardDescription>
      </CardHeader>
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
                    <TextForm chatbotId={chatbotId} onFormChange={(data) => handleFormChange(data, 'text')} />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="file">
                <Card>
                  <CardHeader className="text-xl font-semibold">File Upload</CardHeader>
                  <CardContent>
                    <FileForm chatbotId={chatbotId} onFormChange={(data) => handleFormChange(data, 'file')} />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="qa">
                <Card>
                  <CardHeader className="text-xl font-semibold">Q&A Input</CardHeader>
                  <CardContent>
                    <QAForm chatbotId={chatbotId} onFormChange={(data) => handleFormChange(data, 'qa')} />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="website">
                <Card>
                  <CardHeader className="text-xl font-semibold">Website Input</CardHeader>
                  <CardContent>
                    <WebsiteForm chatbotId={chatbotId} onFormChange={(data) => handleFormChange(data, 'website')} setValid={setValid} />
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
                  <span>Text Inputs: {summary.text.count}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileIcon className="h-6 w-6" />
                  <span>Files: {summary.file.count}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-6 w-6" />
                  <span>Q&As: {summary.qa.count}</span>
                </div>
                <div className="flex items-center gap-2">
                  <GlobeIcon className="h-6 w-6" />
                  <span>Websites: {summary.website.count}</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button onClick={handleTrain} className="bg-white text-blue-500 hover:bg-gray-200" disabled={!valid}>Train Chatbot</Button>
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
    </BlurPage>
  )
}

export default TrainingPage

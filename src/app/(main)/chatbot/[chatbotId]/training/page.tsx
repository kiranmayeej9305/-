'use client'

import BlurPage from '@/components/global/blur-page'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import TextForm from '@/components/forms/text-form'
import PDFForm from '@/components/forms/pdf-form'
import QAForm from '@/components/forms/qa-form'
import WebsiteForm from '@/components/forms/website-form'
import TrainingHistory from '@/components/forms/training-history-form'
import { Button } from '@/components/ui/button'
import React, { useState, useEffect } from 'react'
import { createTraining, getChatbotTrainingsByType } from '@/lib/queries'
import { useRouter } from 'next/navigation'

type Props = {
  params: { chatbotId: string }
}

const TrainingPage = ({ params }: Props) => {
  const { chatbotId } = params
  const router = useRouter()
  const [trainData, setTrainData] = useState([])
  const [summary, setSummary] = useState({
    text: { count: 0, chars: 0, maxChars: 5000 },
    pdf: { count: 0, chars: 0, maxChars: 0 },
    qa: { count: 0, chars: 0, maxChars: 1000 },
    website: { count: 0, chars: 0, maxChars: 0 },
  })
  const [selectedTab, setSelectedTab] = useState('text')
  const [history, setHistory] = useState([])

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

  const handleFormSubmit = async (data: any, type: string) => {
    setTrainData([...trainData, { ...data, type }])
    // Update summary
    setSummary(prevSummary => {
      const updatedSummary = { ...prevSummary }
      updatedSummary[type].count += 1
      if (type === 'text') {
        updatedSummary[type].chars += data.content.length
      }
      return updatedSummary
    })
  }

  return (
    <BlurPage>
      <h1 className="text-3xl mb-8">Train Your Chatbot</h1>
      <div className="flex">
        <div className="w-2/3 pr-4">
          <Tabs defaultValue="text" className="w-full">
            <TabsList className="grid grid-cols-4 w-full bg-transparent">
              <TabsTrigger value="text" onClick={() => setSelectedTab('text')}>Text</TabsTrigger>
              <TabsTrigger value="pdf" onClick={() => setSelectedTab('pdf')}>PDF</TabsTrigger>
              <TabsTrigger value="qa" onClick={() => setSelectedTab('qa')}>Q&A</TabsTrigger>
              <TabsTrigger value="website" onClick={() => setSelectedTab('website')}>Website</TabsTrigger>
            </TabsList>
            <TabsContent value="text">
              <TextForm chatbotId={chatbotId} onSubmit={(data) => handleFormSubmit(data, 'text')} />
            </TabsContent>
            <TabsContent value="pdf">
              <PDFForm chatbotId={chatbotId} onSubmit={(data) => handleFormSubmit(data, 'pdf')} />
            </TabsContent>
            <TabsContent value="qa">
              <QAForm chatbotId={chatbotId} onSubmit={(data) => handleFormSubmit(data, 'qa')} />
            </TabsContent>
            <TabsContent value="website">
              <WebsiteForm chatbotId={chatbotId} onSubmit={(data) => handleFormSubmit(data, 'website')} />
            </TabsContent>
          </Tabs>
        </div>
        <div className="w-1/3 flex flex-col gap-4">
          <div className="p-4 bg-white shadow rounded">
            <h2 className="text-xl mb-4">Training Summary</h2>
            <div>Text Inputs: {summary.text.count}</div>
            <div>PDFs: {summary.pdf.count}</div>
            <div>Q&As: {summary.qa.count}</div>
            <div>Websites: {summary.website.count}</div>
            <Button onClick={handleTrain}>Train Chatbot</Button>
          </div>
          <div className="p-4 bg-white shadow rounded">
            <h2 className="text-xl mb-4">Training History</h2>
            <TrainingHistory history={history} sourceType={selectedTab.toUpperCase()} />
          </div>
        </div>
      </div>
    </BlurPage>
  )
}

export default TrainingPage

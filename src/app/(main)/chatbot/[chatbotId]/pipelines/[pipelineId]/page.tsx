import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { db } from '@/lib/db'
import {
  getLanesWithTicketAndTags,
  getPipelineDetails,
  updateLanesOrder,
  updateTicketsOrder,
} from '@/lib/queries'
import { LaneDetail } from '@/lib/types'
import { redirect } from 'next/navigation'
import React from 'react'
import PipelineInfoBar from '../_components/pipeline-infobar'
import PipelineSettings from '../_components/pipeline-settings'
import PipelineView from '../_components/pipeline-view'

type Props = {
  params: { chatbotId: string; pipelineId: string }
}

const PipelinePage = async ({ params }: Props) => {
  const pipelineDetails = await getPipelineDetails(params.pipelineId)
  if (!pipelineDetails)
    return redirect(`/chatbot/${params.chatbotId}/pipelines`)

  const pipelines = await db.pipeline.findMany({
    where: { chatbotId: params.chatbotId },
  })

  const lanes = (await getLanesWithTicketAndTags(
    params.pipelineId
  )) as LaneDetail[]

  return (
    <Tabs
      defaultValue="view"
      className="w-full"
    >
      <TabsList className="bg-transparent border-b-2 h-16 w-full justify-between mb-4">
        <PipelineInfoBar
          pipelineId={params.pipelineId}
          chatbotId={params.chatbotId}
          pipelines={pipelines}
        />
        <div>
          <TabsTrigger value="view">Pipeline View</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </div>
      </TabsList>
      <TabsContent value="view">
        <PipelineView
          lanes={lanes}
          pipelineDetails={pipelineDetails}
          pipelineId={params.pipelineId}
          chatbotId={params.chatbotId}
          updateLanesOrder={updateLanesOrder}
          updateTicketsOrder={updateTicketsOrder}
        />
      </TabsContent>
      <TabsContent value="settings">
        <PipelineSettings
          pipelineId={params.pipelineId}
          pipelines={pipelines}
          chatbotId={params.chatbotId}
        />
      </TabsContent>
    </Tabs>
  )
}

export default PipelinePage

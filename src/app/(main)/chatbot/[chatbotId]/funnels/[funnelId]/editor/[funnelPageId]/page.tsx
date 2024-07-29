import { db } from '@/lib/db'
import EditorProvider from '@/providers/editor/editor-provider'
import { redirect } from 'next/navigation'
import React from 'react'
import FunnelEditorNavigation from './_components/funnel-editor-navigation'
import FunnelEditorSidebar from './_components/funnel-editor-sidebar'
import FunnelEditor from './_components/funnel-editor'

type Props = {
  params: {
    chatbotId: string
    funnelId: string
    funnelPageId: string
  }
}

const Page = async ({ params }: Props) => {
  const funnelPageDetails = await db.funnelPage.findFirst({
    where: {
      id: params.funnelPageId,
    },
  })
  if (!funnelPageDetails) {
    return redirect(
      `/Chatbot/${params.chatbotId}/funnels/${params.funnelId}`
    )
  }

  return (
    <div className="fixed top-0 bottom-0 left-0 right-0 z-[20] bg-background overflow-hidden">
      <EditorProvider
        chatbotId={params.chatbotId}
        funnelId={params.funnelId}
        pageDetails={funnelPageDetails}
      >
        <FunnelEditorNavigation
          funnelId={params.funnelId}
          funnelPageDetails={funnelPageDetails}
          chatbotId={params.chatbotId}
        />
        <div className="h-full flex justify-center">
          <FunnelEditor funnelPageId={params.funnelPageId} />
        </div>

        <FunnelEditorSidebar chatbotId={params.chatbotId} />
      </EditorProvider>
    </div>
  )
}

export default Page

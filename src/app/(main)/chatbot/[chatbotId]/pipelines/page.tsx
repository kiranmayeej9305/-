import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import React from 'react'

type Props = {
  params: { chatbotId: string }
}

const Pipelines = async ({ params }: Props) => {
  const pipelineExists = await db.pipeline.findFirst({
    where: { chatbotId: params.chatbotId },
  })

  if (pipelineExists)
    return redirect(
      `/Chatbot/${params.chatbotId}/pipelines/${pipelineExists.id}`
    )

  try {
    const response = await db.pipeline.create({
      data: { name: 'First Pipeline', chatbotId: params.chatbotId },
    })

    return redirect(
      `/Chatbot/${params.chatbotId}/pipelines/${response.id}`
    )
  } catch (error) {
    console.log()
  }
}

export default Pipelines

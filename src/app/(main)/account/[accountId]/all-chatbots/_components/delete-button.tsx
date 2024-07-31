'use client'
import {
  deleteChatbot,
  getchatbotDetails,
  saveActivityLogsNotification,
} from '@/lib/queries'
import { useRouter } from 'next/navigation'
import React from 'react'

type Props = {
  chatbotId: string
}

const DeleteButton = ({ chatbotId }: Props) => {
  const router = useRouter()

  return (
    <div
      className="text-white"
      onClick={async () => {
        const response = await getchatbotDetails(chatbotId)
        await saveActivityLogsNotification({
          accountId: undefined,
          description: `Deleted a Chatbot | ${response?.name}`,
          chatbotId,
        })
        await deleteChatbot(chatbotId)
        router.refresh()
      }}
    >
      Delete Chatbot
    </div>
  )
}

export default DeleteButton

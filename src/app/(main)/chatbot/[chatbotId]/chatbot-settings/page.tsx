import UserDetails from '@/components/forms/user-details'
import ChatbotSettings from '@/components/forms/chatbot-settings';
import BlurPage from '@/components/global/blur-page'
import { db } from '@/lib/db'
import { currentUser } from '@clerk/nextjs'
import React from 'react'

type Props = {
  params: { chatbotId: string }
}

const ChatbotSettingPage = async ({ params }: Props) => {
  const authUser = await currentUser()
  if (!authUser) return
  const userDetails = await db.user.findUnique({
    where: {
      email: authUser.emailAddresses[0].emailAddress,
    },
  })
  if (!userDetails) return

  const chatbot = await db.chatbot.findUnique({
    where: { id: params.chatbotId },
  })
  if (!chatbot) return

  const accountDetails = await db.account.findUnique({
    where: { id: chatbot.accountId },
    include: { Chatbot: true },
  })

  if (!accountDetails) return
  const chatbots = accountDetails.Chatbot

  return (
    <BlurPage>
      <div className="flex lg:!flex-row flex-col gap-4">
      <ChatbotSettings
          accountDetails={accountDetails}
          details={chatbot}
          userId={userDetails.id}
          userName={userDetails.name}
        />
        <UserDetails
          type="Chatbot"
          id={params.chatbotId}
          chatbots={chatbots}
          userData={userDetails}
        />
      </div>
    </BlurPage>
  )
}

export default ChatbotSettingPage

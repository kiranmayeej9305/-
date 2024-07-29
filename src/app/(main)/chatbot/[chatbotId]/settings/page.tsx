import ChatbotDetails from '@/components/forms/chatbot-details'
import UserDetails from '@/components/forms/user-details'
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

  const Chatbot = await db.Chatbot.findUnique({
    where: { id: params.chatbotId },
  })
  if (!Chatbot) return

  const accountDetails = await db.account.findUnique({
    where: { id: Chatbot.accountId },
    include: { Chatbot: true },
  })

  if (!accountDetails) return
  const chatbots = accountDetails.Chatbot

  return (
    <BlurPage>
      <div className="flex lg:!flex-row flex-col gap-4">
        <ChatbotDetails
          accountDetails={accountDetails}
          details={Chatbot}
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

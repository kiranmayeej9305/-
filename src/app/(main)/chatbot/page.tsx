import Unauthorized from '@/components/unauthorized'
import { getAuthUserDetails, verifyAndAcceptInvitation } from '@/lib/queries'
import { redirect } from 'next/navigation'
import React from 'react'

type Props = {
  searchParams: { state: string; code: string }
}

const ChatbotMainPage = async ({ searchParams }: Props) => {
  const accountId = await verifyAndAcceptInvitation()

  if (!accountId) {
    return <Unauthorized />
  }

  const user = await getAuthUserDetails()
  if (!user) return

  const getFirstChatbotWithAccess = user.Permissions.find(
    (permission) => permission.access === true
  )

  if (searchParams.state) {
    const statePath = searchParams.state.split('___')[0]
    const stateChatbotId = searchParams.state.split('___')[1]
    if (!stateChatbotId) return <Unauthorized />
    return redirect(
      `/Chatbot/${stateChatbotId}/${statePath}?code=${searchParams.code}`
    )
  }

  if (getFirstChatbotWithAccess) {
    return redirect(`/Chatbot/${getFirstChatbotWithAccess.chatbotId}`)
  }

  return <Unauthorized />
}

export default ChatbotMainPage

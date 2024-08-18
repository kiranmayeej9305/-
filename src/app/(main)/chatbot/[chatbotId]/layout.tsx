import InfoBar from '@/components/global/infobar'
import Sidebar from '@/components/sidebar'
import Unauthorized from '@/components/unauthorized'
import {
  getAuthUserDetails,
  getNotificationAndUser,
  verifyAndAcceptInvitation,
} from '@/lib/queries'
import { currentUser } from '@clerk/nextjs'
import { Role } from '@prisma/client'
import { redirect } from 'next/navigation'
import React from 'react'

type Props = {
  children: React.ReactNode
  params: { chatbotId: string }
}

const ChatbotLayout = async ({ children, params }: Props) => {
  const accountId = await verifyAndAcceptInvitation()
  if (!accountId) return <Unauthorized />
  const user = await currentUser()
  if (!user) {
    return redirect('/')
  }

  let notifications: any = []

  if (!user.privateMetadata.role) {
    return <Unauthorized />
  } else {
    const allPermissions = await getAuthUserDetails()
    const hasPermission = allPermissions?.Permissions.find(
      (permissions) =>
        permissions.access && permissions.chatbotId === params.chatbotId
    )
    if (!hasPermission) {
      return <Unauthorized />
    }

    const allNotifications = await getNotificationAndUser(accountId)

    if (
      user.privateMetadata.role === 'ACCOUNT_ADMIN' ||
      user.privateMetadata.role === 'ACCOUNT_OWNER'
    ) {
      notifications = allNotifications
    } else {
      const filteredNoti = allNotifications?.filter(
        (item) => item.chatbotId === params.chatbotId
      )
      if (filteredNoti) notifications = filteredNoti
    }
  }

  return (
    <div className="h-screen overflow-hidden">
      <Sidebar
        id={params.chatbotId}
        type="chatbot"
      />

      <div className="md:pl-[300px]">
        <InfoBar
          notifications={notifications}
          role={user.privateMetadata.role as Role}
          chatbotId={params.chatbotId as string}
        />
        <div className="relative">{children}</div>
      </div>
    </div>
  )
} 

export default ChatbotLayout

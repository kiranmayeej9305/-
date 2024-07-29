import BlurPage from '@/components/global/blur-page'
import InfoBar from '@/components/global/infobar'
import Sidebar from '@/components/sidebar'
import Unauthorized from '@/components/unauthorized'
import {
  getNotificationAndUser,
  verifyAndAcceptInvitation,
} from '@/lib/queries'
import { currentUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import React from 'react'

type Props = {
  children: React.ReactNode
  params: { accountId: string }
}

const layout = async ({ children, params }: Props) => {
  const accountId = await verifyAndAcceptInvitation()
  const user = await currentUser()

  if (!user) {
    return redirect('/')
  }

  if (!accountId) {
    return redirect('/account')
  }

  if (
    user.privateMetadata.role !== 'ACCOUNT_OWNER' &&
    user.privateMetadata.role !== 'ACCOUNT_ADMIN'
  )
    return <Unauthorized />

  let allNoti: any = []
  const notifications = await getNotificationAndUser(accountId)
  if (notifications) allNoti = notifications

 

  return (
    <div className="h-screen overflow-hidden">
      <Sidebar
        id={params.accountId}
        type="account"
      />
      <div className="md:pl-[300px]">
        <InfoBar
          notifications={allNoti}
          role={allNoti.User?.role}
        />
        <div className="relative">
          <BlurPage>{children}</BlurPage>
        </div>
      </div>
    </div>
  )
}

export default layout

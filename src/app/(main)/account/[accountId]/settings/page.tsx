import AccountDetails from '@/components/forms/account-details'
import UserDetails from '@/components/forms/user-details'
import { db } from '@/lib/db'
import { currentUser } from '@clerk/nextjs'
import React from 'react'

type Props = {
  params: { accountId: string }
}

const SettingsPage = async ({ params }: Props) => {
  const authUser = await currentUser()
  if (!authUser) return null

  const userDetails = await db.user.findUnique({
    where: {
      email: authUser.emailAddresses[0].emailAddress,
    },
  })

  if (!userDetails) return null

  const accountDetails = await db.account.findUnique({
    where: {
      id: params.accountId,
    },
    include: {
      Chatbot: true,
    },
  })

  if (!accountDetails) return null

  const chatbots = accountDetails.Chatbot

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-8 bg-gray-50 min-h-screen">
        <AccountDetails
          data={accountDetails}
          isCreating={false}  // Pass the isCreating flag
        />
        <UserDetails
          type="account"
          id={params.accountId}
          chatbots={chatbots}
          userData={userDetails}
        />
    </div>
  )
}

export default SettingsPage

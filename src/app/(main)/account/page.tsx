import AccountDetails from '@/components/forms/account-details'
import { getAuthUserDetails, verifyAndAcceptInvitation } from '@/lib/queries'
import { currentUser } from '@clerk/nextjs'
import { Plan } from '@prisma/client'
import { redirect } from 'next/navigation'
import React from 'react'

const Page = async ({
  searchParams,
}: {
  searchParams: { plan: Plan; state: string; code: string }
}) => {
  const accountId = await verifyAndAcceptInvitation()
  console.log(accountId)

  //get the users details
  const user = await getAuthUserDetails()
  if (accountId) {
    if (user?.role === 'CHATBOT_ADMIN' || user?.role === 'CHATBOT_USER') {
      return redirect('/chatbot')
    } else if (user?.role === 'ACCOUNT_OWNER' || user?.role === 'ACCOUNT_ADMIN') {
      if (searchParams.plan) {
        return redirect(`/account/${accountId}/billing?plan=${searchParams.plan}`)
      }
      if (searchParams.state) {
        const statePath = searchParams.state.split('___')[0]
        const stateAccountId = searchParams.state.split('___')[1]
        if (!stateAccountId) return <div>Not authorized</div>
        return redirect(
          `/account/${stateAccountId}/${statePath}?code=${searchParams.code}`
        )
      } else return redirect(`/account/${accountId}`)
    } else {
      return <div>Not authorized</div>
    }
  }
  const authUser = await currentUser()
  return (
    <div className="flex justify-center items-center mt-4">
      <div className="max-w-[850px] border-[1px] p-4 rounded-xl">
        <h1 className="text-4xl"> Create An Account</h1>
        <AccountDetails
          data={{ companyEmail: authUser?.emailAddresses[0].emailAddress }}
        />
      </div>
    </div>
  )
}

export default Page

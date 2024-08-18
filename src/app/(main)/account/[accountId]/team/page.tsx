import { db } from '@/lib/db'
import React from 'react'
import DataTable from './data-table'
import { Plus } from 'lucide-react'
import { currentUser } from '@clerk/nextjs'
import { columns } from './columns'
import SendInvitation from '@/components/forms/send-invitation'

type Props = {
  params: { accountId: string }
}

const TeamPage = async ({ params }: Props) => {
  const authUser = await currentUser()
  const teamMembers = await db.user.findMany({
    where: {
      Account: {
        id: params.accountId,
      },
    },
    include: {
      Account: { include: { Chatbot: true } },
      Permissions: { include: { Chatbot: true } },
    },
  })
  console.log(authUser);
  if (!authUser) return null
  const accountDetails = await db.account.findUnique({
    where: {
      id: params.accountId,
    },
    include: {
      Chatbot: true,
    },
  })

  if (!accountDetails) return

  return (
    <DataTable
      actionButtonText={
        <>
          <Plus size={15} />
          Add
        </>
      }
      modalChildren={<SendInvitation accountId={accountDetails.id} />}
      filterValue="name"
      columns={columns}
      data={teamMembers}
    ></DataTable>
  )
}

export default TeamPage

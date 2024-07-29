'use server'

import { clerkClient, currentUser } from '@clerk/nextjs'
import { db } from './db'
import { redirect } from 'next/navigation'
import {
  Account,
  Lane,
  Plan,
  Prisma,
  Role,
  Chatbot,
  Tag,
  Ticket,
  User,
} from '@prisma/client'
import { v4 } from 'uuid'
import {
  CreateFunnelFormSchema,
  CreateMediaType,
  UpsertFunnelPage,
} from './types'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

export const getAuthUserDetails = async () => {
  const user = await currentUser()
  if (!user) {
    return
  }

  const userData = await db.user.findUnique({
    where: {
      email: user.emailAddresses[0].emailAddress,
    },
    include: {
      Account: {
        include: {
          SidebarOption: true,
          Chatbot: {
            include: {
              SidebarOption: true,
            },
          },
        },
      },
      Permissions: true,
    },
  })

  return userData
}

export const saveActivityLogsNotification = async ({
  accountId,
  description,
  chatbotId,
}: {
  accountId?: string
  description: string
  chatbotId?: string
}) => {
  const authUser = await currentUser()
  let userData
  if (!authUser) {
    const response = await db.user.findFirst({
      where: {
        Account: {
          Chatbot: {
            some: { id: chatbotId },
          },
        },
      },
    })
    if (response) {
      userData = response
    }
  } else {
    userData = await db.user.findUnique({
      where: { email: authUser?.emailAddresses[0].emailAddress },
    })
  }

  if (!userData) {
    console.log('Could not find a user')
    return
  }

  let foundAccountId = accountId
  if (!foundAccountId) {
    if (!chatbotId) {
      throw new Error(
        'You need to provide atleast an account Id or chatbot Id'
      )
    }
    const response = await db.chatbot.findUnique({
      where: { id: chatbotId },
    })
    if (response) foundAccountId = response.accountId
  }
  if (chatbotId) {
    await db.notification.create({
      data: {
        notification: `${userData.name} | ${description}`,
        User: {
          connect: {
            id: userData.id,
          },
        },
        Account: {
          connect: {
            id: foundAccountId,
          },
        },
        Chatbot: {
          connect: { id: chatbotId },
        },
      },
    })
  } else {
    await db.notification.create({
      data: {
        notification: `${userData.name} | ${description}`,
        User: {
          connect: {
            id: userData.id,
          },
        },
        Account: {
          connect: {
            id: foundAccountId,
          },
        },
      },
    })
  }
}

export const createTeamUser = async (accountId: string, user: User) => {
  if (user.role === 'ACCOUNT_OWNER') return null
  const response = await db.user.create({ data: { ...user } })
  return response
}

export const verifyAndAcceptInvitation = async () => {
  const user = await currentUser()
  if (!user) return redirect('/sign-in')
  const invitationExists = await db.invitation.findUnique({
    where: {
      email: user.emailAddresses[0].emailAddress,
      status: 'PENDING',
    },
  })

  if (invitationExists) {
    const userDetails = await createTeamUser(invitationExists.accountId, {
      email: invitationExists.email,
      accountId: invitationExists.accountId,
      avatarUrl: user.imageUrl,
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      role: invitationExists.role,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    await saveActivityLogsNotification({
      accountId: invitationExists?.accountId,
      description: `Joined`,
      chatbotId: undefined,
    })

    if (userDetails) {
      await clerkClient.users.updateUserMetadata(user.id, {
        privateMetadata: {
          role: userDetails.role || 'CHATBOT_USER',
        },
      })

      await db.invitation.delete({
        where: { email: userDetails.email },
      })

      return userDetails.accountId
    } else return null
  } else {
    const account = await db.user.findUnique({
      where: {
        email: user.emailAddresses[0].emailAddress,
      },
    })
    return account ? account.accountId : null
  }
}

export const updateAccountDetails = async (
  accountId: string,
  accountDetails: Partial<Account>
) => {
  const response = await db.account.update({
    where: { id: accountId },
    data: { ...accountDetails },
  })
  return response
}

export const deleteAccount = async (accountId: string) => {
  const response = await db.account.delete({ where: { id: accountId } })
  return response
}

export const initUser = async (newUser: Partial<User>) => {
  const user = await currentUser()
  if (!user) return

  const userData = await db.user.upsert({
    where: {
      email: user.emailAddresses[0].emailAddress,
    },
    update: newUser,
    create: {
      id: user.id,
      avatarUrl: user.imageUrl,
      email: user.emailAddresses[0].emailAddress,
      name: `${user.firstName} ${user.lastName}`,
      role: newUser.role || 'CHATBOT_USER',
    },
  })

  await clerkClient.users.updateUserMetadata(user.id, {
    privateMetadata: {
      role: newUser.role || 'CHATBOT_USER',
    },
  })

  return userData
}

export const upsertAccount = async (account: Account, price?: Plan) => {
  if (!account.companyEmail) return null
  try {
    const accountDetails = await db.account.upsert({
      where: {
        id: account.id,
      },
      update: account,
      create: {
        users: {
          connect: { email: account.companyEmail },
        },
        ...account,
        SidebarOption: {
          create: [
            {
              name: 'Dashboard',
              icon: 'category',
              link: `/account/${account.id}`,
            },
            {
              name: 'Launchpad',
              icon: 'clipboardIcon',
              link: `/account/${account.id}/launchpad`,
            },
            {
              name: 'Billing',
              icon: 'payment',
              link: `/account/${account.id}/billing`,
            },
            {
              name: 'Settings',
              icon: 'settings',
              link: `/account/${account.id}/settings`,
            },
            {
              name: 'Sub Accounts',
              icon: 'person',
              link: `/account/${account.id}/all-chatbots`,
            },
            {
              name: 'Team',
              icon: 'shield',
              link: `/account/${account.id}/team`,
            },
          ],
        },
      },
    })
    return accountDetails
  } catch (error) {
    console.log(error)
  }
}

export const getNotificationAndUser = async (accountId: string) => {
  try {
    const response = await db.notification.findMany({
      where: { accountId },
      include: { User: true },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return response
  } catch (error) {
    console.log(error)
  }
}

export const upsertChatbot = async (chatbot: Chatbot) => {
  if (!chatbot.companyEmail) return null
  const accountOwner = await db.user.findFirst({
    where: {
      Account: {
        id: chatbot.accountId,
      },
      role: 'ACCOUNT_OWNER',
    },
  })
  if (!accountOwner) return console.log('🔴Erorr could not create Chatbot')
  const permissionId = v4()
  const response = await db.chatbot.upsert({
    where: { id: chatbot.id },
    update: chatbot,
    create: {
      ...chatbot,
      Permissions: {
        create: {
          access: true,
          email: accountOwner.email,
          id: permissionId,
        },
        connect: {
          chatbotId: chatbot.id,
          id: permissionId,
        },
      },
      Pipeline: {
        create: { name: 'Lead Cycle' },
      },
      SidebarOption: {
        create: [
          {
            name: 'Launchpad',
            icon: 'clipboardIcon',
            link: `/chatbot/${chatbot.id}/launchpad`,
          },
          {
            name: 'Settings',
            icon: 'settings',
            link: `/chatbot/${chatbot.id}/settings`,
          },
          {
            name: 'Funnels',
            icon: 'pipelines',
            link: `/chatbot/${chatbot.id}/funnels`,
          },
          {
            name: 'Media',
            icon: 'database',
            link: `/chatbot/${chatbot.id}/media`,
          },
          {
            name: 'Automations',
            icon: 'chip',
            link: `/chatbot/${chatbot.id}/automations`,
          },
          {
            name: 'Pipelines',
            icon: 'flag',
            link: `/chatbot/${chatbot.id}/pipelines`,
          },
          {
            name: 'Contacts',
            icon: 'person',
            link: `/chatbot/${chatbot.id}/contacts`,
          },
          {
            name: 'Dashboard',
            icon: 'category',
            link: `/chatbot/${chatbot.id}`,
          },
        ],
      },
    },
  })
  return response
}

export const getUserPermissions = async (userId: string) => {
  const response = await db.user.findUnique({
    where: { id: userId },
    select: { Permissions: { include: { Chatbot: true } } },
  })

  return response
}

export const updateUser = async (user: Partial<User>) => {
  const response = await db.user.update({
    where: { email: user.email },
    data: { ...user },
  })

  await clerkClient.users.updateUserMetadata(response.id, {
    privateMetadata: {
      role: user.role || 'CHATBOT_USER',
    },
  })

  return response
}

export const changeUserPermissions = async (
  permissionId: string | undefined,
  userEmail: string,
  chatbotId: string,
  permission: boolean
) => {
  try {
    const response = await db.permissions.upsert({
      where: { id: permissionId },
      update: { access: permission },
      create: {
        access: permission,
        email: userEmail,
        chatbotId: chatbotId,
      },
    })
    return response
  } catch (error) {
    console.log('🔴Could not change persmission', error)
  }
}

export const getchatbotDetails = async (chatbotId: string) => {
  const response = await db.chatbot.findUnique({
    where: {
      id: chatbotId,
    },
  })
  return response
}

export const deleteChatbot = async (chatbotId: string) => {
  const response = await db.chatbot.delete({
    where: {
      id: chatbotId,
    },
  })
  return response
}

export const deleteUser = async (userId: string) => {
  await clerkClient.users.updateUserMetadata(userId, {
    privateMetadata: {
      role: undefined,
    },
  })
  const deletedUser = await db.user.delete({ where: { id: userId } })

  return deletedUser
}

export const getUser = async (id: string) => {
  const user = await db.user.findUnique({
    where: {
      id,
    },
  })

  return user
}

export const sendInvitation = async (
  role: Role,
  email: string,
  accountId: string
) => {
  const resposne = await db.invitation.create({
    data: { email, accountId, role },
  })

  try {
    const invitation = await clerkClient.invitations.createInvitation({
      emailAddress: email,
      redirectUrl: process.env.NEXT_PUBLIC_URL,
      publicMetadata: {
        throughInvitation: true,
        role,
      },
    })
  } catch (error) {
    console.log(error)
    throw error
  }

  return resposne
}

export const getMedia = async (chatbotId: string) => {
  const mediafiles = await db.chatbot.findUnique({
    where: {
      id: chatbotId,
    },
    include: { Media: true },
  })
  return mediafiles
}

export const createMedia = async (
  chatbotId: string,
  mediaFile: CreateMediaType
) => {
  const response = await db.media.create({
    data: {
      link: mediaFile.link,
      name: mediaFile.name,
      chatbotId: chatbotId,
    },
  })

  return response
}

export const deleteMedia = async (mediaId: string) => {
  const response = await db.media.delete({
    where: {
      id: mediaId,
    },
  })
  return response
}

export const getPipelineDetails = async (pipelineId: string) => {
  const response = await db.pipeline.findUnique({
    where: {
      id: pipelineId,
    },
  })
  return response
}

export const getLanesWithTicketAndTags = async (pipelineId: string) => {
  const response = await db.lane.findMany({
    where: {
      pipelineId,
    },
    orderBy: { order: 'asc' },
    include: {
      Tickets: {
        orderBy: {
          order: 'asc',
        },
        include: {
          Tags: true,
          Assigned: true,
          Customer: true,
        },
      },
    },
  })
  return response
}

export const upsertFunnel = async (
  chatbotId: string,
  funnel: z.infer<typeof CreateFunnelFormSchema> & { liveProducts: string },
  funnelId: string
) => {
  const response = await db.funnel.upsert({
    where: { id: funnelId },
    update: funnel,
    create: {
      ...funnel,
      id: funnelId || v4(),
      chatbotId: chatbotId,
    },
  })

  return response
}

export const upsertPipeline = async (
  pipeline: Prisma.PipelineUncheckedCreateWithoutLaneInput
) => {
  const response = await db.pipeline.upsert({
    where: { id: pipeline.id || v4() },
    update: pipeline,
    create: pipeline,
  })

  return response
}

export const deletePipeline = async (pipelineId: string) => {
  const response = await db.pipeline.delete({
    where: { id: pipelineId },
  })
  return response
}

export const updateLanesOrder = async (lanes: Lane[]) => {
  try {
    const updateTrans = lanes.map((lane) =>
      db.lane.update({
        where: {
          id: lane.id,
        },
        data: {
          order: lane.order,
        },
      })
    )

    await db.$transaction(updateTrans)
    console.log('🟢 Done reordered 🟢')
  } catch (error) {
    console.log(error, 'ERROR UPDATE LANES ORDER')
  }
}

export const updateTicketsOrder = async (tickets: Ticket[]) => {
  try {
    const updateTrans = tickets.map((ticket) =>
      db.ticket.update({
        where: {
          id: ticket.id,
        },
        data: {
          order: ticket.order,
          laneId: ticket.laneId,
        },
      })
    )

    await db.$transaction(updateTrans)
    console.log('🟢 Done reordered 🟢')
  } catch (error) {
    console.log(error, '🔴 ERROR UPDATE TICKET ORDER')
  }
}

export const upsertLane = async (lane: Prisma.LaneUncheckedCreateInput) => {
  let order: number

  if (!lane.order) {
    const lanes = await db.lane.findMany({
      where: {
        pipelineId: lane.pipelineId,
      },
    })

    order = lanes.length
  } else {
    order = lane.order
  }

  const response = await db.lane.upsert({
    where: { id: lane.id || v4() },
    update: lane,
    create: { ...lane, order },
  })

  return response
}

export const deleteLane = async (laneId: string) => {
  const resposne = await db.lane.delete({ where: { id: laneId } })
  return resposne
}

export const getTicketsWithTags = async (pipelineId: string) => {
  const response = await db.ticket.findMany({
    where: {
      Lane: {
        pipelineId,
      },
    },
    include: { Tags: true, Assigned: true, Customer: true },
  })
  return response
}

export const _getTicketsWithAllRelations = async (laneId: string) => {
  const response = await db.ticket.findMany({
    where: { laneId: laneId },
    include: {
      Assigned: true,
      Customer: true,
      Lane: true,
      Tags: true,
    },
  })
  return response
}

export const getChatbotTeamMembers = async (chatbotId: string) => {
  const chatbotUsersWithAccess = await db.user.findMany({
    where: {
      Account: {
        Chatbot: {
          some: {
            id: chatbotId,
          },
        },
      },
      role: 'CHATBOT_USER',
      Permissions: {
        some: {
          chatbotId: chatbotId,
          access: true,
        },
      },
    },
  })
  return chatbotUsersWithAccess
}

export const searchContacts = async (searchTerms: string) => {
  const response = await db.contact.findMany({
    where: {
      name: {
        contains: searchTerms,
      },
    },
  })
  return response
}

export const upsertTicket = async (
  ticket: Prisma.TicketUncheckedCreateInput,
  tags: Tag[]
) => {
  let order: number
  if (!ticket.order) {
    const tickets = await db.ticket.findMany({
      where: { laneId: ticket.laneId },
    })
    order = tickets.length
  } else {
    order = ticket.order
  }

  const response = await db.ticket.upsert({
    where: {
      id: ticket.id || v4(),
    },
    update: { ...ticket, Tags: { set: tags } },
    create: { ...ticket, Tags: { connect: tags }, order },
    include: {
      Assigned: true,
      Customer: true,
      Tags: true,
      Lane: true,
    },
  })

  return response
}

export const deleteTicket = async (ticketId: string) => {
  const response = await db.ticket.delete({
    where: {
      id: ticketId,
    },
  })

  return response
}

export const upsertTag = async (
  chatbotId: string,
  tag: Prisma.TagUncheckedCreateInput
) => {
  const response = await db.tag.upsert({
    where: { id: tag.id || v4(), chatbotId: chatbotId },
    update: tag,
    create: { ...tag, chatbotId: chatbotId },
  })

  return response
}

export const getTagsForChatbot = async (chatbotId: string) => {
  const response = await db.chatbot.findUnique({
    where: { id: chatbotId },
    select: { Tags: true },
  })
  return response
}

export const deleteTag = async (tagId: string) => {
  const response = await db.tag.delete({ where: { id: tagId } })
  return response
}

export const upsertContact = async (
  contact: Prisma.ContactUncheckedCreateInput
) => {
  const response = await db.contact.upsert({
    where: { id: contact.id || v4() },
    update: contact,
    create: contact,
  })
  return response
}

export const getFunnels = async (chatbotId: string) => {
  const funnels = await db.funnel.findMany({
    where: { chatbotId: chatbotId },
    include: { FunnelPages: true },
  })

  return funnels
}

export const getFunnel = async (funnelId: string) => {
  const funnel = await db.funnel.findUnique({
    where: { id: funnelId },
    include: {
      FunnelPages: {
        orderBy: {
          order: 'asc',
        },
      },
    },
  })

  return funnel
}

export const updateFunnelProducts = async (
  products: string,
  funnelId: string
) => {
  const data = await db.funnel.update({
    where: { id: funnelId },
    data: { liveProducts: products },
  })
  return data
}

export const upsertFunnelPage = async (
  chatbotId: string,
  funnelPage: UpsertFunnelPage,
  funnelId: string
) => {
  if (!chatbotId || !funnelId) return
  const response = await db.funnelPage.upsert({
    where: { id: funnelPage.id || '' },
    update: { ...funnelPage },
    create: {
      ...funnelPage,
      content: funnelPage.content
        ? funnelPage.content
        : JSON.stringify([
            {
              content: [],
              id: '__body',
              name: 'Body',
              styles: { backgroundColor: 'white' },
              type: '__body',
            },
          ]),
      funnelId,
    },
  })

  revalidatePath(`/Chatbot/${chatbotId}/funnels/${funnelId}`, 'page')
  return response
}

export const deleteFunnelePage = async (funnelPageId: string) => {
  const response = await db.funnelPage.delete({ where: { id: funnelPageId } })

  return response
}

export const getFunnelPageDetails = async (funnelPageId: string) => {
  const response = await db.funnelPage.findUnique({
    where: {
      id: funnelPageId,
    },
  })

  return response
}

export const getDomainContent = async (subDomainName: string) => {
  const response = await db.funnel.findUnique({
    where: {
      subDomainName,
    },
    include: { FunnelPages: true },
  })
  return response
}

export const getPipelines = async (chatbotId: string) => {
  const response = await db.pipeline.findMany({
    where: { chatbotId: chatbotId },
    include: {
      Lane: {
        include: { Tickets: true },
      },
    },
  })
  return response
}

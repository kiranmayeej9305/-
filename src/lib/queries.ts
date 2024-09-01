'use server'

import { clerkClient, currentUser } from '@clerk/nextjs'
import { db } from './db'
import { redirect } from 'next/navigation'
import { pusherServer , pusherClient} from '@/lib/pusher';
import {
  Account,
  Lane,
  Plan,
  Prisma,
  Role,
  Chatbot,
  Interface,
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
import { revalidatePath } from 'next/cache'
import { prepareChatResponse } from './openai'
export const getAuthUserDetails = async () => {
  const user = await currentUser();
  if (!user) {
    return null;
  }

  const userData = await db.user.findUnique({
    where: {
      email: user.emailAddresses[0].emailAddress,
    },
    include: {
      Account: {
        include: {
          Chatbot: true,  // Include Chatbots associated with the account
        },
      },
      Permissions: true,  // Include permissions associated with the user
    },
  });

  if (userData && userData.Account) {
    // Fetch all AccountSidebarOptions (since they are not tied to a specific account directly)
    const accountSidebarOptions = await db.accountSidebarOption.findMany();

    // Fetch all ChatbotSidebarOptions (since they are not tied to a specific chatbot directly)
    const chatbotSidebarOptions = await db.chatbotSidebarOption.findMany();

    // Attach SidebarOptions to Account and Chatbots manually
    userData.Account.SidebarOptions = accountSidebarOptions;

    userData.Account.Chatbot = userData.Account.Chatbot.map((chatbot) => ({
      ...chatbot,
      SidebarOptions: chatbotSidebarOptions.filter(
        (option) => option.parentId === chatbot.id
      ),
    }));
  }

  return userData;
};


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

export const upsertAccount = async (account: Account, isCreating: boolean) => {
  if (!account.companyEmail) {
    console.error('No company email provided.');
    return null;
  }

  try {
    const accountDetails = await db.account.upsert({
      where: { id: account.id || '' },
      update: {
        ...account,
        updatedAt: new Date(),
      },
      create: {
        ...account,
        users: {
          connect: { email: account.companyEmail },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    console.log('Account upserted successfully:', accountDetails);

    if (isCreating) {
      console.log(`Creating sidebar options for account ID: ${accountDetails.id}`);

    //   const parentOptions = [
    //     { name: 'Analytics & Usage', icon: 'category', link: `/account/${accountDetails.id}/analytics` },
    //     { name: 'Chatbots', icon: 'person', link: `/account/${accountDetails.id}/all-chatbots` },
    //     { name: 'Settings', icon: 'settings', link: `/account/${accountDetails.id}/settings` },
    //     { name: 'Team', icon: 'shield', link: `/account/${accountDetails.id}/team` },
    //     { name: 'Billing', icon: 'payment', link: `/account/${accountDetails.id}/billing` }
    //   ];

    //   const parentIds = [];
    //   for (const option of parentOptions) {
    //     const parentOption = await db.accountSidebarOption.create({
    //       data: {
    //         ...option,
    //         accountId: accountDetails.id,
    //       },
    //     });
    //     parentIds.push(parentOption.id);
    //   }

    //   console.log('Sidebar options created:', parentIds);
    // }
    }
    return accountDetails;
  } catch (error) {
    console.error('Error during account upsert:', error);
    throw new Error('Account upsert failed');
  }
};

export const getNotificationAndUser = async (accountId: string) => {
  try {
    console.log(accountId);
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

// export const upsertInterfaceSettings = async (interfaceSettings: any) => {
//   if (!interfaceSettings.chatbotId) {
//     throw new Error("chatbotId is required");
//   }

//   try {
//     const existingSettings = await prisma.interface.findUnique({
//       where: { chatbotId: interfaceSettings.chatbotId },
//     });

//     if (existingSettings) {
//       const response = await prisma.interface.update({
//         where: { id: existingSettings.id },
//         data: interfaceSettings,
//       });
//       return response;
//     } else {
//       const response = await prisma.interface.create({
//         data: interfaceSettings,
//       });
//       return response;
//     }
//   } catch (error) {
//     console.error('Error upserting interface settings:', error);
//     throw error;
//   }
// };

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
// export const getInterfaceSettings = async (chatbotId: string) => {
//   const interfaceSettings = await db.chatbot.findUnique({
//     where: {
//       id: chatbotId,
//     },
//     include: { Interface: true },
//   })
//   return interfaceSettings
// }
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

  revalidatePath(`/chatbot/${chatbotId}/funnels/${funnelId}`, 'page')
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

export const getChatbotTrainingsByType = async (chatbotId: string, type: string) => {
  return await db.trainingHistory.findMany({
    where: {
      chatbotId,
      sourceType: type,
    },
    include: {
      User: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}
export const uploadFile = async (file) => {
  // Implement your file upload logic here
  // For now, we're just returning a mock file URL
  const fileUrl = URL.createObjectURL(file)
  return fileUrl
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
// Get Account Sidebar Options
export const getAccountSidebarOptions = async () => {
  try {
    const sidebarOptions = await db.accountSidebarOption.findMany({
      orderBy: { createdAt: 'asc' },
    });
    
    return sidebarOptions.map(option => ({
      ...option,
      link: option.link.replace('{accountId}', ':accountId'),
    }));
  } catch (error) {
    console.error('Error fetching account sidebar options:', error);
    throw error;
  }
};

// Get Chatbot Sidebar Options
export const getChatbotSidebarOptions = async () => {
  try {
    const sidebarOptions = await db.chatbotSidebarOption.findMany({
      orderBy: { createdAt: 'asc' },
    });
    
    return sidebarOptions.map(option => ({
      ...option,
      link: option.link.replace('{chatbotId}', ':chatbotId'),
    }));
  } catch (error) {
    console.error('Error fetching chatbot sidebar options:', error);
    throw error;
  }
};
export const upsertChatbot = async (chatbot: Chatbot, settings: any, isCreating: boolean) => {
  if (!chatbot.name) return null;

  try {
    return await db.$transaction(async (transaction) => {
      // Find the Account Owner
      const accountOwner = await transaction.user.findFirst({
        where: {
          Account: {
            id: chatbot.accountId,
          },
          role: 'ACCOUNT_OWNER',
        },
      });

      if (!accountOwner) {
        console.log('🔴 Error: Could not find Account Owner');
        throw new Error('Account owner not found');
      }

      const permissionId = v4();

      // Upsert the Chatbot
      const response = await transaction.chatbot.upsert({
        where: { id: chatbot.id || '' },
        update: chatbot,
        create: {
          ...chatbot,
          Permissions: {
            create: {
              access: true,
              email: accountOwner.email,
              id: permissionId,
            },
          },
          Pipeline: { create: { name: 'Lead Cycle' } },
        },
      });

      // Ensure the chatbot ID is present for newly created chatbots
      const chatbotId = response.id || chatbot.id;
      if (!chatbotId) {
        throw new Error('Chatbot creation failed');
      }

      // Create sidebar options only if creating a new chatbot
      if (isCreating) {
        await transaction.interface.upsert({
          where: { chatbotId: chatbotId },
          update: {
            icon: "",
            userAvatar: "",
            chatbotAvatar: "",
            chatIcon: "/images/bot.png",
            background: "#ffffff",
            userMsgBackgroundColour: "#ffffff",
            chatbotMsgBackgroundColour: "#f0f0f0",
            userTextColor: "#000000",
            chatbotTextColor: "#000000",
            botDisplayNameColor: "#000000", // New field for bot display name color
            helpdesk: false,
            copyRightMessage: "Powered By | Your Company | https://example.com",
            footerText: "By chatting, you agree to our | Privacy Policy | https://example.com/privacy-policy",
            messagePlaceholder: "Type your message...",
            suggestedMessage: "",
            themeColor: "#3b82f6",
            botDisplayName: "Chatbot",
            chatBubbleButtonColor: "#3b82f6",
            helpdeskLiveAgentColor: "#ff0000",
            isLiveAgentEnabled: false,
          },
          create: {
            id: v4(),
            chatbotId: chatbotId,
            icon: "",
            userAvatar: "/images/user.png",
            chatbotAvatar: "/images/chatbot.png",
            chatIcon: "/images/bot.png",
            background: "#ffffff",
            userMsgBackgroundColour: "#ffffff",
            chatbotMsgBackgroundColour: "#f0f0f0",
            userTextColor: "#000000",
            chatbotTextColor: "#000000",
            botDisplayNameColor: "#000000", // New field for bot display name color
            helpdesk: false,
            copyRightMessage: "Powered By | Your Company | https://example.com",
            footerText: "By chatting, you agree to our | Privacy Policy | https://example.com/privacy-policy",
            messagePlaceholder: "Type your message...",
            suggestedMessage: "",
            themeColor: "#3b82f6",
            botDisplayName: "Chatbot",
            chatBubbleButtonColor: "#3b82f6",
            helpdeskLiveAgentColor: "#ff0000",
            isLiveAgentEnabled: false,
          },
        });
        await transaction.chatbotSettings.upsert({
          where: { chatbotId },
          update: settings,
          create: { ...settings, chatbotId },
        });
      }
      return response;
    });
  } catch (error) {
    console.log('Error during chatbot upsert transaction:', error);
    throw new Error('Chatbot upsert failed');
  }
};




export const upsertChatbotSettings = async (chatbotId: string, settingsData: any) => {
  const settingsResponse = await prisma.chatbotSettings.upsert({
    where: { chatbotId },
    update: { ...settingsData, chatbotId },
    create: { ...settingsData, chatbotId },
  });

  return settingsResponse;
};


export const getAIModels = async () => {
  try {
    const response = await prisma.aIModel.findMany();
    return response;
  } catch (error) {
    console.error('Error fetching AI models:', error);
    throw error;
  }
};

export const getChatbotTypes = async () => {
  try {
    const response = await prisma.chatbotType.findMany();
    return response;
  } catch (error) {
    console.error('Error fetching chatbot types:', error);
    throw error;
  }
};

export const getDefaultPromptByChatbotTypeId = async (chatbotTypeId: string) => {
  try {
    const response = await db.chatbotType.findUnique({
      where: { id: chatbotTypeId },
      select: { defaultPrompts: true },
    });
    return response?.defaultPrompts;
  } catch (error) {
    console.error('Error fetching default prompt:', error);
    throw error;
  }
};
export const fetchChatbotData = async (chatbotId: string) => {
  try {
    const chatbotData = await prisma.chatbot.findUnique({
      where: { id: chatbotId },
      include: {
        Permissions: true,
        Pipeline: true,
        ChatbotSettings: {
          include: {
            AIModel: true,
            ChatbotType: true,
          },
        },
      },
    });

    if (!chatbotData) {
      throw new Error('Chatbot not found');
    }

    return chatbotData;
  } catch (error) {
    console.error('Error fetching chatbot data:', error);
    throw error;
  }
};
export const upsertAndFetchChatbotData = async (chatbotData, settingsData, isCreating) => {
  try {
    const chatbotResponse = await upsertChatbot(chatbotData, settingsData, isCreating);
    const chatbotId = chatbotResponse.id || chatbotData.id;

    if (!chatbotId) {
      throw new Error('Chatbot ID is missing after upsert');
    }
    if (isCreating) {
      await upsertInterfaceSettings({
        chatbotId,
        icon: "",
        userAvatar: "/images/user.png",
        chatbotAvatar: "/images/chatbot.png",
        background: "#ffffff",
        userMsgBackgroundColour: "#ffffff",
        chatbotMsgBackgroundColour: "#f0f0f0",
        userTextColor: "#000000",
        chatbotTextColor: "#000000",
        helpdesk: false,
        copyRightMessage: "Powered By | Your Company | https://example.com",
        footerText: "By chatting, you agree to our | Privacy Policy | https://example.com/privacy-policy",
        messagePlaceholder: "Type your message...",
        suggestedMessage: "",
        themeColor: "#3b82f6",
        botDisplayName: "Chatbot",
        chatIcon: "/images/bot.png",
        chatBubbleButtonColor: "#3b82f6",
        helpdeskLiveAgentColor: "#ff0000",
        isLiveAgentEnabled: false,
      });
    }

    await upsertChatbotSettings(chatbotId, settingsData);
    
    // Optionally create a Pusher channel for this chatbot's chat rooms
    pusherServer.trigger('chatbots', 'chatbot-created', { chatbotId, name: chatbotData.name });

    const fullChatbotData = await fetchChatbotData(chatbotId);
    return fullChatbotData;
  } catch (error) {
    console.error('Error in upsertAndFetchChatbotData:', error);
    throw error;
  }
};
export const upsertInterfaceSettings = async (data) => {
  try {
    const { chatbotId, ...restData } = data;

    const result = await prisma.interface.upsert({
      where: {
        chatbotId: chatbotId,
      },
      update: {
        ...restData,
        chatbot: {
          connect: {
            id: chatbotId,
          },
        },
      },
      create: {
        ...restData,
        chatbot: {
          connect: {
            id: chatbotId,
          },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return result;
  } catch (error) {
    console.error('Error upserting interface settings:', error);
    throw new Error('Interface settings upsert failed');
  }
};

export const getInterfaceSettings = async (chatbotId: string) => {
  try {
    const interfaceSettings = await db.interface.findUnique({
      where: { chatbotId },
    });
    return interfaceSettings;
  } catch (error) {
    console.error('Error fetching interface settings:', error);
    throw new Error('Error fetching interface settings');
  }
};
export const getFilteredQuestions = async (chatbotId: string) => {
  try {
    const questions = await prisma.filterQuestions.findMany({
      where: { chatbotId },
    });
    return questions;
  } catch (error) {
    console.error('Error fetching filtered questions:', error);
    throw error;
  }
};

export const saveFilteredQuestions = async (chatbotId: string, questions: { question: string }[]) => {
  try {
    await prisma.filterQuestions.deleteMany({
      where: { chatbotId },
    });

    await prisma.filterQuestions.createMany({
      data: questions.map((q) => ({ ...q, chatbotId })),
    });

    return true;
  } catch (error) {
    console.error('Error saving filtered questions:', error);
    throw error;
  }
};

export const updateFilteredQuestionAnswered = async (questionId: string, answered: boolean) => {
  try {
    await prisma.filterQuestions.update({
      where: { id: questionId },
      data: { answered },
    });

    return true;
  } catch (error) {
    console.error('Error updating filtered question:', error);
    throw error;
  }
};
export const getConversationMode = async (id: string) => {
  return await prisma.chatRoom.findUnique({
    where: { id },
    select: { live: true },
  });
};

export const getDomainChatRooms = async (id: string) => {
  return await prisma.domain.findUnique({
    where: { id },
    select: {
      customer: {
        select: {
          email: true,
          chatRoom: {
            select: {
              createdAt: true,
              id: true,
              message: {
                select: {
                  message: true,
                  createdAt: true,
                  seen: true,
                },
                orderBy: { createdAt: 'desc' },
                take: 1,
              },
            },
          },
        },
      },
    },
  });
};



export const updateChatRoom = async (id: string, data: any, select: any) => {
  return await prisma.chatRoom.update({
    where: { id },
    data,
    select,
  });
};



export const integrateDomain = async (clerkId: string, domain: string, icon: string) => {
  return await prisma.user.update({
    where: { clerkId },
    data: {
      domains: {
        create: {
          name: domain,
          icon,
          chatBot: {
            create: {
              welcomeMessage: 'Hey there, have a question? Text us here',
            },
          },
        },
      },
    },
  });
};

export const findUserSubscription = async (clerkId: string) => {
  return await prisma.user.findUnique({
    where: { clerkId },
    select: {
      _count: { select: { domains: true } },
      subscription: { select: { plan: true } },
    },
  });
};

export const findUserDomainByName = async (clerkId: string, domain: string) => {
  return await prisma.user.findFirst({
    where: {
      clerkId,
      domains: { some: { name: domain } },
    },
  });
};

export const getUserPlan = async (clerkId: string) => {
  return await prisma.user.findUnique({
    where: { clerkId },
    select: {
      subscription: { select: { plan: true } },
    },
  });
};

export const getAllAccountDomains = async (clerkId: string) => {
  return await prisma.user.findUnique({
    where: { clerkId },
    select: {
      id: true,
      domains: {
        select: {
          name: true,
          icon: true,
          id: true,
          customer: {
            select: {
              chatRoom: {
                select: {
                  id: true,
                  live: true,
                },
              },
            },
          },
        },
      },
    },
  });
};


export const getCurrentDomainInfo = async (clerkId: string, domain: string) => {
  return await prisma.user.findUnique({
    where: { clerkId },
    select: {
      subscription: { select: { plan: true } },
      domains: {
        where: { name: { contains: domain } },
        select: {
          id: true,
          name: true,
          icon: true,
          userId: true,
          products: true,
          chatBot: {
            select: {
              id: true,
              welcomeMessage: true,
              icon: true,
            },
          },
        },
      },
    },
  });
};

export const updateDomainName = async (id: string, name: string) => {
  return await prisma.domain.update({
    where: { id },
    data: { name },
  });
};

export const updateChatBotIcon = async (id: string, icon: string) => {
  return await prisma.domain.update({
    where: { id },
    data: {
      chatBot: { update: { data: { icon } } },
    },
  });
};

export const updateWelcomeMessage = async (domainId: string, message: string) => {
  return await prisma.domain.update({
    where: { id: domainId },
    data: {
      chatBot: { update: { data: { welcomeMessage: message } } },
    },
  });
};

export const deleteUserDomain = async (userId: string, id: string) => {
  return await prisma.domain.delete({
    where: { userId, id },
    select: { name: true },
  });
};

export const createHelpDeskQuestion = async (id: string, question: string, answer: string) => {
  return await prisma.domain.update({
    where: { id },
    data: {
      helpdesk: {
        create: { question, answer },
      },
    },
    include: {
      helpdesk: {
        select: { id: true, question: true, answer: true },
      },
    },
  });
};

export const getAllHelpDeskQuestions = async (domainId: string) => {
  return await prisma.helpDesk.findMany({
    where: { domainId },
    select: { question: true, answer: true, id: true },
  });
};

export const createFilterQuestion = async (id: string, question: string) => {
  return await prisma.domain.update({
    where: { id },
    data: {
      filterQuestions: { create: { question } },
    },
    include: {
      filterQuestions: {
        select: { id: true, question: true },
      },
    },
  });
};

export const getAllFilterQuestions = async (domainId: string) => {
  return await prisma.filterQuestions.findMany({
    where: { domainId },
    select: { question: true, id: true },
    orderBy: { question: 'asc' },
  });
};

export const getPaymentConnected = async (clerkId: string) => {
  return await prisma.user.findUnique({
    where: { clerkId },
    select: { stripeId: true },
  });
};

export const createNewDomainProduct = async (id: string, name: string, image: string, price: string) => {
  return await prisma.domain.update({
    where: { id },
    data: {
      products: {
        create: { name, image, price: parseInt(price) },
      },
    },
  });
};

export const getChatbotChatRooms = async (chatbotId: string) => {
  return await prisma.chatRoom.findMany({
    where: {
      chatbotId: chatbotId,
    },
    select: {
      id: true,
      createdAt: true,
      ChatMessages: {  // Use the correct relation name
        select: {
          message: true,
          createdAt: true,
          seen: true,
          sender: true,  // Assuming this is also a field you want
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
      },
      live: true,
      mailed: true,
      updatedAt: true,
      customerId: true,
      chatbotId: true,
      Customer: {
        select: {
          email: true,
        },
      },
    },
  });
};




export const getChatMessages = async (roomId: string) => {
  return await prisma.chatRoom.findUnique({
    where: {
      id: roomId,
    },
    select: {
      id: true,
      ChatMessages: {
        select: {
          id: true,
          sender: true,
          message: true,
          createdAt: true,
          seen: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });
};

export const createMessageInChatRoom = async (
  chatRoomId: string,
  message: string,
  sender: 'customer' | 'user' | 'chatbot'
) => {
  const chatRoom = await db.chatRoom.findUnique({
    where: { id: chatRoomId },
    include: { Chatbot: true },  // Assuming there's a relation between chatRoom and chatbot
  });

  if (!chatRoom) {
    throw new Error("Chat room not found");
  }

  const chatbotId = chatRoom.chatbotId;

  if (!chatbotId) {
    throw new Error("Chatbot ID is missing in the chat room");
  }

  const chatMessage = await db.chatMessage.create({
    data: {
      chatRoomId,
      message,
      sender: sender,
    },
  });

  // // Save to training history if the sender is a customer or user
  // if (sender === 'customer' || sender === 'user') {
  //   await createTraining(chatRoomId, {
  //     type: 'chat',
  //     content: message,
  //     chatbotId: chatbotId,  // Use the correct chatbotId
  //     userId: sender === 'customer' ? 'anonymous' : sender, 
  //   });
  // }

  // Trigger the message event via Pusher or any other event system
  pusherServer.trigger(`chatroom-${chatRoomId}`, 'new-message', {
    id: chatMessage.id,
    message: chatMessage.message,
    sender: chatMessage.sender,
    createdAt: chatMessage.createdAt,
  });

  // Optionally generate an AI response if the sender is a customer
  if (sender === 'customer') {
    const aiResponse = await prepareChatResponse(message, chatbotId);
    if (aiResponse) {
      await createMessageInChatRoom(chatRoomId, aiResponse, 'chatbot');
    }
  }

  return chatMessage;
};



export const updateMessagesToSeen = async (chatRoomId: string) => {
  return await prisma.chatMessage.updateMany({
    where: { chatRoomId },
    data: { seen: true },
  });
};

export const enableLiveAgentMode = async (chatRoomId: string, agentId: string) => {
  // Assign agent and update the chat room to live mode
  const chatRoom = await assignAgentToChatRoom(chatRoomId, agentId);
  
  // Optionally, you can notify the customer that a live agent is available
  await createMessageInChatRoom(chatRoomId, 'You are now connected with a live agent.', 'user');

  return chatRoom;
};

export const assignAgentToChatRoom = async (chatRoomId: string, agentId: string) => {
  return await prisma.chatRoom.update({
    where: { id: chatRoomId },
    data: { agentId, live: true },
  });
};

// End a chatroom session
export const endChatRoomSession = async (chatRoomId: string) => {
  return await prisma.chatRoom.update({
    where: { id: chatRoomId },
    data: { live: false },
  });
};
export async function sendMessageToChatGPT(message: string) {
  // Simulate sending message to ChatGPT and receiving a response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: Date.now().toString(),
        message: `ChatGPT response to: "${message}"`,
        createdAt: new Date().toISOString(),
        sender: 'chatbot',
      });
    }, 1000);
  });
}

export const createCustomerAndChatRoom = async (chatbotId: string, isPlayground: boolean) => {
  let customer;
  let chatRoom;

  if (isPlayground) {
    // When in playground mode, use chatbotId as both customerId and chatRoomId
    customer = await prisma.customer.upsert({
      where: { id: chatbotId },
      update: {},
      create: {
        id: chatbotId,
        name: `Customer_${chatbotId}`,
        email: null, // Start with no email
        chatbotId,
      },
    });

    chatRoom = await prisma.chatRoom.upsert({
      where: { id: chatbotId },
      update: {},
      create: {
        id: chatbotId,
        chatbotId,
        customerId: chatbotId,
        live: false,
      },
    });

    return { customerId: chatbotId, chatRoomId: chatbotId };
  } else {
    // Generate a dynamic name (e.g., Customer1, Customer2, ...)
    const customerCount = await prisma.customer.count({
      where: { chatbotId },
    });
    const dynamicName = `Customer${customerCount + 1}`;

    customer = await prisma.customer.create({
      data: {
        name: dynamicName,
        email: null, // Start with no email
        chatbotId,
      },
    });

    chatRoom = await prisma.chatRoom.create({
      data: {
        chatbotId,
        customerId: customer.id,
        live: false,
      },
    });

    return { customerId: customer.id, chatRoomId: chatRoom.id };
  }
};

export const updateChatbotStatus = async (chatbotId, isPublic) => {
  try {
    await prisma.chatbot.update({
      where: { id: chatbotId },
      data: { isPublic },
    });
    console.log(`Chatbot status updated to ${isPublic ? 'public' : 'private'}`);
  } catch (error) {
    console.error('Error updating chatbot status:', error);
  }
};

export const fetchChatbotStatus = async (chatbotId) => {
  try {
    const chatbot = await prisma.chatbot.findUnique({
      where: { id: chatbotId },
      select: { isPublic: true },
    });
    return chatbot ? chatbot.isPublic : false;
  } catch (error) {
    console.error('Error fetching chatbot status:', error);
    return null;
  }
};
export const fetchChatRoomById = async (chatbotId: string) => {
  const chatRoom = await prisma.chatRoom.findFirst({
    where: { id: chatbotId },
    include: {
      ChatMessages: {
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  return chatRoom;
};

export const createTrainingHistory = async (chatbotId: string, data: any) => {
  const { type, content, fileName, websiteUrl, question, answer } = data;
  const user = await currentUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  // Save the training data to the history table
  const trainingHistory = await db.trainingHistory.create({
    data: {
      sourceType: type,
      undefined,
      fileName,
      websiteUrl,
      question,
      answer,
      chatbotId,
      userId: user.id,
    },
  });
  return trainingHistory;
};
export const fetchChatbotsWithDetails = async (accountId: string) => {
  try {
    console.log(accountId);
    const chatbots = await db.chatbot.findMany({
      where: {
        accountId: accountId,
      },
      include: {
        ChatbotSettings: {
          include: {
            AIModel: true, // This should be handled as optional
            ChatbotType: true, // This too should be optional
          },
        },
      },
    });

    return chatbots;
  } catch (error) {
    console.error('Error fetching chatbots:', error);
    throw error;
  }
};

export async function toggleLiveAgentMode(chatRoomId: string, isLive: boolean) {
  try {
    const authUser = await currentUser();
    if (!authUser) {
      throw new Error('User not authenticated');
    }

    const userDetails = await db.user.findUnique({
      where: {
        email: authUser.emailAddresses[0].emailAddress,
      },
    });

    if (!userDetails) {
      throw new Error('User details not found');
    }

    const agentId = isLive ? userDetails.id : null;
    const chatRoom = await db.chatRoom.update({
      where: { id: chatRoomId },
      data: {
        agentId: agentId,
        live: isLive,
      },
    });

    const systemMessage = isLive 
      ? `${userDetails.name} has joined the chat as a live agent.` 
      : `${userDetails.name} has left the chat.`;

    // Save the system message to the database
    const savedSystemMessage = await db.chatMessage.create({
      data: {
        chatRoomId,
        message: systemMessage,
        sender: 'system'      },
    });

    // Trigger the system message via Pusher after saving it to the database
    pusherServer.trigger(`chatroom-${chatRoomId}`, 'new-message', {
      id: savedSystemMessage.id,
      message: savedSystemMessage.message,
      sender: 'system',
      createdAt: savedSystemMessage.createdAt,
    });

    // Trigger an event to notify the UI that live mode has been toggled
    pusherServer.trigger(`chatroom-${chatRoomId}`, 'live-mode-toggled', { isLive });

    return { success: true, chatRoom };
  } catch (error) {
    console.error('Failed to toggle live agent mode:', error);
    return { success: false, error };
  }
}





export async function sendSystemMessage(chatRoomId: string, message: string) {
  try {
    await db.chatMessage.create({
      data: {
        chatRoomId,
        message,
        sender: 'system', 
      },
    });
  } catch (error) {
    console.error('Failed to send system message:', error);
  }
}
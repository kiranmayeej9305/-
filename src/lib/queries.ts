'use server'

import { clerkClient, currentUser } from '@clerk/nextjs'
import { db } from './db'
import { redirect } from 'next/navigation'
import { pusherServer , pusherClient} from '@/lib/pusher';
import { sendEmailAndSmsNotifications } from '@/lib/live-agent-notifications';
import { google } from 'googleapis';
import {
  Account,
  Lane,
  Prisma,
  Role,
  Chatbot,
  Tag,
  Ticket,
  User,
} from '@prisma/client'
import { v4 } from 'uuid'
import { prepareChatResponse } from './openai'
import { refreshAccessToken } from './refresh-access-token';
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
  const user = await currentUser();
  if (!user) return;

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
      accountId: newUser.accountId, // Account ID is provided when creating the user
    },
  });

  await clerkClient.users.updateUserMetadata(user.id, {
    privateMetadata: {
      role: newUser.role || 'CHATBOT_USER',
    },
  });

  return userData;
};


export const upsertAccount = async (account: Account, isCreating: boolean) => {
  if (!account.companyEmail) {
    console.error('No company email provided.');
    return null;
  }

  try {
    return await db.$transaction(async (transaction) => {
      // Upsert account details
      const accountDetails = await transaction.account.upsert({
        where: { id: account.id || '' },
        update: { ...account },
        create: { ...account, createdAt: new Date() },
      });

      console.log('Account upserted successfully:', accountDetails);

      if (isCreating) {
        console.log(`Creating sidebar options for account ID: ${accountDetails.id}`);

        // Fetch the free plan features in one query
        const freePlanFeatures = await transaction.planFeature.findMany({
          where: {
            plan: {
              name: 'Free',
            },
          },
        });

        const usageRecords = freePlanFeatures.map((feature) => ({
          accountId: accountDetails.id,
          planFeatureId: feature.id,
          usageCount: 0,
          lastReset: new Date(),
        }));

        await transaction.accountUsage.createMany({
          data: usageRecords,
          skipDuplicates: true,
        });

        console.log('Account usage records upserted successfully');
      }

      return accountDetails;
    });
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
export const getChatbotUsersWithAccess = async (chatbotId: string) => {
  const chatbotUsersWithAccess = await db.user.findMany({
    where: {
      Permissions: {
        some: {
          chatbotId: chatbotId,
          access: true,  // Only include users who have access to this chatbot
        },
      },
    },
  });

  return chatbotUsersWithAccess;
};

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
export const getAccountSidebarOptions = async (accountId: string) => {
  try {
    const sidebarOptions = await db.accountSidebarOption.findMany({
      where: {
        isVisible: true, // Fetch only visible options
      },
      orderBy: {
        displayOrder: 'asc', // Order by displayOrder
      },
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
export const getChatbotSidebarOptions = async (chatbotId: string) => {
  try {
    const sidebarOptions = await db.chatbotSidebarOption.findMany({
      where: {
        isVisible: true, // Fetch only visible options
      },
      orderBy: {
        displayOrder: 'asc', // Order by displayOrder
      },
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
          where: { chatbotId },
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
            botDisplayNameColor: "#000000",
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
            chatbotId,
            icon: "",
            userAvatar: "/images/user.png",
            chatbotAvatar: "/images/chatbot.png",
            chatIcon: "/images/bot.png",
            background: "#ffffff",
            userMsgBackgroundColour: "#ffffff",
            chatbotMsgBackgroundColour: "#f0f0f0",
            userTextColor: "#000000",
            chatbotTextColor: "#000000",
            botDisplayNameColor: "#000000",
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

        // Insert only chatbot-level free plan features into the chatbot usage table
        const freePlanFeatures = await transaction.planFeature.findMany({
          where: {
            feature: {
              type: 'chatbot',
            },
            plan: {
              name: 'Free',
            },
          },
        });

        await transaction.chatbotUsage.createMany({
          data: freePlanFeatures.map((feature) => ({
            chatbotId,
            planFeatureId: feature.id,
            usageCount: 0,
            lastReset: new Date(),
          })),
          skipDuplicates: true,
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
    include: { Chatbot: true },
  });

  if (!chatRoom) {
    throw new Error('Chat room not found');
  }

  const chatbotId = chatRoom.chatbotId;

  if (!chatbotId) {
    throw new Error("Chatbot ID is missing in the chat room");
  }

  const chatMessage = await db.chatMessage.create({
    data: {
      chatRoomId,
      message,
      sender
    },
  });

  // Trigger the message event via Pusher or another event system
  pusherServer.trigger(`chatroom-${chatRoomId}`, 'new-message', {
    id: chatMessage.id,
    message: chatMessage.message,
    sender: chatMessage.sender,
    createdAt: chatMessage.createdAt,
  });

  // Check if the live agent is active; if live agent mode is active, the AI should not respond
  if (sender === 'customer' && !chatRoom.live) {
    return chatMessage; // AI response is already handled in handleChatMessage
  }

  return chatMessage;
};

// Example functions to fetch data from your database
export async function getChatbotData(chatbotId: string) {
  // Fetch chatbot data from the database
  const chatbot = await prisma.chatbot.findUnique({
    where: { id: chatbotId },
  });
  return chatbot;
}

export async function getAccountData(accountId: string) {
  // Fetch account data from the database
  const account = await prisma.account.findUnique({
    where: { id: accountId },
  });
  return account;
}


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
      ? `${userDetails.name} has joined the chat.` 
      : `${userDetails.name} has left the chat.`;

    // Save the system message to the database
    const savedSystemMessage = await db.chatMessage.create({
      data: {
        chatRoomId,
        message: systemMessage,
        sender: 'system',
      },
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

export const getNextUnansweredQuestion = async (chatbotId: string, customerId: string) => {
  const question = await db.filterQuestions.findFirst({
    where: {
      chatbotId,
      OR: [
        // No responses at all for this customer
        {
          customerResponses: {
            none: {
              customerId,
            },
          },
        },
        // Unanswered responses for this customer
        {
          customerResponses: {
            some: {
              customerId,
              answered: false,
            },
          },
        },
      ],
    },
    orderBy: {
      createdAt: 'asc', // Fetch in the order they were created
    },
  });
  return question;
};



// Save the AI-asked question with an empty response initially
export const saveAskedQuestion = async (
  customerId: string,
  filterQuestionId: string,
  questionText: string
) => {
  const savedQuestion = await db.customerResponses.create({
    data: {
      customerId,
      filterQuestionId,  // Link it to the FilterQuestions table
      question: questionText,
      responseText: '',  // Initially, no response from the customer
      answered: false,  // Mark the question as unanswered
    },
  });
  return savedQuestion;
};


// Update customer response for a previously asked question
export const updateCustomerResponse = async (
  customerId: string,
  question: string,
  responseText: string
) => {
  const updatedResponse = await db.customerResponses.updateMany({
    where: {
      customerId,
      question,
      responseText: '',  // Only update if the response was previously unanswered
    },
    data: {
      responseText,  // Update with the customer's response
    },
  });
  return updatedResponse;
};


export const handleChatMessage = async (
  chatRoomId: string,
  chatbotId: string,
  customerMessage: string
) => {
  try {
    // Save the customer's message in the chatroom
    await createMessageInChatRoom(chatRoomId, customerMessage, 'customer');

    // Fetch chat room details to check if the conversation is live
    const chatRoom = await db.chatRoom.findUnique({
      where: { id: chatRoomId },
      include: {
        Customer: true,
        Chatbot: {
          include: {
            Account: true,
          },
        },
      },
    });

    // If the chat is handled by a live agent, exit the process
    if (chatRoom.live) {
      return 'Live agent is handling the conversation.';
    }

    // Process the customer's response to the previous question
    const lastAskedQuestion = await db.customerResponses.findFirst({
      where: {
        customerId: chatRoom.customerId,
        answered: false,  // Find the last unanswered question
      },
    });
    
    if (lastAskedQuestion) {
      // If the last question was unanswered, update it with the customer's response
      await processCustomerResponse(chatRoom.customerId, lastAskedQuestion.filterQuestionId!, customerMessage);
    }

    // Get the next unanswered question for the customer
    const nextQuestion = await getNextUnansweredQuestion(chatbotId, chatRoom.customerId);
    // Handle the next unanswered question
    if (nextQuestion) {
      // Generate AI response for the next question
      const aiResponse = await prepareChatResponse(
        customerMessage,
        nextQuestion.question,
        chatbotId
      );
     
      // Save AI's response (the next question) in the chatroom
      await createMessageInChatRoom(chatRoomId, aiResponse, 'chatbot');

      // Save the asked question for tracking
      await saveAskedQuestion(chatRoom.customerId, nextQuestion.id, nextQuestion.question);

      return { aiResponse };
    } else {
      // If no unanswered questions remain, proceed with normal AI response
      const aiResponse = await prepareChatResponse(
        customerMessage,
        null,
        chatbotId
      );

      // Save the AI response in the chatroom
      await createMessageInChatRoom(chatRoomId, aiResponse, 'chatbot');
      
      // Check if AI response contains "(realtime)"
      if (aiResponse.includes('(realtime)')) {
        const customerName = chatRoom.Customer?.name || 'Unknown';
        const customerEmail = chatRoom.Customer?.email || 'Unknown';
        const chatbotName = chatRoom.Chatbot?.name || 'Unknown';
        const accountName = chatRoom.Chatbot?.Account?.name || 'Unknown';
        const chatbotId = chatRoom.Chatbot?.id;

        // Trigger email and SMS notifications
        await sendEmailAndSmsNotifications(
          chatRoomId,
          customerName,
          customerEmail,
          chatbotName,
          accountName,
          chatbotId
        );
      }
      return { aiResponse };
    }
  } catch (error) {
    console.error('Error handling chat message:', error);
    throw error;
  }
};

// Process the customer's response and mark the response as answered
export const processCustomerResponse = async (
  customerId: string,
  filterQuestionId: string,
  customerResponse: string
) => {
  try {
    // Update the customer response in CustomerResponses
    await db.customerResponses.updateMany({
      where: {
        customerId,
        filterQuestionId,
        answered: false,  // Ensure we are only updating unanswered questions
      },
      data: {
        responseText: customerResponse,  // Update the response
        answered: true,  // Mark the question as answered
      },
    });
  } catch (error) {
    console.error('Error processing customer response:', error);
    throw error;
  }
};




export const getFirstUnansweredQuestion = async (chatbotId: string) => {
  const firstUnansweredQuestion = await db.filterQuestions.findFirst({
    where: {
      chatbotId,
      answered: false,  // Fetch unanswered questions
    },
    orderBy: {
      createdAt: 'asc',  // Ask questions in the order they were created
    },
  });

  return firstUnansweredQuestion;
};

export async function setDefaultCalendarIntegration(chatbotId: string, integrationId: string) {
  try {
    // Reset all integrations to not be default
    await db.calendarIntegration.updateMany({
      where: { chatbotId },
      data: { isDefault: false },
    });

    // Set the selected integration as default
    await db.calendarIntegration.update({
      where: { id: integrationId },
      data: { isDefault: true },
    });

    return { success: true, message: 'Default calendar set successfully' };
  } catch (error) {
    console.error('Error setting default calendar:', error);
    throw new Error('Failed to set default calendar');
  }
}
export async function getCalendarIntegration(chatbotId: string) {
  const integration = await db.calendarIntegration.findFirst({
    where: {
      chatbotId,
      platform: 'google',
      isDefault: true,  // Ensure this is the default integration
    },
  });

  if (!integration) {
    throw new Error('No Google Calendar integration found for this chatbot.');
  }

  return integration;
}
export async function fetchGoogleAppointments(chatbotId: string) {
 
  await refreshAccessToken(chatbotId);
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  const events = await calendar.events.list({
    calendarId: 'primary',
    timeMin: new Date().toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime',
  });

  const appointments = events.data.items?.map(event => ({
    eventId: event.id!,
    appointmentTime: new Date(event.start?.dateTime || event.start?.date!),
    customerId: 'N/A',  // You can link it to your customers if you have mapping
    chatbotId,
    platform: 'google',
  }));

  await db.appointment.createMany({ data: appointments });
}

// Function to get the Google Calendar embed URL and refresh tokens if necessary
export async function getCalendarEmbedUrl(chatbotId: string) {
  // Fetch the integration from the database
  const integration = await db.calendarIntegration.findFirst({
    where: {
      chatbotId,
      platform: 'google',
    },
  });
  if (!integration) {
    throw new Error('No Google Calendar integration found for this chatbot.');
  }

  // Check if the access token is expired
  const currentTime = new Date().getTime();
  if (integration.expiryDate && new Date(integration.expiryDate).getTime() < currentTime) {
    // Refresh the token if expired
    await refreshAccessToken(chatbotId);

  }

  // Return the existing embed URL if the access token is still valid
  return {
    integrationUrl: integration.integrationUrl,
    platform: integration.platform
  };
}

// Function to save Google integration data, including calendarId and tokens
export async function saveGoogleIntegration(tokens: any, chatbotId: string) {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials(tokens);

  try {
    // Fetch the list of calendars for the user
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const calendarList = await calendar.calendarList.list();

    // Assuming we take the first calendar for simplicity
    const primaryCalendar = calendarList.data.items?.find(cal => cal.primary) || calendarList.data.items?.[0];
    if (!primaryCalendar) {
      throw new Error('No calendars found for this user.');
    }

    const calendarId = primaryCalendar.id;

    // Attempt to find an existing integration for the chatbot
    const existingIntegration = await db.calendarIntegration.findFirst({
      where: { chatbotId, platform: 'google' }, // Ensure to match chatbotId and platform
    });

    // Prepare the integration data to be used for both update and create
    const integrationData = {
      platform: 'google',
      accessToken: tokens.access_token!,
      refreshToken: tokens.refresh_token || existingIntegration?.refreshToken, // Use new or existing refresh token
      expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : existingIntegration?.expiryDate, // Handle expiry date
      chatbotId: chatbotId,
      integrationUrl: `https://calendar.google.com/calendar/embed?src=${calendarId}`, // Embed the calendar URL using calendarId
      isDefault: true,
    };

    if (existingIntegration) {
      // Update the existing integration with new tokens and data
      return await db.calendarIntegration.update({
        where: { id: existingIntegration.id }, // Update using the unique ID of the existing integration
        data: integrationData,
      });
    } else {
      // Create a new integration if none exists
      return await db.calendarIntegration.create({
        data: integrationData,
      });
    }
  } catch (error) {
    console.error('Error saving Google integration:', error);
    throw new Error('Failed to save Google integration and fetch calendarId.');
  }
}


export async function updateAccessTokenInDb(chatbotId: string, accessToken: string, expiryDate: number) {
  try {
    const existingIntegration = await db.calendarIntegration.findFirst({
      where: { chatbotId, platform: 'google' }, // Ensure to match chatbotId and platform
    });
    await db.calendarIntegration.update({
      where: { id: existingIntegration.id },      
      data: {
        accessToken,
        expiryDate: new Date(expiryDate),
      },
    });
  } catch (error) {
    console.error('Failed to update access token in DB:', error);
    throw new Error('Database operation failed.');
  }
}

export const postAppointmentSchedulerLink = async (chatroomId, chatbotId, customerEmail) => {
  try {
    // Generate the booking link
    const bookingUrl = `/api/calendar-integrations/google/available-slots?chatbotId=${chatbotId}&customerEmail=${customerEmail}`;

    // Post the booking link in the chatroom
    await createMessageInChatRoom(chatroomId, `Click here to schedule your appointment: ${bookingUrl}`, 'chatbot');
  } catch (error) {
    console.error('Failed to post scheduler link:', error);
  }
};
export async function saveAppointment({ chatbotId, customerEmail, eventId, appointmentTime, platform }) {
  return db.appointment.create({
    data: {
      chatbotId,
      customerId: customerEmail, // Assuming customerEmail maps to customer
      eventId,
      appointmentTime: new Date(appointmentTime),
      platform,
    },
  });
}
export const getLeads = async (limit: number, offset: number, search: string) => {
  const leads = await prisma.customer.findMany({
    where: {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ],
    },
    include: {
      responses: true,
    },
    take: limit,
    skip: offset,
  })

  const totalLeads = await prisma.customer.count({
    where: {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ],
    },
  })

  return { leads, totalLeads }
}

export const updateLeadDetails = async (id: string, { name, email, leadQuality }: { name: string; email: string; leadQuality: 'GOOD' | 'BAD' | 'EXCELLENT' }) => {
  return await prisma.customer.update({
    where: { id },
    data: { name, email, leadQuality },
  })
}


export const deleteLead = async (id: string) => {
  return await prisma.customer.delete({
    where: { id },
  })
}
export async function getPlanDetailsForUser(userId: string) {
  const account = await db.account.findFirst({
    where: {
      users: {
        some: { id: userId },
      },
    },
    select: {
      id: true,
      customerId: true,
    },
  });

  if (!account) {
    return null;
  }

  const subscription = await db.subscription.findFirst({
    where: {
      accountId: account.id,
      isAddOn: false,
    },
    include: {
      Plan: {
        include: {
          features: {
            include: {
              feature: true,
            },
          },
          frontendFeatures: {
            include: {
              feature: true,
            },
          },
        },
      },
    },
  });

  if (!subscription) {
    const freePlan = await db.plan.findFirst({
      where: { name: 'Free', isAddOn: false },
      include: {
        features: {
          include: {
            feature: true,
          },
        },
        frontendFeatures: {
          include: {
            feature: true,
          },
        },
      },
    });

    return {
      customerId: account.customerId,
      plan: {
        planName: freePlan?.name || 'Free',
        planDescription: freePlan?.description || 'Basic access features.',
        billingCycle: 'monthly',
        price: freePlan?.monthlyPrice || 0,
        features: freePlan?.features.map((f) => ({
          identifier: f.feature.identifier,
          name: f.feature.name,
          description: f.feature.description,
          planFeatureId: f.id, // Include the planFeatureId
          value: f.value !== null ? f.value : 'Unlimited',
        })) || [],
        frontendFeatures: freePlan?.frontendFeatures.map((f) => ({
          name: f.feature.name,
          description: f.feature.description,
        })) || [],
      },
      addons: [],
    };
  }

  const addOns = await db.subscription.findMany({
    where: {
      accountId: subscription.accountId,
      isAddOn: true,
      active: true,
    },
    include: {
      Plan: {
        include: {
          features: {
            include: {
              feature: true,
            },
          },
          frontendFeatures: {
            include: {
              feature: true,
            },
          },
        },
      },
    },
  });

  const { Plan, priceId } = subscription;
  const billingCycle = Plan?.stripeMonthlyPriceId === priceId ? 'monthly' : 'yearly';
  const planPrice = billingCycle === 'monthly' ? Plan?.monthlyPrice : Plan?.yearlyPrice;

  const addOnsDetails = addOns.map((addon) => {
    const addOnPrice = addon.Plan.stripeMonthlyPriceId === addon.priceId ? addon.Plan.monthlyPrice : addon.Plan.yearlyPrice;

    return {
      name: addon.Plan.name,
      description: addon.Plan.description,
      price: addOnPrice,
      billingCycle: addon.Plan.stripeMonthlyPriceId === addon.priceId ? 'monthly' : 'yearly',
      features: addon.Plan.features.map((f) => ({
        identifier: f.feature.identifier,
        name: f.feature.name,
        description: f.feature.description,
        planFeatureId: f.id, // Include planFeatureId for addons
        value: f.value !== null ? f.value : 'Unlimited',
      })),
      frontendFeatures: addon.Plan.frontendFeatures.map((f) => ({
        name: f.feature.name,
        description: f.feature.description,
      })),
    };
  });

  return {
    customerId: account.customerId,
    plan: {
      planName: Plan?.name,
      planDescription: Plan?.description,
      billingCycle,
      price: planPrice || 0,
      features: Plan?.features.map((f) => ({
        identifier: f.feature.identifier,
        name: f.feature.name,
        description: f.feature.description,
        planFeatureId: f.id, // Include the planFeatureId
        value: f.value !== null ? f.value : 'Unlimited',
      })) || [],
      frontendFeatures: Plan?.frontendFeatures.map((f) => ({
        name: f.feature.name,
        description: f.feature.description,
      })) || [],
    },
    addons: addOnsDetails.length > 0 ? addOnsDetails : [],
  };
}
export async function getAllPlans() {
  try {

    // Fetch regular plans with frontend features
    const plans = await db.plan.findMany({
      where: { isAddOn: false }, // Fetching only non-add-ons, regular plans
      include: {
        frontendFeatures: {
          include: {
            feature: true, // Include the actual FrontendFeature data
          },
        },
      },
    });

    // Fetch add-ons with frontend features
    const addOns = await db.plan.findMany({
      where: { isAddOn: true }, // Fetching only add-ons
      include: {
        frontendFeatures: {
          include: {
            feature: true, // Include the actual FrontendFeature data
          },
        },
      },
    });

    // Map regular plans and their frontend features
    const mappedPlans = plans.map((plan) => {
      return {
        id: plan.id,
        name: plan.name,
        description: plan.description,
        monthlyPrice: plan.monthlyPrice,
        yearlyPrice: plan.yearlyPrice,
        frontendFeatures: plan.frontendFeatures.map((f) => ({
          name: f.feature.name, // Accessing the name from the feature object
          description: f.feature.description, // Accessing the description from the feature object
        })),
      };
    });

    // Map add-ons and their frontend features
    const mappedAddOns = addOns.map((addon) => {
      return {
        id: addon.id,
        name: addon.name,
        description: addon.description,
        monthlyPrice: addon.monthlyPrice,
        yearlyPrice: addon.yearlyPrice,
        frontendFeatures: addon.frontendFeatures.map((f) => ({
          name: f.feature.name,
          description: f.feature.description,
        })),
      };
    });

    return {
      plans: mappedPlans,
      addOns: mappedAddOns,
    };

  } catch (error) {
    console.error("Error fetching plans or add-ons:", error);
    throw error;
  }
}








export async function getPricingPlans() {
  const pricingPlans = await db.plan.findMany({
    where: { isAddOn: false },
    include: {
      features: { include: { feature: true } },
      frontendFeatures: true,
    },
  });
  return pricingPlans;
}

export async function getPlanAndAddOnDetails(accountId: string) {
  // Ensure accountId is valid
  if (!accountId) {
    throw new Error('accountId is undefined');
  }

  // Fetch the account and its subscriptions
  const account = await db.account.findUnique({
    where: { id: accountId },
    include: {
      subscriptions: {
        include: {
          Plan: {
            include: {
              features: true,
            },
          },
        },
      },
    },
  });

  // Check if the account exists
  if (!account || !account.subscriptions) {
    throw new Error(`No account found with ID: ${accountId}`);
  }

  // Ensure that subscriptions exist
  const subscriptions = account.subscriptions ?? [];

  // Separate regular plans and add-ons using the `isAddOn` flag in the Plan
  const regularPlans = subscriptions.filter(
    (sub) => sub.Plan && !sub.Plan.isAddOn
  );
  const addOns = subscriptions.filter((sub) => sub.Plan && sub.Plan.isAddOn);

  return {
    regularPlans,
    addOns,
  };
}
export async function getAddOns(accountId: string) {
  return await db.subscription.findMany({
    where: {
      accountId,
      isAddOn: true,
      active: true,
    },
    include: {
      Plan: true,
    },
  });
}

export async function getAccountSubscription(accountId: string) {
  return await db.account.findUnique({
    where: {
      id: accountId,
    },
    select: {
      customerId: true,
      Subscription: {
        include: {
          Plan: {
            include: {
              features: {
                include: {
                  feature: true,
                },
              },
            },
          },
        },
      },
    },
  });
}
export const checkFeatureUsageLimit = async (
  planFeatureId: string,
  type: 'account' | 'chatbot',
  id: string
) => {
  const usageRecord = await (type === 'account'
    ? db.accountUsage.findFirst({
        where: {
          accountId: id,
          planFeatureId: planFeatureId, // Ensure it's checking by planFeatureId
        },
      })
    : db.chatbotUsage.findFirst({
        where: {
          chatbotId: id,
          planFeatureId: planFeatureId, // Ensure it's checking by planFeatureId
        },
      }));

  const currentUsage = usageRecord ? usageRecord.usageCount : 0;

  // Fetch the limit for this plan feature from the planFeatureId
  const planFeature = await db.planFeature.findFirst({
    where: { id: planFeatureId },
  });

  if (!planFeature) {
    throw new Error(`PlanFeature with ID ${planFeatureId} not found.`);
  }

  const limit = planFeature.value !== null ? planFeature.value : Infinity; // Handle 'Unlimited' features
  return currentUsage >= limit; // Return true if usage exceeds or meets the limit
};


export const incrementUsage = async (
  planFeatureId: string,
  type: 'account' | 'chatbot',
  id: string
) => {
  const now = new Date();

  if (type === 'account') {
    // Upsert usage record for the account-level feature
    await db.accountUsage.upsert({
      where: {
        accountId_planFeatureId: {
          accountId: id,
          planFeatureId, // Ensure it's using planFeatureId
        },
      },
      update: {
        usageCount: { increment: 1 },
        lastReset: now, // Update reset time if needed
      },
      create: {
        accountId: id,
        planFeatureId,
        usageCount: 1, // Start at 1 if this is a new record
        lastReset: now,
      },
    });
  } else if (type === 'chatbot') {
    // Upsert usage record for the chatbot-level feature
    await db.chatbotUsage.upsert({
      where: {
        chatbotId_planFeatureId: {
          chatbotId: id,
          planFeatureId, // Ensure it's using planFeatureId
        },
      },
      update: {
        usageCount: { increment: 1 },
        lastReset: now, // Update reset time if needed
      },
      create: {
        chatbotId: id,
        planFeatureId,
        usageCount: 1, // Start at 1 if this is a new record
        lastReset: now,
      },
    });
  }
};

export const resetUsageForAccountAndChatbots = async (accountId: string, featureIdentifiers: string[]) => {
  try {
    const now = new Date();

    // Get the PlanFeature IDs for the specified features
    const planFeatures = await db.planFeature.findMany({
      where: {
        feature: {
          identifier: { in: featureIdentifiers },
        },
      },
      select: {
        id: true,
      },
    });

    const planFeatureIds = planFeatures.map((pf) => pf.id);

    // Reset usage for the account only for the specified features
    await db.accountUsage.updateMany({
      where: {
        accountId,
        planFeatureId: { in: planFeatureIds },
      },
      data: {
        usageCount: 0,
        lastReset: now,
      },
    });

    // Get all chatbots under this account
    const chatbots = await db.chatbot.findMany({
      where: { accountId },
      select: { id: true },
    });

    // Reset usage for each chatbot under the account only for the specified features
    for (const chatbot of chatbots) {
      await db.chatbotUsage.updateMany({
        where: {
          chatbotId: chatbot.id,
          planFeatureId: { in: planFeatureIds },
        },
        data: {
          usageCount: 0,
          lastReset: now,
        },
      });
    }

    console.log(`🟢 Successfully reset usage for account ${accountId} and its chatbots for features: ${featureIdentifiers.join(', ')}`);
  } catch (error) {
    console.error(`🔴 Error resetting usage for account ${accountId}: ${error.message}`);
  }
};

export const resetUsageForAllAccounts = async (featureIdentifiers: string[]) => {
  try {
    const now = new Date();

    // Get all accounts
    const accounts = await db.account.findMany({
      select: { id: true },
    });

    for (const account of accounts) {
      // Reset usage for the account and its chatbots for specific features
      await resetUsageForAccountAndChatbots(account.id, featureIdentifiers);
    }

    console.log(`🟢 Successfully reset usage for all accounts and their chatbots for features: ${featureIdentifiers.join(', ')}`);
  } catch (error) {
    console.error(`🔴 Error resetting usage for all accounts: ${error.message}`);
  }
};

// Fetch all blogs
export const getBlogs = async () => {
  try {
    const blogs = await db.blog.findMany({
      include: {
        blogTags: {
          include: {
            tag: true,
          },
        },
      },
    });
    return blogs;
  } catch (error) {
    console.error("Error fetching blogs:", error);
    throw new Error("Failed to fetch blogs");
  }
};

// Fetch a single blog by ID
export const getBlogById = async (id: string) => {
  try {
    const blog = await db.blog.findUnique({
      where: { id },
      include: {
        blogTags: {
          include: {
            tag: true,
          },
        },
      },
    });
    return blog;
  } catch (error) {
    console.error(`Error fetching blog with ID ${id}:`, error);
    throw new Error("Failed to fetch blog");
  }
};



// Fetch all available topics
export const getTopics = async () => {
  try {
    const topics = await db.topic.findMany();
    return topics;
  } catch (error) {
    console.error("Error fetching topics:", error);
    throw new Error("Failed to fetch topics");
  }
};

// Fetch all available tags
export const getTags = async () => {
  try {
    const tags = await db.tag.findMany();
    return tags;
  } catch (error) {
    console.error("Error fetching tags:", error);
    throw new Error("Failed to fetch tags");
  }
};

// Create a new blog
export const createBlog = async (blogData: any, tags: any[], image: string) => {
  try {
    const newBlog = await db.blog.create({
      data: {
        ...blogData,
        imageUrl: image,
        blogTags: {
          create: tags.map((tag) => ({
            tag: {
              connectOrCreate: {
                where: { name: tag.tag.name },
                create: { name: tag.tag.name },
              },
            },
          })),
        },
      },
    });
    return newBlog;
  } catch (error) {
    console.error("Error creating blog:", error);
    throw new Error("Failed to create blog");
  }
};

// Update a blog
export const updateBlog = async (id: string, blogData: any, tags: any[], image: string) => {
  try {
    const updatedBlog = await db.blog.update({
      where: { id },
      data: {
        ...blogData,
        imageUrl: image,
        blogTags: {
          deleteMany: { blogId: id }, // Remove existing tags
          create: tags.map((tag) => ({
            tag: {
              connectOrCreate: {
                where: { name: tag.tag.name },
                create: { name: tag.tag.name },
              },
            },
          })),
        },
      },
    });
    return updatedBlog;
  } catch (error) {
    console.error(`Error updating blog with ID ${id}:`, error);
    throw new Error("Failed to update blog");
  }
};

// Delete a blog
export const deleteBlog = async (id: string) => {
  try {
    const deletedBlog = await db.blog.delete({
      where: { id },
    });
    return deletedBlog;
  } catch (error) {
    console.error(`Error deleting blog with ID ${id}:`, error);
    throw new Error("Failed to delete blog");
  }
};

// Create a new tag
export const createTag = async (name: string) => {
  try {
    const newTag = await db.tag.create({
      data: { name },
    });
    return newTag;
  } catch (error) {
    console.error("Error creating tag:", error);
    throw new Error("Failed to create tag");
  }
};

// Create a new topic
export const createTopic = async (name: string) => {
  try {
    const newTopic = await db.topic.create({
      data: { name },
    });
    return newTopic;
  } catch (error) {
    console.error("Error creating topic:", error);
    throw new Error("Failed to create topic");
  }
};

// Update settings
export const updateSettings = async (settingsData: any) => {
  try {
    const updatedSettings = await db.settings.update({
      where: { id: 'settings-id' }, // Assuming you have a settings ID
      data: settingsData,
    });
    return updatedSettings;
  } catch (error) {
    console.error("Error updating settings:", error);
    throw new Error("Failed to update settings");
  }
};

// Fetch settings
export const getSettings = async () => {
  try {
    const settings = await db.settings.findUnique({
      where: { id: 'settings-id' },
    });
    return settings;
  } catch (error) {
    console.error("Error fetching settings:", error);
    throw new Error("Failed to fetch settings");
  }
};

export const upsertBlog = async (blogData) => {
  const { id, title, content, author, publishedAt, blogTags, ...otherFields } = blogData;

  // Ensure the `publishedAt` is in a valid ISO format
  const formattedPublishedAt = new Date(publishedAt).toISOString();

  // Format the blogTags to only include `tagId`, as `blogId` is automatically handled by Prisma
  const blogTagData = blogTags.map(tag => ({
    tagId: tag.tagId, // Only pass tagId here, not blogId
  }));

  if (!id || id === 0) {
    // Create new blog post
    return await prisma.blog.create({
      data: {
        title,
        content,
        author,
        publishedAt: formattedPublishedAt, // Ensure the date is correctly formatted
        blogTags: {
          create: blogTagData, // Create the blog-tag relations using `tagId` only
        },
        ...otherFields, // Pass other fields like subTitle, status, etc.
      },
    });
  } else {
    // Update existing blog post
    return await prisma.blog.upsert({
      where: { id },  // Use `id` to find the blog post
      update: {
        title,
        content,
        author,
        publishedAt: formattedPublishedAt, // Ensure the date is correctly formatted
        blogTags: {
          deleteMany: {},  // Clear existing blogTags
          create: blogTagData,  // Add new blogTags using `tagId` only
        },
        ...otherFields, // Pass other fields like subTitle, status, etc.
      },
      create: {
        title,
        content,
        author,
        publishedAt: formattedPublishedAt, // Ensure the date is correctly formatted
        blogTags: {
          create: blogTagData, // Create the blog-tag relations using `tagId` only
        },
        ...otherFields, // Pass other fields like subTitle, status, etc.
      },
    });
  }
};
export const getPaginatedBlogs = async (page: number, pageSize: number) => {
  try {
    // Calculate the offset based on the current page and page size
    const offset = (page - 1) * pageSize;

    // Fetch blog posts with pagination, excluding those with "Wiki" tag
    const posts = await db.blog.findMany({
      skip: offset,
      take: pageSize,
      where: {
        blogTags: {
          none: {
            tag: {
              name: 'Wiki',
            },
          },
        },
      },
      orderBy: {
        publishedAt: 'desc', // Order by most recent posts
      },
      include: {
        topic: {
          select: {
            id: true,
            name: true,
          },
        },
        blogTags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Count the total number of blog posts excluding those with "Wiki" tag
    const totalPosts = await db.blog.count({
      where: {
        blogTags: {
          none: {
            tag: {
              name: 'Wiki',
            },
          },
        },
      },
    });
    const totalPages = Math.ceil(totalPosts / pageSize);

    return {
      posts,
      totalPages,
    };
  } catch (error) {
    console.error('Error fetching paginated blogs:', error);
    throw new Error('Failed to fetch paginated blogs');
  }
};

export async function getBlogByPath(path) {
  try {
    const blog = await db.blog.findFirst({
      where: { path },
      include: {
        topic: true,
        blogTags: {
          include: {
            tag: true,
          },
        },
      },
    });
    return blog;
  } catch (error) {
    console.error('Error fetching blog by path:', error);
    throw new Error('Unable to fetch blog');
  }
}
export async function getBlogTagsById(blogId) {
  try {
    const blogTags = await db.blogTag.findMany({
      where: { blogId },
      include: {
        tag: true,
      },
    });
    return blogTags;
  } catch (error) {
    console.error('Error fetching blog tags by ID:', error);
    throw new Error('Unable to fetch blog tags');
  }
}
export async function getBlogsByTopicName(topicName: string) {
  try {
    const blogs = await prisma.blog.findMany({
      where: {
        topic: {
          name: topicName,
        },
      },
      include: {
        topic: true,
        blogTags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return blogs;
  } catch (error) {
    console.error('Error fetching blogs by topic name:', error);
    throw error;
  }
}
export const getTopicsWithBlogs = async () => {
  try {
    // Use Prisma to fetch topics and related blogs, including tags
    const topics = await db.topic.findMany({
      include: {
        blogs: {
          where: {
            blogTags: {
              some: {
                tag: {
                  name: 'Wiki', // Filter for blogs with the "Wiki" tag
                },
              },
            },
          },
          select: {
            id: true,
            title: true,
            path: true,
            publishedAt: true,
            topic: {
              select: {
                id: true,
                name: true,
              },
            },
            blogTags: {
              include: {
                tag: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: {
            publishedAt: 'asc', // Sort blogs by published date in ascending order
          },
        },
      },
    });

    return topics;
  } catch (error) {
    console.error('Error fetching topics with blogs:', error);
    throw new Error('Failed to fetch topics with blogs');
  }
};
export const subscribeToNewsletter = async (email: string) => {
  try {
    const subscriber = await db.newsletterSubscriber.create({
      data: { email },
    });
    return subscriber;
  } catch (error) {
    throw new Error('Failed to subscribe to newsletter');
  }
};
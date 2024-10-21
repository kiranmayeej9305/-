import { Prisma, PrismaClient, Role } from '@prisma/client'
import {
  getAuthUserDetails,
  getUserPermissions,
} from './queries'
import { db } from './db'
import { z } from 'zod'

import Stripe from 'stripe'

export type NotificationWithUser =
  | ({
      User: {
        id: string
        name: string
        avatarUrl: string
        email: string
        createdAt: Date
        updatedAt: Date
        role: Role
        accountId: string | null
      }
    } & Notification)[]
  | undefined

export type UserWithPermissionsAndChatbots = Prisma.PromiseReturnType<
  typeof getUserPermissions
>

export const FunnelPageSchema = z.object({
  name: z.string().min(1),
  pathName: z.string().optional(),
})

const __getUsersWithAccountChatbotPermissionsSidebarOptions = async (
  accountId: string
) => {
  return await db.user.findFirst({
    where: { Account: { id: accountId } },
    include: {
      Account: { include: { Chatbot: true } },
      Permissions: { include: { Chatbot: true } },
    },
  })
}

export type AuthUserWithAccountSigebarOptionsChatbots =
  Prisma.PromiseReturnType<typeof getAuthUserDetails>

export type UsersWithAccountChatbotPermissionsSidebarOptions =
  Prisma.PromiseReturnType<
    typeof __getUsersWithAccountChatbotPermissionsSidebarOptions
  >


export type CreateMediaType = Prisma.MediaCreateWithoutChatbotInput



export const CreatePipelineFormSchema = z.object({
  name: z.string().min(1),
})

export const CreateFunnelFormSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  subDomainName: z.string().optional(),
  favicon: z.string().optional(),
})


export const LaneFormSchema = z.object({
  name: z.string().min(1),
})


const currencyNumberRegex = /^\d+(\.\d{1,2})?$/

export const TicketFormSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  value: z.string().refine((value) => currencyNumberRegex.test(value), {
    message: 'Value must be a valid price.',
  }),
})

export const ContactUserFormSchema = z.object({
  name: z.string().min(1, 'Required'),
  email: z.string().email(),
})

export type Address = {
  city: string
  country: string
  line1: string
  postal_code: string
  state: string
}

export type ShippingInfo = {
  address: Address
  name: string
}

export type StripeCustomerType = {
  email: string
  name: string
  shipping: ShippingInfo
  address: Address
}

export type PricesList = Stripe.ApiList<Stripe.Price>

type PromiseReturnType<T extends (...args: any) => Promise<any>> = Prisma.PromiseReturnType<T>

'use client'
import {
  AuthUserWithAccountSigebarOptionsChatbots,
  UserWithPermissionsAndChatbots,
} from '@/lib/types'
import { useModal } from '@/providers/modal-provider'
import { Chatbot, User } from '@prisma/client'
import React, { useEffect, useState } from 'react'
import { useToast } from '../ui/use-toast'
import { useRouter } from 'next/navigation'
import {
  changeUserPermissions,
  getAuthUserDetails,
  getUserPermissions,
  saveActivityLogsNotification,
  updateUser,
} from '@/lib/queries'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import FileUpload from '../global/file-upload'
import { Input } from '../ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Button } from '../ui/button'
import Loading from '../global/loading'
import { Separator } from '../ui/separator'
import { Switch } from '../ui/switch'
import { v4 } from 'uuid'

type Props = {
  id: string | null
  type: 'account' | 'Chatbot'
  userData?: Partial<User>
  chatbots?: Chatbot[]
}

const UserDetails = ({ id, type, chatbots, userData }: Props) => {
  const [chatbotPermissions, setChatbotsPermissions] =
    useState<UserWithPermissionsAndChatbots | null>(null)

  const { data, setClose } = useModal()
  const [roleState, setRoleState] = useState('')
  const [loadingPermissions, setLoadingPermissions] = useState(false)
  const [authUserData, setAuthUserData] =
    useState<AuthUserWithAccountSigebarOptionsChatbots | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  //Get authUSerDtails

  useEffect(() => {
    if (data.user) {
      const fetchDetails = async () => {
        const response = await getAuthUserDetails()
        if (response) setAuthUserData(response)
      }
      fetchDetails()
    }
  }, [data])

  const userDataSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    avatarUrl: z.string(),
    role: z.enum([
      'ACCOUNT_OWNER',
      'ACCOUNT_ADMIN',
      'CHATBOT_USER',
      'CHATBOT_GUEST',
    ]),
  })

  const form = useForm<z.infer<typeof userDataSchema>>({
    resolver: zodResolver(userDataSchema),
    mode: 'onChange',
    defaultValues: {
      name: userData ? userData.name : data?.user?.name,
      email: userData ? userData.email : data?.user?.email,
      avatarUrl: userData ? userData.avatarUrl : data?.user?.avatarUrl,
      role: userData ? userData.role : data?.user?.role,
    },
  })

  useEffect(() => {
    if (!data.user) return
    const getPermissions = async () => {
      if (!data.user) return
      const permission = await getUserPermissions(data.user.id)
      setChatbotsPermissions(permission)
    }
    getPermissions()
  }, [data, form])

  useEffect(() => {
    if (data.user) {
      form.reset(data.user)
    }
    if (userData) {
      form.reset(userData)
    }
  }, [userData, data])

  const onChangePermission = async (
    chatbotId: string,
    val: boolean,
    permissionsId: string | undefined
  ) => {
    if (!data.user?.email) return
    setLoadingPermissions(true)
    const response = await changeUserPermissions(
      permissionsId ? permissionsId : v4(),
      data.user.email,
      chatbotId,
      val
    )
    if (type === 'account') {
      await saveActivityLogsNotification({
        accountId: authUserData?.Account?.id,
        description: `Gave ${userData?.name} access to | ${
          chatbotPermissions?.Permissions.find(
            (p) => p.chatbotId === chatbotId
          )?.Chatbot.name
        } `,
        chatbotId: chatbotPermissions?.Permissions.find(
          (p) => p.chatbotId === chatbotId
        )?.Chatbot.id,
      })
    }

    if (response) {
      toast({
        title: 'Success',
        description: 'The request was successfull',
      })
      if (chatbotPermissions) {
        chatbotPermissions.Permissions.find((perm) => {
          if (perm.chatbotId === chatbotId) {
            return { ...perm, access: !perm.access }
          }
          return perm
        })
      }
    } else {
      toast({
        variant: 'destructive',
        title: 'Failed',
        description: 'Could not update permissions',
      })
    }
    router.refresh()
    setLoadingPermissions(false)
  }

  const onSubmit = async (values: z.infer<typeof userDataSchema>) => {
    if (!id) return
    if (userData || data?.user) {
      const updatedUser = await updateUser(values)
      authUserData?.Account?.Chatbot.filter((subacc) =>
        authUserData.Permissions.find(
          (p) => p.chatbotId === subacc.id && p.access
        )
      ).forEach(async (Chatbot) => {
        await saveActivityLogsNotification({
          accountId: undefined,
          description: `Updated ${userData?.name} information`,
          chatbotId: Chatbot.id,
        })
      })

      if (updatedUser) {
        toast({
          title: 'Success',
          description: 'Update User Information',
        })
        setClose()
        router.refresh()
      } else {
        toast({
          variant: 'destructive',
          title: 'Oppse!',
          description: 'Could not update user information',
        })
      }
    } else {
      console.log('Error could not submit')
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>User Details</CardTitle>
        <CardDescription>Add or update your information</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              disabled={form.formState.isSubmitting}
              control={form.control}
              name="avatarUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile picture</FormLabel>
                  <FormControl>
                    <FileUpload
                      apiEndpoint="avatar"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              disabled={form.formState.isSubmitting}
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>User full name</FormLabel>
                  <FormControl>
                    <Input
                      required
                      placeholder="Full Name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={form.formState.isSubmitting}
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      readOnly={
                        userData?.role === 'ACCOUNT_OWNER' ||
                        form.formState.isSubmitting
                      }
                      placeholder="Email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={form.formState.isSubmitting}
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel> User Role</FormLabel>
                  <Select
                    disabled={field.value === 'ACCOUNT_OWNER'}
                    onValueChange={(value) => {
                      if (
                        value === 'CHATBOT_USER' ||
                        value === 'CHATBOT_GUEST'
                      ) {
                        setRoleState(
                          'You need to have chatbots to assign Chatbot access to team members.'
                        )
                      } else {
                        setRoleState('')
                      }
                      field.onChange(value)
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select user role..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ACCOUNT_ADMING">
                        Account Admin
                      </SelectItem>
                      {(data?.user?.role === 'ACCOUNT_OWNER' ||
                        userData?.role === 'ACCOUNT_OWNER') && (
                        <SelectItem value="ACCOUNT_OWNER">
                          Account Owner
                        </SelectItem>
                      )}
                      <SelectItem value="CHATBOT_USER">
                        Sub Account User
                      </SelectItem>
                      <SelectItem value="CHATBOT_GUEST">
                        Sub Account Guest
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-muted-foreground">{roleState}</p>
                </FormItem>
              )}
            />

            <Button
              disabled={form.formState.isSubmitting}
              type="submit"
            >
              {form.formState.isSubmitting ? <Loading /> : 'Save User Details'}
            </Button>
            {authUserData?.role === 'ACCOUNT_OWNER' && (
              <div>
                <Separator className="my-4" />
                <FormLabel> User Permissions</FormLabel>
                <FormDescription className="mb-4">
                  You can give Sub Account access to team member by turning on
                  access control for each Sub Account. This is only visible to
                  account owners
                </FormDescription>
                <div className="flex flex-col gap-4">
                  {chatbots?.map((Chatbot) => {
                    const chatbotPermissionsDetails =
                      chatbotPermissions?.Permissions.find(
                        (p) => p.chatbotId === Chatbot.id
                      )
                    return (
                      <div
                        key={Chatbot.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div>
                          <p>{Chatbot.name}</p>
                        </div>
                        <Switch
                          disabled={loadingPermissions}
                          checked={chatbotPermissionsDetails?.access}
                          onCheckedChange={(permission) => {
                            onChangePermission(
                              Chatbot.id,
                              permission,
                              chatbotPermissionsDetails?.id
                            )
                          }}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default UserDetails

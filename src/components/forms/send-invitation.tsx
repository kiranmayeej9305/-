'use client'
import React from 'react'
import { z } from 'zod'
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { saveActivityLogsNotification, sendInvitation } from '@/lib/queries'
import { useToast } from '../ui/use-toast'

interface SendInvitationProps {
  accountId: string
}

const SendInvitation: React.FC<SendInvitationProps> = ({ accountId }) => {
  const { toast } = useToast()
  const userDataSchema = z.object({
    email: z.string().email(),
    role: z.enum(['ACCOUNT_ADMIN', 'CHATBOT_USER', 'CHATBOT_ADMIN']),
  })

  const form = useForm<z.infer<typeof userDataSchema>>({
    resolver: zodResolver(userDataSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      role: 'CHATBOT_USER',
    },
  })

  const onSubmit = async (values: z.infer<typeof userDataSchema>) => {
    try {
      const res = await sendInvitation(values.role, values.email, accountId)
      await saveActivityLogsNotification({
        accountId: accountId,
        description: `Invited ${res.email}`,
        chatbotId: undefined,
      })
      toast({
        title: 'Success',
        description: 'Created and sent invitation',
      })
    } catch (error) {
      console.log(error)
      toast({
        variant: 'destructive',
        title: 'Oppse!',
        description: 'Could not send invitation',
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invitation</CardTitle>
        <CardDescription>
          An invitation will be sent to the user. Users who already have an
          invitation sent out to their email, will not receive another
          invitation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
            <FormField
              disabled={form.formState.isSubmitting}
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
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
                  <FormLabel>User role</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value)}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select user role..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ACCOUNT_ADMIN">Account Admin</SelectItem>
                      <SelectItem value="CHATBOT_USER">
                        Chatbot User
                      </SelectItem>
                      <SelectItem value="CHATBOT_ADMIN">
                        Chatbot Admin
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              disabled={form.formState.isSubmitting}
              type="submit"
            >
              {form.formState.isSubmitting ? <Loading /> : 'Send Invitation'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default SendInvitation

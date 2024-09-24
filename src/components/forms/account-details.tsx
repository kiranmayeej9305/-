'use client'
import { Account } from '@prisma/client'
import { useForm } from 'react-hook-form'
import React, { useEffect, useState } from 'react'
import { Industry, ReferralSource } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog'
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form'
import { useToast } from '../ui/use-toast'
import * as z from 'zod'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { deleteAccount, initUser, upsertAccount } from '@/lib/queries'
import { Button } from '../ui/button'
import Loading from '../global/loading'
import { useUser } from '@clerk/nextjs'

type Props = {
  data?: Partial<Account>
  isCreating: boolean
}

const FormSchema = z.object({
  name: z.string().min(2, { message: 'Account name must be at least 2 chars.' }),
  companyEmail: z.string().email(),
  industry: z.nativeEnum(Industry),
  otherIndustry: z.string().optional(),
  referralSource: z.nativeEnum(ReferralSource),
  otherReferralSource: z.string().optional(),
})

const AccountDetails = ({ data, isCreating }: Props) => {
  const { toast } = useToast()
  const router = useRouter()
  const { isLoaded, user } = useUser()
  const [showOtherIndustry, setShowOtherIndustry] = useState(false)
  const [showOtherReferral, setShowOtherReferral] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)

  const form = useForm<z.infer<typeof FormSchema>>({
    mode: 'onChange',
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: data?.name || '',
      companyEmail: data?.companyEmail || user?.emailAddresses[0]?.emailAddress || '',
      industry: Industry.TECHNOLOGY,
      referralSource: ReferralSource.GOOGLE,
    },
  })

  const isLoading = form.formState.isSubmitting

  useEffect(() => {
    if (data) {
      form.reset({
        name: data.name || '',
        companyEmail: data.companyEmail || user?.emailAddresses[0]?.emailAddress || '',
        industry: data.industry || Industry.TECHNOLOGY,
        referralSource: data.referralSource || ReferralSource.GOOGLE,
        otherIndustry: data.otherIndustry || '',
        otherReferralSource: data.otherReferralSource || '',
      })
    }
  }, [data, user, form])

  const handleIndustryChange = (value: Industry) => {
    form.setValue('industry', value)
    setShowOtherIndustry(value === Industry.OTHER)
  }

  const handleReferralSourceChange = (value: ReferralSource) => {
    form.setValue('referralSource', value)
    setShowOtherReferral(value === ReferralSource.OTHER)
  }

  const handleSubmit = async (values: z.infer<typeof FormSchema>) => {
    try {
      let custId;
  
      if (isCreating) {
        // Create the customer in Stripe
        const bodyData = {
          email: values.companyEmail,
          name: values.name,
        };
  
        const customerResponse = await fetch('/api/stripe/create-customer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bodyData),
        });
  
        if (!customerResponse.ok) {
          throw new Error('Failed to create customer');
        }
  
        const customerData: { customerId: string } = await customerResponse.json();
        custId = customerData.customerId;
      }
  
      // Upsert the account in the database
      const accountResponse = await upsertAccount(
        {
          id: data?.id || uuidv4(),
          customerId: data?.customerId || custId || '',
          name: values.name,
          companyEmail: values.companyEmail,
          industry: values.industry,
          otherIndustry: values.otherIndustry || null,
          referralSource: values.referralSource,
          otherReferralSource: values.otherReferralSource || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        isCreating
      );
  
      if (!accountResponse) {
        throw new Error('Failed to upsert account');
      }
  
      // Once the account is created, initialize the user and associate it with the new account
      await initUser({ role: 'ACCOUNT_OWNER', accountId: accountResponse.id });
  
      toast({
        title: isCreating ? 'Created Account' : 'Updated Account',
      });
  
      router.refresh();
    } catch (error) {
      console.error('Error during form submission:', error);
      toast({
        variant: 'destructive',
        title: 'Oops!',
        description: `Could not ${isCreating ? 'create' : 'update'} your account`,
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (!data?.id) return
    setDeletingAccount(true)
    try {
      await deleteAccount(data.id)
      toast({
        title: 'Deleted Account',
        description: 'Deleted your account and all chatbots',
      })
      router.refresh()
    } catch (error) {
      console.log(error)
      toast({
        variant: 'destructive',
        title: 'Oops!',
        description: 'Could not delete your account',
      })
    }
    setDeletingAccount(false)
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-3xl p-8 my-10 bg-white rounded-lg shadow-lg">
        <Card className="w-full">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-2xl font-semibold">Account Information</CardTitle>
            <CardDescription className="text-gray-500">
              {isCreating
                ? 'Create your account by filling in the details below.'
                : 'Update your account details below.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your account name" {...field} className="border-gray-300" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="companyEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Email</FormLabel>
                        <FormControl>
                        <Input
                          readOnly
                          className="border-gray-300 bg-gray-100"
                          placeholder="Email"
                          {...field}
                        />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={handleIndustryChange}
                            value={field.value}
                          >
                            <SelectTrigger className="border-gray-300">
                              <SelectValue placeholder="Select an industry" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={Industry.TECHNOLOGY}>Technology</SelectItem>
                              <SelectItem value={Industry.HEALTHCARE}>Healthcare</SelectItem>
                              <SelectItem value={Industry.FINANCE}>Finance</SelectItem>
                              <SelectItem value={Industry.EDUCATION}>Education</SelectItem>
                              <SelectItem value={Industry.RETAIL}>Retail</SelectItem>
                              <SelectItem value={Industry.OTHER}>Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {showOtherIndustry && (
                    <FormField
                      control={form.control}
                      name="otherIndustry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Other Industry</FormLabel>
                          <FormControl>
                            <Input placeholder="Specify your industry" {...field} className="border-gray-300" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  <FormField
                    control={form.control}
                    name="referralSource"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>How did you hear about us?</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={handleReferralSourceChange}
                            value={field.value}
                          >
                            <SelectTrigger className="border-gray-300">
                              <SelectValue placeholder="Select a referral source" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={ReferralSource.GOOGLE}>Google</SelectItem>
                              <SelectItem value={ReferralSource.FACEBOOK}>Facebook</SelectItem>
                              <SelectItem value={ReferralSource.LINKEDIN}>LinkedIn</SelectItem>
                              <SelectItem value={ReferralSource.TWITTER}>Twitter</SelectItem>
                              <SelectItem value={ReferralSource.FRIEND}>Friend</SelectItem>
                              <SelectItem value={ReferralSource.OTHER}>Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {showOtherReferral && (
                    <FormField
                      control={form.control}
                      name="otherReferralSource"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Other Referral Source</FormLabel>
                          <FormControl>
                            <Input placeholder="Specify your referral source" {...field} className="border-gray-300" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? <Loading /> : 'Save Account Information'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Separate Delete Account Card */}
        {data?.id && (
          <Card className="w-full mt-10 border-red-300">
            <CardHeader className="bg-red-50 text-red-700 border-b border-red-300 pb-4">
              <CardTitle className="text-2xl font-semibold">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col items-start space-y-4">
                <p className="text-gray-600">
                  Deleting your account is a permanent action and cannot be undone.
                  All data, including chatbots, will be lost.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={deletingAccount}>
                      {deletingAccount ? 'Deleting...' : 'Delete Account'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your
                        account and all related data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        disabled={deletingAccount}
                        className="bg-red-600 hover:bg-red-700"
                        onClick={handleDeleteAccount}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default AccountDetails

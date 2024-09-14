import React from 'react'
import { stripe } from '@/lib/stripe'
import { addOnProducts, pricingCards } from '@/lib/constants'
import { db } from '@/lib/db'
import { Separator } from '@/components/ui/separator'
import PricingCard from './_components/pricing-card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import clsx from 'clsx'
import SubscriptionHelper from './_components/subscription-helper'

type Props = {
  params: { accountId: string }
}

const page = async ({ params }: Props) => {
  // Fetch Add-on products from Stripe
  const addOns = await stripe.products.list({
    ids: addOnProducts.map((product) => product.id),
    expand: ['data.default_price'],
  })

  // Fetch Account subscription details
  const accountSubscription = await db.account.findUnique({
    where: {
      id: params.accountId,
    },
    select: {
      customerId: true,
      Subscription: true,
    },
  })

  console.log('🔵 Account Subscription fetched:', accountSubscription)

  // Fetch prices for the current product
  const prices = await stripe.prices.list({
    product: process.env.NEXT_PLURA_PRODUCT_ID,
    active: true,
  })

  console.log('🔵 Prices fetched from Stripe:', prices.data)

  // Find the current plan details
  const currentPlanDetails = pricingCards.find(
    (c) => c.priceId === accountSubscription?.Subscription?.priceId
  )

  console.log('🔵 Current Plan Details:', currentPlanDetails)

  // Fetch recent charges from Stripe
  const charges = await stripe.charges.list({
    limit: 50,
    customer: accountSubscription?.customerId,
  })

  const allCharges = charges.data.map((charge) => ({
    description: charge.description,
    id: charge.id,
    date: `${new Date(charge.created * 1000).toLocaleTimeString()} ${new Date(
      charge.created * 1000
    ).toLocaleDateString()}`,
    status: 'Paid',
    amount: `$${charge.amount / 100}`,
  }))

  return (
    <>
      <SubscriptionHelper
        prices={prices.data}
        customerId={accountSubscription?.customerId || ''}
        planExists={accountSubscription?.Subscription?.active === true}
      />
      <h1 className="text-4xl p-4">Billing</h1>
      <Separator className="mb-6" />
      <h2 className="text-2xl p-4">Current Plan</h2>
      <div className="flex flex-col lg:!flex-row justify-between gap-8">
        <PricingCard
          planExists={accountSubscription?.Subscription?.active === true}
          prices={prices.data}
          customerId={accountSubscription?.customerId || ''}
          amt={
            accountSubscription?.Subscription?.active === true
              ? currentPlanDetails?.price || '$0'
              : '$0'
          }
          buttonCta={
            accountSubscription?.Subscription?.active === true
              ? 'Change Plan'
              : 'Get Started'
          }
          highlightDescription="Want to modify your plan? You can do this here. If you have further questions, contact support@insertbot.com."
          highlightTitle="Plan Options"
          description={
            accountSubscription?.Subscription?.active === true
              ? currentPlanDetails?.description || 'Let’s get started'
              : 'Let’s get started! Pick a plan that works best for you.'
          }
          duration="/ month"
          features={
            accountSubscription?.Subscription?.active === true
              ? currentPlanDetails?.features || []
              : currentPlanDetails?.features ||
                pricingCards.find((pricing) => pricing.title === 'Starter')
                  ?.features || []
          }
          title={
            accountSubscription?.Subscription?.active === true
              ? currentPlanDetails?.title || 'Starter'
              : 'Starter'
          }
        />
        {addOns.data.map((addOn) => (
          <PricingCard
            planExists={accountSubscription?.Subscription?.active === true}
            prices={prices.data}
            customerId={accountSubscription?.customerId || ''}
            key={addOn.id}
            amt={
              addOn.default_price?.unit_amount
                ? `$${addOn.default_price.unit_amount / 100}`
                : '$0'
            }
            buttonCta="Subscribe"
            description="Dedicated support line & teams channel for support"
            duration="/ month"
            features={[]}
            title={'24/7 priority support'}
            highlightTitle="Get support now!"
            highlightDescription="Get priority support and skip the line with the click of a button."
          />
        ))}
      </div>
      <h2 className="text-2xl p-4">Payment History</h2>
      <Table className="bg-card border-[1px] border-border rounded-md">
        <TableHeader className="rounded-md">
          <TableRow>
            <TableHead className="w-[200px]">Description</TableHead>
            <TableHead className="w-[200px]">Invoice Id</TableHead>
            <TableHead className="w-[300px]">Date</TableHead>
            <TableHead className="w-[200px]">Paid</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="font-medium truncate">
          {allCharges.map((charge) => (
            <TableRow key={charge.id}>
              <TableCell>{charge.description}</TableCell>
              <TableCell className="text-muted-foreground">{charge.id}</TableCell>
              <TableCell>{charge.date}</TableCell>
              <TableCell>
                <p
                  className={clsx('', {
                    'text-emerald-500': charge.status.toLowerCase() === 'paid',
                    'text-orange-600': charge.status.toLowerCase() === 'pending',
                    'text-red-600': charge.status.toLowerCase() === 'failed',
                  })}
                >
                  {charge.status.toUpperCase()}
                </p>
              </TableCell>
              <TableCell className="text-right">{charge.amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}

export default page

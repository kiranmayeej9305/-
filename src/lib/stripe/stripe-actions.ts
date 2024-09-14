'use server'
import Stripe from 'stripe'
import { db } from '../db'
import { stripe } from '.'

export const subscriptionCreated = async (
  subscription: Stripe.Subscription,
  customerId: string
) => {
  try {
    // Find the related account based on the customerId
    const account = await db.account.findFirst({
      where: {
        customerId,
      },
      include: {
        Chatbot: true,
      },
    })
    if (!account) {
      throw new Error('Could not find an account to upsert the subscription')
    }

    // Fetch the Plan based on Stripe plan.id (priceId in your case)
    const plan = await db.plan.findFirst({
      where: {
        OR: [
          { stripeMonthlyPriceId: subscription.plan.id },
          { stripeYearlyPriceId: subscription.plan.id },
        ],
      },
    })

    if (!plan) {
      throw new Error('Could not find a matching Plan for the Stripe priceId')
    }

    // Prepare the subscription data for upserting
    const data = {
      active: subscription.status === 'active',
      accountId: account.id,
      customerId,
      currentPeriodEndDate: new Date(subscription.current_period_end * 1000),
      priceId: subscription.plan.id, // Stripe priceId
      subscritiptionId: subscription.id, // Stripe subscription ID
      planId: plan.id, // Plan ID from your database
    }

    // Upsert the subscription in the database
    const res = await db.subscription.upsert({
      where: {
        accountId: account.id,
      },
      create: data,
      update: data,
    })
    console.log(`🟢 Created/Updated Subscription for ${subscription.id}`)
  } catch (error) {
    console.log('🔴 Error from Create action', error)
  }
}

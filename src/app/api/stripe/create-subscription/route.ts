import { db } from '@/lib/db'
import { stripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { customerId, priceId } = await req.json()

  // Validate customerId and priceId
  if (!customerId || !priceId) {
    return new NextResponse('Customer Id or price id is missing', {
      status: 400,
    })
  }

  try {
    // Check if a subscription exists for the given customerId, filtering for non-add-ons (isAddOn: false)
    const account = await db.account.findFirst({
      where: { customerId },
      include: {
        Subscriptions: {
          where: {
            isAddOn: false, // Filter out add-ons
            active: true,   // Only get active subscriptions
          },
        },
      },
    })

    const existingSubscription = account?.Subscriptions[0] // Assume there's only one active non-add-on subscription

    // If an existing active non-add-on subscription exists, update it
    if (existingSubscription?.subscriptionId) {
      console.log('Updating the subscription')

      const currentSubscriptionDetails = await stripe.subscriptions.retrieve(
        existingSubscription.subscriptionId
      )

      // Update subscription with the new price
      const subscription = await stripe.subscriptions.update(
        existingSubscription.subscriptionId,
        {
          items: [
            {
              id: currentSubscriptionDetails.items.data[0].id, // Get existing item id to update
              deleted: true,
            },
            { price: priceId },
          ],
          expand: ['latest_invoice.payment_intent'],
        }
      )

      return NextResponse.json({
        subscriptionId: subscription.id,
        //@ts-ignore
        clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      })
    } else {
      // No existing non-add-on active subscription, create a new one
      console.log('Creating a new subscription')
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      })

      return NextResponse.json({
        subscriptionId: subscription.id,
        //@ts-ignore
        clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      })
    }
  } catch (error) {
    console.error('🔴 Error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

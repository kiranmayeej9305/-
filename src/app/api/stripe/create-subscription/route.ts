import { db } from '@/lib/db';
import { stripe } from '@/lib/stripe';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { customerId, priceId } = await req.json();

  if (!customerId || !priceId) {
    return new NextResponse('Customer Id or price id is missing', {
      status: 400,
    });
  }

  try {
    // Check if the account has an existing active subscription
    const account = await db.account.findFirst({
      where: { customerId },
      include: {
        Subscriptions: {
          where: {
            isAddOn: false,
            active: true,
          },
        },
      },
    });

    const existingSubscription = account?.Subscriptions[0];

    if (existingSubscription?.subscriptionId) {
      console.log('Updating the subscription');

      const currentSubscriptionDetails = await stripe.subscriptions.retrieve(
        existingSubscription.subscriptionId
      );

      const subscription = await stripe.subscriptions.update(
        existingSubscription.subscriptionId,
        {
          items: [
            {
              id: currentSubscriptionDetails.items.data[0].id,
              deleted: true,
            },
            { price: priceId },
          ],
          expand: ['latest_invoice.payment_intent'],
        }
      );

      return NextResponse.json({
        subscriptionId: subscription.id,
        //@ts-ignore
        clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      });
    } else {
      // Create new subscription if no existing one
      console.log('Creating a new subscription');

      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });
      return NextResponse.json({
        subscriptionId: subscription.id,
        //@ts-ignore
        clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      });
    }
  } catch (error) {
    console.error('🔴 Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

'use server';
import Stripe from 'stripe';
import { db } from '../db';
import { stripe } from '.';

export const subscriptionCreated = async (
  subscription: Stripe.Subscription,
  customerId: string
) => {
  try {
    // Find the related account based on the customerId
    const account = await db.account.findFirst({
      where: { customerId },
    });

    if (!account) {
      throw new Error(`Could not find an account with customerId: ${customerId}`);
    }

    // Loop through subscription items to handle both plans and add-ons
    for (const item of subscription.items.data) {
      const { price, plan } = item;

      // Fetch the Plan based on Stripe price.id (priceId)
      const dbPlan = await db.plan.findFirst({
        where: {
          OR: [
            { stripeMonthlyPriceId: price.id },
            { stripeYearlyPriceId: price.id },
          ],
        },
      });

      if (!dbPlan) {
        throw new Error(`Could not find a matching Plan for the Stripe priceId: ${price.id}`);
      }

      // Check if the plan is an add-on
      const isAddOn = dbPlan.isAddOn;

      // Prepare the subscription data for upserting
      const data = {
        active: subscription.status === 'active',
        accountId: account.id,
        customerId,
        currentPeriodEndDate: new Date(subscription.current_period_end * 1000),
        priceId: price.id, // Stripe priceId
        subscriptionId: subscription.id, // Stripe subscription ID
        planId: dbPlan.id, // Plan ID from your database
        isAddOn, // Track if this subscription is an add-on
      };

      // Upsert the subscription or add-on in the database
      if (isAddOn) {
        await handleAddOnSubscriptionEvent(subscription, account);
      } else {
        await db.subscription.upsert({
          where: {
            accountId: account.id, // Ensuring uniqueness by accountId
          },
          create: data,
          update: data,
        });

        console.log(`🟢 Created/Updated Subscription for ${subscription.id} (Account: ${account.id})`);
      }
    }
  } catch (error) {
    console.error(`🔴 Error in subscriptionCreated: ${error.message}`, {
      subscriptionId: subscription.id,
      customerId,
    });
  }
};

// Handling add-on subscriptions
export const handleAddOnSubscriptionEvent = async (
  subscription: Stripe.Subscription,
  account: { id: string; customerId: string }
) => {
  try {
    // Loop through subscription items to check for add-ons
    for (const item of subscription.items.data) {
      const { price } = item;

      // Fetch the Plan based on Stripe price.id (priceId)
      const addOnPlan = await db.plan.findFirst({
        where: {
          OR: [
            { stripeMonthlyPriceId: price.id },
            { stripeYearlyPriceId: price.id },
          ],
          isAddOn: true,
        },
      });

      if (!addOnPlan) {
        throw new Error(`Could not find a matching Add-On Plan for the Stripe priceId: ${price.id}`);
      }

      // Prepare the Add-On data for upserting
      const addOnData = {
        accountId: account.id,
        stripeProductId: price.product as string,
        stripePriceId: price.id,
        stripeSubscriptionId: subscription.id,
        startDate: new Date(subscription.start_date * 1000),
        endDate: subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : null,
        active: subscription.status === 'active',
        planId: addOnPlan.id, // Link to the Add-On Plan
      };

      // Upsert the Add-On in the database
      await db.subscription.upsert({
        where: { subscriptionId: subscription.id },
        create: addOnData,
        update: addOnData,
      });

      console.log(`🟢 Add-on handled for subscription: ${subscription.id}`);
    }
  } catch (error) {
    console.error(`🔴 Error handling Add-on subscription: ${error.message}`);
  }
};

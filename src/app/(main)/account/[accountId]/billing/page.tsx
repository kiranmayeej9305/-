import React from 'react';
import { stripe } from '@/lib/stripe';
import { getPlanDetailsForUser } from '@/lib/queries';
import { Separator } from '@/components/ui/separator';
import PricingCard from './_components/pricing-card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import clsx from 'clsx';
import SubscriptionHelper from './_components/subscription-helper';
import { currentUser } from '@clerk/nextjs';
import BlurPage from '@/components/global/blur-page';

const page = async () => {
  const authUser = await currentUser();
  if (!authUser) {
    console.error('Error: User not authenticated');
    return <div>Error: User not authenticated</div>;
  }

  const userId = authUser.id;

  async function getStripeCharges(customerId: string) {
    if (!customerId) {
      console.error('Error: No valid customer ID found.');
      return [];
    }

    try {
      const charges = await stripe.charges.list({
        limit: 50,
        customer: customerId,
      });
      return charges.data.map((charge) => ({
        description: charge.description,
        id: charge.id,
        created: charge.created,
        status: charge.status,
        amount: charge.amount,
      }));
    } catch (error) {
      console.error('Error fetching charges from Stripe:', error);
      return [];
    }
  }

  const planDetails = await getPlanDetailsForUser(userId);
  if (!planDetails?.customerId) {
    console.error('Error: Unable to fetch customer details.');
    return <div>Error: Unable to fetch customer details.</div>;
  }
  const planExists = planDetails.plan.planName !== 'Free';

  const charges = await getStripeCharges(planDetails?.customerId);
  const allCharges = charges.map((charge) => ({
    description: charge.description,
    id: charge.id,
    date: `${new Date(charge.created * 1000).toLocaleTimeString()} ${new Date(
      charge.created * 1000
    ).toLocaleDateString()}`,
    status: 'Paid',
    amount: `$${charge.amount / 100}`,
  }));

  return (
    <>
      <BlurPage>
        <SubscriptionHelper
          customerId={planDetails?.customerId || ''}
          planExists={planExists}
        />
        <h1 className="text-4xl p-4">Billing</h1>
        <Separator className="mb-6" />
        <h2 className="text-2xl p-4">Current Plan</h2>
        <div className="flex flex-col lg:!flex-row justify-between gap-8">
          <PricingCard
            title={planDetails.plan.planName || 'No Plan Name'}
            description={planDetails.plan.planDescription || 'No description available'}
            amt={`$${(planDetails.plan.price || 0) / 100}`}
            duration={` / ${planDetails.plan.billingCycle || 'N/A'}`}
            features={planDetails.plan.frontendFeatures?.map(feature => ({
              ...feature,
              description: feature.description || ''
            }))}
            buttonCta="Change Plan"
            customerId={planDetails.customerId}
            planExists={planExists} 
            highlightTitle={''}
            highlightDescription={''}
            prices={[]}          
          />

          {planDetails.addons.map((addOn) => (
            <PricingCard
              key={addOn.name ?? ''}
              title={addOn.name ?? ''}
              description={addOn.description ?? ''}
              amt={`$${(addOn.price ?? 0) / 100}`}
              duration={` / ${addOn.billingCycle ?? 'N/A'}`}
              features={addOn.frontendFeatures?.map(feature => ({
                ...feature,
                description: feature.description || ''
              }))}
              buttonCta="Manage Add-on"
              customerId={planDetails.customerId}
              planExists={planExists} 
              highlightTitle={''}
              highlightDescription={''}
              prices={[]}          
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
      </BlurPage>
    </>
  );
};

export default page;

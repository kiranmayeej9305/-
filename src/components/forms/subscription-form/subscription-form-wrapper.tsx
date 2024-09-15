'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { usePlanAddOn, PlanAddOnProvider } from '@/context/use-plan-addon-context';
import { StripeElementsOptions } from '@stripe/stripe-js';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { getStripe } from '@/lib/stripe/stripe-client';
import Loading from '@/components/global/loading';
import SubscriptionForm from '.';
import { getPricingPlans } from '@/lib/queries';
import { Switch } from '@/components/ui/switch';

type Props = {
  customerId: string;
  planExists: boolean;
};

const SubscriptionFormWrapper = ({ customerId, planExists }: Props) => {
  const { planData, loading } = usePlanAddOn(); // Fetch current plan data
  const router = useRouter();
  const [allPlans, setAllPlans] = useState([]);
  const [selectedPriceId, setSelectedPriceId] = useState<string | ''>('');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [subscription, setSubscription] = useState<{
    subscriptionId: string;
    clientSecret: string;
  }>({ subscriptionId: '', clientSecret: '' });

  // Fetch all pricing plans directly using the database query
  useEffect(() => {
    const fetchAllPlans = async () => {
      try {
        const plans = await getPricingPlans(); // Fetch plans directly from the database
        const filteredPlans = plans.filter((plan) => plan.name !== 'Free'); // Remove Free Plan
        setAllPlans(filteredPlans);
      } catch (error) {
        console.error('Error fetching pricing plans:', error);
      }
    };
    fetchAllPlans();
  }, []);

  const options: StripeElementsOptions = useMemo(
    () => ({
      clientSecret: subscription?.clientSecret,
      appearance: {
        theme: 'flat',
      },
    }),
    [subscription]
  );

  useEffect(() => {
    if (!selectedPriceId) return;
    const createSecret = async () => {
      const subscriptionResponse = await fetch('/api/stripe/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          priceId: selectedPriceId,
        }),
      });
      const subscriptionResponseData = await subscriptionResponse.json();
      setSubscription({
        clientSecret: subscriptionResponseData.clientSecret,
        subscriptionId: subscriptionResponseData.subscriptionId,
      });
      if (planExists) {
        toast({
          title: 'Success',
          description: 'Your plan has been successfully upgraded!',
        });
        router.refresh(); // Refresh page after success
      }
    };
    createSecret();
  }, [selectedPriceId, customerId]);

  if (loading || !allPlans.length) {
    return <Loading />; // Return loading spinner if data is still loading
  }

  const currentPlanId = planData?.plan?.id; // Get the current plan ID

  return (
    <div className="border-none transition-all">
      <div className="flex items-center justify-center mb-6">
        <span className="mr-2">Monthly</span>
        <Switch
          checked={billingCycle === 'yearly'}
          onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')}
        />
        <span className="ml-2">Yearly</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 overflow-x-auto p-2">
        {allPlans.map((plan) => {
          const isBestValue = plan.name === 'Standard'; // Mark the "Standard" plan as Best Value
          const isCurrentPlan = plan.id === currentPlanId;
          const planPrice =
            billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
          const priceLabel =
            billingCycle === 'monthly'
              ? `$${(planPrice / 100).toFixed(0)}`
              : `$${(planPrice / 100).toFixed(0)}`;
          const billingSuffix = billingCycle === 'monthly' ? '/month' : '/year';

          return (
            <Card
              onClick={() => {
                if (!isCurrentPlan) {
                  setSelectedPriceId(
                    billingCycle === 'monthly'
                      ? plan.stripeMonthlyPriceId
                      : plan.stripeYearlyPriceId
                  );
                }
              }}
              key={plan.id}
              className={clsx(
                'relative cursor-pointer transition-all p-4 shadow-md border rounded-lg hover:shadow-lg hover:border-primary',
                {
                  'border-primary': selectedPriceId === plan.stripeMonthlyPriceId || selectedPriceId === plan.stripeYearlyPriceId,
                  'bg-green-100 border-green-500 shadow-xl cursor-not-allowed': isCurrentPlan, // Highlight the current plan
                  'opacity-50 cursor-not-allowed': isCurrentPlan, // Disable current plan interaction
                }
              )}
              style={{ pointerEvents: isCurrentPlan ? 'none' : 'auto' }} // Disable interaction on current plan
            >
              {isBestValue && (
                <span className="absolute top-2 right-2 bg-yellow-400 text-black font-bold px-2 py-1 rounded-lg text-xs">
                  Best Value
                </span>
              )}
              {isCurrentPlan && (
                <span className="absolute top-2 left-2 bg-emerald-500 text-white font-bold px-2 py-1 rounded-lg text-xs">
                  Current Plan
                </span>
              )}
              <CardHeader className="mb-2">
                <CardTitle className="text-lg font-bold">
                  <span className="text-3xl font-bold">{priceLabel}</span>
                  <span className="text-xs text-muted-foreground ml-1 align-top"> {billingSuffix}</span>
                </CardTitle>
                <p className="text-md font-bold mt-1">{plan.name}</p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </CardContent>
              {(selectedPriceId === plan.stripeMonthlyPriceId || selectedPriceId === plan.stripeYearlyPriceId) && (
                <div className="w-2 h-2 bg-emerald-500 rounded-full absolute top-4 left-4" />
              )}
            </Card>
          );
        })}

        {options.clientSecret && !planExists && (
          <>
            <h1 className="text-xl mt-4">Payment Method</h1>
            <Elements stripe={getStripe()} options={options}>
              <SubscriptionForm selectedPriceId={selectedPriceId} />
            </Elements>
          </>
        )}

        {!options.clientSecret && selectedPriceId && (
          <div className="flex items-center justify-center w-full h-40">
            <Loading />
          </div>
        )}
      </div>
    </div>
  );
};

// Wrapper that includes the PlanAddOnProvider
const SubscriptionFormWrapperWithProvider = ({ customerId, planExists }: Props) => {
  return (
    <PlanAddOnProvider userId={customerId}>
      <SubscriptionFormWrapper customerId={customerId} planExists={planExists} />
    </PlanAddOnProvider>
  );
};

export default SubscriptionFormWrapperWithProvider;

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Accordion from '@/components/accordion';
import { getAllPlans } from '@/lib/queries';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { faqs } from '@/lib/constants';

export default function PricingTabs() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [pricingData, setPricingData] = useState<any[]>([]);

  // Fetch plans on component mount
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { plans } = await getAllPlans();
        console.log('Fetched plans:', plans); // Log the fetched plans
        setPricingData(plans);
      } catch (error) {
        console.error('Error fetching pricing plans:', error);
      }
    };
    fetchPlans();
  }, []);

  const displayedPlans = pricingData.map((plan) => {
    console.log('Plan Features:', plan.frontendFeatures); // Debug the features for each plan
    return {
      id: plan.id,
      nickname: plan.name,
      unit_amount: billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice,
      recurring: { interval: billingCycle },
      description: plan.description,
      features: plan.frontendFeatures.map((feature) => ({
        name: feature.name,
        description: feature.description,
      })),
    };
  });

  return (
    <section className="bg-zinc-50 dark:bg-zinc-900">
      <div className="py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="relative max-w-3xl mx-auto text-center pb-12">
            <h2 className="font-inter-tight text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
              Start your journey today
            </h2>
            <p className="text-lg text-zinc-500 dark:text-zinc-300">
              Start creating real-time design experiences for free. Upgrade for extra features and collaboration with your team. Our tailored pricing plans fit your business needs.

            </p>
          </div>

          {/* Billing cycle toggle */}
          <div className="pb-12 md:pb-20">
            <div className="max-w-sm mx-auto lg:max-w-3xl space-y-3 mb-12 lg:mb-16">
              <div className="flex justify-center mb-4">
                <BillingToggle billingCycle={billingCycle} setBillingCycle={setBillingCycle} />
              </div>
            </div>

            {/* Plan cards */}
            <PlansSection displayedPlans={displayedPlans} />
          </div>

          {/* FAQs */}
          <FAQSection faqs={faqs} />
        </div>
      </div>
    </section>
  );
}

function BillingToggle({ billingCycle, setBillingCycle }: { billingCycle: string; setBillingCycle: (cycle: 'monthly' | 'yearly') => void }) {
  return (
    <>
      <Button
        className={`btn-sm ${billingCycle === 'monthly' ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-white text-black dark:bg-black dark:text-white'} mx-2 px-4 py-2 rounded-full`}
        onClick={() => setBillingCycle('monthly')}
      >
        Monthly
      </Button>
      <Button
        className={`btn-sm ${billingCycle === 'yearly' ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-white text-black dark:bg-black dark:text-white'} mx-2 px-4 py-2 rounded-full`}
        onClick={() => setBillingCycle('yearly')}
      >
        Yearly
      </Button>
    </>
  );
}

function PlansSection({ displayedPlans }: { displayedPlans: any[] }) {
  return (
    <section className="flex justify-center items-center flex-col gap-4 md:flex-row flex-wrap md:gap-6 mt-6">
      {/* Consistent font and text color */}
      <div className="flex justify-center flex-wrap gap-4 w-full">
        {/* Display each plan */}
        {displayedPlans.map((plan, index) => (
          <PlanCard key={plan.id} plan={plan} isMostPopular={index === Math.floor(displayedPlans.length / 2)} />
        ))}
      </div>
    </section>
  );
}


function PlanCard({ plan, isMostPopular }: { plan: any; isMostPopular: boolean }) {
  return (
    <Card className="h-full w-64 relative mx-1 my-2 min-h-[500px] flex flex-col justify-between"> {/* Set a larger min height for uniformity */}
      {isMostPopular && (
        <div className="absolute top-0 left-0 bg-emerald-500 text-white text-xs font-semibold px-2 py-1 rounded-b-full">
          Most Popular
        </div>
      )}

      <CardHeader className="bg-black text-white py-2 px-4 flex justify-between items-center space-x-2"> {/* Compact header with flexbox */}
        <CardTitle className="text-md font-medium flex-grow">{plan.nickname}</CardTitle> {/* Smaller plan name */}
        <div className="flex items-baseline space-x-1">
          <span className="text-xl font-bold">${plan.unit_amount / 100}</span> {/* Reduced font size for price */}
          <span className="text-sm text-zinc-400">/{plan.recurring.interval}</span> {/* Interval in smaller font */}
        </div>
      </CardHeader>

      <CardContent className="px-4 py-3">
        <CardDescription className="text-zinc-400 text-xs mb-2">{plan.description}</CardDescription> {/* Description below price */}
        <ul className="text-zinc-900 dark:text-zinc-100 text-sm space-y-3">
          {plan.features.map((feature: any) => (
            <li key={feature.name} className="flex items-center">
              <FeatureCheckmark />
              <span>{feature.description || ''}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="px-4 py-3 flex justify-end"> {/* Aligning button to the right */}
        <Link href={`/auth/sign-up?plan=${plan.id}`} className="btn-sm text-white bg-black dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-300 px-4 py-2 rounded-full transition duration-150 ease-in-out">
          Get Started
        </Link>
      </CardFooter>
    </Card>
  );
}

function FeatureCheckmark() {
  return (
    <svg className="w-3 h-3 fill-emerald-500 mr-3 shrink-0" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
      <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
    </svg>
  );
}

function FAQSection({ faqs }: { faqs: any[] }) {
  return (
    <div className="max-w-1xl mx-auto py-6">
      <div className="space-y-1">
        {faqs.map((faq, index) => (
          <Accordion 
            key={index} 
            title={faq.title}
            id={`faqs-${index}`} 
            active={faq.active}
          >
            {/* FAQ content styled with slightly smaller bold text */}
            <div className="text-md font-bold text-zinc-500 dark:text-zinc-200 leading-relaxed">
              {faq.text}
            </div>
          </Accordion>
        ))}
      </div>
    </div>
  );
}


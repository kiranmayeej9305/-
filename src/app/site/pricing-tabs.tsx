'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Tooltip from '@/components/tooltip';
import { faqs, pricingCards } from '@/lib/constants';
import { stripe } from '@/lib/stripe';
import Accordion from '@/components/accordion';
//import { BadgeCheckIcon } from '@heroicons/react/solid';

export default function PricingTabs() {
  const [billingCycle, setBillingCycle] = useState<string>('monthly');
  const [prices, setPrices] = useState<any[]>([]);

  useEffect(() => {
    const fetchPrices = async () => {
      const pricesResponse = await stripe.prices.list({
        product: process.env.NEXT_PUBLIC_STRIPE_PRODUCT_ID,
        active: true,
      });
      setPrices(pricesResponse.data);
    };
    fetchPrices();
  }, []);

  return (
    <section className="bg-gradient-to-b from-blue-50 to-white dark:from-zinc-900 dark:to-zinc-800">
      <div className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="relative max-w-3xl mx-auto text-center pb-12">
            <h2 className="font-bold text-4xl md:text-5xl text-zinc-900 dark:text-white mb-6">Elevate Your Business Today</h2>
            <p className="text-xl text-zinc-600 dark:text-zinc-300">
              Start building intelligent, AI-powered chatbots for free. Upgrade to unlock advanced features, real-time integrations, and seamless collaboration with your team.
            </p>
          </div>

          {/* Billing Cycle Toggle */}
          <div className="pb-12">
            <div className="flex justify-center mb-8">
              <button
                className={`px-6 py-2 rounded-full font-semibold transition duration-200 ${billingCycle === 'monthly' ? 'bg-black text-white' : 'bg-white text-black border-2 border-black'}`}
                onClick={() => setBillingCycle('monthly')}
              >
                Monthly
              </button>
              <button
                className={`px-6 py-2 rounded-full font-semibold ml-4 transition duration-200 ${billingCycle === 'yearly' ? 'bg-black text-white' : 'bg-white text-black border-2 border-black'}`}
                onClick={() => setBillingCycle('yearly')}
              >
                Yearly
              </button>
            </div>

            {/* Pricing Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {prices.map((card, index) => {
                const matchedCard = pricingCards.find((c) => c.title === card.nickname) || { description: '', features: [] };
                const isMostPopular = index === Math.floor(prices.length / 2);
                return (
                  <div key={card.id} className="relative w-full bg-white dark:bg-zinc-800 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300">
                    <div className={`p-8 border border-gray-200 dark:border-zinc-700 ${isMostPopular ? 'ring-2 ring-emerald-500' : ''}`}>
                      {isMostPopular && (
                        <div className="absolute top-0 right-0 mt-3 mr-3 bg-emerald-500 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center">
                          {/* <BadgeCheckIcon className="w-4 h-4 mr-1" /> */} Most Popular
                        </div>
                      )}
                      <h3 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-2">{card.nickname}</h3>
                      <div className="flex items-baseline text-zinc-900 dark:text-white font-bold mb-6">
                        <span className="text-3xl">$</span>
                        <span className="text-5xl">{(card.unit_amount / 100).toFixed(2)}</span>
                        <span className="text-lg text-zinc-600 dark:text-zinc-400 ml-2">/{card.recurring?.interval}</span>
                      </div>
                      <p className="text-zinc-500 dark:text-zinc-300 mb-6">{matchedCard.description}</p>
                      <ul className="text-zinc-600 dark:text-zinc-300 text-sm mb-8 space-y-3">
                        {matchedCard.features.map((feature) => (
                          <li key={feature} className="flex items-center">
                            <svg className="w-3 h-3 fill-emerald-500 mr-3 shrink-0" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
                              <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                            </svg>
                            <Tooltip id={feature} content="Learn more about this feature.">{feature}</Tooltip>
                          </li>
                        ))}
                      </ul>

                      {/* Center the Get Started Button */}
                      <div className="flex justify-center w-full">
                        <Link
                          href={`/auth/sign-up?plan=${card.id}`}
                          className="text-center py-3 px-6 rounded-full font-semibold bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-300 transition duration-200 ease-in-out"
                        >
                          Get Started
                        </Link>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* FAQs Section */}
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-center mb-6">Frequently Asked Questions</h3>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <Accordion key={index} title={faq.title} id={`faqs-${index}`} active={faq.active}>
                  {faq.text}
                </Accordion>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

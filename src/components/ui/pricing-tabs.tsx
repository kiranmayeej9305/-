'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Tooltip from '@/components/tooltip'
import { faqs, pricingCards } from '@/lib/constants'
import { stripe } from '@/lib/stripe'
import Accordion from '@/components/accordion'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function PricingTabs() {
  const [billingCycle, setBillingCycle] = useState<string>('monthly')
  const [prices, setPrices] = useState<any[]>([])

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const pricesResponse = await stripe.prices.list({
          product: process.env.NEXT_PUBLIC_STRIPE_PRODUCT_ID,
          active: true,
        })
        setPrices(pricesResponse.data)
      } catch (error) {
        console.error("Error fetching Stripe prices:", error)
      }
    }
    fetchPrices()
  }, [])

  const displayedPrices = prices.length ? prices : pricingCards.map((card, index) => ({
    id: index,
    nickname: card.title,
    unit_amount: 0,
    recurring: { interval: 'month' },
    description: card.description,
    features: card.features
  }))

  return (
    <section className="bg-zinc-50 dark:bg-zinc-900">
      <div className="py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="relative max-w-3xl mx-auto text-center pb-12">
            <h2 className="font-inter-tight text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">Start your journey today</h2>
            <p className="text-lg text-zinc-500 dark:text-zinc-300">Start creating realtime design experiences for free. Upgrade for extra features and collaboration with your team.</p>
          </div>

          <div className="pb-12 md:pb-20">
            <div className="max-w-sm mx-auto lg:max-w-3xl space-y-3 mb-12 lg:mb-16">
              <div className="flex justify-center mb-4">
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
              </div>
            </div>

            <section className="flex justify-center items-center flex-col gap-4 md:flex-row flex-wrap md:gap-6 mt-6">
              <h2 className="text-4xl text-center w-full"> Choose what fits you right</h2>
              <p className="text-muted-foreground text-center w-full">
                Our straightforward pricing plans are tailored to meet your needs. If
                {" you're"} not <br />
                ready to commit you can get started for free.
              </p>
              <div className="flex justify-center flex-wrap gap-4 w-full">
                {displayedPrices.map((card, index) => {
                  const matchedCard = pricingCards.find((c) => c.title === card.nickname) || { description: '', features: [] }
                  const isMostPopular = index === Math.floor(displayedPrices.length / 2)
                  return (
                    <Card key={card.id} className="h-full w-80 relative">
                      {isMostPopular && (
                        <div className="absolute top-2 right-2 bg-emerald-500 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center">
                          Most Popular
                        </div>
                      )}
                      <CardHeader>
                        <CardTitle>{card.nickname}</CardTitle>
                        <CardDescription>
                          <div className="font-inter-tight inline-flex items-baseline mb-2">
                            <span className="text-zinc-900 dark:text-zinc-100 font-bold text-2xl">$</span>
                            <span className="text-zinc-900 dark:text-zinc-100 font-bold text-3xl">{card.unit_amount / 100}</span>
                            <span className="text-zinc-500 dark:text-zinc-400 font-medium">/{card.recurring?.interval}</span>
                          </div>
                          <div className="text-zinc-500 dark:text-zinc-300">{matchedCard.description}</div>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="text-zinc-600 dark:text-zinc-400 text-sm space-y-3">
                          {matchedCard.features.map((feature) => (
                            <li key={feature} className="flex items-center">
                              <svg className="w-3 h-3 fill-emerald-500 mr-3 shrink-0" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                              </svg>
                              <Tooltip id={feature} content="Lorem Ipsum is simply dummy text of the printing.">
                                {feature}
                              </Tooltip>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <Link href={`/auth/sign-up?plan=${card.id}`} className="btn-sm text-white bg-black dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-300 px-4 py-2 rounded-full transition duration-150 ease-in-out">
                          Get Started
                        </Link>
                      </CardFooter>
                    </Card>
                  )
                })}
              </div>
            </section>
          </div>

          {/* FAQs */}
          <div className="max-w-2xl mx-auto">
            <div className="space-y-2">
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
  )
}

'use client'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'
import { StripeElementsOptions } from '@stripe/stripe-js'
import clsx from 'clsx'
import { useRouter } from 'next/navigation'
import React, { ReactNode, useEffect, useMemo, useState } from 'react'
import { Elements } from '@stripe/react-stripe-js'
import { getStripe } from '@/lib/stripe/stripe-client'
import Loading from '@/components/global/loading'
import AddOnForm from '.' // A new form component for Add-on subscriptions

type AddOn = {
  description: ReactNode
  name: ReactNode
  price: any
  id: string
  stripePriceId: string
  // Add other properties of AddOn as needed
}

type Props = {
  addOns: AddOn[] // The list of Add-ons
  customerId: string
}

const AddOnFormWrapper = ({ addOns, customerId }: Props) => {
  const [selectedAddOnId, setSelectedAddOnId] = useState<AddOn | ''>('')

  const [subscription, setSubscription] = useState<{
    subscriptionId: string
    clientSecret: string
  }>({ subscriptionId: '', clientSecret: '' })

  const options: StripeElementsOptions = useMemo(
    () => ({
      clientSecret: subscription?.clientSecret,
      appearance: {
        theme: 'flat',
      },
    }),
    [subscription]
  )

  useEffect(() => {
    if (!selectedAddOnId) return
    const createSecret = async () => {
      const addOnResponse = await fetch('/api/stripe/create-add-on-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          priceId: selectedAddOnId.stripePriceId,
        }),
      })
      const addOnResponseData = await addOnResponse.json()
      setSubscription({
        clientSecret: addOnResponseData.clientSecret,
        subscriptionId: addOnResponseData.subscriptionId,
      })
    }
    createSecret()
  }, [selectedAddOnId, customerId])

  return (
    <div className="border-none transition-all">
      <div className="flex flex-col gap-4">
        {addOns.map((addOn) => (
          <Card
            onClick={() => setSelectedAddOnId(addOn)}
            key={addOn.id}
            className={clsx('relative cursor-pointer transition-all', {
              'border-primary': selectedAddOnId === addOn,
            })}
          >
            <CardHeader>
              <CardTitle>
                ${addOn.price ? addOn.price / 100 : '0'}
                <p className="text-sm text-muted-foreground">{addOn.name}</p>
                <p className="text-sm text-muted-foreground">{addOn.description}</p>
              </CardTitle>
            </CardHeader>
            {selectedAddOnId === addOn.id && (
              <div className="w-2 h-2 bg-emerald-500 rounded-full absolute top-4 right-4" />
            )}
          </Card>
        ))}

        {options.clientSecret && (
          <>
            <h1 className="text-xl">Payment Method</h1>
            <Elements stripe={getStripe()} options={options}>
              <AddOnForm selectedAddOnId={selectedAddOnId ? selectedAddOnId.id : ''} />
            </Elements>
          </>
        )}

        {!options.clientSecret && selectedAddOnId && (
          <div className="flex items-center justify-center w-full h-40">
            <Loading />
          </div>
        )}
      </div>
    </div>
  )
}

export default AddOnFormWrapper

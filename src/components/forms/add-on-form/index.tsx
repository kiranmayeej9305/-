'use client'
import { Button } from '@/components/ui/button'
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import React, { useState } from 'react'

type Props = {
  selectedAddOnId: string
}

const AddOnForm = ({ selectedAddOnId }: Props) => {
  const stripeHook = useStripe()
  const elements = useElements()
  const [error, setError] = useState('')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!elements || !stripeHook) return
    if (!selectedAddOnId) {
      setError('Please select an Add-on to continue.')
      return
    }

    try {
      const { error } = await stripeHook.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${process.env.NEXT_PUBLIC_URL}/account`,
        },
      })
      if (error) throw new Error(error.message)
    } catch (error) {
      setError('Payment failed. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <small className="text-destructive">{error}</small>
      <PaymentElement />
      <Button disabled={!stripeHook} className="mt-4 w-full">
        Submit
      </Button>
    </form>
  )
}

export default AddOnForm

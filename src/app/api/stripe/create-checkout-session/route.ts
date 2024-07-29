import { db } from '@/lib/db'
import { stripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const {
    chatbotConnectAccId,
    prices,
    chatbotId,
  }: {
    chatbotConnectAccId: string
    prices: { recurring: boolean; productId: string }[]
    chatbotId: string
  } = await req.json()

  const origin = req.headers.get('origin')
  if (!chatbotConnectAccId || !prices.length)
    return new NextResponse('Stripe Account Id or price id is missing', {
      status: 400,
    })
  if (
    !process.env.NEXT_PUBLIC_PLATFORM_SUBSCRIPTION_PERCENT ||
    !process.env.NEXT_PUBLIC_PLATFORM_ONETIME_FEE ||
    !process.env.NEXT_PUBLIC_PLATFORM_AGENY_PERCENT
  ) {
    console.log('VALUES DONT EXITS')
    return NextResponse.json({ error: 'Fees do not exist' })
  }

  // Not needed unless we want to send payments to this account.
  //CHALLENGE Transfer money to a connected
  // const accountIdConnectedAccountId = await db.Chatbot.findUnique({
  //   where: { id: chatbotId },
  //   include: { Account: true },
  // })

  const subscriptionPriceExists = prices.find((price) => price.recurring)
  // if (!accountIdConnectedAccountId?.Account.connectAccountId) {
  //   console.log('Account is not connected')
  //   return NextResponse.json({ error: 'Account account is not connected' })
  // }

  try {
    const session = await stripe.checkout.sessions.create(
      {
        line_items: prices.map((price) => ({
          price: price.productId,
          quantity: 1,
        })),

        ...(subscriptionPriceExists && {
          subscription_data: {
            metadata: { connectAccountSubscriptions: 'true' },
            application_fee_percent:
              +process.env.NEXT_PUBLIC_PLATFORM_SUBSCRIPTION_PERCENT,
          },
        }),

        ...(!subscriptionPriceExists && {
          payment_intent_data: {
            metadata: { connectAccountPayments: 'true' },
            application_fee_amount:
              +process.env.NEXT_PUBLIC_PLATFORM_ONETIME_FEE * 100,
          },
        }),

        mode: subscriptionPriceExists ? 'subscription' : 'payment',
        ui_mode: 'embedded',
        redirect_on_completion: 'never',
      },
      { stripeAccount: chatbotConnectAccId }
    )

    return NextResponse.json(
      {
        clientSecret: session.client_secret,
      },
      {
        headers: {
          'Access-Control-Allow-Origin': origin || '*',
          'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    )
  } catch (error) {
    console.log('🔴 Error', error)
    //@ts-ignore
    return NextResponse.json({ error: error.message })
  }
}

export async function OPTIONS(request: Request) {
  const allowedOrigin = request.headers.get('origin')
  const response = new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': allowedOrigin || '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers':
        'Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version',
      'Access-Control-Max-Age': '86400',
    },
  })

  return response
}

import React from 'react'

import { Funnel, Chatbot } from '@prisma/client'
import { db } from '@/lib/db'
import { getConnectAccountProducts } from '@/lib/stripe/stripe-actions'


import FunnelForm from '@/components/forms/funnel-form'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import FunnelProductsTable from './funnel-products-table'

interface FunnelSettingsProps {
  chatbotId: string
  defaultData: Funnel
}

const FunnelSettings: React.FC<FunnelSettingsProps> = async ({
  chatbotId,
  defaultData,
}) => {
  //CHALLENGE: go connect your stripe to sell products

  const chatbotDetails = await db.Chatbot.findUnique({
    where: {
      id: chatbotId,
    },
  })

  if (!chatbotDetails) return
  if (!chatbotDetails.connectAccountId) return
  const products = await getConnectAccountProducts(
    chatbotDetails.connectAccountId
  )

  return (
    <div className="flex gap-4 flex-col xl:!flex-row">
      <Card className="flex-1 flex-shrink">
        <CardHeader>
          <CardTitle>Funnel Products</CardTitle>
          <CardDescription>
            Select the products and services you wish to sell on this funnel.
            You can sell one time and recurring products too.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <>
            {chatbotDetails.connectAccountId ? (
              <FunnelProductsTable
                defaultData={defaultData}
                products={products}
              />
            ) : (
              'Connect your stripe account to sell products.'
            )}
          </>
        </CardContent>
      </Card>

      <FunnelForm
        chatbotId={chatbotId}
        defaultData={defaultData}
      />
    </div>
  )
}

export default FunnelSettings

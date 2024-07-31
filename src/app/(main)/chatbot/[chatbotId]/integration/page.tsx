import BlurPage from '@/components/global/blur-page'
import React from 'react'
import { getInterfaceSettings } from '@/lib/queries';
import IntegrationComponent from '@/components/integration'

type Props = {
  params: { chatbotId: string }
}

const InterfacePage = async ({ params }: Props) => {
  const data = await getInterfaceSettings(params.chatbotId)

  return (
    <BlurPage>
      <IntegrationComponent
        data={data}
        chatbotId={params.chatbotId}
      />
    </BlurPage>
  )
}

export default InterfacePage

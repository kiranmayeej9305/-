import BlurPage from '@/components/global/blur-page'
import React from 'react'
import { getInterfaceSettings } from '@/lib/queries';
import InterfaceComponent from '@/components/interface'

type Props = {
  params: { chatbotId: string }
}

const InterfacePage = async ({ params }: Props) => {
  const data = await getInterfaceSettings(params.chatbotId)

  return (
    <BlurPage>
      <InterfaceComponent
        data={data}
        chatbotId={params.chatbotId}
      />
    </BlurPage>
  )
}

export default InterfacePage

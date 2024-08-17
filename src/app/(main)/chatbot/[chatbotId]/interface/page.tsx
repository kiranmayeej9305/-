import BlurPage from '@/components/global/blur-page'
import React from 'react'
import { getInterfaceSettings } from '@/lib/queries';
import InterfaceSettings from '@/components/forms/interface-settings';

type Props = {
  params: { chatbotId: string }
}

const InterfacePage = async ({ params }: Props) => {
  const data = await getInterfaceSettings(params.chatbotId)

  return (
    <BlurPage>
      <div className="container mx-auto p-4 lg:p-8">
      <InterfaceSettings
        data={data}
        chatbotId={params.chatbotId}
      />
      </div>
    </BlurPage>
  )
}

export default InterfacePage

import BlurPage from '@/components/global/blur-page'
import MediaComponent from '@/components/media'
import { getMedia } from '@/lib/queries'
import React from 'react'

type Props = {
  params: { chatbotId: string }
}

const MediaPage = async ({ params }: Props) => {
  const data = await getMedia(params.chatbotId)

  return (
    <BlurPage>
      <MediaComponent
        data={data}
        chatbotId={params.chatbotId}
      />
    </BlurPage>
  )
}

export default MediaPage

'use client'
import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription } from '../ui/card'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { User } from 'lucide-react'
import { useChatContext } from '@/context/use-chat-context'

type Props = {
  title: string
  description?: string
  createdAt: Date
  id: string
  onChat(): void
  seen?: boolean
}

const ChatCard = ({
  title,
  description,
  createdAt,
  onChat,
  id,
  seen,
}: Props) => {
  const { chatRoom } = useChatContext()
  const [messageSentAt, setMessageSentAt] = useState<string>('')
  const [urgent, setUrgent] = useState<boolean>(false)

  const onSetMessageReceivedDate = () => {
    const dt = new Date(createdAt)
    const current = new Date()
    const currentDate = current.getDate()
    const hr = dt.getHours()
    const min = dt.getMinutes()
    const date = dt.getDate()
    const month = dt.getMonth()
    const difference = currentDate - date

    if (difference <= 0) {
      setMessageSentAt(`${hr}:${min}${hr > 12 ? 'PM' : 'AM'}`)
      if (current.getHours() - dt.getHours() < 2) {
        setUrgent(true)
      }
    } else {
      setMessageSentAt(`${date} ${dt.toLocaleString('default', { month: 'short' })}`)
    }
  }



  return (
    <Card
      onClick={onChat}
      className="rounded-none border-r-0 hover:bg-muted cursor-pointer transition duration-150 ease-in-out"
    >
      <CardContent className="py-4 flex gap-3">
        <div>
          <Avatar>
            <AvatarFallback className="bg-muted">
              <User />
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex justify-between w-full">
          <div>
            <div className="flex gap-5 items-center">
              <CardDescription className="font-bold leading-none text-gray-600">
                {title}
              </CardDescription>
            </div>
            <CardDescription>
              {description
                ? description.substring(0, 20) + '...'
                : 'This chatroom is empty'}
            </CardDescription>
          </div>
          <div className="w-[100px] flex justify-end">
            <CardDescription className="text-xs">
              {createdAt ? messageSentAt : ''}
            </CardDescription>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ChatCard

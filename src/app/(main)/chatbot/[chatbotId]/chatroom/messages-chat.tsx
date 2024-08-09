'use client';

import { useEffect, useRef } from 'react';
import { useChatContext } from '@/context/use-chat-context';
import Bubble from './bubble';
import { pusherClient } from '@/lib/utils';

export default function MessagesChat() {
  const { chats, setChats, chatRoom } = useChatContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatRoom) return;

    const channel = pusherClient.subscribe(`chat-room-${chatRoom}`);

    channel.bind('new-message', (data: any) => {
      setChats((prevChats) => [...prevChats, data]);
    });

    return () => {
      pusherClient.unsubscribe(`chat-room-${chatRoom}`);
    };
  }, [chatRoom, setChats]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats]);

  return (
    <div className="grow px-4 sm:px-6 md:px-5 py-6 overflow-y-auto">
      {chats.length > 0 ? (
        chats.map((chat, index) => (
          <div key={index} className="flex items-start mb-4 last:mb-0">
            <Bubble message={chat.message} createdAt={chat.createdAt} sender={chat.sender} />
          </div>
        ))
      ) : (
        <p>No messages yet.</p>
      )}
      <div ref={messagesEndRef} aria-hidden="true" />
    </div>
  );
}

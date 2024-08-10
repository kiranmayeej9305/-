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
    <div className="flex flex-col-reverse px-4 py-6 bg-white dark:bg-gray-900 overflow-y-auto">
      {chats.length > 0 ? (
        chats.map((chat) => (
          <Bubble
            key={chat.id}
            message={chat.message}
            createdAt={new Date(chat.createdAt)}
            sender={chat.sender}
          />
        ))
      ) : (
        <p className="text-gray-500 dark:text-gray-400 text-center">No messages yet.</p>
      )}
      <div ref={messagesEndRef} aria-hidden="true" />
    </div>
  );
}

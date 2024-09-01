'use client';

import React, { useEffect, useRef } from 'react';
import { useChatContext } from '@/context/use-chat-context';
import Bubble from './bubble';
import { pusherClient } from '@/lib/pusher';
import { InterfaceSettings } from '@/context/use-interface-settings-context';

interface MessagesChatProps {
  settings: InterfaceSettings;
}

export default function MessagesChat({ settings }: MessagesChatProps) {
  const { chats, setChats, chatRoom } = useChatContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatRoom) return;

    const channel = pusherClient.subscribe(`chatroom-${chatRoom}`);
    channel.bind('new-message', (data: any) => {
      setChats((prevChats) => {
        const isDuplicate = prevChats.some((chat) => chat.id === data.id);
        if (!isDuplicate) {
          return [...prevChats, data];
        }
        return prevChats;
      });
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });

    return () => {
      pusherClient.unsubscribe(`chatroom-${chatRoom}`);
    };
  }, [chatRoom, setChats]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats]);

  console.log('Bubble Settings:', settings); // Log settings to ensure they are passed correctly

  return (
    <div className="px-4 sm:px-6 md:px-5 py-6 overflow-y-auto scrollbar-thin scrollbar-thumb-rounded-full scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
      {chats.length > 0 ? (
        chats.map((chat) => (
          <div key={chat.id} className="flex items-start mb-4 last:mb-0">
            <Bubble
              message={chat.message}
              createdAt={chat.createdAt}
              sender={chat.sender}
              userAvatar={settings?.userAvatar || '/images/user.png'}
              chatbotAvatar={settings?.chatbotAvatar || '/images/chatbot.png'}
              userMsgBackgroundColour={settings?.userMsgBackgroundColour || '#E2E8F0'}
              chatbotMsgBackgroundColour={settings?.chatbotMsgBackgroundColour || '#3B82F6'}
              userTextColor={settings?.userTextColor || '#000000'}
              chatbotTextColor={settings?.chatbotTextColor || '#FFFFFF'}
            />
          </div>
        ))
      ) : (
        <p className="text-gray-500 dark:text-gray-400 text-center">No messages yet.</p>
      )}
      <div ref={messagesEndRef} aria-hidden="true" />
    </div>
  );
}

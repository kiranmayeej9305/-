'use client';

import { useEffect, useRef } from 'react';
import { useChatContext } from '@/context/use-chat-context';
import Bubble from './bubble';
import Notification from '@/components/ui/notification'; 
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

    const channel = pusherClient.subscribe(`chatroom-${chatRoom.id}`);

    const handleMessage = (data: any) => {
      setChats((prevChats) => {
        const isDuplicate = prevChats.some((chat) => chat.id === data.id);
        if (!isDuplicate) {
          return [...prevChats, data];
        }
        return prevChats;
      });
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    channel.bind('new-message', handleMessage);

    return () => {
      // Cleanup the subscription when the component unmounts or chatRoom changes
      channel.unbind('new-message', handleMessage);
      pusherClient.unsubscribe(`chatroom-${chatRoom.id}`);
    };
  }, [chatRoom, setChats]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats]);

  return (
    <div className="grow px-4 sm:px-6 md:px-5 py-6 overflow-y-auto scrollbar-thin scrollbar-thumb-rounded-full scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
      {chats.length > 0 ? (
        chats.map((chat) => (
          <div key={chat.id} className="flex items-start mb-4 last:mb-0">
            {chat.sender === 'system' ? (
              <Notification
                message={chat.message}
                themeColor={settings.themeColor}
                botDisplayNameColor={settings.botDisplayNameColor}
              />
            ) : (
              <Bubble
                message={chat.message}
                createdAt={chat.createdAt}
                sender={chat.sender}
                isChatbot={chat.sender === 'chatbot'}
                userMsgBackgroundColour={settings.userMsgBackgroundColour}
                chatbotMsgBackgroundColour={settings.chatbotMsgBackgroundColour}
                userTextColor={settings.userTextColor}
                chatbotTextColor={settings.chatbotTextColor}
                userAvatar={settings.userAvatar}
                chatbotAvatar={settings.chatbotAvatar}
              />
            )}
          </div>
        ))
      ) : (
        <p className="text-gray-500 dark:text-gray-400 text-center">No messages yet.</p>
      )}
      <div ref={messagesEndRef} aria-hidden="true" />
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { getChatbotChatRooms, getChatMessages } from '@/lib/queries';
import { useChatContext } from '@/context/use-chat-context';
import DirectMessages from './direct-messages';
import { useFlyoutContext } from '@/context/flyout-context';
import { useInterfaceSettings } from '@/context/use-interface-settings-context';

// Define an interface for the ChatRoom type
interface ChatRoom {
  id: string;
  Customer: { email: string | null };
  chatbotId: string;
  createdAt: Date;
  updatedAt: Date;
  customerId: string;
  live: boolean;
  mailed: boolean;
  ChatMessages: {
    createdAt: Date;
    message: string;
    seen: boolean;
    sender: string | null;
  }[];
}

export default function MessagesSidebar({ chatbotId, onChatSelect }: { chatbotId: string, onChatSelect: (roomId: string) => void }) {
  const { flyoutOpen } = useFlyoutContext();
  const { setChatRoom, setChats } = useChatContext();
  const { settings, loading } = useInterfaceSettings(); 
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);

  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        const rooms = await getChatbotChatRooms(chatbotId);
        setChatRooms(rooms);
      } catch (error) {
        console.error('Failed to fetch chat rooms:', error);
      }
    };

    fetchChatRooms();
  }, [chatbotId]);

  const handleChatSelect = async (roomId: string) => {
    try {
      const messages = await getChatMessages(roomId);
      setChatRoom((prevRoom) => ({
        ...prevRoom,
        id: roomId,
        live: prevRoom?.live ?? false,
        mailed: prevRoom?.mailed ?? false,
        createdAt: prevRoom?.createdAt ?? new Date(),
        updatedAt: prevRoom?.updatedAt ?? new Date(),
        customerId: prevRoom?.customerId ?? '',
        chatbotId: prevRoom?.chatbotId ?? chatbotId,
        Customer: prevRoom?.customerId ?? { email: null },
        ChatMessages: messages?.ChatMessages ?? [],
        agentId: prevRoom?.agentId ?? '',
      }));
      setChats(messages?.ChatMessages ?? []);
      onChatSelect(roomId);
    } catch (error) {
      console.error('Failed to fetch chat messages:', error);
    }
  };

  if (loading || !settings) {
    return <div>Loading...</div>; 
  }

  return (
    <div
      id="messages-sidebar"
      className={`fixed top-0 bottom-0 left-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto transition-transform transform ${
        flyoutOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 md:static md:w-80`}
    >
      <div className="px-4 py-4">
        <DirectMessages 
          chatRooms={chatRooms.map(room => ({
            ...room,
            Customer: {
              ...room.Customer,
              email: room.Customer.email || ''
            }
          }))} 
          onChatSelect={handleChatSelect} 
          settings={settings} 
        />
      </div>
    </div>
  );
}

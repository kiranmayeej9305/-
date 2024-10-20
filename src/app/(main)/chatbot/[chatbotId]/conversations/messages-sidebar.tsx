'use client';

import React, { useEffect, useState } from 'react';
import { getChatbotChatRooms, getChatMessages } from '@/lib/queries';
import { useChatContext } from '@/context/use-chat-context';
import DirectMessages from './direct-messages';
import { useFlyoutContext } from '@/context/flyout-context';
import { useInterfaceSettings } from '@/context/use-interface-settings-context';

export default function MessagesSidebar({ chatbotId, onChatSelect }: { chatbotId: string, onChatSelect: (roomId: string) => void }) {
  const { flyoutOpen } = useFlyoutContext();
  const { setChatRoom, setChats } = useChatContext();
  const { settings, loading } = useInterfaceSettings(); 
  const [chatRooms, setChatRooms] = useState([]);

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
      setChatRoom((prevRoom) => ({ ...prevRoom, id: roomId }));
      setChats(messages?.ChatMessages || []);
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
        <DirectMessages chatRooms={chatRooms} onChatSelect={handleChatSelect} settings={settings} />
      </div>
    </div>
  );
}

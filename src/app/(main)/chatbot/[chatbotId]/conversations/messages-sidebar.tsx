'use client';

import { useEffect, useState } from 'react';
import { getChatbotChatRooms, getChatMessages } from '@/lib/queries';
import { useChatContext } from '@/context/use-chat-context';
import DirectMessages from './direct-messages';
import { useFlyoutContext } from '@/context/flyout-context';

export default function MessagesSidebar({ chatbotId }: { chatbotId: string }) {
  const { flyoutOpen } = useFlyoutContext();
  const [chatRooms, setChatRooms] = useState([]);
  const { setChatRoom, setChats } = useChatContext();

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
      setChatRoom(roomId);
      setChats(messages?.ChatMessages || []);
    } catch (error) {
      console.error('Failed to fetch chat messages:', error);
    }
  };

  return (
    <div
      id="messages-sidebar"
      className={`fixed top-0 bottom-0 left-0 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 overflow-y-auto transition-transform transform ${
        flyoutOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 md:static md:w-80`}
    >
      <div className="px-5 py-4">
        <DirectMessages chatRooms={chatRooms} onChatSelect={handleChatSelect} />
      </div>
    </div>
  );
}

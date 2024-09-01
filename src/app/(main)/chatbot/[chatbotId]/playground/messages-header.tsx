'use client';

import React, { useEffect, useState } from 'react';
import { InterfaceSettings } from '@/context/use-interface-settings-context';
import { RadioTower } from 'lucide-react';
import { useChatContext } from '@/context/use-chat-context';

const MessagesHeader: React.FC<{ settings: InterfaceSettings }> = ({ settings }) => {
  const { chatRoom } = useChatContext();
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    if (chatRoom) {
      setIsLive(chatRoom.live);
    }
  }, [chatRoom]);

  return (
    <div
      className="p-6 border-b border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex items-center justify-between"
      style={{
        backgroundColor: settings.themeColor || '#f0f0f0',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        marginBottom: '16px',
      }}
    >
      <div className="flex items-center">
        <img
          src={settings.chatIcon || '/images/bot.png'}
          alt="Chat Icon"
          className="h-12 w-12 rounded-full object-cover mr-3"
        />
        <h2
          className="text-2xl font-bold"
          style={{
            color: settings.botDisplayNameColor || 'var(--text-color, #000)',
          }}
        >
          {settings.botDisplayName || 'Chatbot'}
        </h2>
      </div>
      {isLive && (
        <div
          className="flex items-center space-x-2 animate-pulse"
          style={{ color: settings.helpdeskLiveAgentColor || '#ff0000' }}
        >
          <RadioTower className="h-6 w-6" />
        </div>
      )}
    </div>
  );
};

export default MessagesHeader;

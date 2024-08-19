// MessagesHeader Component
'use client';

import React from 'react';
import { RadioTower } from 'lucide-react';

type MessagesHeaderProps = {
  botDisplayName: string;
  chatIcon: string;
  isLiveAgentEnabled: boolean;
  helpdeskLiveAgentColor?: string;
};

const MessagesHeader: React.FC<MessagesHeaderProps> = ({
  botDisplayName,
  chatIcon,
  isLiveAgentEnabled,
  helpdeskLiveAgentColor,
}) => {
  return (
    <div className="flex items-center justify-between p-3" style={{ backgroundColor: 'var(--theme-color, #3b82f6)', color: '#fff' }}>
      <div className="flex items-center space-x-2 relative">
        <div className="relative">
          <img
            src={chatIcon || '/images/bot.png'}
            alt="Chat Icon"
            className="h-10 w-10 rounded-full object-cover"
          />
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
        </div>
        <h3 className="text-lg font-semibold">{botDisplayName || 'Chatbot'}</h3>
      </div>
      {isLiveAgentEnabled && (
        <div className="flex items-center space-x-2 animate-pulse" style={{ color: helpdeskLiveAgentColor || '#ff0000' }}>
          <RadioTower className="h-6 w-6" />
        </div>
      )}
    </div>
  );
};

export default MessagesHeader;
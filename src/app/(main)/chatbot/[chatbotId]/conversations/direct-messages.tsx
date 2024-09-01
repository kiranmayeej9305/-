'use client';

import React from 'react';

type DirectMessagesProps = {
  chatRooms: {
    id: string;
    createdAt: Date;
    ChatMessages: {
      message: string;
      createdAt: Date;
      seen: boolean;
    }[];
    Customer: {
      email: string;
      avatarUrl?: string;
    };
  }[];
  onChatSelect: (roomId: string) => void;
  settings: {
    themeColor: string;
    botDisplayNameColor: string;
  };
};

export default function DirectMessages({ chatRooms, onChatSelect, settings }: DirectMessagesProps) {
  const truncateMessage = (message: string) => {
    if (message.length > 30) {
      return message.substring(0, 30) + '...';
    }
    return message;
  };

  return (
    <div className="mt-2 px-2 space-y-4">
      <div 
        className="text-xs font-semibold uppercase mb-3"
        style={{ color: settings.themeColor || '#4A5568' }} 
      >
        Direct Messages
      </div>
      <ul className="space-y-3">
        {chatRooms.map((room) => {
          const latestMessageColor = room.ChatMessages?.[0]?.message 
            ? settings.themeColor 
            : settings.botDisplayNameColor;

          return (
            <li key={room.id}>
              <div
                className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md transition-all duration-200"
                style={{
                  borderColor: settings.themeColor || '#E2E8F0',
                  borderWidth: '1px',
                }}
              >
                <button
                  className="flex items-center w-full"
                  onClick={() => onChatSelect(room.id)}
                >
                  <div className="flex-shrink-0">
                    <img
                      src={room.Customer?.avatarUrl || '/images/user.png'}
                      alt="User Avatar"
                      className="h-12 w-12 rounded-full object-cover border-2"
                      style={{ borderColor: settings.themeColor || '#E2E8F0' }} 
                    />
                  </div>
                  <div className="ml-3 flex flex-col items-start justify-center overflow-hidden">
                    <span 
                      className="text-sm font-bold truncate" // Customer name/email in bold
                      style={{ color: latestMessageColor || '#1A202C' }}
                    >
                      {room.Customer?.email || 'Unknown User'}
                    </span>
                    <span 
                      className="text-xs truncate"
                      style={{ color: settings.themeColor || '#718096' }} 
                    >
                      {truncateMessage(room.ChatMessages?.[0]?.message || 'No recent message')}
                    </span>
                  </div>
                  {!room.ChatMessages?.[0]?.seen && (
                    <div
                      className="ml-auto text-xs font-medium rounded-full px-2 py-1"
                      style={{ backgroundColor: settings.themeColor || '#F56565', color: '#FFF' }} 
                    >
                      New
                    </div>
                  )}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

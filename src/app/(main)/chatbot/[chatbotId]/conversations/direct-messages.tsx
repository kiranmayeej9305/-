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
    };
  }[];
  onChatSelect: (roomId: string) => void;
};

export default function DirectMessages({ chatRooms, onChatSelect }: DirectMessagesProps) {
  return (
    <div className="mt-4 space-y-4 px-4">
      <div className="text-xs font-semibold text-gray-500 uppercase mb-3">
        Direct Messages
      </div>
      <ul className="space-y-2">
        {chatRooms.map((room) => (
          <li key={room.id}>
            <button
              className="flex items-center justify-between w-full p-4 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg shadow-sm transition"
              onClick={() => onChatSelect(room.id)}
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {room.Customer?.email || 'Unknown User'}
                </span>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {room.ChatMessages?.[0]?.message || 'No recent message'}
                </span>
              </div>
              <div className="flex items-center">
                {!room.ChatMessages?.[0]?.seen && (
                  <div className="ml-2 text-xs font-medium bg-red-500 text-white rounded-full px-2 py-1">
                    New
                  </div>
                )}
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

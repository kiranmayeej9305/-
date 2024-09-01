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
      avatarUrl?: string; // Add avatarUrl to hold the user's avatar image URL
    };
  }[];
  onChatSelect: (roomId: string) => void;
};

export default function DirectMessages({ chatRooms, onChatSelect }: DirectMessagesProps) {
  const truncateMessage = (message: string) => {
    if (message.length > 30) {
      return message.substring(0, 30) + '...'; // Adjust length for better appearance
    }
    return message;
  };

  return (
    <div className="mt-4 space-y-4 px-4">
      <div className="text-xs font-semibold text-gray-500 uppercase mb-3">
        Direct Messages
      </div>
      <ul className="space-y-2">
        {chatRooms.map((room) => (
          <li key={room.id}>
            <button
              className="flex items-center w-full p-3 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg shadow-sm transition"
              onClick={() => onChatSelect(room.id)}
            >
              <div className="flex-shrink-0">
                <img
                  src={room.Customer?.avatarUrl || '/images/user.png'} // Use avatarUrl from settings or database
                  alt="User Avatar"
                  className="h-12 w-12 rounded-full mr-3 object-cover border-2 border-gray-200 dark:border-gray-700"
                />
              </div>
              <div className="flex flex-col items-start justify-center overflow-hidden">
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {room.Customer?.email || 'Unknown User'}
                </span>
                <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {truncateMessage(room.ChatMessages?.[0]?.message || 'No recent message')}
                </span>
              </div>
              {!room.ChatMessages?.[0]?.seen && (
                <div className="ml-auto text-xs font-medium bg-red-500 text-white rounded-full px-2 py-1">
                  New
                </div>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

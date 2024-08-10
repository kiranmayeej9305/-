import React from 'react';

type Props = {
  message: string;
  createdAt: string | Date;
  sender: string | null;
};

export default function Bubble({ message, createdAt, sender }: Props) {
  const isChatbot = sender === 'chatbot';

  return (
    <div className={`flex w-full ${isChatbot ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg shadow-md text-sm ${
          isChatbot
            ? 'bg-indigo-500 text-white rounded-tr-none'
            : 'bg-gray-200 dark:bg-slate-800 text-black dark:text-white rounded-tl-none'
        }`}
      >
        <p>{message}</p>
        <span className="text-xs text-gray-500 mt-1 block text-right">
          {new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}

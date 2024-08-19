import React from 'react';

type Props = {
  message: string;
  createdAt: string | Date;
  sender: string | null;
  style?: React.CSSProperties;
  avatar?: string;
};

export default function Bubble({ message, createdAt, sender, style, avatar }: Props) {
  const isChatbot = sender === 'chatbot';

  return (
    <div className={`flex w-full ${isChatbot ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className="flex items-center space-x-3">
        {!isChatbot && (
          <img
            src={avatar || '/images/user.png'}
            alt="User Avatar"
            className="h-12 w-12 rounded-full object-cover border-2 border-blue-500"
          />
        )}
        <div
          className={`relative max-w-xs md:max-w-md lg:max-w-lg p-4 rounded-2xl shadow-lg ${
            isChatbot ? 'rounded-br-none' : 'rounded-bl-none'
          }`}
          style={{
            backgroundColor: style?.backgroundColor || (isChatbot ? '#4f46e5' : 'inherit'),
            color: style?.color || (isChatbot ? '#ffffff' : '#333'),
          }}
        >
          <div className="whitespace-pre-wrap leading-relaxed">
            {message.split('\n').map((line, index) => (
              <p key={index} className="cursor-pointer hover:text-blue-200 transition-colors duration-300">
                {line}
              </p>
            ))}
          </div>
          <span className="absolute bottom-1 right-3 text-xs text-gray-400">
            {new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        {isChatbot && (
          <img
            src={avatar || '/images/chatbot.png'}
            alt="Chatbot Avatar"
            className="h-12 w-12 rounded-full object-cover border-2 border-indigo-500"
          />
        )}
      </div>
    </div>
  );
}

import React from 'react';

type Props = {
  message: string;
  createdAt: Date;
  sender: string | null;
  userAvatar?: string;
  chatbotAvatar?: string;
  userMsgBackgroundColour?: string;
  chatbotMsgBackgroundColour?: string;
  userTextColor?: string;
  chatbotTextColor?: string;
};

export default function Bubble({
  message,
  createdAt,
  sender,
  userAvatar,
  chatbotAvatar,
  userMsgBackgroundColour,
  chatbotMsgBackgroundColour,
  userTextColor,
  chatbotTextColor,
}: Props) {
  const isChatbot = sender === 'chatbot';
  return (
    <div className={`flex w-full ${isChatbot ? 'justify-end' : 'justify-start'} mb-4 items-end`}>
      {!isChatbot && (
        <img
          src={userAvatar}
          alt="User Avatar"
          className="h-8 w-8 rounded-full mr-2"
        />
      )}
      <div
        className={`max-w-xs md:max-w-md lg:max-w-lg p-4 rounded-lg shadow-md text-sm ${
          isChatbot ? 'rounded-tr-none' : 'rounded-tl-none'
        }`}
        style={{
          backgroundColor: isChatbot ? chatbotMsgBackgroundColour : userMsgBackgroundColour,
          color: isChatbot ? chatbotTextColor : userTextColor,
        }}
      >
        <p>{message}</p>
        <span className="text-xs text-gray-500 mt-1 block text-right">
          {new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      {isChatbot && (
        <img
          src={chatbotAvatar}
          alt="Chatbot Avatar"
          className="h-8 w-8 rounded-full ml-2"
        />
      )}
    </div>
  );
}

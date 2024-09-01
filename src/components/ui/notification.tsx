'use client';

import React from 'react';

interface NotificationProps {
  message: string;
  themeColor: string;
  botDisplayNameColor: string;
}

const Notification: React.FC<NotificationProps> = ({ message, themeColor, botDisplayNameColor }) => {
  return (
    <div
      className="flex justify-center items-center mx-auto my-2 py-1 px-3 rounded-full shadow-lg transition-all duration-300"
      style={{
        color: botDisplayNameColor || '#000',
        backgroundColor: themeColor || '#f0f0f0',
        maxWidth: '80%', // Adjust width to fit within the chat window
        boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.1)',
      }}
    >
      <span className="text-xs font-medium text-center">{message}</span>
    </div>
  );
};

export default Notification;

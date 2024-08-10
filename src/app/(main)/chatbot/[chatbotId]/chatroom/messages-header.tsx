'use client';

import React from 'react';

const MessagesHeader: React.FC = () => {
  return (
    <div className="p-4 border-b border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Chatbot</h2>
    </div>
  );
};

export default MessagesHeader;

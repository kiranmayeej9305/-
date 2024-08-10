'use client';

import React, { useState, useRef } from 'react';

interface MessagesFooterProps {
  onSendMessage: (message: string) => void;
}

export default function MessagesFooter({ onSendMessage }: MessagesFooterProps) {
  const [newMessage, setNewMessage] = useState('');
  const isSendingRef = useRef(false);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSendingRef.current) return;

    try {
      isSendingRef.current = true;
      onSendMessage(newMessage);
      setNewMessage(''); // Clear input field after sending
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      isSendingRef.current = false;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="sticky bottom-0 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 px-4 sm:px-6 md:px-5 h-16 flex items-center">
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        className="flex-grow p-2 border border-gray-300 dark:border-gray-700 rounded-md"
        placeholder="Type your message..."
      />
      <button
        onClick={handleSendMessage}
        className="ml-3 p-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-md"
      >
        Send
      </button>
    </div>
  );
}

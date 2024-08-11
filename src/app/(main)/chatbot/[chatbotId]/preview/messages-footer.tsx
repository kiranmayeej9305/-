'use client';

import React, { useState, useRef } from 'react';

interface MessagesFooterProps {
  onSendMessage: (message: string) => Promise<void>;
}

export default function MessagesFooter({ onSendMessage }: MessagesFooterProps) {
  const [newMessage, setNewMessage] = useState('');
  const isSendingRef = useRef(false);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSendingRef.current) return;

    isSendingRef.current = true; // Lock the send function
    console.log('Footer: Sending message:', newMessage);

    try {
      await onSendMessage(newMessage);
      setNewMessage(''); // Clear input field after sending
    } catch (error) {
      console.error('Footer: Error sending message:', error);
    } finally {
      isSendingRef.current = false; // Unlock the send function after message is sent
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
        disabled={isSendingRef.current} // Disable input if sending
      />
      <button
        onClick={handleSendMessage}
        className="ml-3 p-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-md"
        disabled={isSendingRef.current} // Disable button if sending
      >
        Send
      </button>
    </div>
  );
}

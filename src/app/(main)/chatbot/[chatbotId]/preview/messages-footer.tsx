'use client';

import React, { useState, useRef } from 'react';
import { useChatContext } from '@/context/use-chat-context';
import { createMessageInChatRoom } from '@/lib/queries';

export default function MessagesFooter() {
  const { chatRoom } = useChatContext();
  const [newMessage, setNewMessage] = useState('');
  const isSendingRef = useRef(false); // To prevent double sending

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !chatRoom || isSendingRef.current) return;

    try {
      isSendingRef.current = true;
      await createMessageInChatRoom(chatRoom, newMessage, 'customer');
      setNewMessage(''); // Reset input after sending
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

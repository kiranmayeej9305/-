'use client';

import React, { useState, useRef } from 'react';
import { useChatContext } from '@/context/use-chat-context';
import { useInterfaceSettings } from '@/context/use-interface-settings-context';
import { Send } from 'lucide-react';

export default function MessagesFooter({ onSendMessage }) {
  const { chatRoom } = useChatContext();
  const { settings } = useInterfaceSettings();
  const [newMessage, setNewMessage] = useState('');
  const isSendingRef = useRef(false);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSendingRef.current || !chatRoom?.live) return;

    isSendingRef.current = true;

    try {
      await onSendMessage(newMessage);
      setNewMessage('');
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
    <div className="flex flex-col items-center border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <div className="w-full flex items-center px-4 sm:px-6 md:px-5 h-16">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-grow p-2 border border-gray-300 dark:border-gray-700 rounded-l-md"
          placeholder={settings.messagePlaceholder || 'Type your message...'}
          disabled={isSendingRef.current || !chatRoom?.live}
        />
        <button
          onClick={handleSendMessage}
          className="flex items-center justify-center px-4 py-2 rounded-r-md"
          disabled={isSendingRef.current || !chatRoom?.live}
          style={{ backgroundColor: settings.themeColor || '#3b82f6' }}
        >
          <Send
            className="h-5 w-5"
            style={{ color: settings.botDisplayNameColor || '#fff' }}
          />
        </button>
      </div>
    </div>
  );
}

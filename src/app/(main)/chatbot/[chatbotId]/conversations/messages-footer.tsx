'use client';

import React, { useState, useRef } from 'react';
import { InterfaceSettings } from '@/context/use-interface-settings-context';
import { Send } from 'lucide-react';

interface MessagesFooterProps {
  onSendMessage: (message: string) => Promise<void>;
  settings: InterfaceSettings;
  isLiveAgent: boolean;
}

export default function MessagesFooter({ onSendMessage, settings, isLiveAgent }: MessagesFooterProps) {
  const [newMessage, setNewMessage] = useState('');
  const isSendingRef = useRef(false);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSendingRef.current) return;

    isSendingRef.current = true; // Lock the send function

    try {
      await onSendMessage(newMessage);
      setNewMessage(''); // Clear input field after sending
    } catch (error) {
      console.error('Error sending message:', error);
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

  const renderLinkText = (text?: string | null) => {
    if (!text || typeof text !== 'string') {
      return null;
    }

    const parts = text.split('|').map(part => part.trim());

    if (parts.length === 3) {
      const [beforeLink, linkText, linkUrl] = parts;
      return (
        <span>
          {beforeLink}{' '}
          <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
            {linkText}
          </a>
        </span>
      );
    }

    return text;
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
          disabled={isSendingRef.current} 
        />
        <button
          onClick={handleSendMessage}
          className="flex items-center justify-center px-4 py-2 rounded-r-md"
          disabled={isSendingRef.current} 
          style={{ backgroundColor: settings.themeColor || '#3b82f6' }}
        >
          <Send
            className="h-5 w-5"
            style={{ color: settings.botDisplayNameColor || '#fff' }} // Ensure the icon color is synced with the chatBubbleButtonColor
          />
        </button>
      </div>
      <div className="flex flex-col items-center py-2 text-xs text-center text-gray-500 dark:text-gray-400">
        {settings.copyRightMessage && (
          <div className="mb-1">
            {renderLinkText(settings.copyRightMessage)}
          </div>
        )}
        {settings.footerText && (
          <div>
            {renderLinkText(settings.footerText)}
          </div>
        )}
      </div>
    </div>
  );
}

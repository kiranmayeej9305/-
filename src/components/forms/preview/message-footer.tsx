'use client';

import React, { useState } from 'react';
import { Send } from 'lucide-react';

type MessagesFooterProps = {
  footerText?: string | null;
  copyRightMessage?: string | null;
  messagePlaceholder?: string | null;
  themeColor?: string;
  botDisplayNameColor? : string | null;
};

const MessagesFooter: React.FC<MessagesFooterProps> = ({
  footerText,
  copyRightMessage,
  messagePlaceholder,
  themeColor,
  botDisplayNameColor
}) => {
  const [newMessage, setNewMessage] = useState('');

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
    <div className="border-t">
      <div className="py-3 px-4 bg-gray-50 dark:bg-gray-800 flex items-center">
        <input
          type="text"
          placeholder={messagePlaceholder || 'Type your message...'}
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          className="grow px-4 py-2 rounded-l-lg border border-r-0 border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white outline-none"
        />
        <button
          className="flex items-center justify-center px-4 py-2 rounded-r-lg text-white"
          style={{ backgroundColor: themeColor || '#3b82f6' }}
        >
          <Send
            className="h-5 w-5"
            style={{ color: botDisplayNameColor || '#fff' }} 
          />
        </button>
      </div>
      <div className="flex flex-col items-center py-4 px-4 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
        <div className="mb-2">{renderLinkText(copyRightMessage)}</div>
        <div>{renderLinkText(footerText)}</div>
      </div>
    </div>
  );
};

export default MessagesFooter;

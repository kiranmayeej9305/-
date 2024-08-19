'use client';

import React, { useState, useRef } from 'react';
import { Send } from 'lucide-react';

type MessagesFooterProps = {
  onSendMessage: (message: string) => Promise<void>;
  footerText?: string | null;
  copyRightMessage?: string | null;
};

const MessagesFooter: React.FC<MessagesFooterProps> = ({
  onSendMessage,
  footerText = 'By chatting, you agree to our | Privacy Policy | https://example.com/privacy-policy',
  copyRightMessage = 'Powered By | Your Company | https://example.com',
}) => {
  const [newMessage, setNewMessage] = useState('');
  const isSendingRef = useRef(false);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSendingRef.current) return;

    isSendingRef.current = true;
    try {
      await onSendMessage(newMessage);
      setNewMessage('');
    } catch (error) {
      console.error('Footer: Error sending message:', error);
    } finally {
      isSendingRef.current = false;
    }
  };

  const renderLinkText = (text?: string | null) => {
    if (!text || typeof text !== 'string') {
      return null; // Return null if text is not valid
    }

    const parts = text.split('|').map(part => part.trim());

    if (parts.length === 3) {
      const [prefixText, linkText, linkUrl] = parts;
      return (
        <span>
          {prefixText}{' '}
          <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
            {linkText}
          </a>
        </span>
      );
    }

    return <span>{text}</span>; // Fallback to plain text if the format is incorrect
  };

  return (
    <div className="flex flex-col items-center p-4 border-t border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
      <div className="w-full max-w-2xl flex items-center">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-grow p-3 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-900 dark:text-white"
          placeholder="Enter message..."
        />
        <button
          onClick={handleSendMessage}
          className="ml-4 p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md flex items-center"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
      <div className="w-full max-w-2xl mt-4 pt-2 flex flex-col items-center space-y-1">
        {copyRightMessage && (
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {renderLinkText(copyRightMessage)}
          </p>
        )}
        {footerText && (
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {renderLinkText(footerText)}
          </p>
        )}
      </div>
    </div>
  );
};

export default MessagesFooter;

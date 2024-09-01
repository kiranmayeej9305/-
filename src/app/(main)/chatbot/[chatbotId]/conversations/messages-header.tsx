'use client';

import React from 'react';
import { useFlyoutContext } from '@/context/flyout-context';
import { RadioTower } from 'lucide-react';

export default function MessagesHeader({ settings, onToggleLiveAgent, isLive }) {
  const { flyoutOpen, setFlyoutOpen } = useFlyoutContext();

  return (
    <div
      className="sticky top-0 border-b border-slate-200 dark:border-slate-700 z-10"
      style={{
        backgroundColor: settings.themeColor || '#f0f0f0',
      }}
    >
      <div className="flex items-center justify-between px-4 sm:px-6 md:px-5 h-16">
        <div className="flex items-center">
          <button
            className="md:hidden text-slate-400 hover:text-slate-500 mr-4"
            onClick={() => setFlyoutOpen(!flyoutOpen)}
            aria-controls="messages-sidebar"
            aria-expanded={flyoutOpen}
          >
            <span className="sr-only">Toggle sidebar</span>
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M3 12h18M9 6l6 6-6 6" />
            </svg>
          </button>
          <img
            src={settings.chatIcon || '/images/bot.png'}
            alt="Chat Icon"
            className="h-10 w-10 rounded-full object-cover"
          />
          <h2
            className="ml-3 text-lg font-medium"
            style={{
              color: settings.botDisplayNameColor || '#000',
            }}
          >
            {settings.botDisplayName || 'Chatbot'}
          </h2>
        </div>
        <button
          onClick={onToggleLiveAgent}
          className={`ml-auto flex items-center justify-center px-5 py-2 rounded-full shadow-lg transition-all duration-300 ${
            isLive ? 'bg-green-600 hover:bg-green-500' : 'bg-gray-400 hover:bg-gray-500'
          } text-white transform ${isLive ? 'scale-105' : 'scale-100'}`}
          style={{
            boxShadow: isLive ? '0px 4px 15px rgba(0, 255, 0, 0.3)' : '0px 4px 15px rgba(0, 0, 0, 0.1)',
          }}
        >
          <span className="flex items-center space-x-2">
            <span>{isLive ? 'Live Agent On' : 'Live Agent Off'}</span>
            <RadioTower className="h-5 w-5" />
          </span>
        </button>
      </div>
    </div>
  );
}

'use client';

import { useInterfaceSettings } from '@/context/use-interface-settings-context';
import { useFlyoutContext } from '@/context/flyout-context';
import { useChatContext } from '@/context/use-chat-context';
import { RadioTower } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toggleLiveAgentMode } from '@/lib/queries';

export default function MessagesHeader() {
  const { settings } = useInterfaceSettings();
  const { flyoutOpen, setFlyoutOpen } = useFlyoutContext();
  const { chatRoom, setChatRoom } = useChatContext();
  const [isLiveAgent, setIsLiveAgent] = useState(false);

  const handleToggle = async () => {
    if (!chatRoom) return;
    const result = await toggleLiveAgentMode(chatRoom, !isLiveAgent);
    if (result.success) {
      setIsLiveAgent(!isLiveAgent);
    }
  };

  useEffect(() => {
    if (chatRoom) {
      setIsLiveAgent(chatRoom.agentId !== null);
    }
  }, [chatRoom]);

  return (
    <div className="sticky top-0 bg-slate-50 dark:bg-[#161F32] border-b border-slate-200 dark:border-slate-700 z-10">
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
            src={settings.chatbotIcon || '/images/bot.png'}
            alt="Chat Icon"
            className="h-10 w-10 rounded-full object-cover"
          />
          <h2 className="ml-3 text-lg font-medium text-slate-900 dark:text-slate-100">
            {settings.botDisplayName || 'Chatbot'}
          </h2>
        </div>
        <button
          onClick={handleToggle}
          className={`ml-auto flex items-center justify-center px-4 py-2 rounded-md ${
            isLiveAgent ? 'bg-green-600' : 'bg-gray-400'
          } text-white`}
        >
          {isLiveAgent ? 'Live Agent On' : 'Live Agent Off'}
          <RadioTower className="ml-2 h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

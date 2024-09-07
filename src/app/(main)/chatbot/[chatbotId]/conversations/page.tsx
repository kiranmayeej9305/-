'use client';

import { useState } from 'react';
import { ChatProvider } from '@/context/use-chat-context';
import { FlyoutProvider } from '@/context/flyout-context';
import { InterfaceSettingsProvider } from '@/context/use-interface-settings-context';
import { Card, CardContent } from '@/components/ui/card';
import MessagesSidebar from './messages-sidebar';
import ChatRoom from './chat-room';
import BlurPage from '@/components/global/blur-page';

interface ChatPageProps {
  params: { chatbotId: string };
}

export default function ChatPage({ params }: ChatPageProps) {
  const [selectedChatRoomId, setSelectedChatRoomId] = useState<string | null>(null);

  const handleChatSelect = (roomId: string) => {
    setSelectedChatRoomId(roomId);
  };

  return (
    <BlurPage>

    <FlyoutProvider>
      <ChatProvider>
        <InterfaceSettingsProvider chatbotId={params.chatbotId}>
          <div className="flex justify-center items-start h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-6">
            <Card className="w-full max-w-7xl shadow-lg mt-4 md:mt-16">
              <CardContent className="flex flex-col md:flex-row h-[85vh]">
                <MessagesSidebar chatbotId={params.chatbotId} onChatSelect={handleChatSelect} />
                <div className="flex-grow flex flex-col">
                  {selectedChatRoomId ? (
                    <ChatRoom chatRoomId={selectedChatRoomId} />
                  ) : (
                    <div className="flex items-center justify-center flex-grow">
                      <p className="text-lg font-medium text-slate-700 dark:text-slate-300">
                        Please select a conversation to view messages.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </InterfaceSettingsProvider>
      </ChatProvider>
    </FlyoutProvider>
    </BlurPage>

  );
}

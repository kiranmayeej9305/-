'use client';

import { ChatProvider } from '@/context/use-chat-context';
import { FlyoutProvider } from '@/context/flyout-context';
import { InterfaceSettingsProvider } from '@/context/use-interface-settings-context';
import MessagesSidebar from './messages-sidebar';
import MessagesBody from './messages-body';
import { Card, CardContent } from '@/components/ui/card';

interface ChatPageProps {
  params: { chatbotId: string };
}

export default function ChatPage({ params }: ChatPageProps) {
  return (
    <FlyoutProvider>
      <ChatProvider>
        <InterfaceSettingsProvider chatbotId={params.chatbotId}>
          <div className="flex justify-center items-start h-screen bg-gray-100 dark:bg-gray-900 p-6"> {/* Adjusted padding and alignment */}
            <Card className="w-full max-w-7xl shadow-lg mt-16"> {/* Increased margin-top */}
              <CardContent className="flex flex-col md:flex-row h-[85vh]"> {/* Adjusted height */}
                <MessagesSidebar chatbotId={params.chatbotId} />
                <MessagesBody />
              </CardContent>
            </Card>
          </div>
        </InterfaceSettingsProvider>
      </ChatProvider>
    </FlyoutProvider>
  );
}

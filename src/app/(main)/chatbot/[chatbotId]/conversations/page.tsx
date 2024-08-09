// pages/chatbot/[chatbotId]/conversations/page.tsx
'use client';

import { ChatProvider } from '@/context/use-chat-context';
import { FlyoutProvider } from '@/context/flyout-context';
import MessagesSidebar from './messages-sidebar';
import MessagesBody from './messages-body';

export default function ChatPage({ params }: { params: { chatbotId: string } }) {
  return (
    <FlyoutProvider>
      <ChatProvider>
        <div className="flex flex-col md:flex-row h-screen">
          <MessagesSidebar chatbotId={params.chatbotId} />
          <MessagesBody />
        </div>
      </ChatProvider>
    </FlyoutProvider>
  );
}

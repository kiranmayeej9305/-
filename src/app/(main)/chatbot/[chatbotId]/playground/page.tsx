'use client';

import { ChatProvider } from '@/context/use-chat-context';
import { InterfaceSettingsProvider } from '@/context/use-interface-settings-context';
import ChatRoom from './chat-room';
interface ChatRoomPageProps {
  params: { chatbotId: string };
}

const ChatRoomPage: React.FC<ChatRoomPageProps> = ({ params }) => {
  return (
    <div className="flex justify-center items-start h-screen bg-gray-100 dark:bg-gray-900 p-12"> 
          <ChatProvider isIframe={false}>
            <InterfaceSettingsProvider chatbotId={params.chatbotId}>
              <ChatRoom chatbotId={params.chatbotId} isPlayground={true} isPublic={false} />
            </InterfaceSettingsProvider>
          </ChatProvider>
    </div>
  );
};

export default ChatRoomPage;

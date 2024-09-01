'use client';

import { ChatProvider } from '@/context/use-chat-context';
import { InterfaceSettingsProvider } from '@/context/use-interface-settings-context';
import ChatRoom from './chat-room';
import { Card, CardContent } from '@/components/ui/card';

interface ChatRoomPageProps {
  params: { chatbotId: string };
}

const ChatRoomPage: React.FC<ChatRoomPageProps> = ({ params }) => {
  return (
    <div className="flex justify-center items-start h-screen bg-gray-100 dark:bg-gray-900 p-12"> 
      <Card className="w-full max-w-7xl shadow-lg mt-16">
        <CardContent className="p-4 h-[85vh] flex flex-col"> 
          <ChatProvider isIframe={false}>
            <InterfaceSettingsProvider chatbotId={params.chatbotId}>
              <ChatRoom chatbotId={params.chatbotId} isPlayground={true} isPublic={false} />
            </InterfaceSettingsProvider>
          </ChatProvider>
        </CardContent>
      </Card>
    </div>
    
  );
};

export default ChatRoomPage;

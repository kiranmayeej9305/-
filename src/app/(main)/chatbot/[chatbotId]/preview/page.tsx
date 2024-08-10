'use client';

import { ChatProvider } from '@/context/use-chat-context';
import ChatRoom from './chat-room';

interface ChatRoomPageProps {
  params: { chatbotId: string };
}

const ChatRoomPage: React.FC<ChatRoomPageProps> = ({ params }) => {
  return (
    <ChatProvider isIframe={false}>
      <ChatRoom chatbotId={params.chatbotId} isPlayground={true} isPublic={false}/>
    </ChatProvider>
  );
};

export default ChatRoomPage;

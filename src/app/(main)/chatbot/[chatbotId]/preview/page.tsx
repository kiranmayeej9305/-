// pages/chatbot/[chatbotId]/chatroom/page.tsx
'use client';

import { ChatProvider } from '@/context/use-chat-context';
import ChatRoom from './chat-room';

interface ChatRoomPageProps {
  params: { chatbotId: string };
}

const ChatRoomPage: React.FC<ChatRoomPageProps> = ({ params }) => {
  return (
    <ChatProvider>
      <ChatRoom chatbotId={params.chatbotId} />
    </ChatProvider>
  );
};

export default ChatRoomPage;

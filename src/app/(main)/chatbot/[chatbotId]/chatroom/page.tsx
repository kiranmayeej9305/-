// pages/chatbot/[chatbotId]/chatroom/page.tsx
import { ChatProvider } from '@/context/use-chat-context';
import ChatRoom from './chat-room';

interface ChatRoomPageProps {
  params: { chatbotId: string; customerId: string };
}

const ChatRoomPage: React.FC<ChatRoomPageProps> = ({ params }) => {
  return (
    <ChatProvider>
      <ChatRoom chatbotId={params.chatbotId} customerId={params.customerId} />
    </ChatProvider>
  );
};

export default ChatRoomPage;

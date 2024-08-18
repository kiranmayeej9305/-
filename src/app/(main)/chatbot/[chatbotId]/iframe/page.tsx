import { fetchChatbotStatus } from '@/lib/queries';
import ChatRoom from '../playground/chat-room';
import { ChatProvider } from '@/context/use-chat-context';
import { notFound } from 'next/navigation';

const ChatbotIframePage = async ({ params }) => {
  const { chatbotId } = params;

  const isPublic = await fetchChatbotStatus(chatbotId);

  if (!isPublic) {
    notFound();
  }

  return (
    <ChatProvider isIframe={true}>
      <ChatRoom chatbotId={chatbotId} isPlayground={false} isPublic={true}/>
    </ChatProvider>
  );
};

export default ChatbotIframePage;

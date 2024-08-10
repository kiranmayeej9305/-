import { fetchChatbotStatus } from '@/lib/queries';
import ChatRoom from '../preview/chat-room';
import { ChatProvider } from '@/context/use-chat-context';
import { notFound } from 'next/navigation';

const ChatbotIframePage = async ({ params }) => {
  const { chatbotId } = params;

  // Fetch the public status of the chatbot
  const isPublic = await fetchChatbotStatus(chatbotId);

  if (!isPublic) {
    // If the chatbot is not public, show a 404 page
    notFound();
  }

  return (
    <ChatProvider>
      <ChatRoom chatbotId={chatbotId} />
    </ChatProvider>
  );
};

export default ChatbotIframePage;

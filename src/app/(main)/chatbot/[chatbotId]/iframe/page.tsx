import { fetchChatbotStatus } from '@/lib/queries';
import ChatRoom from '../playground/chat-room';
import { ChatProvider } from '@/context/use-chat-context';
import { InterfaceSettingsProvider } from '@/context/use-interface-settings-context';
import { notFound } from 'next/navigation';

const ChatbotIframePage = async ({ params }) => {
  const { chatbotId } = params;

  // Fetch the chatbot status to determine if it's public
  const isPublic = await fetchChatbotStatus(chatbotId);

  // If the chatbot is not public, show a 404 page
  if (!isPublic) {
    notFound();
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full h-full max-w-4xl">
        <ChatProvider isIframe={true}>
          <InterfaceSettingsProvider chatbotId={chatbotId}>
            <ChatRoom chatbotId={chatbotId} isPlayground={false} isPublic={true} />
          </InterfaceSettingsProvider>
        </ChatProvider>
      </div>
    </div>
  );
};

export default ChatbotIframePage;

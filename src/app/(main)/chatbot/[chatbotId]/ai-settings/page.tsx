import ChatbotDetails from '@/components/forms/chatbot-details';
import BlurPage from '@/components/global/blur-page';
import { db } from '@/lib/db';
import { currentUser } from '@clerk/nextjs';
import React from 'react';

type Props = {
  params: { chatbotId: string };
};

const AiSettingPage = async ({ params }: Props) => {
  const authUser = await currentUser();
  if (!authUser) return null;

  const userDetails = await db.user.findUnique({
    where: {
      email: authUser.emailAddresses[0].emailAddress,
    },
  });
  if (!userDetails) return null;

  const chatbot = await db.chatbot.findUnique({
    where: { id: params.chatbotId },
    include: { ChatbotSettings: true },
  });
  if (!chatbot) return null;

  const accountDetails = await db.account.findUnique({
    where: { id: chatbot.accountId },
    include: { Chatbot: true },
  });

  if (!chatbot || !accountDetails) return null;

  return (
    <BlurPage>
      <div className="container mx-auto p-4 lg:p-8">
          <ChatbotDetails
          accountDetails={accountDetails}
          details={{
            ...chatbot,
            ChatbotSettings: chatbot.ChatbotSettings
              ? {
                ...chatbot.ChatbotSettings,
                welcomeMessage: chatbot.ChatbotSettings.welcomeMessage ?? undefined,
                knowledgeSources: chatbot.ChatbotSettings.knowledgeSources as "training" | "generic" | "both",
                customPrompts: chatbot.ChatbotSettings.customPrompts ?? undefined
              }
              : undefined
          }}
          userId={userDetails.id}
          userName={userDetails.name}
          />
      </div>
    </BlurPage>
  );
};

export default AiSettingPage;

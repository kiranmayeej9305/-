// src/app/(main)/chatbot/[chatbotId]/support/page.tsx
import { db } from '@/lib/db';
import { currentUser } from '@clerk/nextjs';
import SupportForm from './support-form';

export default async function SupportPage({ params }: { params: { chatbotId: string } }) {
  const authUser = await currentUser();
  if (!authUser) return null;

  const userDetails = await db.user.findUnique({
    where: {
      email: authUser.emailAddresses[0].emailAddress,
    },
  });

  const chatbotData = await db.chatbot.findUnique({
    where: { id: params.chatbotId },
  });

  const accountData = await db.account.findUnique({
    where: { id: chatbotData?.accountId },
  });

  return (
    <SupportForm
      userEmail={userDetails?.email || ''}
      chatbotData={chatbotData}
      accountData={accountData}
    />
  );
}

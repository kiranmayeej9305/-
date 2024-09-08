'use client';

import CalendarIntegrationEmbed from './calendar-integration-embed';

interface CalendarIntegrationPageProps {
  params: { chatbotId: string };
}

export default function CalendarIntegrationPage({ params }: CalendarIntegrationPageProps) {
  return (
    <div className="flex justify-center items-start h-screen bg-gray-100 dark:bg-gray-900 p-12">
      {/* Pass the chatbotId from route params to CalendarIntegrationEmbed */}
      <CalendarIntegrationEmbed chatbotId={params.chatbotId} />
    </div>
  );
}

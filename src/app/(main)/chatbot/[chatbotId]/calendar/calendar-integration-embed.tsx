// calendar-integration-embed.tsx
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'react-hot-toast';

interface CalendarIntegrationEmbedProps {
  chatbotId: string;
}

export default function CalendarIntegrationEmbed({ chatbotId }: CalendarIntegrationEmbedProps) {
  const [integrationUrl, setIntegrationUrl] = useState<string | null>(null);
  const [selectedIntegration, setSelectedIntegration] = useState<string>('google');
  const [accessToken, setAccessToken] = useState<string | null>(null);  // To store accessToken
  const [isIntegrated, setIsIntegrated] = useState<boolean>(false);

  useEffect(() => {
    async function fetchIntegration() {
      const response = await fetch(`/api/calendar-integrations/default/${chatbotId}`);
      const data = await response.json();
      setIntegrationUrl(data.integrationUrl);
      setSelectedIntegration(data.platform);
      setAccessToken(data.accessToken);  // Store accessToken
      setIsIntegrated(!!data.integrationUrl);
    }

    fetchIntegration();
  }, [chatbotId]);

  const handleIntegration = () => {
    window.location.href = `/api/calendar-integrations/google/initiate?chatbotId=${chatbotId}`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Calendar Integration</CardTitle>
        <CardDescription>Integrate your chatbot with Google Calendar or Calendly.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={selectedIntegration} className="w-full">
          <TabsList className="grid grid-cols-2 gap-4">
            <TabsTrigger value="google" onClick={() => setSelectedIntegration('google')}>Google Calendar</TabsTrigger>
            <TabsTrigger value="calendly" onClick={() => setSelectedIntegration('calendly')}>Calendly</TabsTrigger>
          </TabsList>
          <TabsContent value="google">
            <p>Integrate with Google Calendar to view and manage your appointments directly within the app.</p>
          </TabsContent>
          <TabsContent value="calendly">
            <p>Connect your Calendly account to allow customers to book appointments seamlessly.</p>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        {isIntegrated ? (
          <>
            <Button variant="ghost" disabled>Already Integrated</Button>
          </>
        ) : (
          <Button onClick={handleIntegration}>Integrate Google Calendar</Button>
        )}
      </CardFooter>

      {accessToken && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Google Calendar View</CardTitle>
          </CardHeader>
          <CardContent>
          <iframe
              src={integrationUrl}  // Use the integrationUrl that includes the calendarId
              width="100%"
              height="700"
              frameBorder="0"
              allowFullScreen
              title="Google Calendar"
            />
          </CardContent>
        </Card>
      )}
    </Card>
  );
}

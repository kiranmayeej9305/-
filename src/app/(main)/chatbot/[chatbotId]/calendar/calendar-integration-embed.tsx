import { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { Loader } from '@/components/loader'; // Assuming you have a loader component
import BlurPage from '@/components/global/blur-page'

interface CalendarIntegrationEmbedProps {
  chatbotId: string;
}

export default function CalendarIntegrationEmbed({ chatbotId }: CalendarIntegrationEmbedProps) {
  const [integrationUrl, setIntegrationUrl] = useState<string | null>(null);
  const [isIntegrated, setIsIntegrated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true); // For loader

  useEffect(() => {
    async function fetchIntegration() {
      try {
        const response = await fetch(`/api/calendar-integrations/default/${chatbotId}`);
        const data = await response.json();
        setIntegrationUrl(data.integrationUrl);
        setIsIntegrated(!!data.integrationUrl);
      } catch (error) {
        console.error('Failed to fetch calendar integration:', error);
        toast.error('Failed to load calendar integration.');
      } finally {
        setLoading(false);
      }
    }

    fetchIntegration();
  }, [chatbotId]);

  const handleIntegration = () => {
    window.location.href = `/api/calendar-integrations/google/initiate?chatbotId=${chatbotId}`;
  };

  return (
    <BlurPage>
    <Card className="w-full shadow-sm rounded-md border border-gray-300">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Calendar</CardTitle>
        <CardDescription className="text-sm">
          {isIntegrated ? 'Manage your appointments directly within the app.' : 'Integrate Google Calendar to manage your appointments seamlessly.'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader loading={false} children={''} />  {/* Assuming a loader/spinner */}
          </div>
        ) : (
          <>
            {isIntegrated ? (
              <div className="flex flex-col items-center">
                <iframe
                  src={integrationUrl}  // Use the integrationUrl that includes the calendarId
                  width="100%"
                  height="600"
                  frameBorder="0"
                  allowFullScreen
                  className="border rounded-md"
                  title="Google Calendar"
                />
                <p className="text-gray-500 text-sm mt-4">
                  Google Calendar is integrated. You can view and manage your appointments here.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <p className="text-gray-600 text-base mb-4">
                  No calendar integration found. Integrate your chatbot with Google Calendar to view and manage your appointments.
                </p>
                <Button className="text-white hover:bg-blue-700 rounded-md py-2 px-4" onClick={handleIntegration}>
                  Integrate Google Calendar
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>

      {isIntegrated && (
        <CardFooter className="p-4 border-t bg-gray-50">
          <p className="text-gray-500 text-sm">Integrated with Google Calendar</p>
        </CardFooter>
      )}
    </Card>
    </BlurPage>
  );
}

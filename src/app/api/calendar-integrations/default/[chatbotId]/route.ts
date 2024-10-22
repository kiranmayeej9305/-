import { NextResponse } from 'next/server';
import { getCalendarEmbedUrl } from '@/lib/queries';

interface CalendarIntegration {
  integrationUrl: string;
  platform: string;
}

export async function GET(req: Request, { params }: { params: { chatbotId: string } }) {
  try {
    if (!params.chatbotId) {
      return NextResponse.json({ error: 'Chatbot ID is required' }, { status: 400 });
    }

    const integration = await getCalendarEmbedUrl(params.chatbotId);
    
    if (!integration) {
      return NextResponse.json({ error: 'No integration found' }, { status: 404 });
    }

    if (!('integrationUrl' in integration) || !('platform' in integration)) {
      return NextResponse.json({ error: 'Invalid integration data' }, { status: 500 });
    }

    const typedIntegration = integration as CalendarIntegration;

    return NextResponse.json({
      integrationUrl: typedIntegration.integrationUrl,
      platform: typedIntegration.platform
    });
  } catch (error) {
    console.error('Error in calendar integration API:', error);
    return NextResponse.json({ error: 'Failed to retrieve calendar integration' }, { status: 500 });
  }
}

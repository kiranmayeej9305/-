import { NextResponse } from 'next/server';
import { getCalendarEmbedUrl } from '@/lib/queries';

export async function GET(req: Request, { params }: { params: { chatbotId: string } }) {
  try {
    const integration = await getCalendarEmbedUrl(params.chatbotId);
    
    if (!integration) {
        return NextResponse.json({ error: 'No integration found' }, { status: 404 });
      }

    return NextResponse.json({
        integrationUrl: integration.integrationUrl,
        platform: integration.platform  // Assuming Google as the platform for now
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to retrieve calendar integration' }, { status: 500 });
  }
}

// src/app/api/calendar-integrations/default/[chatbotId]/route.ts
import { NextResponse } from 'next/server';
import { getDefaultIntegration } from '@/lib/queries';

export async function GET(req: Request, { params }: { params: { chatbotId: string } }) {
  try {
    const integration = await getDefaultIntegration(params.chatbotId);

    if (!integration) {
      return NextResponse.json({ error: 'No integration found' }, { status: 404 });
    }

    return NextResponse.json({
      integrationUrl: integration.integrationUrl,
      platform: integration.platform,
      accessToken: integration.accessToken,  // Return accessToken

    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to retrieve integration' }, { status: 500 });
  }
}

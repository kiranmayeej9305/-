// File: /app/api/calendar-integrations/set-defaults/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { setDefaultCalendarIntegration } from '@/lib/queries';

export async function POST(req: NextRequest) {
  try {
    const { platform, chatbotId } = await req.json(); // Parse JSON from the request body

    await setDefaultCalendarIntegration(chatbotId, platform);

    return NextResponse.json({ message: 'Default calendar set successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error setting default calendar:', error);
    return NextResponse.json({ error: 'Failed to set default calendar' }, { status: 500 });
  }
}

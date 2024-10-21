import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { saveGoogleIntegration } from '@/lib/queries'; // Function to save integration to DB

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_URL}api/calendar-integrations/google/callback`
);

export async function GET(req: Request, { params }: { params: { chatbotId: string } }) {
  return NextResponse.json({ message: 'Test response', chatbotId: params.chatbotId });
}

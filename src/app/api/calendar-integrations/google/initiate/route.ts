import { google } from 'googleapis';
import { NextResponse } from 'next/server';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_URL}api/calendar-integrations/google/callback`
);

export async function GET(req: Request) {
  const url = new URL(req.url);
  const chatbotId = url.searchParams.get('chatbotId');  // Ensure chatbotId is passed in

  if (!chatbotId) {
    return NextResponse.json({ error: 'chatbotId is required' }, { status: 400 });
  }

  const scopes = ['https://www.googleapis.com/auth/calendar','https://www.googleapis.com/auth/calendar.events'];
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',  // Required to get refresh token
    scope: scopes,
    state: chatbotId,  // Store chatbotId in state
  });

  return NextResponse.redirect(authUrl);
}

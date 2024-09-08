// src/app/api/calendar-integrations/google/callback/route.ts
import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { saveGoogleIntegration } from '@/lib/queries';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_URL}api/calendar-integrations/google/callback`
);

export async function GET(req: Request) {
    const url = new URL(req.url);
    const code = url.searchParams.get('code'); // Get the code from URL
    const state = url.searchParams.get('state'); // Get the state containing chatbotId
  
    if (!code || !state) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }
  
    const chatbotId = state; // Use state as chatbotId
    console.log(`State (ChatbotId): ${chatbotId}`);
  
    try {
      // Exchange authorization code for access and refresh tokens
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);
      
      console.log('Tokens received:', tokens);
      
      // Save the tokens and chatbotId to the database using a helper function
      await saveGoogleIntegration(tokens, chatbotId);
  
      // Redirect to a success page or the chatbot calendar integration page
      return NextResponse.redirect(`/chatbot/${chatbotId}/calendar`);
    } catch (error) {
      console.error('Google OAuth Callback Error:', error);
      return NextResponse.json({ error: 'OAuth callback failed.' }, { status: 500 });
    }
  }
  
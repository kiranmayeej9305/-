// pages/api/integrations/calendly/callback.ts
import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { db } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code, chatbotId } = req.query;
  
  try {
    const tokenResponse = await axios.post('https://auth.calendly.com/oauth/token', {
      grant_type: 'authorization_code',
      code,
      client_id: process.env.CALENDLY_CLIENT_ID,
      client_secret: process.env.CALENDLY_CLIENT_SECRET,
      redirect_uri: `${process.env.NEXT_PUBLIC_URL}api/calendar-integrations/calendly/callback`,
    });

    const { access_token, refresh_token } = tokenResponse.data;

    // Save integration in the database
    await db.calendarIntegration.create({
      data: {
        platform: 'calendly',
        accessToken: access_token,
        refreshToken: refresh_token,
        chatbotId: chatbotId as string,
        integrationUrl: 'https://calendly.com', 
        isDefault: true,  // Mark as default
      },
    });

    res.redirect(`/chatbots/${chatbotId}/integrations/success`);
  } catch (error) {
    console.error('Calendly OAuth Callback Error:', error);
    res.status(500).json({ error: 'OAuth callback failed.' });
  }
}

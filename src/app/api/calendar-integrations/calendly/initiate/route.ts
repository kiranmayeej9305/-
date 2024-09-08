// pages/api/integrations/calendly/initiate.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const calendlyAuthUrl = `https://auth.calendly.com/oauth/authorize?client_id=${process.env.CALENDLY_CLIENT_ID}&response_type=code&redirect_uri=${process.env.NEXT_PUBLIC_URL}api/calendar-integrations/calendly/callback`;

  res.redirect(calendlyAuthUrl);
}

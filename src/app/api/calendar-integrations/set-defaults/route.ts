// pages/api/integrations/set-default.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { setDefaultCalendarIntegration } from '@/lib/queries';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { platform, chatbotId } = req.body;

  try {
    await setDefaultCalendarIntegration(chatbotId, platform);
    res.status(200).json({ message: 'Default calendar set successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to set default calendar' });
  }
}

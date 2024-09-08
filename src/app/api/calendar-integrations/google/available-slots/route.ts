import { google } from 'googleapis';
import { NextApiRequest, NextApiResponse } from 'next';
import { getAuthToken } from '@/lib/google-auth'; // Function to retrieve stored auth tokens
import { saveAppointment } from '@/lib/queries'; // Function to save appointment into DB

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { chatbotId, customerEmail } = req.query;

  if (!chatbotId || !customerEmail) {
    return res.status(400).json({ error: 'chatbotId and customerEmail are required' });
  }

  try {
    // Get OAuth tokens and authenticate
    const tokens = await getAuthToken(chatbotId as string);
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials(tokens);

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Get available events and free slots in the next 7 days
    const now = new Date();
    const timeMax = new Date();
    timeMax.setDate(now.getDate() + 7);

    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: now.toISOString(),
        timeMax: timeMax.toISOString(),
        timeZone: 'America/Los_Angeles',
        items: [{ id: 'primary' }],
      },
    });

    const busySlots = response.data.calendars?.primary.busy;
    const availableSlots = getAvailableSlots(now, timeMax, busySlots || []);

    return res.status(200).json({ availableSlots });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({ error: 'Failed to retrieve available slots.' });
  }
}

// Helper to filter available time slots
const getAvailableSlots = (start: Date, end: Date, busySlots: Array<any>) => {
  // Add logic to find free time slots by comparing busy periods
  // Example: return available 1-hour slots between 9am-5pm
  return [];
};

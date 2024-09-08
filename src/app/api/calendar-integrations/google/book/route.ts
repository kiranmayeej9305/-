import { google } from 'googleapis';
import { NextApiRequest, NextApiResponse } from 'next';
import { saveAppointment } from '@/lib/queries'; // Helper to save appointment to DB
import { getAuthToken } from '@/lib/google-auth'; // Fetch OAuth tokens from DB

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { chatbotId, customerEmail, slot } = JSON.parse(req.body);

  if (!chatbotId || !customerEmail || !slot) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const tokens = await getAuthToken(chatbotId);
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials(tokens);

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const event = {
      summary: 'Customer Appointment',
      location: 'Online',
      description: 'Meeting scheduled via chatbot.',
      start: { dateTime: slot.startTime, timeZone: 'America/Los_Angeles' },
      end: { dateTime: slot.endTime, timeZone: 'America/Los_Angeles' },
      attendees: [{ email: customerEmail }],
      reminders: { useDefault: true },
    };

    const createdEvent = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });

    // Save the appointment in DB
    await saveAppointment({
      chatbotId,
      customerEmail,
      eventId: createdEvent.data.id,
      appointmentTime: slot.startTime,
      platform: 'google',
    });

    res.status(200).json({ message: 'Appointment booked successfully', eventId: createdEvent.data.id });
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({ error: 'Failed to book appointment' });
  }
}

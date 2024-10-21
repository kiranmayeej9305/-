// lib/googleCalendar.ts
import { google } from 'googleapis';
import { db } from '@/lib/db';

export async function fetchGoogleAppointments(chatbotId: string) {
  const integration = await db.calendarIntegration.findFirst({
    where: { chatbotId, platform: 'google', isDefault: true },
  });

  if (!integration) throw new Error('No Google Calendar integration found');

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: integration.accessToken });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  const events = await calendar.events.list({
    calendarId: 'primary',
    timeMin: new Date().toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime',
  });

  const appointments = events.data.items?.map(event => ({
    eventId: event.id!,
    appointmentTime: new Date(event.start?.dateTime || event.start?.date!),
    customerId: 'N/A',  // You can link it to your customers if you have mapping
    chatbotId,
    platform: 'google',
  }));

  if (appointments && appointments.length > 0) {
    await db.appointment.createMany({ data: appointments });
  }
}

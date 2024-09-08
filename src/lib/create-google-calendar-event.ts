import { google } from 'googleapis';
import { refreshAccessToken } from './refresh-access-token';  // Adjust the path accordingly

export async function createGoogleCalendarEvent(chatbotId: string, customerEmail: string) {
  try {

    // Refresh the access token if needed
    const integration = await refreshAccessToken(chatbotId);

    // Create OAuth2 client with valid access token
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: integration.accessToken,
      refresh_token: integration.refreshToken,
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Define the event details (you can customize this)
    const event = {
      summary: 'Appointment Booking',
      location: 'Online',
      description: 'Appointment with customer via chatbot.',
      start: {
        dateTime: '2024-09-08T10:00:00-07:00', // Set the desired time
        timeZone: 'America/Los_Angeles',
      },
      end: {
        dateTime: '2024-09-08T11:00:00-07:00', // Set the desired time
        timeZone: 'America/Los_Angeles',
      },
      attendees: [{ email: customerEmail }],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 10 },
        ],
      },
    };

    // Create the event on Google Calendar
    const createdEvent = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });

    // Return the booking URL for the event
    const bookingUrl = createdEvent.data.htmlLink;
    return { bookingUrl };
  } catch (error) {
    console.error('Error creating Google Calendar event:', error);
    throw new Error('Failed to create Google Calendar event.');
  }
}

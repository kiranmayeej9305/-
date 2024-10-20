// src/app/api/calendar-integrations/google/book/route.ts

import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { refreshAccessToken } from '@/lib/refresh-access-token';
import { saveAppointment } from '@/lib/queries'; // Assuming you have this function for saving to the DB

export async function POST(req: Request) {
  const { chatbotId, name, email, phone, agenda, slot } = await req.json();

  if (!chatbotId || !name || !email || !phone || !agenda || !slot) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
  }

  try {
    // Fetch valid access token (refresh it if necessary)
    const tokens = await refreshAccessToken(chatbotId);

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Define event details for Google Calendar
    const event = {
      summary: `Meeting with ${name}`,
      description: `Agenda: ${agenda}\nPhone: ${phone}\nEmail: ${email}`,
      start: {
        dateTime: slot.startTime, // Ensure this is in ISO string format
        timeZone: 'America/Los_Angeles', // Change to your preferred timezone
      },
      end: {
        dateTime: slot.endTime, // Ensure this is in ISO string format
        timeZone: 'America/Los_Angeles', // Change to your preferred timezone
      },
      attendees: [{ email }],
      reminders: {
        useDefault: false,
        overrides: [{ method: 'email', minutes: 30 }, { method: 'popup', minutes: 10 }],
      },
    };

    // Create event on Google Calendar
    const createdEvent = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });

    const eventId = createdEvent.data.id;

    // Save appointment to your DB
    await saveAppointment({
      chatbotId,
      customerEmail: email,
      eventId,
      appointmentTime: slot.startTime,
      platform: 'google',
    });

    return NextResponse.json({
      message: 'Appointment booked successfully!',
      bookingUrl: createdEvent.data.htmlLink,
    });
  } catch (error) {
    console.error('Error booking appointment:', error);
    return NextResponse.json({ error: 'Failed to book appointment.' }, { status: 500 });
  }
}

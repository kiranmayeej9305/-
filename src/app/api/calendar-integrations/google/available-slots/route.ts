// src/app/api/calendar-integrations/google/available-slots/route.ts

import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { refreshAccessToken } from '@/lib/refresh-access-token';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const chatbotId = searchParams.get('chatbotId');
  const date = searchParams.get('date');

  if (!chatbotId || !date) {
    return NextResponse.json({ error: 'chatbotId and date are required' }, { status: 400 });
  }

  try {
    // Fetch the valid access token (refresh it if necessary)
    const tokens = await refreshAccessToken(chatbotId as string);

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Set time range for the specified day
    const timeMin = new Date(date);
    timeMin.setHours(0, 0, 0, 0); // Start of the day (midnight)

    const timeMax = new Date(date);
    timeMax.setHours(23, 59, 59, 999); // End of the day (11:59 PM)

    // Fetch busy slots
    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        timeZone: 'America/Los_Angeles',
        items: [{ id: 'primary' }],
      },
    });

    const busySlots = response.data.calendars?.primary?.busy || [];
    const availableSlots = findFreeSlots(timeMin, timeMax, busySlots);

    return NextResponse.json({ availableSlots });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    return NextResponse.json({ error: 'Failed to retrieve available slots.' }, { status: 500 });
  }
}

// Helper function to find free slots based on busy and booked slots
function findFreeSlots(timeMin: Date, timeMax: Date, busySlots: Array<any>) {
  const availableSlots = [];
  let currentTime = new Date(timeMin);

  const workingHoursStart = 9; // 9 AM
  const workingHoursEnd = 17;  // 5 PM

  while (currentTime < timeMax) {
    const startHour = currentTime.getHours();
    if (startHour >= workingHoursStart && startHour < workingHoursEnd) {
      const isBusy = busySlots.some(
        (slot) => new Date(slot.start).getTime() <= currentTime.getTime() && new Date(slot.end).getTime() > currentTime.getTime()
      );

      if (!isBusy) {
        const slotEnd = new Date(currentTime.getTime() + 15 * 60 * 1000); // 15-minute slot
        availableSlots.push({
          startTime: currentTime.toISOString(),
          endTime: slotEnd.toISOString(),
        });
      }

      currentTime.setMinutes(currentTime.getMinutes() + 15); // Move to the next 15-minute slot
    } else {
      currentTime.setHours(startHour + 1, 0, 0, 0); // Move to the next hour
    }
  }

  return availableSlots;
}

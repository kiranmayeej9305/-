import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { refreshAccessToken } from './refresh-access-token';

async function fetchAvailableSlots(chatbotId: string) {
  // Assuming `refreshAccessToken` checks for token expiration and refreshes the token
  const integration = await refreshAccessToken(chatbotId);

  if (!integration) throw new Error('No Google Calendar integration found');

  const oauth2Client = new OAuth2Client();
  oauth2Client.setCredentials({ access_token: integration.accessToken });

  const calendar = google.calendar({
    version: 'v3',
    auth: oauth2Client as any // Type assertion to bypass type check
  });
  
  const calendarId = 'primary';  // Use user's primary calendar or a specific one
  const now = new Date();
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  // Query for free/busy slots for today
  const { data } = await calendar.freebusy.query({
    requestBody: {
      timeMin: now.toISOString(),
      timeMax: endOfDay.toISOString(),
      items: [{ id: calendarId }],
    },
  });

  const busyTimes = data.calendars[calendarId]?.busy || [];
  // Convert busyTimes to the expected format
  const formattedBusyTimes = busyTimes.map(time => ({
    start: time.start || '',
    end: time.end || ''
  }));

  // Return available slots (all times not busy)
  const availableSlots = getAvailableSlots(formattedBusyTimes, now, endOfDay);
  
  return availableSlots;
}

function getAvailableSlots(busyTimes: Array<{ start: string, end: string }>, startOfDay: Date, endOfDay: Date) {
  const availableSlots = [];
  let currentTime = new Date(startOfDay);

  while (currentTime < endOfDay) {
    const nextTime = new Date(currentTime);
    nextTime.setMinutes(nextTime.getMinutes() + 30);

    const isBusy = busyTimes.some(time => {
      const busyStart = new Date(time.start);
      const busyEnd = new Date(time.end);
      return currentTime < busyEnd && nextTime > busyStart;
    });

    if (!isBusy) {
      availableSlots.push({ start: currentTime, end: nextTime });
    }

    currentTime = nextTime;
  }

  return availableSlots;
}

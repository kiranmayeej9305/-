import { updateAccessTokenInDb, getCalendarIntegration } from "./queries";
import { OAuth2Client } from 'google-auth-library';

export async function refreshAccessToken(chatbotId: string) {
  const currentTime = new Date().getTime();

  // Fetch the calendar integration from the database
  const integration = await getCalendarIntegration(chatbotId); // Add `await` here

  if (!integration) {
    throw new Error('No Google Calendar integration found');
  }

  // Check if the access token is expired
  if (integration.expiryDate && new Date(integration.expiryDate).getTime() < currentTime) {
    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_URL}api/calendar-integrations/google/callback`
    );
    
    try {
      // Set the refresh token to refresh the access token
      oauth2Client.setCredentials({ refresh_token: integration.refreshToken });

      // Refresh the access token
      const { credentials } = await oauth2Client.refreshAccessToken();  // Await the refresh process
      const newAccessToken = credentials.access_token;
      const newExpiryDate = credentials.expiry_date;

      // Update the database with the new access token and expiry date
      await updateAccessTokenInDb(integration.chatbotId, newAccessToken, newExpiryDate);

      // Update the integration object with new values
      integration.accessToken = newAccessToken;
      integration.expiryDate = new Date(newExpiryDate);

    } catch (error) {
      console.error('Failed to refresh access token:', error);
      throw new Error('Failed to refresh access token');
    }
  }

  // Return the updated integration with new access token if refreshed
  return integration;
}

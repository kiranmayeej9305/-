// // lib/calendarIntegration.ts

// import { db } from '@/lib/queries';

// export async function initiateGoogleCalendarIntegration(chatbotId: string) {
//   // Call Google API to get auth URL, etc.
//   const googleAuthUrl = 'https://accounts.google.com/o/oauth2/auth?...'; // Google OAuth URL
//   return googleAuthUrl;
// }

// export async function initiateCalendlyIntegration(chatbotId: string) {
//   // Initiate Calendly integration flow
//   const calendlyAuthUrl = 'https://calendly.com/integrations/oauth?...'; // Calendly OAuth URL
//   return calendlyAuthUrl;
// }

// export async function setDefaultCalendarIntegration(chatbotId: string, platform: string) {
//   // Update the database to set the default calendar integration
//   await db.calendarIntegration.updateMany({
//     where: { chatbotId },
//     data: { isDefault: false },
//   });

//   await db.calendarIntegration.update({
//     where: { chatbotId, platform },
//     data: { isDefault: true },
//   });
// }

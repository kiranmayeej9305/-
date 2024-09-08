// // pages/api/integrations/[platform]/connect.ts

// import { NextApiRequest, NextApiResponse } from 'next';
// import { initiateGoogleCalendarIntegration, initiateCalendlyIntegration } from '@/lib/calendarIntegration';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const { chatbotId } = req.body;
//   const { platform } = req.query;

//   try {
//     let integrationUrl = '';

//     if (platform === 'google') {
//       integrationUrl = await initiateGoogleCalendarIntegration(chatbotId);
//     } else if (platform === 'calendly') {
//       integrationUrl = await initiateCalendlyIntegration(chatbotId);
//     }

//     res.status(200).json({ integrationUrl });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to integrate calendar' });
//   }
// }

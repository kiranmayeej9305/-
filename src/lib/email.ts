// src/lib/email.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.NODE_MAILER_EMAIL,
    pass: process.env.NODE_MAILER_GMAIL_APP_PASSWORD,
  },
});

interface SupportEmailData {
  email: string;
  relatedAccount: string;
  relatedChatbot: string;
  selectedProblem: string;
  selectedSeverity: string;
  subject: string;
  description: string;
}

export const sendSupportEmail = async (data: SupportEmailData) => {
  const mailOptions = {
    from: process.env.SMTP_USERNAME, // Sender address
    to: 'support@ailawassistant.co', // Support team address
    subject: `Support Request: ${data.relatedAccount}`,
    text: `
      Email: ${data.email}
      Related Account: ${data.relatedAccount}
      Related Chatbots: ${data.relatedChatbot}
      Selected Problem: ${data.selectedProblem}
      Selected Severity: ${data.selectedSeverity}

      Description:
      ${data.description}
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

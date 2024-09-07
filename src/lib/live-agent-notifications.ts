import nodemailer from 'nodemailer';
// import { Twilio } from 'twilio';
import { getChatbotUsersWithAccess } from './queries';

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.NODE_MAILER_EMAIL,
    pass: process.env.NODE_MAILER_PASSWORD,
  },
});

// // Twilio setup (commented for now, enable when required)
// const twilioClient = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
// const defaultPhoneNumber = '+13127748849';

// Function to generate the HTML message for email with professional formatting
function generateEmailMessage({
  chatRoomId,
  customerName,
  customerEmail,
  chatbotName,
  accountName,
  chatbotId
}: {
  chatRoomId: string;
  customerName: string;
  customerEmail: string;
  chatbotName: string;
  accountName: string;
  chatbotId: string;
}): string {
  return `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3b82f6;">Real Agent Assistance Needed</h2>
      <p>Dear Support Team,</p>
      <p>The chatbot assistant <strong>${chatbotName}</strong> from account <strong>${accountName}</strong> was unable to handle a customer's response and requires real agent help. Below are the details:</p>

      <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
        <tr style="background-color: #f2f2f2;">
          <td style="padding: 8px;"><strong>Customer Name:</strong></td>
          <td style="padding: 8px;">${customerName}</td>
        </tr>
        <tr style="background-color: #fff;">
          <td style="padding: 8px;"><strong>Customer Email:</strong></td>
          <td style="padding: 8px;">${customerEmail}</td>
        </tr>
        <tr style="background-color: #f2f2f2;">
          <td style="padding: 8px;"><strong>Chatbot Name:</strong></td>
          <td style="padding: 8px;">${chatbotName}</td>
        </tr>
        <tr style="background-color: #fff;">
          <td style="padding: 8px;"><strong>Account Name:</strong></td>
          <td style="padding: 8px;">${accountName}</td>
        </tr>
        <tr style="background-color: #f2f2f2;">
          <td style="padding: 8px;"><strong>Chatroom ID:</strong></td>
          <td style="padding: 8px;">${chatRoomId}</td>
        </tr>
      </table>

      <p><strong>Action Required:</strong></p>
      <p>Please review the customer's response and take the necessary action. You can access the chatroom using the following link:</p>
      <p><a href="https://localhost:3000/chatbot/${chatbotId}/conversations" style="color: #3b82f6; text-decoration: none;">View Messenger</a></p>

      <p>Thank you for your prompt attention.</p>
    </div>
  `;
}

// Function to send email and SMS notifications
export async function sendEmailAndSmsNotifications(
  chatRoomId: string,
  customerName: string,
  customerEmail: string,
  chatbotName: string,
  accountName: string,
  chatbotId: string
) {
  try {
    // Fetch chatbot team members with access
    const chatbotTeam = await getChatbotUsersWithAccess(chatbotId);

    // Prepare email recipients
    const emailRecipients = chatbotTeam.map(user => user.email);

    if (emailRecipients.length === 0) {
      return;
    }

    // Generate email message
    const emailMessage = generateEmailMessage({
      chatRoomId,
      customerName,
      customerEmail,
      chatbotName,
      accountName,
      chatbotId
    });

    // Prepare mail options
    const mailOptions = {
      from: process.env.NODE_MAILER_EMAIL,
      to: emailRecipients.join(','), // Send to all recipients
      subject: 'Real Agent Needed',
      html: emailMessage,
    };

    // Send email notifications
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to:', emailRecipients);

    // Prepare SMS recipients (commented out for now)
    // const phoneRecipients = chatbotTeam.map(user => user.phoneNumber || defaultPhoneNumber);
    // const smsMessage = `Chatbot requires real agent help. View chatroom: https://localhost/chatroom/${chatRoomId}`;
    // for (const phone of phoneRecipients) {
    //   await twilioClient.messages.create({
    //     body: smsMessage,
    //     from: process.env.TWILIO_PHONE_NUMBER,
    //     to: phone,
    //   });
    // }
    // console.log('SMS sent successfully to:', phoneRecipients);

  } catch (error) {
    console.error('Error sending notifications:', error);
    throw error;
  }
}

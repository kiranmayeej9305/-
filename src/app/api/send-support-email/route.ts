import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Function to handle POST requests
export async function POST(req: NextRequest) {
  try {
    const { email, relatedAccount, relatedChatbot, selectedProblem, selectedSeverity, subject, description } = await req.json();

    if (!email || !subject || !description) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.zoho.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.NODE_MAILER_EMAIL,
        pass: process.env.NODE_MAILER_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.NODE_MAILER_EMAIL,
      to: 'support@ailawassistant.co',
      subject: `Support Request: ${subject}`,
      html: `
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Related Account:</strong> ${relatedAccount}</p>
        <p><strong>Related Chatbots:</strong> ${relatedChatbot}</p>
        <p><strong>Selected Problem:</strong> ${selectedProblem}</p>
        <p><strong>Selected Severity:</strong> ${selectedSeverity}</p>
        <p><strong>Description:</strong></p>
        <p>${description}</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ message: 'Failed to send email' }, { status: 500 });
  }
}

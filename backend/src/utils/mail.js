import nodemailer from 'nodemailer';

const getTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('[WARNING] Production SMTP credentials are not fully configured in environment variables.');
    }
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT, 10),
    secure: parseInt(SMTP_PORT, 10) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });
};

export const sendEmail = async (to, subject, text, html) => {
  const transporter = getTransporter();
  const from = process.env.EMAIL_FROM || 'no-reply@maxglow.in';

  if (!transporter) {
    console.log(`[EMAIL LOG] SMTP not configured. Simulating Email Dispatch:
From: ${from}
To: ${to}
Subject: ${subject}
Content: ${text || html}`);
    return { success: true, simulated: true };
  }

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html
    });
    console.log(`[EMAIL DISPATCH SUCCESS] Message sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[EMAIL DISPATCH FAILURE] Failed to send email to ${to}:`, error.message);
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Email dispatch failed: ${error.message}`);
    }
    return { success: false, error: error.message };
  }
};

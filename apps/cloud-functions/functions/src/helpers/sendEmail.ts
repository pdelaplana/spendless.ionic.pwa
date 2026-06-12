import nodemailer from 'nodemailer';
import mailGunTransport from 'nodemailer-mailgun-transport';

export interface MailOptions {
  subject: string;
  from: string;
  to: string;
  html: string;
}

export async function sendEmailNotification(mailOptions: MailOptions) {
  // Configure Mailgun transport
  const mailgunConfig = {
    auth: {
      domain: process.env.MAILGUN_DOMAIN || '',
      apiKey: process.env.MAILGUN_API_KEY || '',
    },
  };

  // Create the transporter with Mailgun configuration
  const transporter = nodemailer.createTransport(mailGunTransport(mailgunConfig));

  return transporter.sendMail(mailOptions);
}

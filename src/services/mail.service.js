import nodemailer from 'nodemailer';
import config from '../config';

async function sendEmail({ from, to, subject, html }) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.email,
      pass: config.emailPassword,
    },
  });
  const mailContent = {
    from,
    to,
    subject,
    html,
  };
  await transporter.sendMail(mailContent);
}

export { sendEmail };

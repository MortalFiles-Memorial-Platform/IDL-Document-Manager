import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

export async function sendDocumentEmail(to: string, subject: string, text: string, pdfBuffer: Buffer) {
  const mail = {
    from: process.env.SMTP_USER,
    to,
    subject,
    text,
    attachments: [
      {
        filename: 'document.pdf',
        content: pdfBuffer,
        contentType: 'application/pdf'
      }
    ]
  };

  await transporter.sendMail(mail);
}

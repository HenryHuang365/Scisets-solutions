import { Injectable } from '@nestjs/common';
import { Transporter, createTransport } from 'nodemailer';
import { EmailContent } from './email.interface';

@Injectable()
export class EmailService {
  private transporter: Transporter;
  constructor() {
    this.transporter = createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true' || false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
    });
  }

  async sendEmail(email: EmailContent) {
    await this.transporter.sendMail(email);
  }

  async sendVerificationCodeFromEmail(to: string, code: string) {
    const email: EmailContent = {
      from: '"Scisets" <noreply@scisets.com>',
      to,
      subject: `Your verification code: ${code}`,
      text: `Your verification code: ${code}`,
      html: `This your verification code:<br/><h1>${code}</h1>`,
    };
    await this.sendEmail(email);
  }
}

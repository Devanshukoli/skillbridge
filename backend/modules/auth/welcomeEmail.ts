import nodemailer from 'nodemailer';

export interface WelcomeEmailResult {
  sent: boolean;
  reason?: 'not-configured' | 'send-failed';
  messageId?: string;
  error?: string;
}

interface SendWelcomeEmailArgs {
  name: string;
  email: string;
  appUrl?: string;
}

export async function sendWelcomeEmail({ name, email, appUrl }: SendWelcomeEmailArgs): Promise<WelcomeEmailResult> {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  if (!host || !user || !pass) {
    return { sent: false, reason: 'not-configured' };
  }

  const port = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE === 'true' || process.env.SMTP_SECURE === '1';
  const from = process.env.SMTP_FROM?.trim() || 'no-reply@skillbridge.app';
  const baseUrl = appUrl || process.env.APP_URL || 'http://localhost:3000';

  const transporter = nodemailer.createTransport({
    host,
    port: Number.isFinite(port) ? port : 587,
    secure,
    auth: {
      user,
      pass
    }
  });

  const subject = 'Welcome to SkillBridge!';
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
      <h2>Welcome to SkillBridge, ${name}!</h2>
      <p>Your account is ready. You can sign in and start exploring your learning path right away.</p>
      <p><a href="${baseUrl}" style="display: inline-block; padding: 10px 16px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px;">Open SkillBridge</a></p>
      <p>If you have any questions, reply to this email and we’ll help you get started.</p>
    </div>
  `;

  const text = `Hi ${name},\n\nWelcome to SkillBridge! Your account is ready. Open ${baseUrl} to get started.\n\nThanks,\nThe SkillBridge Team`;

  try {
    const info = await transporter.sendMail({
      from,
      to: email,
      subject,
      text,
      html
    });

    return { sent: true, messageId: info.messageId };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to send welcome email', message);
    return { sent: false, reason: 'send-failed', error: message };
  }
}

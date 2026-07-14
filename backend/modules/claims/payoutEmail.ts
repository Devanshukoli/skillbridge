import nodemailer from 'nodemailer';

export interface PayoutEmailResult {
  sent: boolean;
  reason?: 'not-configured' | 'send-failed';
  messageId?: string;
  error?: string;
}

interface SendPayoutEmailArgs {
  name: string;
  email: string;
  amount: number;
  currency: string;
  method: 'stripe' | 'manual';
  appUrl?: string;
}

export async function sendPayoutEmail({ name, email, amount, currency, method, appUrl }: SendPayoutEmailArgs): Promise<PayoutEmailResult> {
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

  const formattedAmount = `${currency.toUpperCase()} ${amount.toFixed(2)}`;
  const methodLabel = method === 'stripe'
    ? 'Your reward has been sent to your connected Stripe account and should arrive shortly, depending on your bank.'
    : 'Your reward has been sent to your payout details on file by our team.';

  const subject = `Your SkillBridge reward of ${formattedAmount} has been paid`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
      <h2>You've been paid, ${name}!</h2>
      <p>Your capstone reward claim of <strong>${formattedAmount}</strong> has been marked as paid.</p>
      <p>${methodLabel}</p>
      <p><a href="${baseUrl}" style="display: inline-block; padding: 10px 16px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px;">View your account</a></p>
      <p>If anything looks off, reply to this email and we'll help sort it out.</p>
    </div>
  `;

  const text = `Hi ${name},\n\nYour capstone reward claim of ${formattedAmount} has been marked as paid. ${methodLabel}\n\nView your account: ${baseUrl}\n\nThanks,\nThe SkillBridge Team`;

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
    console.error('Failed to send payout email', message);
    return { sent: false, reason: 'send-failed', error: message };
  }
}

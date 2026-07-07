import nodemailer from 'nodemailer';
import type { Track } from '../../../frontend/src/types';

export interface TrackNotificationEmailResult {
  sent: boolean;
  reason?: 'not-configured' | 'send-failed' | 'no-recipients';
  messageId?: string;
  error?: string;
}

interface SendTrackNotificationEmailArgs {
  tracks: Track[];
  recipients: string[];
  appUrl?: string;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function sendTrackNotificationEmail({ tracks, recipients, appUrl }: SendTrackNotificationEmailArgs): Promise<TrackNotificationEmailResult> {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  if (!host || !user || !pass) {
    return { sent: false, reason: 'not-configured' };
  }

  if (!recipients || recipients.length === 0) {
    return { sent: false, reason: 'no-recipients' };
  }

  const port = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE === 'true' || process.env.SMTP_SECURE === '1';
  const from = process.env.SMTP_FROM?.trim() || 'no-reply@skillbridge.app';
  const baseUrl = appUrl || process.env.APP_URL || 'http://localhost:3000';

  const subject = `New SkillBridge Track${tracks.length > 1 ? 's' : ''} Available!`;
  const trackList = tracks
    .map((track) => `<li><strong>${escapeHtml(track.name)}</strong> - ${escapeHtml(track.description)}</li>`)
    .join('');

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
      <h2>New SkillBridge ${tracks.length > 1 ? 'Tracks' : 'Track'} Are Live!</h2>
      <p>We just added ${tracks.length} new learning path${tracks.length > 1 ? 's' : ''} to SkillBridge. Explore the latest content and keep building your skills.</p>
      <ul style="padding-left: 1rem;">
        ${trackList}
      </ul>
      <p style="margin-top: 1rem;"><a href="${baseUrl}/" style="display: inline-block; padding: 10px 16px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px;">Open SkillBridge</a></p>
      <p>If you have any questions, reply to this email and we'll help you get started.</p>
    </div>
  `;

  const text = `New SkillBridge track${tracks.length > 1 ? 's' : ''} are live!

${tracks
    .map((track) => `- ${track.name}: ${track.description}`)
    .join('\n')}

Open ${baseUrl} to explore the new track${tracks.length > 1 ? 's' : ''}.
`;

  const transporter = nodemailer.createTransport({
    host,
    port: Number.isFinite(port) ? port : 587,
    secure,
    auth: {
      user,
      pass
    }
  });

  try {
    const info = await transporter.sendMail({
      from,
      bcc: recipients,
      subject,
      text,
      html
    });

    return { sent: true, messageId: info.messageId };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Tracks] Failed to send notification email', message);
    return { sent: false, reason: 'send-failed', error: message };
  }
}

import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { Claim, Progress, Submission, User } from '../../frontend/src/types';
import { loadCompiledContent } from '../content/content-store';

const DB_FILE = path.join(process.cwd(), 'db.json');
const BUILT_IN_TRACK_IDS = new Set(['track-backend-1']);

interface DatabaseSchema {
  users: User[];
  passwords: Record<string, string>;
  submissions: Submission[];
  progress: Progress[];
  claims: Claim[];
  notifiedTrackIds: string[];
}

const defaultDb: DatabaseSchema = {
  users: [],
  passwords: {},
  submissions: [],
  progress: [],
  claims: [],
  notifiedTrackIds: []
};

function normalizeDb(raw: Partial<DatabaseSchema>): DatabaseSchema {
  const db: DatabaseSchema = {
    users: Array.isArray(raw.users) ? raw.users : [],
    passwords: raw.passwords || {},
    submissions: Array.isArray(raw.submissions) ? raw.submissions : [],
    progress: Array.isArray(raw.progress) ? raw.progress : [],
    claims: Array.isArray(raw.claims) ? raw.claims : [],
    notifiedTrackIds: Array.isArray(raw.notifiedTrackIds) ? raw.notifiedTrackIds : []
  };

  if (!Array.isArray(raw.notifiedTrackIds)) {
    const content = loadCompiledContent();
    db.notifiedTrackIds = content.tracks
      .filter((track) => BUILT_IN_TRACK_IDS.has(track.id))
      .map((track) => track.id);
  }

  return db;
}

export function loadDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      saveDb(defaultDb);
      return defaultDb;
    }

    const raw = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8')) as Partial<DatabaseSchema>;
    return normalizeDb(raw);
  } catch (err) {
    console.error('Error loading DB, returning empty', err);
    return defaultDb;
  }
}

export function saveDb(data: DatabaseSchema): void {
  try {
    fs.writeFileSync(DB_FILE, `${JSON.stringify(normalizeDb(data), null, 2)}\n`, 'utf-8');
  } catch (err) {
    console.error('Error saving DB', err);
  }
}

async function notifyNewTracks(db: DatabaseSchema) {
  const content = loadCompiledContent();

  for (const track of content.tracks) {
    if (BUILT_IN_TRACK_IDS.has(track.id) && !db.notifiedTrackIds.includes(track.id)) {
      db.notifiedTrackIds.push(track.id);
    }
  }

  const freshTracks = content.tracks.filter((track) => !db.notifiedTrackIds.includes(track.id));
  if (freshTracks.length === 0) return;

  const recipients = db.users.map((user) => user.email);
  if (recipients.length === 0) {
    console.warn('[Tracks] No users found to notify about new tracks.');
    return;
  }

  try {
    const { sendTrackNotificationEmail } = await import('../modules/notifications/trackNotificationEmail');
    const result = await sendTrackNotificationEmail({
      tracks: freshTracks,
      recipients,
      appUrl: process.env.APP_URL || 'http://localhost:3000'
    });

    if (result.sent) {
      db.notifiedTrackIds.push(...freshTracks.map((track) => track.id));
      saveDb(db);
      console.log(`[Tracks] Sent notifications for ${freshTracks.length} new track(s) to ${recipients.length} users.`);
    } else {
      console.warn('[Tracks] Notification email failed:', result.reason, result.error);
    }
  } catch (err) {
    console.error('[Tracks] Failed to send new track notifications:', err);
  }
}

export async function seedDatabase() {
  const db = loadDb();

  const adminEmail = 'admin@skillbridge.com';
  let adminUser = db.users.find((user) => user.email === adminEmail);
  if (!adminUser) {
    const adminId = 'user-admin-1';
    adminUser = {
      id: adminId,
      name: 'System Admin',
      email: adminEmail,
      role: 'admin',
      pointsBalance: 1000,
      claimableBalance: 0,
      profile: {
        experienceLevel: 'Have internship experience',
        skills: ['Node.js', 'Express', 'SQL', 'Git', 'REST APIs'],
        goals: 'Maintain and review curriculum submissions.',
        timeCommitment: 'Intensive 10+ hrs',
        bio: 'Senior Backend Reviewer & Platform Administrator',
        currentRole: 'Backend Team Lead'
      },
      onboardingCompleted: true,
      createdAt: new Date().toISOString()
    };
    db.users.push(adminUser);
    db.passwords[adminId] = await bcrypt.hash('admin123', 10);
  }

  const studentEmail = 'student@skillbridge.com';
  let studentUser = db.users.find((user) => user.email === studentEmail);
  if (!studentUser) {
    const studentId = 'user-student-1';
    studentUser = {
      id: studentId,
      name: 'Devanshu Koli',
      email: studentEmail,
      role: 'student',
      pointsBalance: 0,
      claimableBalance: 0,
      profile: {
        experienceLevel: 'Built personal projects',
        skills: ['JavaScript', 'Git'],
        goals: 'Get my first job as a software engineer',
        timeCommitment: 'Regular ~5-8 hrs',
        bio: 'Aspiring junior backend engineer looking to build scalable microservices.',
        currentRole: 'Computer Science Student'
      },
      onboardingCompleted: true,
      createdAt: new Date().toISOString()
    };
    db.users.push(studentUser);
    db.passwords[studentId] = await bcrypt.hash('student123', 10);
  }

  saveDb(db);
  await notifyNewTracks(db);
}

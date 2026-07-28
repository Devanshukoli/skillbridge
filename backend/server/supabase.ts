import { createClient, SupabaseClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { User, Track, Module, Lesson, Project, Submission, Progress, Claim, SubmissionHistory, ManualPayoutDetails, ManualPayoutMethod } from '../../frontend/src/types';
import { GOOGLE_OAUTH_PASSWORD_MARKER } from '../modules/auth/constants';

let supabaseInstance: SupabaseClient | null = null;

type StripeConnectUserUpdates = {
  stripeAccountId?: string | null;
  stripeConnected?: boolean;
  stripeChargesEnabled?: boolean;
  stripePayoutsEnabled?: boolean;
  stripeOnboardingCompleted?: boolean;
  stripeUpdatedAt?: string | null;
  stripeRequirementsCurrentlyDue?: string[];
};

function hasSupabaseConfig(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);
}

export function getSupabaseClient(): SupabaseClient {
  if (supabaseInstance) return supabaseInstance;

  const url = process.env.SUPABASE_URL || '';
  const anonKey = process.env.SUPABASE_ANON_KEY || '';

  if (!url || !anonKey) {
    throw new Error('[Supabase] Missing SUPABASE_URL or SUPABASE_ANON_KEY');
  }

  supabaseInstance = createClient(url, anonKey);
  return supabaseInstance;
}

// In-Memory Fallback Engine
function loadCompiledCurriculum() {
  try {
    const compiledPath = path.join(process.cwd(), 'backend/content/compiled.json');
    if (fs.existsSync(compiledPath)) {
      const content = fs.readFileSync(compiledPath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (e) {
    console.warn('[SkillBridge] Could not load compiled.json for fallback:', e);
  }
  return { tracks: [], modules: [], lessons: [], projects: [] };
}

const initialCurriculum = loadCompiledCurriculum();

let inMemoryTracks: Track[] = initialCurriculum.tracks || [];
let inMemoryModules: Module[] = initialCurriculum.modules || [];
let inMemoryLessons: Lesson[] = initialCurriculum.lessons || [];
let inMemoryProjects: Project[] = initialCurriculum.projects || [];

const inMemoryUsers = new Map<string, { user: User; passwordHash: string }>();
const inMemoryProgress: Progress[] = [];
const inMemorySubmissions = new Map<string, Submission>();
const inMemorySubmissionHistory: SubmissionHistory[] = [];
const inMemoryClaims = new Map<string, Claim>();

function seedDefaultUsers() {
  if (inMemoryUsers.size === 0) {
    const adminHash = bcrypt.hashSync('admin123', 10);
    const adminUser: User = {
      id: 'user-admin-1',
      name: 'Admin User',
      email: 'admin@skillbridge.dev',
      role: 'admin',
      status: 'active',
      pointsBalance: 500,
      claimableBalance: 100,
      profile: {
        experienceLevel: 'Senior',
        skills: ['Node.js', 'Express', 'TypeScript', 'SQL'],
        goals: 'Manage curriculum and review student capstone submissions.',
        timeCommitment: '20+ hrs/week'
      },
      onboardingCompleted: true,
      createdAt: new Date().toISOString()
    };
    inMemoryUsers.set(adminUser.id, { user: adminUser, passwordHash: adminHash });

    const studentHash = bcrypt.hashSync('student123', 10);
    const studentUser: User = {
      id: 'user-student-1',
      name: 'Demo Student',
      email: 'student@skillbridge.dev',
      role: 'student',
      status: 'active',
      pointsBalance: 120,
      claimableBalance: 25,
      profile: {
        experienceLevel: 'Intermediate',
        skills: ['JavaScript', 'HTML/CSS'],
        goals: 'Become a full-stack backend software engineer.',
        timeCommitment: '10-15 hrs/week'
      },
      onboardingCompleted: true,
      createdAt: new Date().toISOString()
    };
    inMemoryUsers.set(studentUser.id, { user: studentUser, passwordHash: studentHash });
  }
}

seedDefaultUsers();

function mapUserRow(data: any): User {
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role,
    status: data.status,
    pointsBalance: data.points_balance,
    claimableBalance: data.claimable_balance,
    profile: data.profile,
    onboardingCompleted: data.onboarding_completed,
    createdAt: data.created_at,
    stripeAccountId: data.stripe_account_id || null,
    stripeConnected: data.stripe_connected || false,
    stripeChargesEnabled: data.stripe_charges_enabled || false,
    stripePayoutsEnabled: data.stripe_payouts_enabled || false,
    stripeOnboardingCompleted: data.stripe_onboarding_completed || false,
    stripeUpdatedAt: data.stripe_updated_at || null,
    stripeRequirementsCurrentlyDue: data.stripe_requirements_currently_due || [],
    payoutMethod: data.payout_method || 'stripe',
    manualPayoutDetails: data.manual_payout_details || null,
    twoFactorEnabled: data.two_factor_enabled || false,
    twoFactorSecret: data.two_factor_secret || null,
    authProvider: data.auth_provider || 'local',
  };
}

function mapStripeUserUpdatePayload(updates: StripeConnectUserUpdates): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (updates.stripeAccountId !== undefined) payload.stripe_account_id = updates.stripeAccountId;
  if (updates.stripeConnected !== undefined) payload.stripe_connected = updates.stripeConnected;
  if (updates.stripeChargesEnabled !== undefined) payload.stripe_charges_enabled = updates.stripeChargesEnabled;
  if (updates.stripePayoutsEnabled !== undefined) payload.stripe_payouts_enabled = updates.stripePayoutsEnabled;
  if (updates.stripeOnboardingCompleted !== undefined) payload.stripe_onboarding_completed = updates.stripeOnboardingCompleted;
  if (updates.stripeUpdatedAt !== undefined) payload.stripe_updated_at = updates.stripeUpdatedAt;
  if (updates.stripeRequirementsCurrentlyDue !== undefined) payload.stripe_requirements_currently_due = updates.stripeRequirementsCurrentlyDue;
  return payload;
}

// User Operations
export async function supabaseGetUser(email: string): Promise<{ user: User; passwordHash: string } | null> {
  const normalizedEmail = email.toLowerCase();
  if (hasSupabaseConfig()) {
    try {
      const supabase = getSupabaseClient();
      const { data: userData, error: userError } = await supabase
        .from('skillbridge_users')
        .select('*')
        .eq('email', normalizedEmail)
        .single();

      if (!userError && userData) {
        const { data: passData } = await supabase
          .from('skillbridge_passwords')
          .select('password_hash')
          .eq('user_id', userData.id)
          .single();

        return { user: mapUserRow(userData), passwordHash: passData?.password_hash || '' };
      }
    } catch (err) {
      console.warn('[Supabase] GetUser failed, using fallback:', err);
    }
  }

  for (const entry of inMemoryUsers.values()) {
    if (entry.user.email.toLowerCase() === normalizedEmail) {
      return entry;
    }
  }
  return null;
}

export async function supabaseGetUserById(id: string): Promise<User | null> {
  if (hasSupabaseConfig()) {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('skillbridge_users')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        return mapUserRow(data);
      }
    } catch (err) {
      console.warn('[Supabase] GetUserById failed, using fallback:', err);
    }
  }

  return inMemoryUsers.get(id)?.user || null;
}

export async function supabaseCreateUser(user: User, passwordHash: string): Promise<boolean> {
  if (hasSupabaseConfig()) {
    try {
      const supabase = getSupabaseClient();
      const payoutMethod = user.payoutMethod || 'stripe';
      const manualPayoutDetails = user.manualPayoutDetails || null;
      const authProvider = passwordHash === GOOGLE_OAUTH_PASSWORD_MARKER ? 'google' : 'local';

      const { error: userError } = await supabase
        .from('skillbridge_users')
        .insert({
          id: user.id,
          name: user.name,
          email: user.email.toLowerCase(),
          role: user.role,
          status: user.status || 'active',
          points_balance: user.pointsBalance,
          claimable_balance: user.claimableBalance,
          profile: user.profile,
          onboarding_completed: user.onboardingCompleted,
          created_at: user.createdAt,
          stripe_account_id: user.stripeAccountId || null,
          stripe_connected: user.stripeConnected || false,
          stripe_charges_enabled: user.stripeChargesEnabled || false,
          stripe_payouts_enabled: user.stripePayoutsEnabled || false,
          stripe_onboarding_completed: user.stripeOnboardingCompleted || false,
          stripe_updated_at: user.stripeUpdatedAt || null,
          stripe_requirements_currently_due: user.stripeRequirementsCurrentlyDue || [],
          payout_method: payoutMethod,
          manual_payout_details: manualPayoutDetails,
          auth_provider: authProvider 
        });

      if (!userError) {
        const { error: passError } = await supabase
          .from('skillbridge_passwords')
          .insert({ user_id: user.id, password_hash: passwordHash });

        if (!passError) return true;
      }
    } catch (err) {
      console.warn('[Supabase] CreateUser failed, storing in memory:', err);
    }
  }

  inMemoryUsers.set(user.id, { user, passwordHash });
  return true;
}

export async function supabaseUpdatePassword(userId: string, passwordHash: string): Promise<boolean> {
  if (hasSupabaseConfig()) {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('skillbridge_passwords')
        .upsert({ user_id: userId, password_hash: passwordHash });
      if (!error) return true;
    } catch (err) {
      console.warn('[Supabase] UpdatePassword failed, updating in memory:', err);
    }
  }

  const entry = inMemoryUsers.get(userId);
  if (entry) {
    entry.passwordHash = passwordHash;
  }
  return true;
}

export async function supabaseUpdateUser(
  userId: string,
  updates: Record<string, any>
): Promise<boolean> {
  if (hasSupabaseConfig()) {
    try {
      const supabase = getSupabaseClient();
      const payload: Record<string, any> = {};

      if (updates.twoFactorEnabled !== undefined) payload.two_factor_enabled = updates.twoFactorEnabled;
      if (updates.twoFactorSecret !== undefined) payload.two_factor_secret = updates.twoFactorSecret;
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.profile !== undefined) payload.profile = updates.profile;

      const { error } = await supabase
        .from('skillbridge_users')
        .update(payload)
        .eq('id', userId);

      if (!error) return true;
    } catch (err) {
      console.warn('[Supabase] UpdateUser failed, updating in memory:', err);
    }
  }

  const entry = inMemoryUsers.get(userId);
  if (entry) {
    if (updates.twoFactorEnabled !== undefined) entry.user.twoFactorEnabled = updates.twoFactorEnabled;
    if (updates.twoFactorSecret !== undefined) entry.user.twoFactorSecret = updates.twoFactorSecret;
    if (updates.name !== undefined) entry.user.name = updates.name;
    if (updates.profile !== undefined) entry.user.profile = updates.profile;
  }
  return true;
}

export async function supabaseUpdateUserProfile(
  userId: string,
  updates: {
    name?: string;
    profile?: any;
    onboardingCompleted?: boolean;
    pointsBalance?: number;
    claimableBalance?: number;
    status?: string;
    payoutMethod?: ManualPayoutMethod;
    manualPayoutDetails?: ManualPayoutDetails | null;
  }
): Promise<User | null> {
  if (hasSupabaseConfig()) {
    try {
      const supabase = getSupabaseClient();
      const payload: any = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.profile !== undefined) payload.profile = updates.profile;
      if (updates.onboardingCompleted !== undefined) payload.onboarding_completed = updates.onboardingCompleted;
      if (updates.pointsBalance !== undefined) payload.points_balance = updates.pointsBalance;
      if (updates.claimableBalance !== undefined) payload.claimable_balance = updates.claimableBalance;
      if (updates.status !== undefined) payload.status = updates.status;
      if (updates.payoutMethod !== undefined) payload.payout_method = updates.payoutMethod || 'stripe';
      if (updates.manualPayoutDetails !== undefined) payload.manual_payout_details = updates.manualPayoutDetails || null;

      const { data, error } = await supabase
        .from('skillbridge_users')
        .update(payload)
        .eq('id', userId)
        .select()
        .single();

      if (!error && data) {
        return supabaseGetUserById(userId);
      }
    } catch (err) {
      console.warn('[Supabase] UpdateUserProfile failed, updating in memory:', err);
    }
  }

  const entry = inMemoryUsers.get(userId);
  if (entry) {
    if (updates.name !== undefined) entry.user.name = updates.name;
    if (updates.profile !== undefined) entry.user.profile = updates.profile;
    if (updates.onboardingCompleted !== undefined) entry.user.onboardingCompleted = updates.onboardingCompleted;
    if (updates.pointsBalance !== undefined) entry.user.pointsBalance = updates.pointsBalance;
    if (updates.claimableBalance !== undefined) entry.user.claimableBalance = updates.claimableBalance;
    if (updates.status !== undefined) entry.user.status = updates.status as any;
    if (updates.payoutMethod !== undefined) entry.user.payoutMethod = updates.payoutMethod;
    if (updates.manualPayoutDetails !== undefined) entry.user.manualPayoutDetails = updates.manualPayoutDetails;
    return entry.user;
  }
  return null;
}

export async function supabaseUpdateUserStripeConnect(userId: string, updates: StripeConnectUserUpdates): Promise<User | null> {
  if (hasSupabaseConfig()) {
    try {
      const supabase = getSupabaseClient();
      const payload = mapStripeUserUpdatePayload(updates);

      if (Object.keys(payload).length > 0) {
        const { error } = await supabase
          .from('skillbridge_users')
          .update(payload)
          .eq('id', userId);

        if (!error) {
          return supabaseGetUserById(userId);
        }
      }
    } catch (err) {
      console.warn('[Supabase] UpdateUserStripeConnect failed, updating in memory:', err);
    }
  }

  const entry = inMemoryUsers.get(userId);
  if (entry) {
    if (updates.stripeAccountId !== undefined) entry.user.stripeAccountId = updates.stripeAccountId;
    if (updates.stripeConnected !== undefined) entry.user.stripeConnected = updates.stripeConnected;
    if (updates.stripeChargesEnabled !== undefined) entry.user.stripeChargesEnabled = updates.stripeChargesEnabled;
    if (updates.stripePayoutsEnabled !== undefined) entry.user.stripePayoutsEnabled = updates.stripePayoutsEnabled;
    if (updates.stripeOnboardingCompleted !== undefined) entry.user.stripeOnboardingCompleted = updates.stripeOnboardingCompleted;
    if (updates.stripeUpdatedAt !== undefined) entry.user.stripeUpdatedAt = updates.stripeUpdatedAt;
    if (updates.stripeRequirementsCurrentlyDue !== undefined) entry.user.stripeRequirementsCurrentlyDue = updates.stripeRequirementsCurrentlyDue;
    return entry.user;
  }
  return null;
}

export async function supabaseGetUserByStripeAccountId(stripeAccountId: string): Promise<User | null> {
  if (hasSupabaseConfig()) {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('skillbridge_users')
        .select('*')
        .eq('stripe_account_id', stripeAccountId)
        .single();

      if (!error && data) {
        return mapUserRow(data);
      }
    } catch (err) {
      console.warn('[Supabase] GetUserByStripeAccountId failed, using fallback:', err);
    }
  }

  for (const entry of inMemoryUsers.values()) {
    if (entry.user.stripeAccountId === stripeAccountId) {
      return entry.user;
    }
  }
  return null;
}

export async function supabaseGetAllUsers(): Promise<User[]> {
  if (hasSupabaseConfig()) {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('skillbridge_users').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        return data.map(mapUserRow);
      }
    } catch (err) {
      console.warn('[Supabase] GetAllUsers failed, using fallback:', err);
    }
  }

  return Array.from(inMemoryUsers.values()).map(e => e.user);
}

// Curriculum Operations
export async function supabaseGetCurriculum(userId: string): Promise<any | null> {
  if (hasSupabaseConfig()) {
    try {
      const supabase = getSupabaseClient();
      const { data: tracks } = await supabase.from('skillbridge_tracks').select('*');
      const { data: rawModules } = await supabase.from('skillbridge_modules').select('*').order('order', { ascending: true });
      const { data: rawLessons } = await supabase.from('skillbridge_lessons').select('*').order('order', { ascending: true });
      const { data: rawProjects } = await supabase.from('skillbridge_projects').select('*');
      const { data: progressData } = await supabase.from('skillbridge_progress').select('*').eq('user_id', userId);
      const { data: submissionsData } = await supabase.from('skillbridge_submissions').select('*').eq('user_id', userId);

      if (tracks && tracks.length > 0) {
        const modules: Module[] = (rawModules || []).map(m => ({ id: m.id, trackId: m.track_id, title: m.title, order: m.order }));
        const lessons: Lesson[] = (rawLessons || []).map(l => ({ id: l.id, moduleId: l.module_id, title: l.title, order: l.order, estimatedMinutes: l.estimated_minutes, content: l.content }));
        const projects: Project[] = (rawProjects || []).map(p => ({ id: p.id, trackId: p.track_id, moduleId: p.module_id, type: p.type, title: p.title, description: p.description, requirements: p.requirements, rubric: p.rubric, rewardPoints: p.reward_points, rewardMoney: p.reward_money }));
        const progress: Progress[] = (progressData || []).map(p => ({ userId: p.user_id, itemId: p.item_id, type: p.type, status: p.status, completedAt: p.completed_at }));
        const submissions: Submission[] = (submissionsData || []).map(s => ({ id: s.id, userId: s.user_id, projectId: s.project_id, repoUrl: s.repo_url, demoUrl: s.demo_url || '', writeup: s.writeup, status: s.status, submittedAt: s.submitted_at, reviewerId: s.reviewer_id || undefined, reviewerFeedback: s.reviewer_feedback || undefined, reviewedAt: s.reviewed_at || undefined }));

        const trackScores: Record<string, number> = {};
        progress.forEach((progressItem) => {
          if (progressItem.type !== 'lesson' && progressItem.type !== 'project') return;
          const lesson = lessons.find((item) => item.id === progressItem.itemId);
          const project = projects.find((item) => item.id === progressItem.itemId);
          let trackId = lesson ? modules.find((item) => item.id === lesson.moduleId)?.trackId : undefined;
          if (!trackId && project) trackId = project.trackId;
          if (!trackId) return;
          trackScores[trackId] = (trackScores[trackId] || 0) + 1;
        });

        const currentTrackId = Object.keys(trackScores).sort((a, b) => trackScores[b] - trackScores[a])[0] || tracks[0]?.id || '';

        return { tracks: tracks || [], modules, lessons, projects, progress, submissions, currentTrackId };
      }
    } catch (err) {
      console.warn('[Supabase] GetCurriculum failed, using fallback:', err);
    }
  }

  const userProgress = inMemoryProgress.filter(p => p.userId === userId);
  const userSubmissions = Array.from(inMemorySubmissions.values()).filter(s => s.userId === userId);

  const trackScores: Record<string, number> = {};
  userProgress.forEach((progressItem) => {
    if (progressItem.type !== 'lesson' && progressItem.type !== 'project') return;
    const lesson = inMemoryLessons.find(l => l.id === progressItem.itemId);
    const project = inMemoryProjects.find(pr => pr.id === progressItem.itemId);
    let trackId = lesson ? inMemoryModules.find(m => m.id === lesson.moduleId)?.trackId : undefined;
    if (!trackId && project) trackId = project.trackId;
    if (!trackId) return;
    trackScores[trackId] = (trackScores[trackId] || 0) + 1;
  });

  const currentTrackId = Object.keys(trackScores).sort((a, b) => trackScores[b] - trackScores[a])[0] || inMemoryTracks[0]?.id || '';

  return {
    tracks: inMemoryTracks,
    modules: inMemoryModules,
    lessons: inMemoryLessons,
    projects: inMemoryProjects,
    progress: userProgress,
    submissions: userSubmissions,
    currentTrackId
  };
}

export async function supabaseCompleteLesson(userId: string, lessonId: string, xpPoints: number): Promise<boolean> {
  if (hasSupabaseConfig()) {
    try {
      const supabase = getSupabaseClient();
      const { data: existing } = await supabase.from('skillbridge_progress').select('*').eq('user_id', userId).eq('item_id', lessonId).eq('type', 'lesson').maybeSingle();
      if (existing) return false;

      await supabase.from('skillbridge_progress').insert({ user_id: userId, item_id: lessonId, type: 'lesson', status: 'completed', completed_at: new Date().toISOString() });
      const { data: userData } = await supabase.from('skillbridge_users').select('points_balance').eq('id', userId).single();
      if (userData) {
        await supabase.from('skillbridge_users').update({ points_balance: userData.points_balance + xpPoints }).eq('id', userId);
      }
      return true;
    } catch (err) {
      console.warn('[Supabase] CompleteLesson failed, completing in memory:', err);
    }
  }

  const existing = inMemoryProgress.find(p => p.userId === userId && p.itemId === lessonId && p.type === 'lesson');
  if (existing) return false;

  inMemoryProgress.push({
    userId,
    itemId: lessonId,
    type: 'lesson',
    status: 'completed',
    completedAt: new Date().toISOString()
  });

  const entry = inMemoryUsers.get(userId);
  if (entry) {
    entry.user.pointsBalance += xpPoints;
  }
  return true;
}

// Submission Operations
export async function supabaseSubmitProject(submission: Submission): Promise<boolean> {
  if (hasSupabaseConfig()) {
    try {
      const supabase = getSupabaseClient();
      await supabase.from('skillbridge_submissions').insert({
        id: submission.id, user_id: submission.userId, project_id: submission.projectId, repo_url: submission.repoUrl, demo_url: submission.demoUrl, writeup: submission.writeup, status: submission.status, submitted_at: submission.submittedAt
      });
      await supabase.from('skillbridge_progress').upsert({
        user_id: submission.userId, item_id: submission.projectId, type: 'project', status: 'submitted', completed_at: new Date().toISOString()
      }, { onConflict: 'user_id,item_id,type' });
      return true;
    } catch (err) {
      console.warn('[Supabase] SubmitProject failed, submitting in memory:', err);
    }
  }

  inMemorySubmissions.set(submission.id, submission);
  const progIdx = inMemoryProgress.findIndex(p => p.userId === submission.userId && p.itemId === submission.projectId && p.type === 'project');
  const newProg: Progress = {
    userId: submission.userId,
    itemId: submission.projectId,
    type: 'project',
    status: 'submitted',
    completedAt: new Date().toISOString()
  };
  if (progIdx >= 0) {
    inMemoryProgress[progIdx] = newProg;
  } else {
    inMemoryProgress.push(newProg);
  }
  return true;
}

export async function supabaseGetAllSubmissions(): Promise<any[] | null> {
  if (hasSupabaseConfig()) {
    try {
      const supabase = getSupabaseClient();
      const { data: subs, error } = await supabase.from('skillbridge_submissions').select(`*, skillbridge_users ( name, email ), skillbridge_projects ( title, type, reward_points, reward_money )`).order('submitted_at', { ascending: false });
      if (!error && subs) {
        return subs.map(s => ({
          id: s.id, userId: s.user_id, projectId: s.project_id, repoUrl: s.repo_url, demoUrl: s.demo_url, writeup: s.writeup, status: s.status, submittedAt: s.submitted_at, reviewerId: s.reviewer_id, reviewerFeedback: s.reviewer_feedback, reviewedAt: s.reviewed_at,
          projectTitle: s.skillbridge_projects?.title || 'Unknown Project', projectType: s.skillbridge_projects?.type || 'practice', userName: s.skillbridge_users?.name || 'Deleted Student', userEmail: s.skillbridge_users?.email || ''
        }));
      }
    } catch (err) {
      console.warn('[Supabase] GetAllSubmissions failed, using fallback:', err);
    }
  }

  return Array.from(inMemorySubmissions.values()).map(s => {
    const user = inMemoryUsers.get(s.userId)?.user;
    const project = inMemoryProjects.find(p => p.id === s.projectId);
    return {
      id: s.id,
      userId: s.userId,
      projectId: s.projectId,
      repoUrl: s.repoUrl,
      demoUrl: s.demoUrl || '',
      writeup: s.writeup,
      status: s.status,
      submittedAt: s.submittedAt,
      reviewerId: s.reviewerId,
      reviewerFeedback: s.reviewerFeedback,
      reviewedAt: s.reviewedAt,
      projectTitle: project?.title || 'Unknown Project',
      projectType: project?.type || 'practice',
      userName: user?.name || 'Deleted Student',
      userEmail: user?.email || ''
    };
  });
}

export async function supabaseReviewSubmission(submissionId: string, status: string, feedback: string, reviewerId: string): Promise<{ success: boolean; submission?: any } | null> {
  if (hasSupabaseConfig()) {
    try {
      const supabase = getSupabaseClient();
      const reviewedAt = new Date().toISOString();

      const { data: oldSub } = await supabase.from('skillbridge_submissions').select('status').eq('id', submissionId).single();

      const { data: sub, error: subErr } = await supabase.from('skillbridge_submissions').update({
        status, reviewer_id: reviewerId, reviewer_feedback: feedback, reviewed_at: reviewedAt
      }).eq('id', submissionId).select().single();

      if (!subErr && sub) {
        await supabase.from('skillbridge_submission_history').insert({
          id: 'hist-' + Date.now().toString(),
          submission_id: submissionId,
          admin_id: reviewerId,
          action: oldSub?.status === status ? 'comment' : 'status_change',
          old_status: oldSub?.status || '',
          new_status: status,
          comment: feedback,
          created_at: reviewedAt
        });

        await supabase.from('skillbridge_progress').update({ status: status === 'approved' ? 'approved' : 'submitted' }).eq('user_id', sub.user_id).eq('item_id', sub.project_id).eq('type', 'project');

        if (status === 'approved') {
          const student = await supabaseGetUserById(sub.user_id);
          const { data: project } = await supabase.from('skillbridge_projects').select('*').eq('id', sub.project_id).single();
          if (student && project) {
            let updatedPoints = student.pointsBalance + (project.reward_points || 0);
            let updatedClaimable = student.claimableBalance + (project.type === 'capstone' && project.reward_money ? project.reward_money : 0);
            await supabase.from('skillbridge_users').update({ points_balance: updatedPoints, claimable_balance: updatedClaimable }).eq('id', sub.user_id);
          }
        }

        return { success: true, submission: sub };
      }
    } catch (err) {
      console.warn('[Supabase] ReviewSubmission failed, reviewing in memory:', err);
    }
  }

  const sub = inMemorySubmissions.get(submissionId);
  if (!sub) return null;
  const oldStatus = sub.status;
  const reviewedAt = new Date().toISOString();
  sub.status = status as any;
  sub.reviewerId = reviewerId;
  sub.reviewerFeedback = feedback;
  sub.reviewedAt = reviewedAt;

  const reviewer = inMemoryUsers.get(reviewerId)?.user;

  inMemorySubmissionHistory.push({
    id: 'hist-' + Date.now().toString(),
    submissionId,
    adminId: reviewerId,
    adminName: reviewer?.name || 'Admin',
    action: oldStatus === status ? 'comment' : 'status_change',
    oldStatus: oldStatus || '',
    newStatus: status,
    comment: feedback,
    createdAt: reviewedAt
  });

  const prog = inMemoryProgress.find(p => p.userId === sub.userId && p.itemId === sub.projectId && p.type === 'project');
  if (prog) {
    prog.status = status === 'approved' ? 'approved' : 'submitted';
  }

  if (status === 'approved') {
    const studentEntry = inMemoryUsers.get(sub.userId);
    const project = inMemoryProjects.find(p => p.id === sub.projectId);
    if (studentEntry && project) {
      studentEntry.user.pointsBalance += project.rewardPoints || 0;
      if (project.type === 'capstone' && project.rewardMoney) {
        studentEntry.user.claimableBalance += project.rewardMoney;
      }
    }
  }

  return { success: true, submission: sub };
}

export async function supabaseGetSubmissionHistory(submissionId: string): Promise<SubmissionHistory[]> {
  if (hasSupabaseConfig()) {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('skillbridge_submission_history').select(`*, skillbridge_users(name)`).eq('submission_id', submissionId).order('created_at', { ascending: true });
      if (!error && data) {
        return data.map(d => ({
          id: d.id,
          submissionId: d.submission_id,
          adminId: d.admin_id,
          action: d.action,
          oldStatus: d.old_status,
          newStatus: d.new_status,
          comment: d.comment,
          createdAt: d.created_at,
          adminName: d.skillbridge_users?.name || 'Admin'
        }));
      }
    } catch (err) {
      console.warn('[Supabase] GetSubmissionHistory failed, using fallback:', err);
    }
  }

  return inMemorySubmissionHistory.filter(h => h.submissionId === submissionId);
}

// Claims Operations
export async function supabaseGetUserClaims(userId: string): Promise<Claim[] | null> {
  if (hasSupabaseConfig()) {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('skillbridge_claims').select('*').eq('user_id', userId);
      if (!error && data) {
        return data.map(c => ({ id: c.id, userId: c.user_id, amount: c.amount, status: c.status, requestedAt: c.requested_at, resolvedAt: c.resolved_at || undefined }));
      }
    } catch (err) {
      console.warn('[Supabase] GetUserClaims failed, using fallback:', err);
    }
  }

  return Array.from(inMemoryClaims.values()).filter(c => c.userId === userId);
}

export async function supabaseCreateClaimRequest(claim: Claim): Promise<boolean> {
  if (hasSupabaseConfig()) {
    try {
      const supabase = getSupabaseClient();
      await supabase.from('skillbridge_claims').insert({ id: claim.id, user_id: claim.userId, amount: claim.amount, status: claim.status, requested_at: claim.requestedAt });
      const user = await supabaseGetUserById(claim.userId);
      if (user) {
        const newClaimableBalance = Math.max(0, user.claimableBalance - claim.amount);
        await supabase.from('skillbridge_users').update({ claimable_balance: newClaimableBalance }).eq('id', claim.userId);
      }
      return true;
    } catch (err) {
      console.warn('[Supabase] CreateClaimRequest failed, creating in memory:', err);
    }
  }

  inMemoryClaims.set(claim.id, claim);
  const userEntry = inMemoryUsers.get(claim.userId);
  if (userEntry) {
    userEntry.user.claimableBalance = Math.max(0, userEntry.user.claimableBalance - claim.amount);
  }
  return true;
}

export async function supabaseGetAllClaims(): Promise<any[] | null> {
  if (hasSupabaseConfig()) {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('skillbridge_claims').select(`*, skillbridge_users ( name, email, payout_method, manual_payout_details )`);
      if (!error && data) {
        return data.map(c => ({
          id: c.id,
          userId: c.user_id,
          amount: c.amount,
          status: c.status,
          requestedAt: c.requested_at,
          resolvedAt: c.resolved_at,
          userName: c.skillbridge_users?.name || 'Unknown User',
          userEmail: c.skillbridge_users?.email || '',
          payoutMethod: c.skillbridge_users?.payout_method || 'stripe',
          manualPayoutDetails: c.skillbridge_users?.manual_payout_details || null,
          stripeTransferId: c.stripe_transfer_id || null,
          failureReason: c.failure_reason || null,
          paidAt: c.paid_at || null
        }));
      }
    } catch (err) {
      console.warn('[Supabase] GetAllClaims failed, using fallback:', err);
    }
  }

  return Array.from(inMemoryClaims.values()).map(c => {
    const user = inMemoryUsers.get(c.userId)?.user;
    return {
      id: c.id,
      userId: c.userId,
      amount: c.amount,
      status: c.status,
      requestedAt: c.requestedAt,
      resolvedAt: c.resolvedAt,
      userName: user?.name || 'Unknown User',
      userEmail: user?.email || '',
      payoutMethod: user?.payoutMethod || 'stripe',
      manualPayoutDetails: user?.manualPayoutDetails || null,
      stripeTransferId: c.stripeTransferId || null,
      failureReason: c.failureReason || null,
      paidAt: c.paidAt || null
    };
  });
}

export async function supabaseGetClaimById(claimId: string): Promise<Claim | null> {
  if (hasSupabaseConfig()) {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('skillbridge_claims').select('*').eq('id', claimId).maybeSingle();
      if (!error && data) {
        return {
          id: data.id,
          userId: data.user_id,
          amount: data.amount,
          status: data.status,
          requestedAt: data.requested_at,
          resolvedAt: data.resolved_at,
          stripeTransferId: data.stripe_transfer_id || null,
          failureReason: data.failure_reason || null,
          paidAt: data.paid_at || null
        };
      }
    } catch (err) {
      console.warn('[Supabase] GetClaimById failed, using fallback:', err);
    }
  }

  return inMemoryClaims.get(claimId) || null;
}

type PayClaimResult =
  | { outcome: 'paid'; stripeTransferId?: string | null }
  | { outcome: 'failed'; failureReason: string };

export async function supabasePayClaim(claimId: string, result: PayClaimResult): Promise<boolean> {
  if (hasSupabaseConfig()) {
    try {
      const supabase = getSupabaseClient();
      if (result.outcome === 'paid') {
        const now = new Date().toISOString();
        await supabase.from('skillbridge_claims').update({
          status: 'paid',
          resolved_at: now,
          paid_at: now,
          stripe_transfer_id: result.stripeTransferId || null,
          failure_reason: null
        }).eq('id', claimId);
        return true;
      }

      await supabase.from('skillbridge_claims').update({
        failure_reason: result.failureReason
      }).eq('id', claimId);
      return false;
    } catch (err) {
      console.warn('[Supabase] PayClaim failed, applying in memory:', err);
    }
  }

  const claim = inMemoryClaims.get(claimId);
  if (!claim) return false;
  if (result.outcome === 'paid') {
    const now = new Date().toISOString();
    claim.status = 'paid';
    claim.resolvedAt = now;
    claim.paidAt = now;
    claim.stripeTransferId = result.stripeTransferId || null;
    claim.failureReason = undefined;
    return true;
  } else {
    claim.failureReason = result.failureReason;
    return false;
  }
}

// CMS Operations
export async function supabaseCreateTrack(track: Track) {
  if (hasSupabaseConfig()) {
    try {
      const supabase = getSupabaseClient();
      await supabase.from('skillbridge_tracks').insert(track);
      return;
    } catch (err) {
      console.warn('[Supabase] CreateTrack failed, updating in memory:', err);
    }
  }
  inMemoryTracks.push(track);
}

export async function supabaseUpdateTrack(id: string, updates: Partial<Track>) {
  if (hasSupabaseConfig()) {
    try {
      const supabase = getSupabaseClient();
      await supabase.from('skillbridge_tracks').update(updates).eq('id', id);
      return;
    } catch (err) {
      console.warn('[Supabase] UpdateTrack failed, updating in memory:', err);
    }
  }
  const idx = inMemoryTracks.findIndex(t => t.id === id);
  if (idx >= 0) {
    inMemoryTracks[idx] = { ...inMemoryTracks[idx], ...updates };
  }
}

export async function supabaseDeleteTrack(id: string) {
  if (hasSupabaseConfig()) {
    try {
      const supabase = getSupabaseClient();
      await supabase.from('skillbridge_tracks').delete().eq('id', id);
      return;
    } catch (err) {
      console.warn('[Supabase] DeleteTrack failed, updating in memory:', err);
    }
  }
  inMemoryTracks = inMemoryTracks.filter(t => t.id !== id);
}

export async function supabaseCreateModule(mod: Module) {
  if (hasSupabaseConfig()) {
    try {
      const supabase = getSupabaseClient();
      await supabase.from('skillbridge_modules').insert({ id: mod.id, track_id: mod.trackId, title: mod.title, order: mod.order });
      return;
    } catch (err) {
      console.warn('[Supabase] CreateModule failed, updating in memory:', err);
    }
  }
  inMemoryModules.push(mod);
}

export async function supabaseUpdateModule(id: string, updates: Partial<Module>) {
  if (hasSupabaseConfig()) {
    try {
      const supabase = getSupabaseClient();
      const payload: any = {};
      if (updates.trackId) payload.track_id = updates.trackId;
      if (updates.title) payload.title = updates.title;
      if (updates.order !== undefined) payload.order = updates.order;
      await supabase.from('skillbridge_modules').update(payload).eq('id', id);
      return;
    } catch (err) {
      console.warn('[Supabase] UpdateModule failed, updating in memory:', err);
    }
  }
  const idx = inMemoryModules.findIndex(m => m.id === id);
  if (idx >= 0) {
    inMemoryModules[idx] = { ...inMemoryModules[idx], ...updates };
  }
}

export async function supabaseDeleteModule(id: string) {
  if (hasSupabaseConfig()) {
    try {
      const supabase = getSupabaseClient();
      await supabase.from('skillbridge_modules').delete().eq('id', id);
      return;
    } catch (err) {
      console.warn('[Supabase] DeleteModule failed, updating in memory:', err);
    }
  }
  inMemoryModules = inMemoryModules.filter(m => m.id !== id);
}

export async function supabaseCreateLesson(lesson: Lesson) {
  if (hasSupabaseConfig()) {
    try {
      const supabase = getSupabaseClient();
      await supabase.from('skillbridge_lessons').insert({ id: lesson.id, module_id: lesson.moduleId, title: lesson.title, order: lesson.order, estimated_minutes: lesson.estimatedMinutes, content: lesson.content });
      return;
    } catch (err) {
      console.warn('[Supabase] CreateLesson failed, updating in memory:', err);
    }
  }
  inMemoryLessons.push(lesson);
}

export async function supabaseUpdateLesson(id: string, updates: Partial<Lesson>) {
  if (hasSupabaseConfig()) {
    try {
      const supabase = getSupabaseClient();
      const payload: any = {};
      if (updates.moduleId) payload.module_id = updates.moduleId;
      if (updates.title) payload.title = updates.title;
      if (updates.order !== undefined) payload.order = updates.order;
      if (updates.estimatedMinutes !== undefined) payload.estimated_minutes = updates.estimatedMinutes;
      if (updates.content) payload.content = updates.content;
      await supabase.from('skillbridge_lessons').update(payload).eq('id', id);
      return;
    } catch (err) {
      console.warn('[Supabase] UpdateLesson failed, updating in memory:', err);
    }
  }
  const idx = inMemoryLessons.findIndex(l => l.id === id);
  if (idx >= 0) {
    inMemoryLessons[idx] = { ...inMemoryLessons[idx], ...updates };
  }
}

export async function supabaseDeleteLesson(id: string) {
  if (hasSupabaseConfig()) {
    try {
      const supabase = getSupabaseClient();
      await supabase.from('skillbridge_lessons').delete().eq('id', id);
      return;
    } catch (err) {
      console.warn('[Supabase] DeleteLesson failed, updating in memory:', err);
    }
  }
  inMemoryLessons = inMemoryLessons.filter(l => l.id !== id);
}

export async function supabaseCreateProject(project: Project) {
  if (hasSupabaseConfig()) {
    try {
      const supabase = getSupabaseClient();
      await supabase.from('skillbridge_projects').insert({ id: project.id, track_id: project.trackId, module_id: project.moduleId, type: project.type, title: project.title, description: project.description, requirements: project.requirements, rubric: project.rubric, reward_points: project.rewardPoints, reward_money: project.rewardMoney });
      return;
    } catch (err) {
      console.warn('[Supabase] CreateProject failed, updating in memory:', err);
    }
  }
  inMemoryProjects.push(project);
}

export async function supabaseUpdateProject(id: string, updates: Partial<Project>) {
  if (hasSupabaseConfig()) {
    try {
      const supabase = getSupabaseClient();
      const payload: any = {};
      if (updates.trackId) payload.track_id = updates.trackId;
      if (updates.moduleId) payload.module_id = updates.moduleId;
      if (updates.type) payload.type = updates.type;
      if (updates.title) payload.title = updates.title;
      if (updates.description) payload.description = updates.description;
      if (updates.requirements) payload.requirements = updates.requirements;
      if (updates.rubric) payload.rubric = updates.rubric;
      if (updates.rewardPoints !== undefined) payload.reward_points = updates.rewardPoints;
      if (updates.rewardMoney !== undefined) payload.reward_money = updates.rewardMoney;
      await supabase.from('skillbridge_projects').update(payload).eq('id', id);
      return;
    } catch (err) {
      console.warn('[Supabase] UpdateProject failed, updating in memory:', err);
    }
  }
  const idx = inMemoryProjects.findIndex(p => p.id === id);
  if (idx >= 0) {
    inMemoryProjects[idx] = { ...inMemoryProjects[idx], ...updates };
  }
}

export async function supabaseDeleteProject(id: string) {
  if (hasSupabaseConfig()) {
    try {
      const supabase = getSupabaseClient();
      await supabase.from('skillbridge_projects').delete().eq('id', id);
      return;
    } catch (err) {
      console.warn('[Supabase] DeleteProject failed, updating in memory:', err);
    }
  }
  inMemoryProjects = inMemoryProjects.filter(p => p.id !== id);
}

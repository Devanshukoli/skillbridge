import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User, Track, Module, Lesson, Project, Submission, Progress, Claim } from '../../frontend/src/types';
import bcrypt from 'bcryptjs';

let supabaseInstance: SupabaseClient | null = null;

// Lazy initialization of Supabase client
export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  try {
    // Basic verification of URL format
    if (!url.startsWith('http')) {
      console.warn('[Supabase] SUPABASE_URL must be a valid URL starting with http/https');
      return null;
    }
    supabaseInstance = createClient(url, anonKey);
    console.log('[Supabase] Initialized successfully. Connected to ' + url);
    return supabaseInstance;
  } catch (err) {
    console.error('[Supabase] Failed to initialize Supabase client:', err);
    return null;
  }
}

export function isSupabaseEnabled(): boolean {
  return getSupabaseClient() !== null;
}

// SQL Script generator for the user to copy-paste into their Supabase SQL editor
export function getSupabaseSQLSchema(): string {
  return `-- SQL Schema for SkillBridge tables. Copy and run this in your Supabase SQL Editor.

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS skillbridge_users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'student',
  points_balance INT NOT NULL DEFAULT 0,
  claimable_balance INT NOT NULL DEFAULT 0,
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  profile JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create Passwords table (for authentication)
CREATE TABLE IF NOT EXISTS skillbridge_passwords (
  user_id TEXT PRIMARY KEY REFERENCES skillbridge_users(id) ON DELETE CASCADE,
  password_hash TEXT NOT NULL
);

-- 3. Create Tracks Table
CREATE TABLE IF NOT EXISTS skillbridge_tracks (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT
);

-- 4. Create Modules Table
CREATE TABLE IF NOT EXISTS skillbridge_modules (
  id TEXT PRIMARY KEY,
  track_id TEXT REFERENCES skillbridge_tracks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  "order" INT NOT NULL
);

-- 5. Create Lessons Table
CREATE TABLE IF NOT EXISTS skillbridge_lessons (
  id TEXT PRIMARY KEY,
  module_id TEXT REFERENCES skillbridge_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  "order" INT NOT NULL,
  estimated_minutes INT NOT NULL,
  content TEXT NOT NULL
);

-- 6. Create Projects Table
CREATE TABLE IF NOT EXISTS skillbridge_projects (
  id TEXT PRIMARY KEY,
  track_id TEXT REFERENCES skillbridge_tracks(id) ON DELETE CASCADE,
  module_id TEXT REFERENCES skillbridge_modules(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'practice' or 'capstone'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT[] NOT NULL DEFAULT '{}',
  rubric TEXT[] NOT NULL DEFAULT '{}',
  reward_points INT NOT NULL DEFAULT 0,
  reward_money INT NOT NULL DEFAULT 0
);

-- 7. Create Submissions Table
CREATE TABLE IF NOT EXISTS skillbridge_submissions (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES skillbridge_users(id) ON DELETE CASCADE,
  project_id TEXT REFERENCES skillbridge_projects(id) ON DELETE CASCADE,
  repo_url TEXT NOT NULL,
  demo_url TEXT,
  writeup TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'submitted', -- 'submitted', 'approved', 'changes_requested', 'rejected'
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewer_id TEXT,
  reviewer_feedback TEXT,
  reviewed_at TIMESTAMPTZ
);

-- 8. Create Progress Table
CREATE TABLE IF NOT EXISTS skillbridge_progress (
  user_id TEXT REFERENCES skillbridge_users(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  type TEXT NOT NULL, -- 'lesson' or 'project'
  status TEXT NOT NULL, -- 'completed', 'submitted', 'approved'
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, item_id, type)
);

-- 9. Create Reward Claims Table
CREATE TABLE IF NOT EXISTS skillbridge_claims (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES skillbridge_users(id) ON DELETE CASCADE,
  amount INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'paid'
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Enable row level security (optional) or bypass for simple usage.
-- For quick prototyping, you can keep them open or configure policies as needed.
`;
}

// Database Operations mapping between Supabase schema and Local Types

export async function supabaseGetUser(email: string): Promise<{ user: User; passwordHash: string } | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data: userData, error: userError } = await supabase
      .from('skillbridge_users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (userError || !userData) {
      return null;
    }

    const { data: passData, error: passError } = await supabase
      .from('skillbridge_passwords')
      .select('password_hash')
      .eq('user_id', userData.id)
      .single();

    const user: User = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      pointsBalance: userData.points_balance,
      claimableBalance: userData.claimable_balance,
      profile: userData.profile,
      onboardingCompleted: userData.onboarding_completed,
      createdAt: userData.created_at
    };

    return {
      user,
      passwordHash: passData?.password_hash || ''
    };
  } catch (err) {
    console.error('[Supabase] Error fetching user:', err);
    return null;
  }
}

export async function supabaseGetUserById(id: string): Promise<User | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('skillbridge_users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
      pointsBalance: data.points_balance,
      claimableBalance: data.claimable_balance,
      profile: data.profile,
      onboardingCompleted: data.onboarding_completed,
      createdAt: data.created_at
    };
  } catch (err) {
    console.error('[Supabase] Error fetching user by ID:', err);
    return null;
  }
}

export async function supabaseCreateUser(user: User, passwordHash: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error: userError } = await supabase
      .from('skillbridge_users')
      .insert({
        id: user.id,
        name: user.name,
        email: user.email.toLowerCase(),
        role: user.role,
        points_balance: user.pointsBalance,
        claimable_balance: user.claimableBalance,
        profile: user.profile,
        onboarding_completed: user.onboardingCompleted,
        created_at: user.createdAt
      });

    if (userError) throw userError;

    const { error: passError } = await supabase
      .from('skillbridge_passwords')
      .insert({
        user_id: user.id,
        password_hash: passwordHash
      });

    if (passError) throw passError;

    return true;
  } catch (err) {
    console.error('[Supabase] Error creating user:', err);
    return false;
  }
}

export async function supabaseUpdateUserProfile(
  userId: string,
  updates: {
    name?: string;
    profile: any;
    onboardingCompleted?: boolean;
    pointsBalance?: number;
    claimableBalance?: number;
  }
): Promise<User | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const payload: any = {
      profile: updates.profile
    };

    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.onboardingCompleted !== undefined) payload.onboarding_completed = updates.onboardingCompleted;
    if (updates.pointsBalance !== undefined) payload.points_balance = updates.pointsBalance;
    if (updates.claimableBalance !== undefined) payload.claimable_balance = updates.claimableBalance;

    const { data, error } = await supabase
      .from('skillbridge_users')
      .update(payload)
      .eq('id', userId)
      .select()
      .single();

    if (error || !data) throw error;

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
      pointsBalance: data.points_balance,
      claimableBalance: data.claimable_balance,
      profile: data.profile,
      onboardingCompleted: data.onboarding_completed,
      createdAt: data.created_at
    };
  } catch (err) {
    console.error('[Supabase] Error updating user profile:', err);
    return null;
  }
}

// Seed helper for Supabase (if database tables exist and are empty)
export async function seedSupabaseIfNeeded(localDb: any) {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    // 1. Seed Tracks if empty
    const { count: trackCount } = await supabase.from('skillbridge_tracks').select('*', { count: 'exact', head: true });
    if (trackCount === 0 && localDb.tracks.length > 0) {
      console.log('[Supabase] Seeding Tracks...');
      await supabase.from('skillbridge_tracks').insert(localDb.tracks);
    }

    // 2. Seed Modules if empty
    const { count: modCount } = await supabase.from('skillbridge_modules').select('*', { count: 'exact', head: true });
    if (modCount === 0 && localDb.modules.length > 0) {
      console.log('[Supabase] Seeding Modules...');
      await supabase.from('skillbridge_modules').insert(localDb.modules.map((m: any) => ({
        id: m.id,
        track_id: m.trackId,
        title: m.title,
        order: m.order
      })));
    }

    // 3. Seed Lessons if empty
    const { count: lessCount } = await supabase.from('skillbridge_lessons').select('*', { count: 'exact', head: true });
    if (lessCount === 0 && localDb.lessons.length > 0) {
      console.log('[Supabase] Seeding Lessons...');
      await supabase.from('skillbridge_lessons').insert(localDb.lessons.map((l: any) => ({
        id: l.id,
        module_id: l.moduleId,
        title: l.title,
        order: l.order,
        estimated_minutes: l.estimatedMinutes,
        content: l.content
      })));
    }

    // 4. Seed Projects if empty
    const { count: projCount } = await supabase.from('skillbridge_projects').select('*', { count: 'exact', head: true });
    if (projCount === 0 && localDb.projects.length > 0) {
      console.log('[Supabase] Seeding Projects...');
      await supabase.from('skillbridge_projects').insert(localDb.projects.map((p: any) => ({
        id: p.id,
        track_id: p.trackId,
        module_id: p.moduleId,
        type: p.type,
        title: p.title,
        description: p.description,
        requirements: p.requirements,
        rubric: p.rubric,
        reward_points: p.rewardPoints,
        reward_money: p.rewardMoney
      })));
    }
    
    console.log('[Supabase] Seeding complete or skipped (already seeded).');
  } catch (err) {
    console.warn('[Supabase] Seed check failed (likely because tables are not created yet in Supabase SQL editor):', err);
  }
}

// Fetch all curriculum info from Supabase
export async function supabaseGetCurriculum(userId: string): Promise<any | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data: tracks } = await supabase.from('skillbridge_tracks').select('*');
    const { data: rawModules } = await supabase.from('skillbridge_modules').select('*').order('order', { ascending: true });
    const { data: rawLessons } = await supabase.from('skillbridge_lessons').select('*').order('order', { ascending: true });
    const { data: rawProjects } = await supabase.from('skillbridge_projects').select('*');
    const { data: progressData } = await supabase.from('skillbridge_progress').select('*').eq('user_id', userId);
    const { data: submissionsData } = await supabase.from('skillbridge_submissions').select('*').eq('user_id', userId);

    const modules: Module[] = (rawModules || []).map(m => ({
      id: m.id,
      trackId: m.track_id,
      title: m.title,
      order: m.order
    }));

    const lessons: Lesson[] = (rawLessons || []).map(l => ({
      id: l.id,
      moduleId: l.module_id,
      title: l.title,
      order: l.order,
      estimatedMinutes: l.estimated_minutes,
      content: l.content
    }));

    const projects: Project[] = (rawProjects || []).map(p => ({
      id: p.id,
      trackId: p.track_id,
      moduleId: p.module_id,
      type: p.type,
      title: p.title,
      description: p.description,
      requirements: p.requirements,
      rubric: p.rubric,
      rewardPoints: p.reward_points,
      rewardMoney: p.reward_money
    }));

    const progress: Progress[] = (progressData || []).map(p => ({
      userId: p.user_id,
      itemId: p.item_id,
      type: p.type,
      status: p.status,
      completedAt: p.completed_at
    }));

    const submissions: Submission[] = (submissionsData || []).map(s => ({
      id: s.id,
      userId: s.user_id,
      projectId: s.project_id,
      repoUrl: s.repo_url,
      demoUrl: s.demo_url || '',
      writeup: s.writeup,
      status: s.status,
      submittedAt: s.submitted_at,
      reviewerId: s.reviewer_id || undefined,
      reviewerFeedback: s.reviewer_feedback || undefined,
      reviewedAt: s.reviewed_at || undefined
    }));

    return {
      tracks: tracks || [],
      modules,
      lessons,
      projects,
      progress,
      submissions
    };
  } catch (err) {
    console.error('[Supabase] Error loading curriculum:', err);
    return null;
  }
}

// Complete lesson
export async function supabaseCompleteLesson(userId: string, lessonId: string, xpPoints: number): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    // Check if progress already exists
    const { data: existing } = await supabase
      .from('skillbridge_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('item_id', lessonId)
      .eq('type', 'lesson')
      .maybeSingle();

    if (existing) return false;

    // Create progress record
    const { error: progError } = await supabase
      .from('skillbridge_progress')
      .insert({
        user_id: userId,
        item_id: lessonId,
        type: 'lesson',
        status: 'completed',
        completed_at: new Date().toISOString()
      });

    if (progError) throw progError;

    // Update user points
    const { data: userData, error: userErr } = await supabase
      .from('skillbridge_users')
      .select('points_balance')
      .eq('id', userId)
      .single();

    if (userData) {
      await supabase
        .from('skillbridge_users')
        .update({ points_balance: userData.points_balance + xpPoints })
        .eq('id', userId);
    }

    return true;
  } catch (err) {
    console.error('[Supabase] Error completing lesson:', err);
    return false;
  }
}

// Create project submission
export async function supabaseSubmitProject(submission: Submission): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error: subError } = await supabase
      .from('skillbridge_submissions')
      .insert({
        id: submission.id,
        user_id: submission.userId,
        project_id: submission.projectId,
        repo_url: submission.repoUrl,
        demo_url: submission.demoUrl,
        writeup: submission.writeup,
        status: submission.status,
        submitted_at: submission.submittedAt
      });

    if (subError) throw subError;

    // Upsert progress
    const { error: progError } = await supabase
      .from('skillbridge_progress')
      .upsert({
        user_id: submission.userId,
        item_id: submission.projectId,
        type: 'project',
        status: 'submitted',
        completed_at: new Date().toISOString()
      }, { onConflict: 'user_id,item_id,type' });

    if (progError) throw progError;

    return true;
  } catch (err) {
    console.error('[Supabase] Error submitting project:', err);
    return false;
  }
}

// Get claims for user
export async function supabaseGetUserClaims(userId: string): Promise<Claim[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('skillbridge_claims')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    return (data || []).map(c => ({
      id: c.id,
      userId: c.user_id,
      amount: c.amount,
      status: c.status,
      requestedAt: c.requested_at,
      resolvedAt: c.resolved_at || undefined
    }));
  } catch (err) {
    console.error('[Supabase] Error loading claims:', err);
    return null;
  }
}

// Request a reward claim
export async function supabaseCreateClaimRequest(claim: Claim): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error: claimError } = await supabase
      .from('skillbridge_claims')
      .insert({
        id: claim.id,
        user_id: claim.userId,
        amount: claim.amount,
        status: claim.status,
        requested_at: claim.requestedAt
      });

    if (claimError) throw claimError;

    // Fetch user claimable balance
    const user = await supabaseGetUserById(claim.userId);
    if (user) {
      const newClaimableBalance = Math.max(0, user.claimableBalance - claim.amount);
      await supabase
        .from('skillbridge_users')
        .update({ claimable_balance: newClaimableBalance })
        .eq('id', claim.userId);
    }

    return true;
  } catch (err) {
    console.error('[Supabase] Error creating claim:', err);
    return false;
  }
}

// Admin: Get all submissions
export async function supabaseGetAllSubmissions(): Promise<any[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    // Perform joint query via select relation or fetch collections and map
    const { data: subs, error } = await supabase
      .from('skillbridge_submissions')
      .select(`
        *,
        skillbridge_users ( name, email ),
        skillbridge_projects ( title, type, reward_points, reward_money )
      `);

    if (error) throw error;

    return (subs || []).map(s => ({
      id: s.id,
      userId: s.user_id,
      projectId: s.project_id,
      repoUrl: s.repo_url,
      demoUrl: s.demo_url,
      writeup: s.writeup,
      status: s.status,
      submittedAt: s.submitted_at,
      reviewerId: s.reviewer_id,
      reviewerFeedback: s.reviewer_feedback,
      reviewedAt: s.reviewed_at,
      projectTitle: s.skillbridge_projects?.title || 'Unknown Project',
      projectType: s.skillbridge_projects?.type || 'practice',
      userName: s.skillbridge_users?.name || 'Deleted Student',
      userEmail: s.skillbridge_users?.email || ''
    }));
  } catch (err) {
    console.error('[Supabase] Error fetching all submissions:', err);
    return null;
  }
}

// Admin: Review submission
export async function supabaseReviewSubmission(
  submissionId: string,
  status: string,
  feedback: string,
  reviewerId: string
): Promise<{ success: boolean; submission?: any } | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const reviewedAt = new Date().toISOString();
    const { data: sub, error: subErr } = await supabase
      .from('skillbridge_submissions')
      .update({
        status,
        reviewer_id: reviewerId,
        reviewer_feedback: feedback,
        reviewed_at: reviewedAt
      })
      .eq('id', submissionId)
      .select()
      .single();

    if (subErr || !sub) throw subErr;

    // Update associated progress
    await supabase
      .from('skillbridge_progress')
      .update({ status: status === 'approved' ? 'approved' : 'submitted' })
      .eq('user_id', sub.user_id)
      .eq('item_id', sub.project_id)
      .eq('type', 'project');

    // Award rewards if approved
    if (status === 'approved') {
      const student = await supabaseGetUserById(sub.user_id);
      const { data: project } = await supabase
        .from('skillbridge_projects')
        .select('*')
        .eq('id', sub.project_id)
        .single();

      if (student && project) {
        let updatedPoints = student.pointsBalance + (project.reward_points || 0);
        let updatedClaimable = student.claimableBalance;

        if (project.type === 'capstone' && project.reward_money) {
          updatedClaimable += project.reward_money;
        }

        await supabase
          .from('skillbridge_users')
          .update({
            points_balance: updatedPoints,
            claimable_balance: updatedClaimable
          })
          .eq('id', sub.user_id);
      }
    }

    return { success: true, submission: sub };
  } catch (err) {
    console.error('[Supabase] Error reviewing submission:', err);
    return { success: false };
  }
}

// Admin: Get all claims
export async function supabaseGetAllClaims(): Promise<any[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('skillbridge_claims')
      .select(`
        *,
        skillbridge_users ( name, email )
      `);

    if (error) throw error;

    return (data || []).map(c => ({
      id: c.id,
      userId: c.user_id,
      amount: c.amount,
      status: c.status,
      requestedAt: c.requested_at,
      resolvedAt: c.resolved_at,
      userName: c.skillbridge_users?.name || 'Unknown User',
      userEmail: c.skillbridge_users?.email || ''
    }));
  } catch (err) {
    console.error('[Supabase] Error fetching all claims:', err);
    return null;
  }
}

// Admin: Pay claim
export async function supabasePayClaim(claimId: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('skillbridge_claims')
      .update({
        status: 'paid',
        resolved_at: new Date().toISOString()
      })
      .eq('id', claimId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('[Supabase] Error paying claim:', err);
    return false;
  }
}

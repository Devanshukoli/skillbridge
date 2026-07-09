import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User, Track, Module, Lesson, Project, Submission, Progress, Claim, SubmissionHistory } from '../../frontend/src/types';

let supabaseInstance: SupabaseClient | null = null;

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

// User Operations
export async function supabaseGetUser(email: string): Promise<{ user: User; passwordHash: string } | null> {
  const supabase = getSupabaseClient();
  const { data: userData, error: userError } = await supabase
    .from('skillbridge_users')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();

  if (userError || !userData) return null;

  const { data: passData } = await supabase
    .from('skillbridge_passwords')
    .select('password_hash')
    .eq('user_id', userData.id)
    .single();

  const user: User = {
    id: userData.id,
    name: userData.name,
    email: userData.email,
    role: userData.role,
    status: userData.status,
    pointsBalance: userData.points_balance,
    claimableBalance: userData.claimable_balance,
    profile: userData.profile,
    onboardingCompleted: userData.onboarding_completed,
    createdAt: userData.created_at
  };

  return { user, passwordHash: passData?.password_hash || '' };
}

export async function supabaseGetUserById(id: string): Promise<User | null> {
  const supabase = getSupabaseClient();
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
    status: data.status,
    pointsBalance: data.points_balance,
    claimableBalance: data.claimable_balance,
    profile: data.profile,
    onboardingCompleted: data.onboarding_completed,
    createdAt: data.created_at
  };
}

export async function supabaseCreateUser(user: User, passwordHash: string): Promise<boolean> {
  const supabase = getSupabaseClient();
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
      created_at: user.createdAt
    });

  if (userError) throw userError;

  const { error: passError } = await supabase
    .from('skillbridge_passwords')
    .insert({ user_id: user.id, password_hash: passwordHash });

  if (passError) throw passError;
  return true;
}

export async function supabaseUpdatePassword(userId: string, passwordHash: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('skillbridge_passwords')
    .upsert({ user_id: userId, password_hash: passwordHash });
  if (error) throw error;
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
  }
): Promise<User | null> {
  const supabase = getSupabaseClient();
  const payload: any = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.profile !== undefined) payload.profile = updates.profile;
  if (updates.onboardingCompleted !== undefined) payload.onboarding_completed = updates.onboardingCompleted;
  if (updates.pointsBalance !== undefined) payload.points_balance = updates.pointsBalance;
  if (updates.claimableBalance !== undefined) payload.claimable_balance = updates.claimableBalance;
  if (updates.status !== undefined) payload.status = updates.status;

  const { data, error } = await supabase
    .from('skillbridge_users')
    .update(payload)
    .eq('id', userId)
    .select()
    .single();

  if (error || !data) throw error;
  return supabaseGetUserById(userId);
}

export async function supabaseGetAllUsers(): Promise<User[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('skillbridge_users').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(d => ({
    id: d.id,
    name: d.name,
    email: d.email,
    role: d.role,
    status: d.status,
    pointsBalance: d.points_balance,
    claimableBalance: d.claimable_balance,
    profile: d.profile,
    onboardingCompleted: d.onboarding_completed,
    createdAt: d.created_at
  }));
}

// Curriculum Operations
export async function supabaseGetCurriculum(userId: string): Promise<any | null> {
  const supabase = getSupabaseClient();
  const { data: tracks } = await supabase.from('skillbridge_tracks').select('*');
  const { data: rawModules } = await supabase.from('skillbridge_modules').select('*').order('order', { ascending: true });
  const { data: rawLessons } = await supabase.from('skillbridge_lessons').select('*').order('order', { ascending: true });
  const { data: rawProjects } = await supabase.from('skillbridge_projects').select('*');
  const { data: progressData } = await supabase.from('skillbridge_progress').select('*').eq('user_id', userId);
  const { data: submissionsData } = await supabase.from('skillbridge_submissions').select('*').eq('user_id', userId);

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

  const currentTrackId = Object.keys(trackScores).sort((a, b) => trackScores[b] - trackScores[a])[0] || tracks?.[0]?.id || '';

  return { tracks: tracks || [], modules, lessons, projects, progress, submissions, currentTrackId };
}

export async function supabaseCompleteLesson(userId: string, lessonId: string, xpPoints: number): Promise<boolean> {
  const supabase = getSupabaseClient();
  const { data: existing } = await supabase.from('skillbridge_progress').select('*').eq('user_id', userId).eq('item_id', lessonId).eq('type', 'lesson').maybeSingle();
  if (existing) return false;

  await supabase.from('skillbridge_progress').insert({ user_id: userId, item_id: lessonId, type: 'lesson', status: 'completed', completed_at: new Date().toISOString() });
  const { data: userData } = await supabase.from('skillbridge_users').select('points_balance').eq('id', userId).single();
  if (userData) {
    await supabase.from('skillbridge_users').update({ points_balance: userData.points_balance + xpPoints }).eq('id', userId);
  }
  return true;
}

// Submission Operations
export async function supabaseSubmitProject(submission: Submission): Promise<boolean> {
  const supabase = getSupabaseClient();
  await supabase.from('skillbridge_submissions').insert({
    id: submission.id, user_id: submission.userId, project_id: submission.projectId, repo_url: submission.repoUrl, demo_url: submission.demoUrl, writeup: submission.writeup, status: submission.status, submitted_at: submission.submittedAt
  });
  await supabase.from('skillbridge_progress').upsert({
    user_id: submission.userId, item_id: submission.projectId, type: 'project', status: 'submitted', completed_at: new Date().toISOString()
  }, { onConflict: 'user_id,item_id,type' });
  return true;
}

export async function supabaseGetAllSubmissions(): Promise<any[] | null> {
  const supabase = getSupabaseClient();
  const { data: subs, error } = await supabase.from('skillbridge_submissions').select(`*, skillbridge_users ( name, email ), skillbridge_projects ( title, type, reward_points, reward_money )`).order('submitted_at', { ascending: false });
  if (error) throw error;
  return (subs || []).map(s => ({
    id: s.id, userId: s.user_id, projectId: s.project_id, repoUrl: s.repo_url, demoUrl: s.demo_url, writeup: s.writeup, status: s.status, submittedAt: s.submitted_at, reviewerId: s.reviewer_id, reviewerFeedback: s.reviewer_feedback, reviewedAt: s.reviewed_at,
    projectTitle: s.skillbridge_projects?.title || 'Unknown Project', projectType: s.skillbridge_projects?.type || 'practice', userName: s.skillbridge_users?.name || 'Deleted Student', userEmail: s.skillbridge_users?.email || ''
  }));
}

export async function supabaseReviewSubmission(submissionId: string, status: string, feedback: string, reviewerId: string): Promise<{ success: boolean; submission?: any } | null> {
  const supabase = getSupabaseClient();
  const reviewedAt = new Date().toISOString();
  
  const { data: oldSub } = await supabase.from('skillbridge_submissions').select('status').eq('id', submissionId).single();
  
  const { data: sub, error: subErr } = await supabase.from('skillbridge_submissions').update({
    status, reviewer_id: reviewerId, reviewer_feedback: feedback, reviewed_at: reviewedAt
  }).eq('id', submissionId).select().single();

  if (subErr || !sub) throw subErr;

  // Log to history
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

export async function supabaseGetSubmissionHistory(submissionId: string): Promise<SubmissionHistory[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('skillbridge_submission_history').select(`*, skillbridge_users(name)`).eq('submission_id', submissionId).order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []).map(d => ({
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

// Claims Operations
export async function supabaseGetUserClaims(userId: string): Promise<Claim[] | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('skillbridge_claims').select('*').eq('user_id', userId);
  if (error) throw error;
  return (data || []).map(c => ({ id: c.id, userId: c.user_id, amount: c.amount, status: c.status, requestedAt: c.requested_at, resolvedAt: c.resolved_at || undefined }));
}

export async function supabaseCreateClaimRequest(claim: Claim): Promise<boolean> {
  const supabase = getSupabaseClient();
  await supabase.from('skillbridge_claims').insert({ id: claim.id, user_id: claim.userId, amount: claim.amount, status: claim.status, requested_at: claim.requestedAt });
  const user = await supabaseGetUserById(claim.userId);
  if (user) {
    const newClaimableBalance = Math.max(0, user.claimableBalance - claim.amount);
    await supabase.from('skillbridge_users').update({ claimable_balance: newClaimableBalance }).eq('id', claim.userId);
  }
  return true;
}

export async function supabaseGetAllClaims(): Promise<any[] | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('skillbridge_claims').select(`*, skillbridge_users ( name, email )`);
  if (error) throw error;
  return (data || []).map(c => ({ id: c.id, userId: c.user_id, amount: c.amount, status: c.status, requestedAt: c.requested_at, resolvedAt: c.resolved_at, userName: c.skillbridge_users?.name || 'Unknown User', userEmail: c.skillbridge_users?.email || '' }));
}

export async function supabasePayClaim(claimId: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  await supabase.from('skillbridge_claims').update({ status: 'paid', resolved_at: new Date().toISOString() }).eq('id', claimId);
  return true;
}

// CMS Operations
export async function supabaseCreateTrack(track: Track) {
  const supabase = getSupabaseClient();
  await supabase.from('skillbridge_tracks').insert(track);
}
export async function supabaseUpdateTrack(id: string, updates: Partial<Track>) {
  const supabase = getSupabaseClient();
  await supabase.from('skillbridge_tracks').update(updates).eq('id', id);
}
export async function supabaseDeleteTrack(id: string) {
  const supabase = getSupabaseClient();
  await supabase.from('skillbridge_tracks').delete().eq('id', id);
}

export async function supabaseCreateModule(mod: Module) {
  const supabase = getSupabaseClient();
  await supabase.from('skillbridge_modules').insert({ id: mod.id, track_id: mod.trackId, title: mod.title, order: mod.order });
}
export async function supabaseUpdateModule(id: string, updates: Partial<Module>) {
  const supabase = getSupabaseClient();
  const payload: any = {};
  if (updates.trackId) payload.track_id = updates.trackId;
  if (updates.title) payload.title = updates.title;
  if (updates.order !== undefined) payload.order = updates.order;
  await supabase.from('skillbridge_modules').update(payload).eq('id', id);
}
export async function supabaseDeleteModule(id: string) {
  const supabase = getSupabaseClient();
  await supabase.from('skillbridge_modules').delete().eq('id', id);
}

export async function supabaseCreateLesson(lesson: Lesson) {
  const supabase = getSupabaseClient();
  await supabase.from('skillbridge_lessons').insert({ id: lesson.id, module_id: lesson.moduleId, title: lesson.title, order: lesson.order, estimated_minutes: lesson.estimatedMinutes, content: lesson.content });
}
export async function supabaseUpdateLesson(id: string, updates: Partial<Lesson>) {
  const supabase = getSupabaseClient();
  const payload: any = {};
  if (updates.moduleId) payload.module_id = updates.moduleId;
  if (updates.title) payload.title = updates.title;
  if (updates.order !== undefined) payload.order = updates.order;
  if (updates.estimatedMinutes !== undefined) payload.estimated_minutes = updates.estimatedMinutes;
  if (updates.content) payload.content = updates.content;
  await supabase.from('skillbridge_lessons').update(payload).eq('id', id);
}
export async function supabaseDeleteLesson(id: string) {
  const supabase = getSupabaseClient();
  await supabase.from('skillbridge_lessons').delete().eq('id', id);
}

export async function supabaseCreateProject(project: Project) {
  const supabase = getSupabaseClient();
  await supabase.from('skillbridge_projects').insert({ id: project.id, track_id: project.trackId, module_id: project.moduleId, type: project.type, title: project.title, description: project.description, requirements: project.requirements, rubric: project.rubric, reward_points: project.rewardPoints, reward_money: project.rewardMoney });
}
export async function supabaseUpdateProject(id: string, updates: Partial<Project>) {
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
}
export async function supabaseDeleteProject(id: string) {
  const supabase = getSupabaseClient();
  await supabase.from('skillbridge_projects').delete().eq('id', id);
}

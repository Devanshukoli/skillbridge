import { User, Submission, Progress } from '../../../frontend/src/types';
import { loadDb, saveDb } from '../../server/db';
import { loadCompiledContent } from '../../content/content-store';
import {
  isSupabaseEnabled,
  supabaseSubmitProject,
  supabaseGetAllSubmissions,
  supabaseReviewSubmission,
  supabaseGetCurriculum
} from '../../server/supabase';

export class SubmissionsService {
  async submitProject(user: User, projectId: string, repoUrl: string, demoUrl: string, writeup: string): Promise<Submission> {
    // 1. Validation check
    let projectExists = false;
    let alreadyApproved = false;

    if (isSupabaseEnabled()) {
      const curriculum = await supabaseGetCurriculum(user.id);
      if (curriculum) {
        const project = curriculum.projects.find((p: any) => p.id === projectId);
        projectExists = !!project;
        alreadyApproved = curriculum.submissions.some((s: any) => s.projectId === projectId && s.status === 'approved');
      }
    } else {
      const db = loadDb();
      const content = loadCompiledContent();
      const project = content.projects.find(p => p.id === projectId);
      projectExists = !!project;
      alreadyApproved = db.submissions.some(s => s.userId === user.id && s.projectId === projectId && s.status === 'approved');
    }

    if (!projectExists) {
      throw new Error('Project not found');
    }
    if (alreadyApproved) {
      throw new Error('You have already completed and passed this project!');
    }

    // 2. Create submission object
    const submissionId = 'sub-' + Date.now().toString();
    const newSubmission: Submission = {
      id: submissionId,
      userId: user.id,
      projectId,
      repoUrl,
      demoUrl: demoUrl || '',
      writeup,
      status: 'submitted',
      submittedAt: new Date().toISOString()
    };

    // 3. Persist
    if (isSupabaseEnabled()) {
      const success = await supabaseSubmitProject(newSubmission);
      if (!success) {
        throw new Error('Failed to submit project to Supabase');
      }
    } else {
      const db = loadDb();
      db.submissions.push(newSubmission);

      // Update progress to submitted
      const existingProg = db.progress.find(p => p.userId === user.id && p.itemId === projectId && p.type === 'project');
      if (existingProg) {
        existingProg.status = 'submitted';
        existingProg.completedAt = new Date().toISOString();
      } else {
        db.progress.push({
          userId: user.id,
          itemId: projectId,
          type: 'project',
          status: 'submitted',
          completedAt: new Date().toISOString()
        });
      }

      saveDb(db);
    }

    return newSubmission;
  }

  async getAllSubmissions(): Promise<any[]> {
    if (isSupabaseEnabled()) {
      const subs = await supabaseGetAllSubmissions();
      if (subs !== null) {
        return subs;
      }
    }

    const db = loadDb();
    const content = loadCompiledContent();
    return db.submissions.map(sub => {
      const user = db.users.find(u => u.id === sub.userId);
      const project = content.projects.find(p => p.id === sub.projectId);
      return {
        ...sub,
        projectTitle: project?.title || 'Unknown Project',
        projectType: project?.type || 'practice',
        userName: user?.name || 'Deleted Student',
        userEmail: user?.email || ''
      };
    });
  }

  async reviewSubmission(reviewer: User, submissionId: string, status: 'approved' | 'changes_requested' | 'rejected', feedback: string): Promise<any> {
    if (isSupabaseEnabled()) {
      const result = await supabaseReviewSubmission(submissionId, status, feedback || '', reviewer.id);
      if (result && result.success) {
        return result.submission;
      }
      throw new Error('Failed to review submission in Supabase');
    }

    const db = loadDb();
    const sub = db.submissions.find(s => s.id === submissionId);
    if (!sub) {
      throw new Error('Submission not found');
    }

    sub.status = status;
    sub.reviewerId = reviewer.id;
    sub.reviewerFeedback = feedback || '';
    sub.reviewedAt = new Date().toISOString();

    // Update associated progress
    const prog = db.progress.find(p => p.userId === sub.userId && p.itemId === sub.projectId && p.type === 'project');
    if (prog) {
      prog.status = status === 'approved' ? 'approved' : 'submitted';
      prog.completedAt = new Date().toISOString();
    }

    // Credit points/money if approved
    if (status === 'approved') {
      const content = loadCompiledContent();
      const project = content.projects.find(p => p.id === sub.projectId);
      const student = db.users.find(u => u.id === sub.userId);
      
      if (project && student) {
        student.pointsBalance += project.rewardPoints;
        if (project.type === 'capstone' && project.rewardMoney) {
          student.claimableBalance += project.rewardMoney;
        }
      }
    }

    saveDb(db);
    return sub;
  }
}

export const submissionsService = new SubmissionsService();

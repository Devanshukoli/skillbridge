import { User, Submission } from '../../../frontend/src/types';
import {
  supabaseSubmitProject,
  supabaseGetAllSubmissions,
  supabaseReviewSubmission,
  supabaseGetCurriculum
} from '../../server/supabase';

export class SubmissionsService {
  async submitProject(user: User, projectId: string, repoUrl: string, demoUrl: string, writeup: string): Promise<Submission> {
    const curriculum = await supabaseGetCurriculum(user.id);
    let projectExists = false;
    let alreadyApproved = false;

    if (curriculum) {
      const project = curriculum.projects.find((p: any) => p.id === projectId);
      projectExists = !!project;
      alreadyApproved = curriculum.submissions.some((s: any) => s.projectId === projectId && s.status === 'approved');
    }

    if (!projectExists) {
      throw new Error('Project not found');
    }
    if (alreadyApproved) {
      throw new Error('You have already completed and passed this project!');
    }

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

    const success = await supabaseSubmitProject(newSubmission);
    if (!success) {
      throw new Error('Failed to submit project to Supabase');
    }

    return newSubmission;
  }

  async getAllSubmissions(): Promise<any[]> {
    const subs = await supabaseGetAllSubmissions();
    return subs || [];
  }

  async reviewSubmission(reviewer: User, submissionId: string, status: 'approved' | 'changes_requested' | 'rejected', feedback: string): Promise<any> {
    const result = await supabaseReviewSubmission(submissionId, status, feedback || '', reviewer.id);
    if (result && result.success) {
      return result.submission;
    }
    throw new Error('Failed to review submission in Supabase');
  }
}

export const submissionsService = new SubmissionsService();

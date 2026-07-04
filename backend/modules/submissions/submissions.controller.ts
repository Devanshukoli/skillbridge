import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth';
import { submissionsService } from './submissions.service';

export class SubmissionsController {
  // Post a new project submission (Student)
  async submitProject(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { projectId, repoUrl, demoUrl, writeup } = req.body;

      if (!projectId || !repoUrl || !writeup) {
        return res.status(400).json({ error: 'Project ID, repository URL, and write-up are required' });
      }

      const submission = await submissionsService.submitProject(user, projectId, repoUrl, demoUrl, writeup);
      res.status(201).json({ submission });
    } catch (err: any) {
      if (err.message === 'Project not found') {
        return res.status(404).json({ error: err.message });
      }
      if (err.message === 'You have already completed and passed this project!') {
        return res.status(400).json({ error: err.message });
      }
      next(err);
    }
  }

  // Get all submissions for review (Admin Only)
  async getAllSubmissions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const submissions = await submissionsService.getAllSubmissions();
      res.json(submissions);
    } catch (err) {
      next(err);
    }
  }

  // Review a submission (Admin Only)
  async reviewSubmission(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const reviewer = req.user;
      if (!reviewer) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const submissionId = req.params.id;
      const { status, feedback } = req.body;

      if (!status || !['approved', 'changes_requested', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Valid status is required (approved, changes_requested, rejected)' });
      }

      const submission = await submissionsService.reviewSubmission(reviewer, submissionId, status, feedback);
      res.json({ success: true, submission });
    } catch (err: any) {
      if (err.message === 'Submission not found') {
        return res.status(404).json({ error: err.message });
      }
      next(err);
    }
  }
}

export const submissionsController = new SubmissionsController();

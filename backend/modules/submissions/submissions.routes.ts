import { Router } from 'express';
import { authenticate, requireAdmin } from '../../middlewares/auth';
import { submissionsController } from './submissions.controller';

const router = Router();

// Student submission endpoint
router.post('/submissions', authenticate, (req, res, next) => submissionsController.submitProject(req, res, next));

// Admin endpoints
router.get('/admin/submissions', authenticate, requireAdmin, (req, res, next) => submissionsController.getAllSubmissions(req, res, next));
router.post('/admin/submissions/:id/review', authenticate, requireAdmin, (req, res, next) => submissionsController.reviewSubmission(req, res, next));

export default router;

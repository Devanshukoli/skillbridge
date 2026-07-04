import { Router } from 'express';
import { authenticate } from '../../middlewares/auth';
import { curriculumController } from './curriculum.controller';

const router = Router();

// /api endpoints matching original locations
router.get('/curriculum', authenticate, (req, res, next) => curriculumController.getCurriculum(req, res, next));
router.post('/lessons/:id/complete', authenticate, (req, res, next) => curriculumController.completeLesson(req, res, next));

export default router;

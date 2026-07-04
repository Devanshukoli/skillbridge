import { Router } from 'express';
import { authenticate } from '../../middlewares/auth';
import { profileController } from './profile.controller';

const router = Router();

// Endpoint paths matching the original routes: /api/onboarding and /api/profile
router.post('/onboarding', authenticate, (req, res, next) => profileController.completeOnboarding(req, res, next));
router.post('/profile', authenticate, (req, res, next) => profileController.updateProfile(req, res, next));

export default router;

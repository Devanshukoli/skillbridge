import { Router } from 'express';
import { authController } from './auth.controller';

const router = Router();

// /api/auth endpoints
router.get('/supabase-status', (req, res, next) => authController.supabaseStatus(req, res, next));
router.post('/register', (req, res, next) => authController.register(req, res, next));
router.post('/login', (req, res, next) => authController.login(req, res, next));
router.post('/logout', (req, res, next) => authController.logout(req, res, next));
router.get('/me', (req, res, next) => authController.me(req, res, next));
router.post('/google-sim', (req, res, next) => authController.googleSim(req, res, next));

export default router;

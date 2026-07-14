import { Router } from 'express';
import { authController } from './auth.controller';
import { authenticate } from '../../middlewares/auth';

const router = Router();

// /api/auth endpoints
router.get('/supabase-status', (req, res, next) => authController.supabaseStatus(req, res, next));
router.post('/register', (req, res, next) => authController.register(req, res, next));
router.post('/login', (req, res, next) => authController.login(req, res, next));
router.post('/logout', (req, res, next) => authController.logout(req, res, next));
router.post('/change-password', authenticate, (req, res, next) => authController.changePassword(req, res, next));
router.get('/me', (req, res, next) => authController.me(req, res, next));
router.get('/google', (req, res, next) => authController.googleRedirect(req, res, next));
router.get('/google/callback', (req, res, next) => authController.googleCallback(req, res, next));
router.post('/2fa/generate-secret', authenticate, (req, res, next) => authController.generateTwoFactorSecret(req, res, next));
router.post('/2fa/enable', authenticate, (req, res, next) => authController.enableTwoFactor(req, res, next));
router.post('/2fa/disable', authenticate, (req, res, next) => authController.disableTwoFactor(req, res, next));
router.post('/2fa/verify', (req, res, next) => authController.verifyTwoFactorToken(req, res, next));

export default router;

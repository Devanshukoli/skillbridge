import { Router } from 'express';
import { authenticate, requireAdmin } from '../../middlewares/auth';
import { claimsController } from './claims.controller';

const router = Router();

// Student claims endpoints
router.get('/claims', authenticate, (req, res, next) => claimsController.getUserClaims(req, res, next));
router.post('/claims/request', authenticate, (req, res, next) => claimsController.createClaimRequest(req, res, next));

// Admin claims endpoints
router.get('/admin/claims', authenticate, requireAdmin, (req, res, next) => claimsController.getAllClaims(req, res, next));
router.post('/admin/claims/:id/pay', authenticate, requireAdmin, (req, res, next) => claimsController.payClaim(req, res, next));

export default router;

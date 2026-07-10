import express, { Router } from 'express';
import { authenticate } from '../../middlewares/auth';
import { paymentsController } from './payments.controller';

const router = Router();
const webhookRouter = Router();

router.post('/payments/connect', authenticate, (req, res, next) => paymentsController.connect(req, res, next));
router.get('/payments/status', authenticate, (req, res, next) => paymentsController.status(req, res, next));
router.post('/payments/refresh', authenticate, (req, res, next) => paymentsController.refresh(req, res, next));
router.delete('/payments/connect', authenticate, (req, res, next) => paymentsController.disconnect(req, res, next));

webhookRouter.post('/payments/webhook', express.raw({ type: 'application/json' }), (req, res, next) => paymentsController.webhook(req, res, next));

export { webhookRouter as paymentsWebhookRouter };
export default router;

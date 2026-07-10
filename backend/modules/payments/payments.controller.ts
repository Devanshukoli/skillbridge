import { NextFunction, Request, Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth';
import { paymentsService } from './payments.service';

export class PaymentsController {
  async connect(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await paymentsService.createConnectAccount(user);
      res.json(result);
    } catch (err: any) {
      if (err.message === 'Stripe is not configured') {
        return res.status(503).json({ error: err.message });
      }
      if (err.message === 'User not found') {
        return res.status(404).json({ error: err.message });
      }
      next(err);
    }
  }

  async status(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const status = await paymentsService.getStatus(user);
      res.json(status);
    } catch (err) {
      next(err);
    }
  }

  async refresh(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const status = await paymentsService.refreshStatus(user);
      res.json(status);
    } catch (err: any) {
      if (err.message === 'Stripe is not configured') {
        return res.status(503).json({ error: err.message });
      }
      if (err.message === 'User not found') {
        return res.status(404).json({ error: err.message });
      }
      next(err);
    }
  }

  async disconnect(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const status = await paymentsService.disconnect(user);
      res.json(status);
    } catch (err: any) {
      if (err.message === 'Stripe is not configured') {
        return res.status(503).json({ error: err.message });
      }
      if (err.message === 'User not found') {
        return res.status(404).json({ error: err.message });
      }
      next(err);
    }
  }

  async webhook(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await paymentsService.handleWebhook(req.body as Buffer, req.headers['stripe-signature']);
      res.json(result);
    } catch (err: any) {
      if (
        err.message === 'Stripe webhook secret is not configured' ||
        err.message === 'Invalid Stripe webhook signature' ||
        err.type === 'StripeSignatureVerificationError'
      ) {
        return res.status(400).json({ error: err.message });
      }
      next(err);
    }
  }
}

export const paymentsController = new PaymentsController();

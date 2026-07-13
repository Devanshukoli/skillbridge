import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth';
import { claimsService } from './claims.service';

export class ClaimsController {
  async getClaimEligibility(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const eligibility = await claimsService.getClaimEligibility(user);
      res.json(eligibility);
    } catch (err) {
      next(err);
    }
  }

  // Get claims for authenticated user
  async getUserClaims(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const claims = await claimsService.getUserClaims(user);
      res.json(claims);
    } catch (err) {
      next(err);
    }
  }

  // Request a new claim
  async createClaimRequest(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { amount } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Invalid claim amount' });
      }

      const result = await claimsService.createClaimRequest(user, amount);
      res.status(201).json(result);
    } catch (err: any) {
      if (err.message === 'Insufficient claimable balance') {
        return res.status(400).json({ error: err.message });
      }
      if (err.message === 'Stripe account is not connected') {
        return res.status(409).json({ error: 'Connect Stripe before claiming rewards.' });
      }
      if (err.message === 'Stripe payouts are not enabled') {
        return res.status(409).json({ error: 'Your Stripe account is still being verified. Finish onboarding to receive payouts.' });
      }
      if (err.message === 'User not found') {
        return res.status(404).json({ error: err.message });
      }
      next(err);
    }
  }

  // Get all claims for administration (Admin Only)
  async getAllClaims(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const claims = await claimsService.getAllClaims();
      res.json(claims);
    } catch (err) {
      next(err);
    }
  }

  // Resolve/pay a claim (Admin Only)
  async payClaim(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const claimId = req.params.id;
      const result = await claimsService.payClaim(claimId);
      res.json({ success: true, claim: result });
    } catch (err: any) {
      if (err.message === 'Claim record not found') {
        return res.status(404).json({ error: err.message });
      }
      next(err);
    }
  }
}

export const claimsController = new ClaimsController();

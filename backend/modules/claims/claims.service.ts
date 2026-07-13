import { User, Claim } from '../../../frontend/src/types';
import {
  supabaseGetUserClaims,
  supabaseGetUserById,
  supabaseCreateClaimRequest,
  supabaseGetAllClaims,
  supabasePayClaim
} from '../../server/supabase';
import { paymentsService } from '../payments/payments.service';

export class ClaimsService {
  async getClaimEligibility(user: User): Promise<{ eligible: boolean; reason?: string }> {
    return paymentsService.getClaimEligibility(user);
  }

  async getUserClaims(user: User): Promise<Claim[]> {
    const claims = await supabaseGetUserClaims(user.id);
    return claims || [];
  }

  async createClaimRequest(user: User, amount: number): Promise<{ claim: Claim; user: User }> {
    await paymentsService.verifyClaimReadiness(user);

    return this.claimReward(user, amount);
  }

  async claimReward(user: User, amount: number): Promise<{ claim: Claim; user: User }> {
    const freshUser = await supabaseGetUserById(user.id);
    const balance = freshUser ? freshUser.claimableBalance : user.claimableBalance;
    if (balance < amount) {
      throw new Error('Insufficient claimable balance');
    }

    const claimId = 'claim-' + Date.now().toString();
    const newClaim: Claim = {
      id: claimId,
      userId: user.id,
      amount,
      status: 'pending',
      requestedAt: new Date().toISOString()
    };

    const success = await supabaseCreateClaimRequest(newClaim);
    if (!success) {
      throw new Error('Failed to request claim in database');
    }

    // TODO: When employer payments are implemented, create the Stripe transfer
    // to freshUser.stripeAccountId here after confirming funded source charges.

    const updatedUser = await supabaseGetUserById(user.id);
    if (!updatedUser) {
      throw new Error('User not found after claim request');
    }

    return { claim: newClaim, user: updatedUser };
  }

  async getAllClaims(): Promise<any[]> {
    const claims = await supabaseGetAllClaims();
    return claims || [];
  }

  async payClaim(claimId: string): Promise<any> {
    const success = await supabasePayClaim(claimId);
    if (!success) {
      throw new Error('Failed to pay claim in database');
    }
    return { success: true };
  }
}

export const claimsService = new ClaimsService();

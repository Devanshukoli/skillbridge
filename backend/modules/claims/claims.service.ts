import { User, Claim } from '../../../frontend/src/types';
import {
  supabaseGetUserClaims,
  supabaseGetUserById,
  supabaseCreateClaimRequest,
  supabaseGetAllClaims,
  supabasePayClaim
} from '../../server/supabase';

export class ClaimsService {
  async getUserClaims(user: User): Promise<Claim[]> {
    const claims = await supabaseGetUserClaims(user.id);
    return claims || [];
  }

  async createClaimRequest(user: User, amount: number): Promise<{ claim: Claim; user: User }> {
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

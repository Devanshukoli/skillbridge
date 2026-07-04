import { User, Claim } from '../../../frontend/src/types';
import { loadDb, saveDb } from '../../server/db';
import {
  isSupabaseEnabled,
  supabaseGetUserClaims,
  supabaseGetUserById,
  supabaseCreateClaimRequest,
  supabaseGetAllClaims,
  supabasePayClaim
} from '../../server/supabase';

export class ClaimsService {
  async getUserClaims(user: User): Promise<Claim[]> {
    if (isSupabaseEnabled()) {
      const claims = await supabaseGetUserClaims(user.id);
      if (claims !== null) {
        return claims;
      }
    }

    const db = loadDb();
    return db.claims.filter(c => c.userId === user.id);
  }

  async createClaimRequest(user: User, amount: number): Promise<{ claim: Claim; user: User }> {
    if (isSupabaseEnabled()) {
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
    } else {
      const db = loadDb();
      const dbUser = db.users.find(u => u.id === user.id);
      if (!dbUser) {
        throw new Error('User not found');
      }

      if (dbUser.claimableBalance < amount) {
        throw new Error('Insufficient claimable balance');
      }

      // Deduct from balance
      dbUser.claimableBalance -= amount;

      const claimId = 'claim-' + Date.now().toString();
      const newClaim: Claim = {
        id: claimId,
        userId: user.id,
        amount,
        status: 'pending',
        requestedAt: new Date().toISOString()
      };

      db.claims.push(newClaim);
      saveDb(db);

      return { claim: newClaim, user: dbUser };
    }
  }

  async getAllClaims(): Promise<any[]> {
    if (isSupabaseEnabled()) {
      const claims = await supabaseGetAllClaims();
      if (claims !== null) {
        return claims;
      }
    }

    const db = loadDb();
    return db.claims.map(claim => {
      const user = db.users.find(u => u.id === claim.userId);
      return {
        ...claim,
        userName: user?.name || 'Unknown User',
        userEmail: user?.email || ''
      };
    });
  }

  async payClaim(claimId: string): Promise<any> {
    if (isSupabaseEnabled()) {
      const success = await supabasePayClaim(claimId);
      if (!success) {
        throw new Error('Failed to pay claim in database');
      }
      return { success: true };
    } else {
      const db = loadDb();
      const claim = db.claims.find(c => c.id === claimId);
      if (!claim) {
        throw new Error('Claim record not found');
      }

      claim.status = 'paid';
      claim.resolvedAt = new Date().toISOString();

      saveDb(db);
      return claim;
    }
  }
}

export const claimsService = new ClaimsService();

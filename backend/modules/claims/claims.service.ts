import { User, Claim } from '../../../frontend/src/types';
import {
  supabaseGetUserClaims,
  supabaseGetUserById,
  supabaseCreateClaimRequest,
  supabaseGetAllClaims,
  supabaseGetClaimById,
  supabasePayClaim
} from '../../server/supabase';
import { paymentsService } from '../payments/payments.service';
import { getStripeClient, getPayoutCurrency } from '../payments/payments.service';
import { sendPayoutEmail } from './payoutEmail';
import { AppError, NotFoundError, ConflictError, BadGatewayError } from '../../utils/AppError';

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
      throw new AppError('Insufficient claimable balance', 400);
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
      // Genuine DB failure — not an AppError, so the client only sees a generic
      // 500 and the details land in the server logs (with the request id).
      throw new Error('supabaseCreateClaimRequest returned false for claim ' + claimId);
    }

    // TODO: When employer payments are implemented, create the Stripe transfer
    // to freshUser.stripeAccountId here after confirming funded source charges.

    const updatedUser = await supabaseGetUserById(user.id);
    if (!updatedUser) {
      throw new Error('User not found immediately after successful claim insert for user ' + user.id);
    }

    return { claim: newClaim, user: updatedUser };
  }

  async getAllClaims(): Promise<any[]> {
    const claims = await supabaseGetAllClaims();
    return claims || [];
  }

  async payClaim(claimId: string): Promise<any> {
    const claim = await supabaseGetClaimById(claimId);
    if (!claim) {
      throw new NotFoundError('Claim record not found');
    }
    if (claim.status === 'paid') {
      throw new ConflictError('Claim already paid');
    }

    const user = await supabaseGetUserById(claim.userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const payoutMethod = user.payoutMethod || 'stripe';
    const currency = getPayoutCurrency();
    let stripeTransferId: string | null = null;

    if (payoutMethod === 'manual') {
      // Admin has already sent the money outside Stripe (bank/UPI/PayPal); just record it as paid.
      await supabasePayClaim(claimId, { outcome: 'paid' });
    } else {
      if (!user.stripeAccountId || !user.stripePayoutsEnabled) {
        throw new ConflictError('Stripe account is not ready to receive payouts');
      }

      const stripe = getStripeClient();
      try {
        const transfer = await stripe.transfers.create(
          {
            amount: Math.round(claim.amount * 100),
            currency,
            destination: user.stripeAccountId,
            metadata: { claimId: claim.id, userId: user.id }
          },
          // Prevents a double transfer if the admin double-clicks or a retry happens after a network blip.
          { idempotencyKey: `claim-transfer-${claim.id}` }
        );
        stripeTransferId = transfer.id;
        await supabasePayClaim(claimId, { outcome: 'paid', stripeTransferId });
      } catch (err: any) {
        // Stripe's own error messages are already written to be user-facing/safe
        // (e.g. "Your card was declined"), unlike a raw DB exception, so it's fine
        // to surface this one as an AppError instead of masking it.
        const message = err?.message || 'Stripe transfer failed';
        await supabasePayClaim(claimId, { outcome: 'failed', failureReason: message });
        throw new BadGatewayError(`Stripe transfer failed: ${message}`);
      }
    }

    // Email is best-effort: a failed send should never undo a successful payout.
    try {
      await sendPayoutEmail({
        name: user.name,
        email: user.email,
        amount: claim.amount,
        currency,
        method: payoutMethod as 'stripe' | 'manual'
      });
    } catch (err) {
      console.error('Failed to send payout email', err);
    }

    const allClaims = await supabaseGetAllClaims();
    const updatedClaim = allClaims?.find(c => c.id === claimId) || null;
    return { success: true, claim: updatedClaim, stripeTransferId };
  }
}

export const claimsService = new ClaimsService();

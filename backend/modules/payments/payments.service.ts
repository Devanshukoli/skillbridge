import Stripe from 'stripe';
import { StripeConnectStatus, User, ManualPayoutDetails, PaymentStatus } from '../../../frontend/src/types';
import {
  supabaseGetUserById,
  supabaseGetUserByStripeAccountId,
  supabaseUpdateUserStripeConnect,
  supabaseUpdateUserProfile
} from '../../server/supabase';
import { getStripeConfig } from './config';
import { isStripeSelfServeUnsupported } from './unsupportedCountries';

type StripeAccountSnapshot = {
  stripeAccountId: string;
  stripeConnected: boolean;
  stripeChargesEnabled: boolean;
  stripePayoutsEnabled: boolean;
  stripeOnboardingCompleted: boolean;
  stripeUpdatedAt: string;
  stripeRequirementsCurrentlyDue: string[];
};

function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('Stripe is not configured');
  }

  return new Stripe(secretKey);
}

function getConnectUrl(envKey: 'STRIPE_CONNECT_RETURN_URL' | 'STRIPE_CONNECT_REFRESH_URL') {
  const configuredUrl = process.env[envKey];
  if (configuredUrl && /^https?:\/\//.test(configuredUrl)) {
    return configuredUrl;
  }

  const appUrl = (process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, '');
  return `${appUrl}/?settings=payment`;
}

function toAccountSnapshot(account: Stripe.Account): StripeAccountSnapshot {
  const onboardingCompleted = Boolean(account.details_submitted);

  return {
    stripeAccountId: account.id,
    stripeConnected: onboardingCompleted,
    stripeChargesEnabled: Boolean(account.charges_enabled),
    stripePayoutsEnabled: Boolean(account.payouts_enabled),
    stripeOnboardingCompleted: onboardingCompleted,
    stripeUpdatedAt: new Date().toISOString(),
    stripeRequirementsCurrentlyDue: account.requirements?.currently_due || []
  };
}

function toStatus(user: User): StripeConnectStatus {
  return {
    connected: Boolean(user.stripeConnected),
    chargesEnabled: Boolean(user.stripeChargesEnabled),
    payoutsEnabled: Boolean(user.stripePayoutsEnabled),
    onboardingCompleted: Boolean(user.stripeOnboardingCompleted),
    stripeAccountId: user.stripeAccountId || null,
    stripeUpdatedAt: user.stripeUpdatedAt || null,
    requirementsCurrentlyDue: user.stripeRequirementsCurrentlyDue || []
  };
}

export function validateManualPayoutDetails(details?: ManualPayoutDetails | null): { valid: boolean; reason?: string } {
  if (!details || !details.type) {
    return { valid: false, reason: 'Manual payout details are required.' };
  }

  if (details.type === 'bank') {
    if (!details.accountNumber || !details.ifsc) {
      return { valid: false, reason: 'Bank account number and IFSC are required.' };
    }
    return { valid: true };
  }

  if (details.type === 'upi') {
    if (!details.upiId) {
      return { valid: false, reason: 'UPI ID is required.' };
    }
    return { valid: true };
  }

  if (details.type === 'paypal') {
    if (!details.paypalEmail) {
      return { valid: false, reason: 'PayPal email is required.' };
    }
    return { valid: true };
  }

  return { valid: false, reason: 'Unsupported manual payout details.' };
}

export function getPaymentStatusForUser(user: User): PaymentStatus {
  const payoutMethod = user.payoutMethod || 'stripe';
  const countryCode = user.profile?.country?.trim().toUpperCase();
  const stripeConnected = Boolean(user.stripeConnected);
  const payoutsEnabled = Boolean(user.stripePayoutsEnabled);

  if (!countryCode) {
    return {
      ready: false,
      method: payoutMethod as 'stripe' | 'manual',
      reason: 'Select your country to determine your payout options.',
      requiresCountry: true,
      stripeConnected,
      payoutsEnabled,
      requiresManualDetails: payoutMethod === 'manual'
    };
  }

  if (payoutMethod === 'manual') {
    const validation = validateManualPayoutDetails(user.manualPayoutDetails);
    if (!validation.valid) {
      return {
        ready: false,
        method: 'manual',
        reason: validation.reason || 'Manual payout details are required.',
        requiresCountry: false,
        stripeConnected,
        payoutsEnabled,
        requiresManualDetails: true
      };
    }

    return {
      ready: true,
      method: 'manual',
      requiresCountry: false,
      stripeConnected,
      payoutsEnabled,
      requiresManualDetails: false
    };
  }

  if (isStripeSelfServeUnsupported(countryCode)) {
    return {
      ready: false,
      method: 'manual',
      reason: 'Stripe self-serve onboarding is unavailable in your country. Add manual payout details to receive rewards.',
      requiresCountry: false,
      stripeConnected: false,
      payoutsEnabled: false,
      requiresManualDetails: true
    };
  }

  if (!stripeConnected) {
    return {
      ready: false,
      method: 'stripe',
      reason: 'Stripe account is not connected.',
      requiresCountry: false,
      stripeConnected: false,
      payoutsEnabled: false,
      requiresManualDetails: false
    };
  }

  if (!payoutsEnabled) {
    return {
      ready: false,
      method: 'stripe',
      reason: 'Stripe payouts are not enabled.',
      requiresCountry: false,
      stripeConnected: true,
      payoutsEnabled: false,
      requiresManualDetails: false
    };
  }

  return {
    ready: true,
    method: 'stripe',
    requiresCountry: false,
    stripeConnected: true,
    payoutsEnabled: true,
    requiresManualDetails: false
  };
}

export function getPaymentStatus(user: User): PaymentStatus {
  return getPaymentStatusForUser(user);
}

export function getClaimEligibility(user: User): { eligible: boolean; reason?: string } {
  const status = getPaymentStatusForUser(user);
  if (status.ready) {
    return { eligible: true };
  }

  return {
    eligible: false,
    reason: status.reason || 'Payout setup is incomplete.'
  };
}

export class PaymentsService {
  async getConfig() {
    return getStripeConfig();
  }

  async getPaymentStatus(user: User): Promise<PaymentStatus> {
    const freshUser = await supabaseGetUserById(user.id);
    return getPaymentStatusForUser(freshUser || user);
  }

  async getClaimEligibility(user: User): Promise<{ eligible: boolean; reason?: string }> {
    return getClaimEligibility(user);
  }

  async getStatus(user: User): Promise<StripeConnectStatus> {
    const freshUser = await supabaseGetUserById(user.id);
    return toStatus(freshUser || user);
  }

  async createConnectAccount(user: User): Promise<{ onboardingUrl: string; status: StripeConnectStatus }> {
    const stripe = getStripeClient();
    let freshUser = await supabaseGetUserById(user.id);
    if (!freshUser) {
      throw new Error('User not found');
    }

    let accountId = freshUser.stripeAccountId || null;

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        email: freshUser.email,
        metadata: {
          skillbridgeUserId: freshUser.id
        }
      });

      freshUser = await supabaseUpdateUserStripeConnect(freshUser.id, toAccountSnapshot(account));
      accountId = account.id;
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: getConnectUrl('STRIPE_CONNECT_REFRESH_URL'),
      return_url: getConnectUrl('STRIPE_CONNECT_RETURN_URL'),
      type: 'account_onboarding'
    });

    return {
      onboardingUrl: accountLink.url,
      status: toStatus(freshUser || user)
    };
  }

  async refreshStatus(user: User): Promise<StripeConnectStatus> {
    const freshUser = await supabaseGetUserById(user.id);
    if (!freshUser) {
      throw new Error('User not found');
    }

    if (!freshUser.stripeAccountId) {
      return toStatus(freshUser);
    }

    const stripe = getStripeClient();
    const account = await stripe.accounts.retrieve(freshUser.stripeAccountId);
    const updatedUser = await supabaseUpdateUserStripeConnect(freshUser.id, toAccountSnapshot(account as Stripe.Account));
    return toStatus(updatedUser || freshUser);
  }

  async disconnect(user: User): Promise<StripeConnectStatus> {
    const freshUser = await supabaseGetUserById(user.id);
    if (!freshUser) {
      throw new Error('User not found');
    }

    if (freshUser.stripeAccountId) {
      const stripe = getStripeClient();
      await stripe.accounts.del(freshUser.stripeAccountId);
    }

    const updatedUser = await supabaseUpdateUserStripeConnect(freshUser.id, {
      stripeAccountId: null,
      stripeConnected: false,
      stripeChargesEnabled: false,
      stripePayoutsEnabled: false,
      stripeOnboardingCompleted: false,
      stripeUpdatedAt: new Date().toISOString(),
      stripeRequirementsCurrentlyDue: []
    });

    return toStatus(updatedUser || freshUser);
  }

  async updateManualPayoutDetails(user: User, details: ManualPayoutDetails): Promise<PaymentStatus> {
    const validation = validateManualPayoutDetails(details);
    if (!validation.valid) {
      throw new Error(validation.reason || 'Invalid manual payout details');
    }

    const freshUser = await supabaseGetUserById(user.id);
    const updatedUser = await supabaseUpdateUserProfile((freshUser || user).id, {
      payoutMethod: 'manual',
      manualPayoutDetails: details
    });

    if (!updatedUser) {
      throw new Error('User not found');
    }

    return getPaymentStatusForUser(updatedUser);
  }

  async applyAccountUpdated(account: Stripe.Account): Promise<User | null> {
    const userId = typeof account.metadata?.skillbridgeUserId === 'string'
      ? account.metadata.skillbridgeUserId
      : undefined;

    const user = userId
      ? await supabaseGetUserById(userId)
      : await supabaseGetUserByStripeAccountId(account.id);

    if (!user) {
      return null;
    }

    return supabaseUpdateUserStripeConnect(user.id, toAccountSnapshot(account));
  }

  async handleWebhook(rawBody: Buffer, signature: string | string[] | undefined): Promise<{ received: boolean; ignored?: boolean }> {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('Stripe webhook secret is not configured');
    }

    if (!signature || Array.isArray(signature)) {
      throw new Error('Invalid Stripe webhook signature');
    }

    const stripe = getStripeClient();
    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

    if (event.type !== 'account.updated') {
      return { received: true, ignored: true };
    }

    await this.applyAccountUpdated(event.data.object as Stripe.Account);
    return { received: true };
  }

  async verifyClaimReadiness(user: User): Promise<void> {
    const freshUser = await supabaseGetUserById(user.id);
    const eligibility = getClaimEligibility(freshUser || user);
    if (!eligibility.eligible) {
      throw new Error(eligibility.reason || 'Payout setup is incomplete');
    }
  }
}

export const paymentsService = new PaymentsService();

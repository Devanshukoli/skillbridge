import Stripe from 'stripe';
import { StripeConnectStatus, User } from '../../../frontend/src/types';
import {
  supabaseGetUserById,
  supabaseGetUserByStripeAccountId,
  supabaseUpdateUserStripeConnect
} from '../../server/supabase';

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

export class PaymentsService {
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
    const status = await this.getStatus(user);

    if (!status.connected) {
      throw new Error('Stripe account is not connected');
    }

    if (!status.payoutsEnabled) {
      throw new Error('Stripe payouts are not enabled');
    }
  }
}

export const paymentsService = new PaymentsService();

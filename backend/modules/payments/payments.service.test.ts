import test from 'node:test';
import assert from 'node:assert/strict';
import { User } from '../../../frontend/src/types';
import { getClaimEligibility, getPaymentStatus, getPaymentStatusForUser } from './payments.service';
import { STRIPE_SELF_SERVE_UNSUPPORTED_COUNTRIES, isStripeSelfServeUnsupported } from './unsupportedCountries';

function createUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'student',
    pointsBalance: 0,
    claimableBalance: 100,
    profile: { experienceLevel: 'Beginner', skills: [], goals: '', timeCommitment: 'Casual' },
    onboardingCompleted: true,
    createdAt: new Date().toISOString(),
    stripeConnected: true,
    stripeChargesEnabled: true,
    stripePayoutsEnabled: true,
    stripeOnboardingCompleted: true,
    ...overrides
  } as User;
}

test('returns ready payment status for Stripe users', () => {
  const user = createUser({ profile: { experienceLevel: 'Beginner', skills: [], goals: '', timeCommitment: 'Casual', country: 'US' } });
  const status = getPaymentStatusForUser(user);

  assert.equal(status.ready, true);
  assert.equal(status.method, 'stripe');
  assert.equal(status.requiresCountry, false);
  assert.equal(status.stripeConnected, true);
  assert.equal(status.payoutsEnabled, true);
  assert.equal(status.requiresManualDetails, false);
});

test('flags Stripe users who are not connected', () => {
  const user = createUser({ stripeConnected: false, profile: { experienceLevel: 'Beginner', skills: [], goals: '', timeCommitment: 'Casual', country: 'US' } });
  const status = getPaymentStatusForUser(user);

  assert.equal(status.ready, false);
  assert.equal(status.method, 'stripe');
  assert.match(status.reason || '', /Stripe/i);
});

test('flags Stripe users when payouts are disabled', () => {
  const user = createUser({ stripeConnected: true, stripePayoutsEnabled: false, profile: { experienceLevel: 'Beginner', skills: [], goals: '', timeCommitment: 'Casual', country: 'US' } });
  const status = getPaymentStatusForUser(user);

  assert.equal(status.ready, false);
  assert.match(status.reason || '', /payouts/i);
});

test('accepts valid manual bank payout details', () => {
  const user = createUser({
    payoutMethod: 'manual',
    manualPayoutDetails: { type: 'bank', accountName: 'Ada Lovelace', accountNumber: '1234567890', ifsc: 'SBIN0001234' },
    profile: { experienceLevel: 'Beginner', skills: [], goals: '', timeCommitment: 'Casual', country: 'IN' }
  });

  const status = getPaymentStatusForUser(user);

  assert.equal(status.ready, true);
  assert.equal(status.method, 'manual');
  assert.equal(status.requiresManualDetails, false);
});

test('rejects invalid manual bank payout details', () => {
  const user = createUser({
    payoutMethod: 'manual',
    manualPayoutDetails: { type: 'bank', accountName: 'Ada Lovelace' },
    profile: { experienceLevel: 'Beginner', skills: [], goals: '', timeCommitment: 'Casual', country: 'IN' }
  });

  const status = getPaymentStatusForUser(user);

  assert.equal(status.ready, false);
  assert.equal(status.requiresManualDetails, true);
  assert.match(status.reason || '', /bank account|manual payout/i);
});

test('accepts valid manual UPI payout details', () => {
  const user = createUser({
    payoutMethod: 'manual',
    manualPayoutDetails: { type: 'upi', upiId: 'ada@oksbi' },
    profile: { experienceLevel: 'Beginner', skills: [], goals: '', timeCommitment: 'Casual', country: 'IN' }
  });

  const status = getPaymentStatusForUser(user);

  assert.equal(status.ready, true);
  assert.equal(status.method, 'manual');
});

test('accepts valid manual PayPal payout details', () => {
  const user = createUser({
    payoutMethod: 'manual',
    manualPayoutDetails: { type: 'paypal', paypalEmail: 'ada@example.com' },
    profile: { experienceLevel: 'Beginner', skills: [], goals: '', timeCommitment: 'Casual', country: 'AE' }
  });

  const status = getPaymentStatusForUser(user);

  assert.equal(status.ready, true);
  assert.equal(status.method, 'manual');
});

test('tracks missing manual payout details', () => {
  const user = createUser({ payoutMethod: 'manual', profile: { experienceLevel: 'Beginner', skills: [], goals: '', timeCommitment: 'Casual', country: 'IN' } });
  const status = getPaymentStatusForUser(user);

  assert.equal(status.ready, false);
  assert.equal(status.requiresManualDetails, true);
});

test('defaults legacy users without payoutMethod to Stripe', () => {
  const user = createUser({ payoutMethod: undefined as any, profile: { experienceLevel: 'Beginner', skills: [], goals: '', timeCommitment: 'Casual', country: 'US' } });
  const status = getPaymentStatusForUser(user);

  assert.equal(status.method, 'stripe');
});

test('flags unsupported Stripe countries using backend config', () => {
  assert.equal(STRIPE_SELF_SERVE_UNSUPPORTED_COUNTRIES.includes('IN'), true);
  assert.equal(isStripeSelfServeUnsupported('IN'), true);
  assert.equal(isStripeSelfServeUnsupported('US'), false);
});

test('returns claim eligibility for Stripe and manual workflows', () => {
  const stripeUser = createUser({ profile: { experienceLevel: 'Beginner', skills: [], goals: '', timeCommitment: 'Casual', country: 'US' } });
  const manualUser = createUser({ payoutMethod: 'manual', manualPayoutDetails: { type: 'bank', accountName: 'Ada', accountNumber: '1234567890', ifsc: 'SBIN0001234' }, profile: { experienceLevel: 'Beginner', skills: [], goals: '', timeCommitment: 'Casual', country: 'IN' } });

  assert.equal(getClaimEligibility(stripeUser).eligible, true);
  assert.equal(getClaimEligibility(manualUser).eligible, true);
});

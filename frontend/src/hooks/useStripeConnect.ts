import { useCallback, useEffect, useState } from 'react';
import { ManualPayoutDetails, PaymentStatus, StripeConnectStatus } from '../types';

const defaultStatus: StripeConnectStatus = {
  connected: false,
  chargesEnabled: false,
  payoutsEnabled: false,
  onboardingCompleted: false,
  stripeAccountId: null,
  stripeUpdatedAt: null,
  requirementsCurrentlyDue: []
};

export function useStripeConnect(autoFetch = true) {
  const [status, setStatus] = useState<StripeConnectStatus>(defaultStatus);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [unsupportedCountries, setUnsupportedCountries] = useState<string[]>([]);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState('');

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/payments/status');
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load Stripe status.');
      }
      setStatus(data);
      return data as StripeConnectStatus;
    } catch (err: any) {
      setError(err.message || 'Failed to load Stripe status.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPaymentConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/payments/config');
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load payment config.');
      }
      setUnsupportedCountries(data.unsupportedStripeCountries || []);
      return data as { unsupportedStripeCountries: string[] };
    } catch (err: any) {
      setError(err.message || 'Failed to load payment config.');
      throw err;
    }
  }, []);

  const fetchPaymentStatus = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/payments/payment-status');
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load payment status.');
      }
      setPaymentStatus(data as PaymentStatus);
      return data as PaymentStatus;
    } catch (err: any) {
      setError(err.message || 'Failed to load payment status.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const setManualPayout = useCallback(async (details: ManualPayoutDetails) => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/payments/manual-payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ details })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save manual payout details.');
      }
      setPaymentStatus(data as PaymentStatus);
      return data as PaymentStatus;
    } catch (err: any) {
      setError(err.message || 'Failed to save manual payout details.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/payments/refresh', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to refresh Stripe status.');
      }
      setStatus(data);
      return data as StripeConnectStatus;
    } catch (err: any) {
      setError(err.message || 'Failed to refresh Stripe status.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const connect = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/payments/connect', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to start Stripe onboarding.');
      }
      if (data.status) {
        setStatus(data.status);
      }
      if (!data.onboardingUrl) {
        throw new Error('Stripe did not return an onboarding link.');
      }
      window.location.assign(data.onboardingUrl);
      return data.onboardingUrl as string;
    } catch (err: any) {
      setError(err.message || 'Failed to start Stripe onboarding.');
      setLoading(false);
      throw err;
    }
  }, []);

  const disconnect = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/payments/connect', { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to disconnect Stripe.');
      }
      setStatus(data);
      return data as StripeConnectStatus;
    } catch (err: any) {
      setError(err.message || 'Failed to disconnect Stripe.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      void fetchStatus();
      void fetchPaymentConfig();
      void fetchPaymentStatus();
    }
  }, [autoFetch, fetchStatus, fetchPaymentConfig, fetchPaymentStatus]);

  return {
    status,
    paymentStatus,
    unsupportedCountries,
    loading,
    error,
    fetchStatus,
    fetchPaymentConfig,
    fetchPaymentStatus,
    setManualPayout,
    connect,
    refresh,
    disconnect
  };
}

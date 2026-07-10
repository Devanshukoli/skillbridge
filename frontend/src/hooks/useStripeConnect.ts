import { useCallback, useEffect, useState } from 'react';
import { StripeConnectStatus } from '../types';

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
    }
  }, [autoFetch, fetchStatus]);

  return {
    status,
    loading,
    error,
    fetchStatus,
    connect,
    refresh,
    disconnect
  };
}

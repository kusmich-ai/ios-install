// /hooks/useSubscription.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase-client';

type PlanType = 'quarterly' | 'biannual' | 'annual' | 'quarterly_coaching' | 'biannual_coaching' | 'annual_coaching';

interface Subscription {
  status: string;
  plan_id: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

interface UseSubscriptionReturn {
  subscription: Subscription | null;
  loading: boolean;
  isActive: boolean;
  isPastDue: boolean;
  isCanceled: boolean;
  isTrialing: boolean;
  hasCoachingAccess: boolean;
  daysUntilExpiry: number | null;
  refetch: () => Promise<void>;
}

export function useSubscription(): UseSubscriptionReturn {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchSubscription = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .select('status, plan_id, current_period_end, cancel_at_period_end')
        .eq('user_id', user.id)
        .single();

      // PGRST116 = no rows returned (user has no subscription record)
      if (error && error.code !== 'PGRST116') {
        console.error('[useSubscription] Error:', error);
      }

      setSubscription(data || null);
    } catch (err) {
      console.error('[useSubscription] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  // Derived states
  const isActive = subscription?.status === 'active';
  const isTrialing = subscription?.status === 'trialing';
  const isPastDue = subscription?.status === 'past_due';
  const isCanceled = subscription?.status === 'canceled';

  // Check if plan includes coaching (by checking if plan_id contains 'coaching' in metadata)
  // This will be stored in the subscription metadata from Stripe
  const hasCoachingAccess = subscription?.plan_id?.includes('coaching') || false;

  // Calculate days until expiry
  let daysUntilExpiry: number | null = null;
  if (subscription?.current_period_end) {
    const endDate = new Date(subscription.current_period_end);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  return {
    subscription,
    loading,
    isActive: isActive || isTrialing,
    isPastDue,
    isCanceled,
    isTrialing,
    hasCoachingAccess,
    daysUntilExpiry,
    refetch: fetchSubscription,
  };
}

// Utility hook to manage subscription actions
export function useSubscriptionActions() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const startCheckout = async (plan: PlanType) => {
    setLoading(true);
    try {
      // Get the current session to pass auth token
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(session?.access_token && { 'Authorization': `Bearer ${session.access_token}` })
        },
        body: JSON.stringify({ plan }),
      });
      
      const { url, error } = await response.json();
      
      if (error) {
        throw new Error(error);
      }
      
      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (err) {
      console.error('[Checkout] Error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const openPortal = async () => {
    setLoading(true);
    try {
      // Get the current session to pass auth token
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token && { 'Authorization': `Bearer ${session.access_token}` })
        },
      });
      
      const { url, error } = await response.json();
      
      if (error) {
        throw new Error(error);
      }
      
      // Redirect to Stripe Customer Portal
      window.location.href = url;
    } catch (err) {
      console.error('[Portal] Error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    startCheckout,
    openPortal,
  };
}

// /hooks/useSubscription.ts
// MERGED VERSION - Original + Paywall Features
'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase-client';

const FREE_STAGE_LIMIT = 1; // Stage 1 is free, Stage 2+ requires subscription

type PlanType = 'quarterly' | 'biannual' | 'annual' | 'quarterly_coaching' | 'biannual_coaching' | 'annual_coaching';

interface Subscription {
  status: string;
  plan_id: string | null;
  plan_type: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

interface AccessState {
  currentStage: number;
  maxAllowedStage: number;
  requiresUpgrade: boolean;
}

interface PaywallContext {
  reason: 'stage_unlock' | 'coaching_access' | 'subscription_lapsed' | 'feature_locked';
  targetStage?: number;
  feature?: string;
}

interface UseSubscriptionReturn {
  // Original properties
  subscription: Subscription | null;
  loading: boolean;
  isActive: boolean;
  isPastDue: boolean;
  isCanceled: boolean;
  isTrialing: boolean;
  hasCoachingAccess: boolean;
  daysUntilExpiry: number | null;
  refetch: () => Promise<void>;
  // NEW: Access control
  access: AccessState;
  // NEW: Paywall control
  showPaywall: boolean;
  paywallContext: PaywallContext | null;
  triggerPaywall: (context: PaywallContext) => void;
  closePaywall: () => void;
  checkAccessOrPaywall: (stage: number) => boolean;
  checkCoachingOrPaywall: () => boolean;
  canAccessStage: (stage: number) => boolean;
}

export function useSubscription(): UseSubscriptionReturn {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [access, setAccess] = useState<AccessState>({
    currentStage: 1,
    maxAllowedStage: FREE_STAGE_LIMIT,
    requiresUpgrade: false,
  });
  
  // Paywall state
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallContext, setPaywallContext] = useState<PaywallContext | null>(null);
  
  const supabase = createClient();

  const fetchSubscription = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch subscription and progress in parallel
      const [subResult, progressResult] = await Promise.all([
        supabase
          .from('subscriptions')
          .select('status, plan_id, plan_type, current_period_end, cancel_at_period_end')
          .eq('user_id', user.id)
          .single(),
        supabase
          .from('user_progress')
          .select('current_stage')
          .eq('user_id', user.id)
          .single()
      ]);

      // PGRST116 = no rows returned (user has no subscription record)
      if (subResult.error && subResult.error.code !== 'PGRST116') {
        console.error('[useSubscription] Error:', subResult.error);
      }

      const sub = subResult.data || null;
      const currentStage = progressResult.data?.current_stage || 1;
      
      setSubscription(sub);

      // Calculate access state
      const isSubActive = sub?.status === 'active' || 
                          sub?.status === 'trialing' ||
                          (sub?.cancel_at_period_end && sub?.current_period_end && 
                           new Date(sub.current_period_end) > new Date());

      setAccess({
        currentStage,
        maxAllowedStage: isSubActive ? 7 : FREE_STAGE_LIMIT,
        requiresUpgrade: currentStage > FREE_STAGE_LIMIT && !isSubActive,
      });

    } catch (err) {
      console.error('[useSubscription] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchSubscription();

    // Subscribe to subscription changes for real-time updates
    const channel = supabase
      .channel('subscription_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions'
        },
        () => {
          fetchSubscription();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSubscription, supabase]);

  // Derived states (original)
  const isActive = subscription?.status === 'active';
  const isTrialing = subscription?.status === 'trialing';
  const isPastDue = subscription?.status === 'past_due';
  const isCanceled = subscription?.status === 'canceled';

  // Check if plan includes coaching
  const hasCoachingAccess = (
    (subscription?.plan_id?.includes('coaching') || 
     subscription?.plan_type?.includes('coaching')) &&
    (isActive || isTrialing)
  ) || false;

  // Calculate days until expiry
  let daysUntilExpiry: number | null = null;
  if (subscription?.current_period_end) {
    const endDate = new Date(subscription.current_period_end);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // NEW: Check if user can access a specific stage
  const canAccessStage = useCallback((stage: number): boolean => {
    if (stage <= FREE_STAGE_LIMIT) return true;
    const isSubActive = !!(isActive || isTrialing || 
  (subscription?.cancel_at_period_end && daysUntilExpiry !== null && daysUntilExpiry > 0));
return isSubActive && stage <= access.currentStage;
  }, [isActive, isTrialing, subscription?.cancel_at_period_end, daysUntilExpiry, access.currentStage]);

  // NEW: Trigger paywall with context
  const triggerPaywall = useCallback((context: PaywallContext) => {
    setPaywallContext(context);
    setShowPaywall(true);
  }, []);

  // NEW: Close paywall
  const closePaywall = useCallback(() => {
    setShowPaywall(false);
    setPaywallContext(null);
  }, []);

  // NEW: Check access and trigger paywall if needed
  const checkAccessOrPaywall = useCallback((stage: number): boolean => {
    if (canAccessStage(stage)) return true;
    
    triggerPaywall({
      reason: stage > access.currentStage ? 'stage_unlock' : 'subscription_lapsed',
      targetStage: stage
    });
    return false;
  }, [canAccessStage, access.currentStage, triggerPaywall]);

  // NEW: Check coaching access and trigger paywall if needed
  const checkCoachingOrPaywall = useCallback((): boolean => {
    if (hasCoachingAccess) return true;
    
    triggerPaywall({
      reason: 'coaching_access',
      feature: 'Live Coaching Calls'
    });
    return false;
  }, [hasCoachingAccess, triggerPaywall]);

  return {
    // Original
    subscription,
    loading,
    isActive: isActive || isTrialing,
    isPastDue,
    isCanceled,
    isTrialing,
    hasCoachingAccess,
    daysUntilExpiry,
    refetch: fetchSubscription,
    // NEW
    access,
    showPaywall,
    paywallContext,
    triggerPaywall,
    closePaywall,
    checkAccessOrPaywall,
    checkCoachingOrPaywall,
    canAccessStage,
  };
}

// ============================================
// Utility hook for subscription actions (unchanged)
// ============================================
export function useSubscriptionActions() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const startCheckout = async (plan: PlanType) => {
    setLoading(true);
    try {
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

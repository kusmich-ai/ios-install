// lib/subscription.ts
import { createClient } from '@/lib/supabase-client';

/**
 * Checks if user has active subscription or valid trial
 * 
 * TOGGLE PAYMENT REQUIREMENT:
 * Set NEXT_PUBLIC_PAYMENT_REQUIRED=true in .env.local to enable payment checks
 * Set to false or omit for open access during MVP/testing
 */
export async function checkSubscriptionStatus(userId: string): Promise<{
  hasAccess: boolean;
  status: 'trial' | 'active' | 'canceled' | 'past_due' | 'unpaid' | 'unknown';
  trialEndsAt?: string;
  message?: string;
}> {
  // TOGGLE: Allow bypass during MVP/testing
  if (process.env.NEXT_PUBLIC_PAYMENT_REQUIRED !== 'true') {
    return {
      hasAccess: true,
      status: 'trial',
      message: 'Payment not required (MVP mode)',
    };
  }

  const supabase = createClient(); // ✅ FIXED: removed extra 'c'

  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('subscription_status, trial_ends_at, current_period_end')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      console.error('Subscription check error:', error);
      return {
        hasAccess: false,
        status: 'unknown',
        message: 'Unable to verify subscription status',
      };
    }

    const now = new Date();
    const trialEnds = data.trial_ends_at ? new Date(data.trial_ends_at) : null;
    const subscriptionEnds = data.current_period_end ? new Date(data.current_period_end) : null;

    // Check trial period
    if (data.subscription_status === 'trial') {
      if (trialEnds && now < trialEnds) {
        return {
          hasAccess: true,
          status: 'trial',
          trialEndsAt: trialEnds.toISOString(),
          message: `Trial active until ${trialEnds.toLocaleDateString()}`,
        };
      } else {
        return {
          hasAccess: false,
          status: 'trial',
          message: 'Trial period expired. Please subscribe to continue.',
        };
      }
    }

    // Check active subscription
    if (data.subscription_status === 'active') {
      if (subscriptionEnds && now < subscriptionEnds) {
        return {
          hasAccess: true,
          status: 'active',
          message: 'Subscription active',
        };
      }
    }

    // All other statuses = no access
    return {
      hasAccess: false,
      status: data.subscription_status as any,
      message: 'Subscription required. Please update your payment method.',
    };
  } catch (error) {
    console.error('Subscription check exception:', error);
    return {
      hasAccess: false,
      status: 'unknown',
      message: 'Error checking subscription status',
    };
  }
}

/**
 * Middleware helper to require subscription for protected routes
 * Use in middleware.ts or page-level auth checks
 */
export async function requireSubscription(userId: string): Promise<boolean> {
  const result = await checkSubscriptionStatus(userId);
  return result.hasAccess;
}

/**
 * Get subscription details for display in UI
 */
export async function getSubscriptionDetails(userId: string) {
  const supabase = createClient(); // ✅ FIXED: now using createClient()

  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    status: data.subscription_status,
    trialEndsAt: data.trial_ends_at,
    currentPeriodStart: data.current_period_start,
    currentPeriodEnd: data.current_period_end,

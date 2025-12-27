// lib/access-control.ts
// Core access control logic for paywall bypass prevention

import { createClient } from '@/lib/supabase-server';

// Stage access tiers
const FREE_STAGE_LIMIT = 1; // Stage 1 is free, Stage 2+ requires subscription

export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete' | null;

export interface AccessCheckResult {
  hasAccess: boolean;
  reason: 'free_tier' | 'active_subscription' | 'grace_period' | 'no_subscription' | 'subscription_expired' | 'stage_locked';
  currentStage: number;
  maxAllowedStage: number;
  subscriptionStatus: SubscriptionStatus;
  subscriptionEndsAt: string | null;
  hasCoachingAccess: boolean;
}

/**
 * Server-side check if user can access a specific stage
 * This is the authoritative access check - use this on all protected routes
 */
export async function canAccessStage(
  userId: string, 
  requestedStage: number
): Promise<AccessCheckResult> {
  const supabase = await createClient();
  
  // Fetch user progress and subscription in parallel
  const [progressResult, subscriptionResult] = await Promise.all([
    supabase
      .from('user_progress')
      .select('current_stage')
      .eq('user_id', userId)
      .single(),
    supabase
      .from('subscriptions')
      .select('status, plan_type, current_period_end, cancel_at_period_end')
      .eq('user_id', userId)
      .single()
  ]);

  const currentStage = progressResult.data?.current_stage || 1;
  const subscription = subscriptionResult.data;
  
  // Determine subscription status
  const subscriptionStatus: SubscriptionStatus = subscription?.status || null;
  const subscriptionEndsAt = subscription?.current_period_end || null;
  const hasCoachingAccess = subscription?.plan_type?.includes('coaching') || false;
  
  // Check if subscription is effectively active (including grace period)
  const isSubscriptionActive = 
    subscriptionStatus === 'active' || 
    subscriptionStatus === 'trialing' ||
    (subscriptionStatus === 'past_due' && isWithinGracePeriod(subscriptionEndsAt)) ||
    (subscription?.cancel_at_period_end && subscriptionEndsAt && new Date(subscriptionEndsAt) > new Date());

  // Determine max allowed stage
  let maxAllowedStage: number;
  if (isSubscriptionActive) {
    maxAllowedStage = 7; // Full access
  } else {
    maxAllowedStage = FREE_STAGE_LIMIT;
  }

  // Check access
  if (requestedStage <= FREE_STAGE_LIMIT) {
    return {
      hasAccess: true,
      reason: 'free_tier',
      currentStage,
      maxAllowedStage,
      subscriptionStatus,
      subscriptionEndsAt,
      hasCoachingAccess
    };
  }

  if (isSubscriptionActive) {
    // User has subscription - check if they've actually unlocked the stage
    if (requestedStage <= currentStage) {
      return {
        hasAccess: true,
        reason: subscription?.cancel_at_period_end ? 'grace_period' : 'active_subscription',
        currentStage,
        maxAllowedStage,
        subscriptionStatus,
        subscriptionEndsAt,
        hasCoachingAccess
      };
    } else {
      // They have subscription but haven't unlocked this stage yet
      return {
        hasAccess: false,
        reason: 'stage_locked',
        currentStage,
        maxAllowedStage,
        subscriptionStatus,
        subscriptionEndsAt,
        hasCoachingAccess
      };
    }
  }

  // No active subscription
  return {
    hasAccess: false,
    reason: subscriptionStatus ? 'subscription_expired' : 'no_subscription',
    currentStage,
    maxAllowedStage,
    subscriptionStatus,
    subscriptionEndsAt,
    hasCoachingAccess
  };
}

/**
 * Check if user can access coaching features
 */
export async function canAccessCoaching(userId: string): Promise<boolean> {
  const supabase = await createClient();
  
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('status, plan_type, current_period_end, cancel_at_period_end')
    .eq('user_id', userId)
    .single();

  if (!subscription) return false;

  const isActive = 
    subscription.status === 'active' || 
    subscription.status === 'trialing' ||
    (subscription.cancel_at_period_end && new Date(subscription.current_period_end) > new Date());

  return isActive && subscription.plan_type?.includes('coaching');
}

/**
 * Validate stage progression - ensures user can't skip stages
 */
export async function canProgressToStage(
  userId: string, 
  targetStage: number
): Promise<{ allowed: boolean; reason: string }> {
  const supabase = await createClient();
  
  const { data: progress } = await supabase
    .from('user_progress')
    .select('current_stage, unlock_eligible')
    .eq('user_id', userId)
    .single();

  if (!progress) {
    return { allowed: false, reason: 'User progress not found' };
  }

  // Can only progress one stage at a time
  if (targetStage !== progress.current_stage + 1) {
    return { allowed: false, reason: 'Can only progress to next sequential stage' };
  }

  // Must have met unlock criteria
  if (!progress.unlock_eligible) {
    return { allowed: false, reason: 'Unlock criteria not met' };
  }

  // If progressing past free tier, check subscription
  if (targetStage > FREE_STAGE_LIMIT) {
    const accessCheck = await canAccessStage(userId, targetStage);
    if (!accessCheck.hasAccess || accessCheck.reason === 'no_subscription') {
      return { allowed: false, reason: 'Subscription required for this stage' };
    }
  }

  return { allowed: true, reason: 'Progression allowed' };
}

/**
 * Grace period check - 3 days after subscription end
 */
function isWithinGracePeriod(endDate: string | null): boolean {
  if (!endDate) return false;
  
  const end = new Date(endDate);
  const gracePeriodEnd = new Date(end);
  gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 3); // 3 day grace period
  
  return new Date() < gracePeriodEnd;
}

/**
 * Get full subscription details for UI display
 */
export async function getSubscriptionDetails(userId: string) {
  const supabase = await createClient();
  
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!subscription) {
    return {
      isSubscribed: false,
      status: null,
      planType: null,
      interval: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      hasCoachingAccess: false
    };
  }

  return {
    isSubscribed: true,
    status: subscription.status,
    planType: subscription.plan_type,
    interval: subscription.interval,
    currentPeriodEnd: subscription.current_period_end,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    hasCoachingAccess: subscription.plan_type?.includes('coaching') || false
  };
}

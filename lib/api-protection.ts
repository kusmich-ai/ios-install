// lib/api-protection.ts
// Wrapper functions for protecting API routes

import { createClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';
import { canAccessStage, canAccessCoaching, canProgressToStage } from './access-control';

// Types
interface ProtectedRouteOptions {
  requireSubscription?: boolean;
  requireCoaching?: boolean;
  requiredStage?: number;
}

type ApiHandler = (
  req: NextRequest,
  context: { userId: string; params?: any }
) => Promise<NextResponse>;

/**
 * Wrapper for protected API routes
 * Handles authentication, subscription, and stage access checks
 */
export function withProtection(
  handler: ApiHandler,
  options: ProtectedRouteOptions = {}
) {
  return async (req: NextRequest, context?: { params?: any }) => {
    try {
      const supabase = await createClient();
      
      // 1. Authentication check
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return NextResponse.json(
          { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
          { status: 401 }
        );
      }

      // 2. Subscription check (if required)
      if (options.requireSubscription) {
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('status, current_period_end, cancel_at_period_end')
          .eq('user_id', user.id)
          .single();

        const isActive = 
          subscription?.status === 'active' || 
          subscription?.status === 'trialing' ||
          (subscription?.cancel_at_period_end && 
           new Date(subscription.current_period_end) > new Date());

        if (!isActive) {
          return NextResponse.json(
            { 
              error: 'Subscription required', 
              code: 'SUBSCRIPTION_REQUIRED',
              upgradeUrl: '/pricing'
            },
            { status: 403 }
          );
        }
      }

      // 3. Coaching access check (if required)
      if (options.requireCoaching) {
        const hasCoaching = await canAccessCoaching(user.id);
        
        if (!hasCoaching) {
          return NextResponse.json(
            { 
              error: 'Coaching subscription required', 
              code: 'COACHING_REQUIRED',
              upgradeUrl: '/pricing?upgrade=coaching'
            },
            { status: 403 }
          );
        }
      }

      // 4. Stage access check (if required)
      if (options.requiredStage) {
        const accessCheck = await canAccessStage(user.id, options.requiredStage);
        
        if (!accessCheck.hasAccess) {
          return NextResponse.json(
            { 
              error: `Stage ${options.requiredStage} access required`, 
              code: 'STAGE_LOCKED',
              currentStage: accessCheck.currentStage,
              requiredStage: options.requiredStage,
              reason: accessCheck.reason,
              upgradeUrl: accessCheck.reason === 'no_subscription' ? '/pricing' : undefined
            },
            { status: 403 }
          );
        }
      }

      // 5. Call the actual handler
      return handler(req, { userId: user.id, params: context?.params });
      
    } catch (error) {
      console.error('[API Protection Error]', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Validate stage progression request
 * Use this when user tries to unlock a new stage
 */
export async function validateStageProgression(
  userId: string,
  targetStage: number
): Promise<NextResponse | null> {
  const progressCheck = await canProgressToStage(userId, targetStage);
  
  if (!progressCheck.allowed) {
    return NextResponse.json(
      { 
        error: progressCheck.reason, 
        code: 'PROGRESSION_DENIED',
        allowed: false
      },
      { status: 403 }
    );
  }
  
  return null; // null means OK to proceed
}

/**
 * Extract and validate stage from request body or params
 */
export function getRequestedStage(req: NextRequest, body?: any): number | null {
  // Try URL params first
  const url = new URL(req.url);
  const stageParam = url.searchParams.get('stage');
  if (stageParam) {
    const stage = parseInt(stageParam, 10);
    if (!isNaN(stage) && stage >= 1 && stage <= 7) {
      return stage;
    }
  }
  
  // Try request body
  if (body?.stage) {
    const stage = parseInt(body.stage, 10);
    if (!isNaN(stage) && stage >= 1 && stage <= 7) {
      return stage;
    }
  }
  
  return null;
}

/**
 * Rate limiting helper (simple in-memory, use Redis in production)
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);
  
  if (!record || now > record.resetAt) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }
  
  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }
  
  record.count++;
  return { allowed: true, remaining: maxRequests - record.count, resetAt: record.resetAt };
}

/**
 * Apply rate limiting to a response
 */
export function withRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): NextResponse | null {
  const { allowed, remaining, resetAt } = checkRateLimit(identifier, maxRequests, windowMs);
  
  if (!allowed) {
    const response = NextResponse.json(
      { error: 'Too many requests', code: 'RATE_LIMITED' },
      { status: 429 }
    );
    response.headers.set('X-RateLimit-Remaining', '0');
    response.headers.set('X-RateLimit-Reset', resetAt.toString());
    response.headers.set('Retry-After', Math.ceil((resetAt - Date.now()) / 1000).toString());
    return response;
  }
  
  return null; // null means OK to proceed
}

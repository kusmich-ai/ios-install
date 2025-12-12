// lib/security/auth.ts
// Authentication & Authorization Helpers for API Routes

import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export interface AuthResult {
  authenticated: boolean;
  userId?: string;
  error?: string;
  user?: {
    id: string;
    email?: string;
    created_at?: string;
  };
}

/**
 * Verify user authentication from cookies
 * Use this at the start of every API route
 */
export async function verifyAuth(): Promise<AuthResult> {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
        },
      }
    );

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.error('[Auth] Error verifying user:', error.message);
      return {
        authenticated: false,
        error: 'Authentication failed',
      };
    }

    if (!user) {
      return {
        authenticated: false,
        error: 'Not authenticated',
      };
    }

    return {
      authenticated: true,
      userId: user.id,
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
      },
    };
  } catch (error) {
    console.error('[Auth] Unexpected error:', error);
    return {
      authenticated: false,
      error: 'Authentication error',
    };
  }
}

/**
 * Create an unauthorized response
 */
export function unauthorizedResponse(message?: string): NextResponse {
  return NextResponse.json(
    { 
      error: message || 'Unauthorized',
      code: 'UNAUTHORIZED',
    },
    { status: 401 }
  );
}

/**
 * Create a forbidden response (authenticated but not allowed)
 */
export function forbiddenResponse(message?: string): NextResponse {
  return NextResponse.json(
    { 
      error: message || 'Forbidden',
      code: 'FORBIDDEN',
    },
    { status: 403 }
  );
}

/**
 * Create a rate limited response
 */
export function rateLimitedResponse(retryAfter?: number): NextResponse {
  const headers: HeadersInit = {};
  if (retryAfter) {
    headers['Retry-After'] = String(Math.ceil(retryAfter / 1000));
  }

  return NextResponse.json(
    { 
      error: 'Too many requests. Please wait and try again.',
      code: 'RATE_LIMITED',
      retryAfter: retryAfter ? Math.ceil(retryAfter / 1000) : undefined,
    },
    { status: 429, headers }
  );
}

/**
 * Create a bad request response
 */
export function badRequestResponse(message: string): NextResponse {
  return NextResponse.json(
    { 
      error: message,
      code: 'BAD_REQUEST',
    },
    { status: 400 }
  );
}

/**
 * Verify that the authenticated user matches the requested userId
 * Prevents users from accessing other users' data
 */
export function verifyUserOwnership(
  authenticatedUserId: string,
  requestedUserId: string
): boolean {
  return authenticatedUserId === requestedUserId;
}

/**
 * Audit log helper - persists to database
 */
export interface AuditEntry {
  userId: string;
  action: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export async function logAuditEvent(entry: AuditEntry): Promise<void> {
  // Always log to console for immediate visibility
  console.log('[AUDIT]', JSON.stringify({
    ...entry,
    timestamp: new Date().toISOString(),
  }));

  // Persist to database
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    await supabase.from('audit_logs').insert({
      user_id: entry.userId,
      action: entry.action,
      details: entry.details || {},
      ip_address: entry.ipAddress || null,
      user_agent: entry.userAgent || null,
    });
  } catch (error) {
    // Don't fail the request if audit logging fails
    console.error('[AUDIT] Failed to persist audit log:', error);
  }
}

// lib/security/rateLimit.ts
// Drop this file into your /lib/security/ directory

/**
 * Rate Limiting Module
 * Prevents API abuse and runaway costs
 * 
 * Uses in-memory storage (resets on server restart)
 * For production scale, consider Redis or Supabase-based rate limiting
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
  blocked: boolean;
  blockUntil?: number;
}

// In-memory rate limit storage
// Key: userId, Value: rate limit data
const rateLimitMap = new Map<string, RateLimitEntry>();

// Configuration
const RATE_LIMIT_CONFIG = {
  // Chat API - most expensive
  chat: {
    windowMs: 60 * 1000,      // 1 minute window
    maxRequests: 30,          // 30 requests per minute
    blockDurationMs: 5 * 60 * 1000, // 5 minute block if exceeded repeatedly
    blockThreshold: 3,        // Block after 3 violations
  },
  // Practice logging - less expensive
  practice: {
    windowMs: 60 * 1000,
    maxRequests: 60,
    blockDurationMs: 2 * 60 * 1000,
    blockThreshold: 5,
  },
  // Progress calculations
  progress: {
    windowMs: 60 * 1000,
    maxRequests: 30,
    blockDurationMs: 2 * 60 * 1000,
    blockThreshold: 3,
  },
  // Default for unspecified endpoints
  default: {
    windowMs: 60 * 1000,
    maxRequests: 100,
    blockDurationMs: 60 * 1000,
    blockThreshold: 5,
  },
};

type RateLimitType = keyof typeof RATE_LIMIT_CONFIG;

// Track violations for progressive blocking
const violationMap = new Map<string, number>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number; // milliseconds until reset
  blocked: boolean;
  blockRemaining?: number; // milliseconds until unblock
}

/**
 * Check if a request should be rate limited
 * @param userId - The user's ID
 * @param type - The type of request (chat, practice, progress, default)
 * @returns Rate limit result
 */
export function checkRateLimit(
  userId: string,
  type: RateLimitType = 'default'
): RateLimitResult {
  const config = RATE_LIMIT_CONFIG[type] || RATE_LIMIT_CONFIG.default;
  const now = Date.now();
  const key = `${userId}:${type}`;

  // Get or create entry
  let entry = rateLimitMap.get(key);

  // Check if user is currently blocked
  if (entry?.blocked && entry.blockUntil) {
    if (now < entry.blockUntil) {
      return {
        allowed: false,
        remaining: 0,
        resetIn: entry.resetTime - now,
        blocked: true,
        blockRemaining: entry.blockUntil - now,
      };
    } else {
      // Block expired, reset everything
      entry.blocked = false;
      entry.blockUntil = undefined;
      violationMap.delete(key);
    }
  }

  // Reset if window expired
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 0,
      resetTime: now + config.windowMs,
      blocked: false,
    };
  }

  // Increment count
  entry.count++;
  rateLimitMap.set(key, entry);

  // Check if over limit
  if (entry.count > config.maxRequests) {
    // Track violation
    const violations = (violationMap.get(key) || 0) + 1;
    violationMap.set(key, violations);

    // Progressive blocking
    if (violations >= config.blockThreshold) {
      entry.blocked = true;
      entry.blockUntil = now + config.blockDurationMs;
      rateLimitMap.set(key, entry);
    }

    return {
      allowed: false,
      remaining: 0,
      resetIn: entry.resetTime - now,
      blocked: entry.blocked,
      blockRemaining: entry.blockUntil ? entry.blockUntil - now : undefined,
    };
  }

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetIn: entry.resetTime - now,
    blocked: false,
  };
}

/**
 * Get current rate limit status without incrementing
 */
export function getRateLimitStatus(
  userId: string,
  type: RateLimitType = 'default'
): RateLimitResult {
  const config = RATE_LIMIT_CONFIG[type] || RATE_LIMIT_CONFIG.default;
  const now = Date.now();
  const key = `${userId}:${type}`;

  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetTime) {
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetIn: config.windowMs,
      blocked: false,
    };
  }

  if (entry.blocked && entry.blockUntil && now < entry.blockUntil) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: entry.resetTime - now,
      blocked: true,
      blockRemaining: entry.blockUntil - now,
    };
  }

  return {
    allowed: entry.count < config.maxRequests,
    remaining: Math.max(0, config.maxRequests - entry.count),
    resetIn: entry.resetTime - now,
    blocked: false,
  };
}

/**
 * Reset rate limit for a user (admin function)
 */
export function resetRateLimit(userId: string, type?: RateLimitType): void {
  if (type) {
    rateLimitMap.delete(`${userId}:${type}`);
    violationMap.delete(`${userId}:${type}`);
  } else {
    // Reset all types for user
    for (const t of Object.keys(RATE_LIMIT_CONFIG)) {
      rateLimitMap.delete(`${userId}:${t}`);
      violationMap.delete(`${userId}:${t}`);
    }
  }
}

/**
 * Cleanup old entries (call periodically)
 */
export function cleanupRateLimits(): void {
  const now = Date.now();
  
  for (const [key, entry] of rateLimitMap.entries()) {
    // Remove entries that have expired and aren't blocked
    if (now > entry.resetTime && !entry.blocked) {
      rateLimitMap.delete(key);
    }
    // Remove entries that were blocked but block has expired
    if (entry.blocked && entry.blockUntil && now > entry.blockUntil) {
      rateLimitMap.delete(key);
      violationMap.delete(key);
    }
  }
}

// Optional: Auto-cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimits, 5 * 60 * 1000);
}

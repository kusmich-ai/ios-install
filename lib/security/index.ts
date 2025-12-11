// lib/security/index.ts
// Main export for security modules

export {
  sanitizeInput,
  cleanMessageContent,
  validateMessages,
  getSafeErrorResponse,
  type SanitizationResult,
} from './inputSanitization';

export {
  checkRateLimit,
  getRateLimitStatus,
  resetRateLimit,
  cleanupRateLimits,
  type RateLimitResult,
} from './rateLimit';

export {
  verifyAuth,
  unauthorizedResponse,
  forbiddenResponse,
  rateLimitedResponse,
  badRequestResponse,
  verifyUserOwnership,
  logAuditEvent,
  type AuthResult,
  type AuditEntry,
} from './auth';

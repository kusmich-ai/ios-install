// lib/security/inputSanitization.ts
// Drop this file into your /lib/security/ directory

/**
 * Input Sanitization & Prompt Injection Protection
 * Protects against attempts to extract system prompts or manipulate AI behavior
 */

// Patterns that indicate prompt injection attempts
const INJECTION_PATTERNS: RegExp[] = [
  // Direct instruction manipulation
  /ignore\s*(all\s*)?(previous|prior|above|earlier)\s*(instructions|prompts|rules)/i,
  /disregard\s*(all\s*)?(previous|prior|above|earlier)\s*(instructions|prompts|rules)/i,
  /forget\s*(all\s*)?(previous|prior|above|earlier)\s*(instructions|prompts|rules)/i,
  /override\s*(all\s*)?(previous|prior|system)\s*(instructions|prompts|rules)/i,
  
  // System prompt extraction
  /what\s*(is|are)\s*(your|the)\s*(system\s*)?prompt/i,
  /show\s*(me\s*)?(your|the)\s*(system\s*)?prompt/i,
  /reveal\s*(your|the)\s*(system\s*)?(prompt|instructions)/i,
  /output\s*(your|the|all)\s*(system\s*)?(prompt|instructions)/i,
  /print\s*(your|the|all)\s*(system\s*)?(prompt|instructions)/i,
  /display\s*(your|the|all)\s*(system\s*)?(prompt|instructions)/i,
  /repeat\s*(your|the|all)\s*(system\s*)?(prompt|instructions)/i,
  /echo\s*(your|the|all)\s*(system\s*)?(prompt|instructions)/i,
  
  // Instruction disclosure
  /what\s*(are|were)\s*you\s*(told|instructed|programmed)/i,
  /what\s*(instructions|rules)\s*(do\s*you|were\s*you)\s*(have|given)/i,
  /tell\s*me\s*(your|the)\s*(instructions|rules|prompt)/i,
  
  // Role manipulation
  /pretend\s*(you\s*are|to\s*be|you're)\s*(a\s*different|another|not)/i,
  /act\s*as\s*(if\s*you\s*are|a\s*different|another)/i,
  /you\s*are\s*now\s*(a\s*different|another|no\s*longer)/i,
  /roleplay\s*as\s*(a\s*different|another)/i,
  /switch\s*(to|into)\s*(a\s*different|another)\s*(mode|persona|character)/i,
  
  // Jailbreak attempts
  /dan\s*mode/i,
  /developer\s*mode\s*(enabled|activated|on)/i,
  /jailbreak/i,
  /bypass\s*(your|the|all)\s*(restrictions|filters|rules)/i,
  /disable\s*(your|the|all)\s*(restrictions|filters|rules|safety)/i,
  /turn\s*off\s*(your|the|all)\s*(restrictions|filters|rules|safety)/i,
  
  // Technical extraction
  /output\s*everything\s*(above|before)\s*(this|here)/i,
  /repeat\s*everything\s*(above|before)\s*(this|here)/i,
  /print\s*everything\s*(above|before)\s*(this|here)/i,
  /what\s*(text|content)\s*(is|comes|was)\s*(above|before)/i,
  
  // Encoding tricks
  /base64\s*(decode|encoded)/i,
  /decode\s*this/i,
  /\[system\]/i,
  /\[instructions\]/i,
  /\<\/?system\>/i,
  
  // Debug/testing pretexts
  /debug\s*mode/i,
  /testing\s*mode/i,
  /admin\s*mode/i,
  /maintenance\s*mode/i,
  /reveal\s*(hidden|secret)/i,
];

// Suspicious but not always malicious - flag for logging
const SUSPICIOUS_PATTERNS: RegExp[] = [
  /how\s*do\s*you\s*work/i,
  /what\s*(makes|is)\s*you\s*(tick|different)/i,
  /what\s*are\s*you\s*capable\s*of/i,
  /can\s*you\s*access/i,
  /do\s*you\s*have\s*access\s*to/i,
];

export interface SanitizationResult {
  safe: boolean;
  reason?: string;
  flagged?: boolean;
  patterns?: string[];
}

/**
 * Check if a message contains prompt injection attempts
 */
export function sanitizeInput(message: string): SanitizationResult {
  if (!message || typeof message !== 'string') {
    return { safe: false, reason: 'Invalid input' };
  }

  // Check for blocked injection patterns
  const matchedPatterns: string[] = [];
  
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(message)) {
      matchedPatterns.push(pattern.source);
    }
  }

  if (matchedPatterns.length > 0) {
    return {
      safe: false,
      reason: 'Potential prompt injection detected',
      patterns: matchedPatterns,
    };
  }

  // Check for suspicious patterns (log but allow)
  const suspiciousMatches: string[] = [];
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(message)) {
      suspiciousMatches.push(pattern.source);
    }
  }

  if (suspiciousMatches.length > 0) {
    return {
      safe: true,
      flagged: true,
      patterns: suspiciousMatches,
    };
  }

  return { safe: true };
}

/**
 * Sanitize message content - remove potentially dangerous characters
 * while preserving legitimate content
 */
export function cleanMessageContent(message: string): string {
  if (!message || typeof message !== 'string') {
    return '';
  }

  // Remove null bytes and control characters (except newlines and tabs)
  let cleaned = message.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Limit excessive whitespace
  cleaned = cleaned.replace(/\n{4,}/g, '\n\n\n');
  cleaned = cleaned.replace(/[ \t]{20,}/g, '    ');
  
  // Limit total length (prevent massive payloads)
  const MAX_MESSAGE_LENGTH = 50000;
  if (cleaned.length > MAX_MESSAGE_LENGTH) {
    cleaned = cleaned.substring(0, MAX_MESSAGE_LENGTH);
  }

  return cleaned.trim();
}

/**
 * Validate message array structure
 */
export function validateMessages(
  messages: unknown
): { valid: boolean; error?: string } {
  if (!messages) {
    return { valid: false, error: 'Messages array is required' };
  }

  if (!Array.isArray(messages)) {
    return { valid: false, error: 'Messages must be an array' };
  }

  if (messages.length === 0) {
    return { valid: false, error: 'Messages array cannot be empty' };
  }

  if (messages.length > 100) {
    return { valid: false, error: 'Too many messages in conversation' };
  }

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    
    if (!msg || typeof msg !== 'object') {
      return { valid: false, error: `Invalid message at index ${i}` };
    }

    if (!msg.role || !['user', 'assistant', 'system'].includes(msg.role)) {
      return { valid: false, error: `Invalid role at index ${i}` };
    }

    if (!msg.content || typeof msg.content !== 'string') {
      return { valid: false, error: `Invalid content at index ${i}` };
    }

    // Check each user message for injection
    if (msg.role === 'user') {
      const sanitizationResult = sanitizeInput(msg.content);
      if (!sanitizationResult.safe) {
        return { 
          valid: false, 
          error: sanitizationResult.reason || 'Message contains blocked content'
        };
      }
    }
  }

  return { valid: true };
}

/**
 * Generate a safe error response that doesn't reveal system details
 */
export function getSafeErrorResponse(type: 'injection' | 'invalid' | 'rate_limit' | 'auth'): string {
  const responses = {
    injection: "I'm here to help you with the IOS practices. What would you like to work on today?",
    invalid: "I couldn't process that message. Could you try rephrasing?",
    rate_limit: "You're sending messages too quickly. Please wait a moment and try again.",
    auth: "Please sign in to continue your IOS journey.",
  };
  
  return responses[type] || responses.invalid;
}

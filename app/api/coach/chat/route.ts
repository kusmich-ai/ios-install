// app/api/coach/chat/route.ts - FINAL VERSION WITH MEMORY INJECTION
import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { getCoachSystemPrompt, CoachId } from '@/lib/coachPrompts';
import { withCueKernel } from '@/lib/prompts/withCueKernel';

import {
  verifyAuth,
  unauthorizedResponse,
  rateLimitedResponse,
  badRequestResponse,
  logAuditEvent,
} from '@/lib/security/auth';
import {
  sanitizeInput,
  cleanMessageContent,
  validateMessages,
  getSafeErrorResponse,
} from '@/lib/security/inputSanitization';
import { checkRateLimit } from '@/lib/security/rateLimit';
import {
  checkForSafetyIssues,
  addSafetyToPrompt,
  BoundaryCategory,
} from '@/lib/crisisDetection';
import { sendSafetyNotification } from '@/lib/notifications';
import { getMemoryContext } from '@/lib/memoryService';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

type MessageRole = 'user' | 'assistant';

interface Message {
  role: string;
  content: string;
}

interface RequestBody {
  messages: Message[];
  coachId: CoachId;
  conversationId?: string;
}

// Map categories to audit action names
const ACTION_MAP: Record<BoundaryCategory, string> = {
  crisis: 'CRISIS_DETECTED',
  concern: 'CONCERN_DETECTED',
  child_safety: 'CHILD_SAFETY_DETECTED',
  psychotic_symptoms: 'PSYCHOTIC_SYMPTOMS_DETECTED',
  abuse_situation: 'ABUSE_SITUATION_DETECTED',
  eating_disorder: 'EATING_DISORDER_DETECTED',
  substance_abuse: 'SUBSTANCE_ABUSE_DETECTED',
  deep_trauma: 'DEEP_TRAUMA_DETECTED',
  diagnosis_seeking: 'DIAGNOSIS_SEEKING_DETECTED',
  sexual_content: 'SEXUAL_CONTENT_BLOCKED',
  illegal_activity: 'ILLEGAL_ACTIVITY_BLOCKED',
  medication: 'MEDICAL_ADVICE_REDIRECTED',
  legal: 'LEGAL_ADVICE_REDIRECTED',
  financial: 'FINANCIAL_ADVICE_REDIRECTED',
  none: 'NONE',
};

export async function POST(req: Request) {
  try {
    // STEP 1: VERIFY AUTHENTICATION
    const authResult = await verifyAuth();
    
    if (!authResult.authenticated || !authResult.userId) {
      console.log('[API/Coach/Chat] Unauthorized request');
      return unauthorizedResponse('Please sign in to continue.');
    }

    const userId = authResult.userId;

    // STEP 2: CHECK RATE LIMIT
    const rateLimitResult = checkRateLimit(userId, 'chat');
    
    if (!rateLimitResult.allowed) {
      console.log('[API/Coach/Chat] Rate limited:', userId);
      
      await logAuditEvent({
        userId,
        action: 'RATE_LIMIT_HIT',
        details: { blocked: rateLimitResult.blocked, context: 'coach_chat' },
      });

      return rateLimitedResponse(rateLimitResult.blockRemaining || rateLimitResult.resetIn);
    }

    // STEP 3: PARSE AND VALIDATE REQUEST
    const body: RequestBody = await req.json();
    const { messages, coachId, conversationId } = body;

    // Validate coachId
    if (!coachId || !['nic', 'fehren'].includes(coachId)) {
      return badRequestResponse('Invalid coach ID');
    }

    const validationResult = validateMessages(messages);
    if (!validationResult.valid) {
      console.log('[API/Coach/Chat] Invalid messages:', validationResult.error);
      return badRequestResponse(validationResult.error || 'Invalid messages');
    }

    // STEP 4: GET LATEST USER MESSAGE
    const userMessages = messages.filter((m: Message) => m.role === 'user');
    const latestUserMessage = userMessages[userMessages.length - 1];
    
    if (!latestUserMessage) {
      return badRequestResponse('No user message found');
    }

    // STEP 5: CHECK FOR PROMPT INJECTION
    const sanitizationResult = sanitizeInput(latestUserMessage.content);
    
    if (!sanitizationResult.safe) {
      console.log('[API/Coach/Chat] Blocked injection attempt:', userId);
      
      await logAuditEvent({
        userId,
        action: 'INJECTION_BLOCKED',
        details: { patterns: sanitizationResult.patterns, context: 'coach_chat', coachId },
      });

      return NextResponse.json({
        response: getSafeErrorResponse('injection'),
        coachId,
      });
    }

    // STEP 6: COMPREHENSIVE SAFETY CHECK
    const safetyCheck = checkForSafetyIssues(latestUserMessage.content);
    
    // Log and notify for safety events
    if (safetyCheck.category !== 'none') {
      const actionType = ACTION_MAP[safetyCheck.category];

      console.log(`[API/Coach/Chat] Safety event: ${safetyCheck.category}`, userId, safetyCheck.matchedPhrases);
      
      // Log to audit system
      await logAuditEvent({
        userId,
        action: actionType,
        details: { 
          coachId, 
          category: safetyCheck.category,
          level: safetyCheck.level,
          phrases: safetyCheck.matchedPhrases,
          blocked: safetyCheck.blockResponse,
          conversationId,
        },
      });

      // Send Slack notification for critical/high-priority events
      sendSafetyNotification(actionType, {
        coachId,
        userId,
        matchedPhrases: safetyCheck.matchedPhrases,
        category: safetyCheck.category,
        level: safetyCheck.level,
        conversationId,
      }).catch(err => {
        console.error('[API/Coach/Chat] Notification error (non-blocking):', err);
      });

      // If this category requires blocking, return the prepared response
      if (safetyCheck.blockResponse && safetyCheck.suggestedResponse) {
        return NextResponse.json({
          response: safetyCheck.suggestedResponse,
          coachId,
          safetyCategory: safetyCheck.category,
          safetyTriggered: true,
        });
      }
    }

    // STEP 7: FETCH USER MEMORIES
    let memoryContext = '';
    try {
      memoryContext = await getMemoryContext(userId, coachId);
      if (memoryContext) {
        console.log(`[API/Coach/Chat] Loaded memory context for user ${userId.slice(0, 8)}...`);
      }
    } catch (memoryError) {
      // Don't fail the request if memory loading fails
      console.error('[API/Coach/Chat] Error loading memories (non-blocking):', memoryError);
    }

    // STEP 8: BUILD SYSTEM PROMPT
let systemPrompt = getCoachSystemPrompt(coachId);

// Add safety protocols
systemPrompt = addSafetyToPrompt(systemPrompt);

// Add memory context if available
if (memoryContext) {
  systemPrompt += `\n\n${memoryContext}`;
}

// If concern was detected but not blocked, add context for AI
if (safetyCheck.level === 'concern' && !safetyCheck.blockResponse) {
  systemPrompt += `\n\n## CURRENT CONTEXT - HANDLE WITH CARE
The user's message contains language suggesting possible distress (detected: ${safetyCheck.matchedPhrases.join(', ')}). Check in on their wellbeing before proceeding with coaching. Ask directly if they're having thoughts of hurting themselves. Prioritize their safety over coaching content.`;
}

// IMPORTANT: Apply cue kernel LAST so it overrides everything above
systemPrompt = withCueKernel(systemPrompt);


    // STEP 9: PREPARE MESSAGES
    const conversationMessages: Array<{ role: MessageRole; content: string }> = messages
      .filter((msg: Message) => msg.role !== 'system')
      .map((msg: Message) => ({
        role: (msg.role === 'assistant' ? 'assistant' : 'user') as MessageRole,
        content: cleanMessageContent(msg.content),
      }));

    // STEP 10: MAKE API CALL
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: systemPrompt,
      messages: conversationMessages,
    });

    const responseText = response.content[0].type === 'text' 
      ? response.content[0].text 
      : '';

    return NextResponse.json({ 
      response: responseText,
      coachId,
    });

  } catch (error) {
    console.error('[API/Coach/Chat] Error:', error);
    
    return NextResponse.json(
      { error: 'Failed to process request. Please try again.' },
      { status: 500 }
    );
  }
}

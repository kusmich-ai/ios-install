// app/api/coach/chat/route.ts
import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { getCoachSystemPrompt, CoachId } from '@/lib/coachPrompts';
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
  memories?: string[];
}

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
    const { messages, coachId, memories } = body;

    // Validate coachId
    if (!coachId || !['nic', 'fehren'].includes(coachId)) {
      return badRequestResponse('Invalid coach ID');
    }

    const validationResult = validateMessages(messages);
    if (!validationResult.valid) {
      console.log('[API/Coach/Chat] Invalid messages:', validationResult.error);
      return badRequestResponse(validationResult.error || 'Invalid messages');
    }

    // STEP 4: SANITIZE INPUT
    const userMessages = messages.filter((m: Message) => m.role === 'user');
    const latestUserMessage = userMessages[userMessages.length - 1];
    
    if (latestUserMessage) {
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
    }

    // STEP 5: BUILD SYSTEM PROMPT
    let systemPrompt = getCoachSystemPrompt(coachId);

    // Inject memories if available
    if (memories && memories.length > 0) {
      systemPrompt += `\n\n## WHAT YOU REMEMBER ABOUT THIS USER\n${memories.join('\n')}`;
    }

    // STEP 6: PREPARE MESSAGES
    const conversationMessages: Array<{ role: MessageRole; content: string }> = messages
      .filter((msg: Message) => msg.role !== 'system')
      .map((msg: Message) => ({
        role: (msg.role === 'assistant' ? 'assistant' : 'user') as MessageRole,
        content: cleanMessageContent(msg.content),
      }));

    // STEP 7: MAKE API CALL
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

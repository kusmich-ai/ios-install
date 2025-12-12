// app/api/coach/conversations/route.ts - SECURED VERSION
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { CoachId } from '@/lib/coachPrompts';
import {
  verifyAuth,
  unauthorizedResponse,
  rateLimitedResponse,
  badRequestResponse,
  logAuditEvent,
} from '@/lib/security/auth';
import { checkRateLimit } from '@/lib/security/rateLimit';
import {
  sanitizeInput,
  getSafeErrorResponse,
} from '@/lib/security/inputSanitization';

// Helper to create Supabase server client
async function createSupabaseServer() {
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );
}

// Validate UUID format
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// Sanitize conversation title
function sanitizeTitle(title: string): string {
  if (!title || typeof title !== 'string') return 'New conversation';
  // Remove any HTML/script tags, limit length
  return title
    .replace(/<[^>]*>/g, '')
    .replace(/[<>]/g, '')
    .slice(0, 100)
    .trim() || 'New conversation';
}

// ============================================
// GET - Fetch conversations for a coach
// ============================================
export async function GET(req: Request) {
  try {
    // STEP 1: VERIFY AUTHENTICATION
    const authResult = await verifyAuth();
    
    if (!authResult.authenticated || !authResult.userId) {
      console.log('[Coach/Conversations] Unauthorized GET request');
      return unauthorizedResponse('Please sign in to continue.');
    }

    const userId = authResult.userId;

    // STEP 2: CHECK RATE LIMIT (more lenient for reads)
    const rateLimitResult = checkRateLimit(userId, 'default');
    
    if (!rateLimitResult.allowed) {
      console.log('[Coach/Conversations] Rate limited:', userId);
      
      await logAuditEvent({
        userId,
        action: 'RATE_LIMIT_HIT',
        details: { context: 'coach_conversations_get' },
      });

      return rateLimitedResponse(rateLimitResult.blockRemaining || rateLimitResult.resetIn);
    }

    // STEP 3: VALIDATE QUERY PARAMS
    const { searchParams } = new URL(req.url);
    const coachId = searchParams.get('coachId') as CoachId;
    const conversationId = searchParams.get('conversationId');

    if (!coachId || !['nic', 'fehren'].includes(coachId)) {
      return badRequestResponse('Invalid coach ID');
    }

    if (conversationId && !isValidUUID(conversationId)) {
      return badRequestResponse('Invalid conversation ID format');
    }

    // STEP 4: FETCH DATA
    const supabase = await createSupabaseServer();

    // If conversationId provided, fetch single conversation
    if (conversationId) {
      const { data, error } = await supabase
        .from('coach_conversations')
        .select('*')
        .eq('id', conversationId)
        .eq('user_id', userId)
        .eq('coach_id', coachId)
        .single();

      if (error) {
        console.error('[Coach/Conversations] Error fetching conversation:', error);
        return NextResponse.json({ error: 'Failed to fetch conversation' }, { status: 500 });
      }

      return NextResponse.json({ conversation: data });
    }

    // Otherwise, fetch all conversations for this coach
    const { data, error } = await supabase
      .from('coach_conversations')
      .select('id, title, updated_at, created_at')
      .eq('user_id', userId)
      .eq('coach_id', coachId)
      .order('updated_at', { ascending: false })
      .limit(50); // Prevent excessive data fetching

    if (error) {
      console.error('[Coach/Conversations] Error fetching conversations:', error);
      return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
    }

    return NextResponse.json({ conversations: data || [] });

  } catch (error) {
    console.error('[Coach/Conversations] GET Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================
// POST - Create new conversation or update existing
// ============================================
export async function POST(req: Request) {
  try {
    // STEP 1: VERIFY AUTHENTICATION
    const authResult = await verifyAuth();
    
    if (!authResult.authenticated || !authResult.userId) {
      console.log('[Coach/Conversations] Unauthorized POST request');
      return unauthorizedResponse('Please sign in to continue.');
    }

    const userId = authResult.userId;

    // STEP 2: CHECK RATE LIMIT
    const rateLimitResult = checkRateLimit(userId, 'default');
    
    if (!rateLimitResult.allowed) {
      console.log('[Coach/Conversations] Rate limited:', userId);
      
      await logAuditEvent({
        userId,
        action: 'RATE_LIMIT_HIT',
        details: { context: 'coach_conversations_post' },
      });

      return rateLimitedResponse(rateLimitResult.blockRemaining || rateLimitResult.resetIn);
    }

    // STEP 3: PARSE AND VALIDATE REQUEST
    const body = await req.json();
    const { coachId, conversationId, messages, title } = body;

    if (!coachId || !['nic', 'fehren'].includes(coachId)) {
      return badRequestResponse('Invalid coach ID');
    }

    if (conversationId && !isValidUUID(conversationId)) {
      return badRequestResponse('Invalid conversation ID format');
    }

    // Validate messages array
    if (messages) {
      if (!Array.isArray(messages)) {
        return badRequestResponse('Messages must be an array');
      }
      
      if (messages.length > 200) {
        return badRequestResponse('Too many messages in conversation');
      }

      // Check each message for injection attempts
      for (const msg of messages) {
        if (msg.role === 'user' && msg.content) {
          const sanitizationResult = sanitizeInput(msg.content);
          if (!sanitizationResult.safe) {
            console.log('[Coach/Conversations] Injection detected in message save:', userId);
            
            await logAuditEvent({
              userId,
              action: 'INJECTION_BLOCKED',
              details: { 
                patterns: sanitizationResult.patterns, 
                context: 'coach_conversations_save',
                coachId 
              },
            });
            
            // Don't block the save, but log it - the message was already sent
            // Just continue with the save
          }
        }
      }
    }

    // STEP 4: PERFORM DATABASE OPERATION
    const supabase = await createSupabaseServer();
    const sanitizedTitle = sanitizeTitle(title);

    // Update existing conversation
    if (conversationId) {
      const updateData: any = {};
      if (messages) updateData.messages = messages;
      if (title) updateData.title = sanitizedTitle;

      const { data, error } = await supabase
        .from('coach_conversations')
        .update(updateData)
        .eq('id', conversationId)
        .eq('user_id', userId) // Ensure user owns this conversation
        .select()
        .single();

      if (error) {
        console.error('[Coach/Conversations] Error updating conversation:', error);
        return NextResponse.json({ error: 'Failed to update conversation' }, { status: 500 });
      }

      return NextResponse.json({ conversation: data });
    }

    // Create new conversation
    const { data, error } = await supabase
      .from('coach_conversations')
      .insert({
        user_id: userId,
        coach_id: coachId,
        messages: messages || [],
        title: sanitizedTitle,
      })
      .select()
      .single();

    if (error) {
      console.error('[Coach/Conversations] Error creating conversation:', error);
      return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
    }

    // Log new conversation creation
    await logAuditEvent({
      userId,
      action: 'COACH_CONVERSATION_CREATED',
      details: { coachId, conversationId: data.id },
    });

    return NextResponse.json({ conversation: data });

  } catch (error) {
    console.error('[Coach/Conversations] POST Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================
// DELETE - Delete a conversation
// ============================================
export async function DELETE(req: Request) {
  try {
    // STEP 1: VERIFY AUTHENTICATION
    const authResult = await verifyAuth();
    
    if (!authResult.authenticated || !authResult.userId) {
      console.log('[Coach/Conversations] Unauthorized DELETE request');
      return unauthorizedResponse('Please sign in to continue.');
    }

    const userId = authResult.userId;

    // STEP 2: CHECK RATE LIMIT
    const rateLimitResult = checkRateLimit(userId, 'default');
    
    if (!rateLimitResult.allowed) {
      return rateLimitedResponse(rateLimitResult.blockRemaining || rateLimitResult.resetIn);
    }

    // STEP 3: VALIDATE PARAMS
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return badRequestResponse('Conversation ID required');
    }

    if (!isValidUUID(conversationId)) {
      return badRequestResponse('Invalid conversation ID format');
    }

    // STEP 4: DELETE
    const supabase = await createSupabaseServer();

    const { error } = await supabase
      .from('coach_conversations')
      .delete()
      .eq('id', conversationId)
      .eq('user_id', userId); // Ensure user owns this conversation

    if (error) {
      console.error('[Coach/Conversations] Error deleting conversation:', error);
      return NextResponse.json({ error: 'Failed to delete conversation' }, { status: 500 });
    }

    // Log deletion
    await logAuditEvent({
      userId,
      action: 'COACH_CONVERSATION_DELETED',
      details: { conversationId },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[Coach/Conversations] DELETE Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

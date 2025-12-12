// app/api/coach/memory/route.ts
// API routes for coach memory operations

import { NextResponse } from 'next/server';
import {
  verifyAuth,
  unauthorizedResponse,
  rateLimitedResponse,
  badRequestResponse,
  logAuditEvent,
} from '@/lib/security/auth';
import { checkRateLimit } from '@/lib/security/rateLimit';
import {
  getMemories,
  deleteMemory,
  deleteAllMemories,
  getMemoryContext,
  Memory,
} from '@/lib/memoryService';
import {
  extractMemoriesFromConversation,
} from '@/lib/memoryExtraction';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

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

// ============================================
// GET - Fetch memories for a user/coach
// ============================================
export async function GET(req: Request) {
  try {
    // Verify authentication
    const authResult = await verifyAuth();
    
    if (!authResult.authenticated || !authResult.userId) {
      return unauthorizedResponse('Please sign in to continue.');
    }

    const userId = authResult.userId;

    // Check rate limit
    const rateLimitResult = checkRateLimit(userId, 'default');
    if (!rateLimitResult.allowed) {
      return rateLimitedResponse(rateLimitResult.resetIn);
    }

    // Get params
    const { searchParams } = new URL(req.url);
    const coachId = searchParams.get('coachId');
    const format = searchParams.get('format'); // 'raw' or 'prompt'

    if (!coachId || !['nic', 'fehren'].includes(coachId)) {
      return badRequestResponse('Invalid coach ID');
    }

    if (format === 'prompt') {
      // Return formatted for prompt injection
      const context = await getMemoryContext(userId, coachId);
      return NextResponse.json({ context });
    }

    // Return raw memories
    const memories = await getMemories(userId, coachId);
    
    return NextResponse.json({ 
      memories,
      count: memories.length,
    });

  } catch (error) {
    console.error('[API/Coach/Memory] GET Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================
// POST - Extract memories from a conversation
// ============================================
export async function POST(req: Request) {
  try {
    // Verify authentication
    const authResult = await verifyAuth();
    
    if (!authResult.authenticated || !authResult.userId) {
      return unauthorizedResponse('Please sign in to continue.');
    }

    const userId = authResult.userId;

    // Check rate limit (stricter for extraction since it calls Claude)
    const rateLimitResult = checkRateLimit(userId, 'chat');
    if (!rateLimitResult.allowed) {
      return rateLimitedResponse(rateLimitResult.resetIn);
    }

    // Parse request
    const body = await req.json();
    const { coachId, conversationId, messages } = body;

    if (!coachId || !['nic', 'fehren'].includes(coachId)) {
      return badRequestResponse('Invalid coach ID');
    }

    if (!conversationId) {
      return badRequestResponse('Conversation ID required');
    }

    if (!messages || !Array.isArray(messages)) {
      return badRequestResponse('Messages array required');
    }

    // Get existing memories to avoid duplicates
    const existingMemories = await getMemories(userId, coachId);
    const existingForExtraction = existingMemories.map(m => ({
      category: m.category,
      key: m.key,
      value: m.value,
      confidence: m.confidence,
    }));

    // Extract memories
    const result = await extractMemoriesFromConversation(
      userId,
      coachId,
      conversationId,
      messages,
      existingForExtraction
    );

    // Log extraction
    await logAuditEvent({
      userId,
      action: 'MEMORY_EXTRACTION',
      details: {
        coachId,
        conversationId,
        memoriesExtracted: result.memoriesExtracted,
        success: result.success,
      },
    });

    return NextResponse.json({
      success: result.success,
      memoriesExtracted: result.memoriesExtracted,
      memories: result.memories,
    });

  } catch (error) {
    console.error('[API/Coach/Memory] POST Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================
// DELETE - Delete memories
// ============================================
export async function DELETE(req: Request) {
  try {
    // Verify authentication
    const authResult = await verifyAuth();
    
    if (!authResult.authenticated || !authResult.userId) {
      return unauthorizedResponse('Please sign in to continue.');
    }

    const userId = authResult.userId;

    // Check rate limit
    const rateLimitResult = checkRateLimit(userId, 'default');
    if (!rateLimitResult.allowed) {
      return rateLimitedResponse(rateLimitResult.resetIn);
    }

    // Get params
    const { searchParams } = new URL(req.url);
    const coachId = searchParams.get('coachId');
    const memoryKey = searchParams.get('key');
    const deleteAll = searchParams.get('all') === 'true';

    if (!coachId || !['nic', 'fehren'].includes(coachId)) {
      return badRequestResponse('Invalid coach ID');
    }

    if (deleteAll) {
      // Delete all memories for this coach
      const success = await deleteAllMemories(userId, coachId);
      
      if (success) {
        await logAuditEvent({
          userId,
          action: 'MEMORY_DELETE_ALL',
          details: { coachId },
        });
      }
      
      return NextResponse.json({ success, deleted: 'all' });
    }

    if (!memoryKey) {
      return badRequestResponse('Memory key required (or use all=true)');
    }

    // Delete specific memory
    const success = await deleteMemory(userId, coachId, memoryKey);
    
    if (success) {
      await logAuditEvent({
        userId,
        action: 'MEMORY_DELETE',
        details: { coachId, key: memoryKey },
      });
    }

    return NextResponse.json({ success, deleted: memoryKey });

  } catch (error) {
    console.error('[API/Coach/Memory] DELETE Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

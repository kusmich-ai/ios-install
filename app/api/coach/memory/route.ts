// app/api/coach/memory/route.ts
// API routes for coach memory operations - UPDATED with management features

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
  getAllUserMemories,
  getMemoryCount,
  deleteMemory,
  deleteMemoryById,
  deleteAllMemories,
  getMemoryContext,
} from '@/lib/memoryService';
import {
  extractMemoriesFromConversation,
} from '@/lib/memoryExtraction';

// ============================================
// GET - Fetch memories for a user
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
    const format = searchParams.get('format'); // 'raw', 'prompt', or 'all'
    const includeShared = searchParams.get('shared') !== 'false'; // Default true

    // Format: 'all' - get ALL memories across all coaches (for management UI)
    if (format === 'all') {
      const memories = await getAllUserMemories(userId);
      const count = memories.length;
      
      return NextResponse.json({ 
        memories,
        count,
      });
    }

    // Otherwise need coachId
    if (!coachId || !['nic', 'fehren'].includes(coachId)) {
      return badRequestResponse('Invalid coach ID');
    }

    // Format: 'prompt' - return formatted for prompt injection
    if (format === 'prompt') {
      const context = await getMemoryContext(userId, coachId, includeShared);
      return NextResponse.json({ context });
    }

    // Format: 'count' - just return count
    if (format === 'count') {
      const count = await getMemoryCount(userId, coachId);
      return NextResponse.json({ count });
    }

    // Default: return raw memories
    const memories = await getMemories(userId, coachId, undefined, includeShared);
    
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
    const memoryId = searchParams.get('id');
    const deleteAll = searchParams.get('all') === 'true';
    const deleteEverything = searchParams.get('everything') === 'true';

    // Delete EVERYTHING across all coaches
    if (deleteEverything) {
      const success = await deleteAllMemories(userId); // No coachId = all coaches
      
      if (success) {
        await logAuditEvent({
          userId,
          action: 'MEMORY_DELETE_EVERYTHING',
          details: { scope: 'all_coaches' },
        });
      }
      
      return NextResponse.json({ success, deleted: 'everything' });
    }

    // Delete all for specific coach
    if (deleteAll) {
      if (!coachId || !['nic', 'fehren'].includes(coachId)) {
        return badRequestResponse('Invalid coach ID');
      }
      
      const success = await deleteAllMemories(userId, coachId);
      
      if (success) {
        await logAuditEvent({
          userId,
          action: 'MEMORY_DELETE_ALL',
          details: { coachId },
        });
      }
      
      return NextResponse.json({ success, deleted: 'all', coachId });
    }

    // Delete by ID (preferred for UI)
    if (memoryId) {
      const success = await deleteMemoryById(userId, memoryId);
      
      if (success) {
        await logAuditEvent({
          userId,
          action: 'MEMORY_DELETE',
          details: { memoryId },
        });
      }
      
      return NextResponse.json({ success, deleted: memoryId });
    }

    // Delete by key (legacy)
    if (memoryKey && coachId) {
      if (!['nic', 'fehren'].includes(coachId)) {
        return badRequestResponse('Invalid coach ID');
      }
      
      const success = await deleteMemory(userId, coachId, memoryKey);
      
      if (success) {
        await logAuditEvent({
          userId,
          action: 'MEMORY_DELETE',
          details: { coachId, key: memoryKey },
        });
      }

      return NextResponse.json({ success, deleted: memoryKey });
    }

    return badRequestResponse('Provide id, key+coachId, all+coachId, or everything=true');

  } catch (error) {
    console.error('[API/Coach/Memory] DELETE Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

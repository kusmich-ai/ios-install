// app/api/coach/conversations/search/route.ts
// Search through past conversations

import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import {
  verifyAuth,
  unauthorizedResponse,
  rateLimitedResponse,
  badRequestResponse,
} from '@/lib/security/auth';
import { checkRateLimit } from '@/lib/security/rateLimit';

// ============================================
// SUPABASE CLIENT
// ============================================
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
// HELPER: Extract matching snippet from messages
// ============================================
function extractSnippet(
  messages: Array<{ role: string; content: string }>,
  query: string,
  snippetLength: number = 80
): string | null {
  const lowerQuery = query.toLowerCase();
  
  for (const msg of messages) {
    const content = msg.content;
    const lowerContent = content.toLowerCase();
    const index = lowerContent.indexOf(lowerQuery);
    
    if (index !== -1) {
      // Found a match - extract snippet around it
      const start = Math.max(0, index - 30);
      const end = Math.min(content.length, index + query.length + snippetLength);
      
      let snippet = content.slice(start, end);
      
      // Add ellipsis if truncated
      if (start > 0) snippet = '...' + snippet;
      if (end < content.length) snippet = snippet + '...';
      
      return snippet;
    }
  }
  
  return null;
}

// ============================================
// GET - Search conversations
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
    const query = searchParams.get('q')?.trim();
    const coachId = searchParams.get('coachId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

    if (!query || query.length < 2) {
      return badRequestResponse('Search query must be at least 2 characters');
    }

    if (!coachId || !['nic', 'fehren'].includes(coachId)) {
      return badRequestResponse('Invalid coach ID');
    }

    const supabase = await createSupabaseServer();

    // Search in title and messages content
    // Using ILIKE for case-insensitive search
    // messages is JSONB, so we cast to text for searching
    const { data: conversations, error } = await supabase
      .from('coach_conversations')
      .select('id, title, messages, updated_at')
      .eq('user_id', userId)
      .eq('coach_id', coachId)
      .or(`title.ilike.%${query}%,messages::text.ilike.%${query}%`)
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[API/Search] Error:', error);
      return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }

    // Process results to add snippets
    const results = (conversations || []).map(conv => {
      const messages = conv.messages as Array<{ role: string; content: string }>;
      const snippet = extractSnippet(messages, query);
      
      return {
        id: conv.id,
        title: conv.title,
        snippet,
        updated_at: conv.updated_at,
        messageCount: messages?.length || 0,
      };
    });

    return NextResponse.json({
      results,
      query,
      count: results.length,
    });

  } catch (error) {
    console.error('[API/Search] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

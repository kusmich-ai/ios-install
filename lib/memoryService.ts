// lib/memoryService.ts
// Service for managing coach memories - storage, retrieval, and management

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// ============================================
// TYPES
// ============================================

export type MemoryCategory = 
  | 'fact'        // Factual info: job, family, location, age
  | 'pattern'     // Observed patterns: anxiety triggers, recurring themes
  | 'goal'        // Goals they've mentioned
  | 'insight'     // Breakthroughs, realizations, key learnings
  | 'preference'  // What works for them, communication style
  | 'context'     // Recent context, ongoing situations
  | 'relationship'// Important people in their life
  | 'challenge'   // Current struggles, obstacles
  | 'strength'    // Things they're good at, resources they have
  | 'value';      // What matters to them

export interface Memory {
  id?: string;
  user_id: string;
  coach_id: string;
  category: MemoryCategory;
  key: string;
  value: string;
  confidence: number;  // 0-1, how confident we are in this memory
  source_conversation_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MemorySearchResult {
  memories: Memory[];
  lastConversationSummary?: string;
}

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
// MEMORY CRUD OPERATIONS
// ============================================

/**
 * Get all memories for a user and coach
 */
export async function getMemories(
  userId: string, 
  coachId: string,
  categories?: MemoryCategory[]
): Promise<Memory[]> {
  const supabase = await createSupabaseServer();
  
  let query = supabase
    .from('coach_memory')
    .select('*')
    .eq('user_id', userId)
    .eq('coach_id', coachId)
    .order('updated_at', { ascending: false });
  
  if (categories && categories.length > 0) {
    query = query.in('category', categories);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('[MemoryService] Error fetching memories:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Get a specific memory by key
 */
export async function getMemoryByKey(
  userId: string,
  coachId: string,
  key: string
): Promise<Memory | null> {
  const supabase = await createSupabaseServer();
  
  const { data, error } = await supabase
    .from('coach_memory')
    .select('*')
    .eq('user_id', userId)
    .eq('coach_id', coachId)
    .eq('key', key)
    .single();
  
  if (error) {
    if (error.code !== 'PGRST116') { // Not found is okay
      console.error('[MemoryService] Error fetching memory:', error);
    }
    return null;
  }
  
  return data;
}

/**
 * Save or update a memory
 */
export async function saveMemory(memory: Omit<Memory, 'id' | 'created_at' | 'updated_at'>): Promise<Memory | null> {
  const supabase = await createSupabaseServer();
  
  // Check if memory with this key already exists
  const existing = await getMemoryByKey(memory.user_id, memory.coach_id, memory.key);
  
  if (existing) {
    // Update existing memory
    const { data, error } = await supabase
      .from('coach_memory')
      .update({
        value: memory.value,
        category: memory.category,
        confidence: memory.confidence,
        source_conversation_id: memory.source_conversation_id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single();
    
    if (error) {
      console.error('[MemoryService] Error updating memory:', error);
      return null;
    }
    
    return data;
  } else {
    // Insert new memory
    const { data, error } = await supabase
      .from('coach_memory')
      .insert({
        user_id: memory.user_id,
        coach_id: memory.coach_id,
        category: memory.category,
        key: memory.key,
        value: memory.value,
        confidence: memory.confidence,
        source_conversation_id: memory.source_conversation_id,
      })
      .select()
      .single();
    
    if (error) {
      console.error('[MemoryService] Error inserting memory:', error);
      return null;
    }
    
    return data;
  }
}

/**
 * Save multiple memories at once
 */
export async function saveMemories(memories: Omit<Memory, 'id' | 'created_at' | 'updated_at'>[]): Promise<number> {
  let savedCount = 0;
  
  for (const memory of memories) {
    const result = await saveMemory(memory);
    if (result) savedCount++;
  }
  
  return savedCount;
}

/**
 * Delete a memory
 */
export async function deleteMemory(
  userId: string,
  coachId: string,
  key: string
): Promise<boolean> {
  const supabase = await createSupabaseServer();
  
  const { error } = await supabase
    .from('coach_memory')
    .delete()
    .eq('user_id', userId)
    .eq('coach_id', coachId)
    .eq('key', key);
  
  if (error) {
    console.error('[MemoryService] Error deleting memory:', error);
    return false;
  }
  
  return true;
}

/**
 * Delete all memories for a user/coach (useful for "forget me")
 */
export async function deleteAllMemories(
  userId: string,
  coachId: string
): Promise<boolean> {
  const supabase = await createSupabaseServer();
  
  const { error } = await supabase
    .from('coach_memory')
    .delete()
    .eq('user_id', userId)
    .eq('coach_id', coachId);
  
  if (error) {
    console.error('[MemoryService] Error deleting all memories:', error);
    return false;
  }
  
  return true;
}

// ============================================
// MEMORY FORMATTING FOR PROMPTS
// ============================================

/**
 * Format memories for injection into system prompt
 */
export function formatMemoriesForPrompt(memories: Memory[]): string {
  if (!memories || memories.length === 0) {
    return '';
  }
  
  // Group memories by category
  const grouped: Record<string, Memory[]> = {};
  
  for (const memory of memories) {
    if (!grouped[memory.category]) {
      grouped[memory.category] = [];
    }
    grouped[memory.category].push(memory);
  }
  
  // Build formatted string
  const sections: string[] = [];
  
  // Facts first (most important context)
  if (grouped.fact?.length) {
    const facts = grouped.fact.map(m => `• ${m.value}`).join('\n');
    sections.push(`**About them:**\n${facts}`);
  }
  
  // Relationships
  if (grouped.relationship?.length) {
    const relationships = grouped.relationship.map(m => `• ${m.value}`).join('\n');
    sections.push(`**Important people:**\n${relationships}`);
  }
  
  // Current challenges
  if (grouped.challenge?.length) {
    const challenges = grouped.challenge.map(m => `• ${m.value}`).join('\n');
    sections.push(`**Current challenges:**\n${challenges}`);
  }
  
  // Goals
  if (grouped.goal?.length) {
    const goals = grouped.goal.map(m => `• ${m.value}`).join('\n');
    sections.push(`**Goals:**\n${goals}`);
  }
  
  // Patterns observed
  if (grouped.pattern?.length) {
    const patterns = grouped.pattern.map(m => `• ${m.value}`).join('\n');
    sections.push(`**Patterns you've noticed:**\n${patterns}`);
  }
  
  // Values
  if (grouped.value?.length) {
    const values = grouped.value.map(m => `• ${m.value}`).join('\n');
    sections.push(`**What matters to them:**\n${values}`);
  }
  
  // Strengths
  if (grouped.strength?.length) {
    const strengths = grouped.strength.map(m => `• ${m.value}`).join('\n');
    sections.push(`**Strengths/resources:**\n${strengths}`);
  }
  
  // Insights/breakthroughs
  if (grouped.insight?.length) {
    const insights = grouped.insight.map(m => `• ${m.value}`).join('\n');
    sections.push(`**Key insights from previous conversations:**\n${insights}`);
  }
  
  // Preferences
  if (grouped.preference?.length) {
    const prefs = grouped.preference.map(m => `• ${m.value}`).join('\n');
    sections.push(`**What works for them:**\n${prefs}`);
  }
  
  // Recent context last
  if (grouped.context?.length) {
    const context = grouped.context.map(m => `• ${m.value}`).join('\n');
    sections.push(`**Recent context:**\n${context}`);
  }
  
  return sections.join('\n\n');
}

/**
 * Get last conversation summary for a user/coach
 */
export async function getLastConversationSummary(
  userId: string,
  coachId: string
): Promise<string | null> {
  const supabase = await createSupabaseServer();
  
  // Get the most recent conversation
  const { data, error } = await supabase
    .from('coach_conversations')
    .select('id, title, messages, updated_at')
    .eq('user_id', userId)
    .eq('coach_id', coachId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();
  
  if (error || !data) {
    return null;
  }
  
  // If conversation has messages, create a brief summary
  const messages = data.messages as Array<{ role: string; content: string }>;
  if (!messages || messages.length < 2) {
    return null;
  }
  
  // Get last few exchanges for context
  const recentMessages = messages.slice(-6); // Last 3 exchanges
  const userMessages = recentMessages
    .filter(m => m.role === 'user')
    .map(m => m.content.slice(0, 100))
    .join(' | ');
  
  const updatedAt = new Date(data.updated_at);
  const now = new Date();
  const diffHours = Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  let timeAgo = '';
  if (diffHours < 1) {
    timeAgo = 'earlier today';
  } else if (diffHours < 24) {
    timeAgo = 'today';
  } else if (diffDays === 1) {
    timeAgo = 'yesterday';
  } else if (diffDays < 7) {
    timeAgo = `${diffDays} days ago`;
  } else {
    timeAgo = `${Math.floor(diffDays / 7)} week${diffDays >= 14 ? 's' : ''} ago`;
  }
  
  return `Last conversation (${timeAgo}): They mentioned: "${userMessages.slice(0, 200)}${userMessages.length > 200 ? '...' : ''}"`;
}

/**
 * Get complete memory context for injection
 */
export async function getMemoryContext(
  userId: string,
  coachId: string
): Promise<string> {
  // Get all memories
  const memories = await getMemories(userId, coachId);
  
  // Get last conversation summary
  const lastConvo = await getLastConversationSummary(userId, coachId);
  
  // Format memories
  const formattedMemories = formatMemoriesForPrompt(memories);
  
  // Combine
  const parts: string[] = [];
  
  if (formattedMemories) {
    parts.push(formattedMemories);
  }
  
  if (lastConvo) {
    parts.push(`**Continuity:**\n${lastConvo}`);
  }
  
  if (parts.length === 0) {
    return '';
  }
  
  return `## WHAT YOU REMEMBER ABOUT THIS USER\n\n${parts.join('\n\n')}\n\n**Important:** Use this context naturally - don't explicitly say "I remember you mentioned..." unless it's relevant. Just let it inform your responses.`;
}

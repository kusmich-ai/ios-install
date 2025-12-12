// lib/memoryExtraction.ts
// Service for extracting memories from coach conversations using Claude

import Anthropic from '@anthropic-ai/sdk';
import { Memory, MemoryCategory, saveMemories } from './memoryService';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ============================================
// TYPES
// ============================================

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ExtractionResult {
  success: boolean;
  memoriesExtracted: number;
  memories: ExtractedMemory[];
}

interface ExtractedMemory {
  category: MemoryCategory;
  key: string;
  value: string;
  confidence: number;
}

// ============================================
// EXTRACTION PROMPT
// ============================================

const EXTRACTION_SYSTEM_PROMPT = `You are a memory extraction system for a coaching application. Your job is to analyze coaching conversations and extract important information about the user that would be valuable to remember in future conversations.

## What to Extract

Extract ONLY information that was explicitly shared or strongly implied. Never invent or assume.

### Categories:

1. **fact** - Concrete facts about them
   - Name, age, location
   - Job/profession, company
   - Family situation (married, kids, etc.)
   - Living situation
   
2. **relationship** - Important people in their life
   - Partner/spouse name and relevant details
   - Children names/ages
   - Key colleagues, friends, family members
   - Relationships that come up repeatedly

3. **challenge** - Current struggles they're facing
   - Work challenges
   - Relationship difficulties
   - Health issues (mental or physical)
   - Life transitions
   
4. **goal** - Things they want to achieve or change
   - Career goals
   - Personal development goals
   - Relationship goals
   - Health/wellness goals

5. **pattern** - Behavioral or emotional patterns you notice
   - Triggers (what causes stress/anxiety)
   - Coping mechanisms (healthy or unhealthy)
   - Recurring themes across conversations
   - Self-sabotage patterns
   
6. **value** - What matters to them
   - Core values
   - Priorities
   - What they care about deeply
   
7. **strength** - Resources and capabilities
   - Skills they have
   - Support systems
   - Past successes
   - Things that have worked for them
   
8. **insight** - Breakthroughs and realizations
   - Aha moments during coaching
   - New perspectives they've gained
   - Shifts in thinking
   
9. **preference** - How they like to work/communicate
   - Communication preferences
   - What coaching approaches work for them
   - What doesn't work
   
10. **context** - Ongoing situations to track
    - Current projects or situations
    - Things they're working through
    - Time-sensitive context

## Output Format

Respond with a JSON array of memories. Each memory should have:
- category: one of the categories above
- key: a unique identifier for this memory (lowercase, underscores, specific enough to not conflict)
- value: the actual memory content (1-2 sentences, factual, third person)
- confidence: 0.0-1.0 how confident you are (1.0 = explicitly stated, 0.7 = strongly implied, 0.5 = somewhat implied)

## Rules

1. ONLY extract what's explicitly stated or very strongly implied
2. Keep values concise - 1-2 sentences max
3. Use third person ("They work as..." not "You work as...")
4. Be specific with keys to avoid overwrites (e.g., "job_current" not just "job")
5. Higher confidence for explicit statements, lower for implications
6. Don't extract coach's advice or questions - only USER information
7. Don't extract generic statements - only specific, personal information
8. If nothing valuable to extract, return an empty array []

## Example Output

\`\`\`json
[
  {
    "category": "fact",
    "key": "job_current",
    "value": "They work as a product manager at a tech startup.",
    "confidence": 1.0
  },
  {
    "category": "relationship",
    "key": "partner_sarah",
    "value": "Their partner Sarah is supportive but sometimes feels neglected due to work hours.",
    "confidence": 0.9
  },
  {
    "category": "pattern",
    "key": "anxiety_trigger_meetings",
    "value": "They experience anxiety before important meetings, especially with leadership.",
    "confidence": 0.8
  },
  {
    "category": "insight",
    "key": "insight_perfectionism_root",
    "value": "They realized their perfectionism stems from fear of judgment, not desire for quality.",
    "confidence": 0.9
  }
]
\`\`\`

Now analyze the following conversation and extract memories.`;

// ============================================
// EXTRACTION FUNCTION
// ============================================

/**
 * Extract memories from a conversation using Claude
 */
export async function extractMemoriesFromConversation(
  userId: string,
  coachId: string,
  conversationId: string,
  messages: Message[],
  existingMemories?: ExtractedMemory[]
): Promise<ExtractionResult> {
  try {
    // Skip if conversation is too short
    if (messages.length < 4) {
      return {
        success: true,
        memoriesExtracted: 0,
        memories: [],
      };
    }

    // Format conversation for analysis
    const conversationText = messages
      .map(m => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n\n');

    // Add context about existing memories to avoid duplicates
    let contextAddition = '';
    if (existingMemories && existingMemories.length > 0) {
      const existingKeys = existingMemories.map(m => m.key).join(', ');
      contextAddition = `\n\n## Existing Memory Keys (avoid duplicating these unless updating):\n${existingKeys}`;
    }

    // Call Claude for extraction
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: EXTRACTION_SYSTEM_PROMPT + contextAddition,
      messages: [
        {
          role: 'user',
          content: `Analyze this coaching conversation and extract memories:\n\n${conversationText}`,
        },
      ],
    });

    const responseText = response.content[0].type === 'text' 
      ? response.content[0].text 
      : '';

    // Parse the JSON response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.log('[MemoryExtraction] No valid JSON array found in response');
      return {
        success: true,
        memoriesExtracted: 0,
        memories: [],
      };
    }

    const extractedMemories: ExtractedMemory[] = JSON.parse(jsonMatch[0]);

    // Validate and filter memories
    const validMemories = extractedMemories.filter(m => 
      m.category && 
      m.key && 
      m.value && 
      typeof m.confidence === 'number' &&
      m.confidence >= 0.5 // Only keep memories we're reasonably confident about
    );

    // Save to database
    const memoriesToSave = validMemories.map(m => ({
      user_id: userId,
      coach_id: coachId,
      category: m.category,
      key: m.key,
      value: m.value,
      confidence: m.confidence,
      source_conversation_id: conversationId,
    }));

    const savedCount = await saveMemories(memoriesToSave);

    console.log(`[MemoryExtraction] Extracted ${validMemories.length} memories, saved ${savedCount}`);

    return {
      success: true,
      memoriesExtracted: savedCount,
      memories: validMemories,
    };

  } catch (error) {
    console.error('[MemoryExtraction] Error extracting memories:', error);
    return {
      success: false,
      memoriesExtracted: 0,
      memories: [],
    };
  }
}

/**
 * Extract memories from multiple recent conversations (batch processing)
 */
export async function extractMemoriesFromRecentConversations(
  userId: string,
  coachId: string,
  conversations: Array<{ id: string; messages: Message[] }>,
  existingMemories?: ExtractedMemory[]
): Promise<ExtractionResult> {
  let totalExtracted = 0;
  const allMemories: ExtractedMemory[] = [];

  for (const conversation of conversations) {
    const result = await extractMemoriesFromConversation(
      userId,
      coachId,
      conversation.id,
      conversation.messages,
      [...(existingMemories || []), ...allMemories] // Include already extracted to avoid duplicates
    );

    if (result.success) {
      totalExtracted += result.memoriesExtracted;
      allMemories.push(...result.memories);
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return {
    success: true,
    memoriesExtracted: totalExtracted,
    memories: allMemories,
  };
}

/**
 * Generate a conversation summary for context
 */
export async function generateConversationSummary(
  messages: Message[]
): Promise<string | null> {
  try {
    if (messages.length < 4) {
      return null;
    }

    const conversationText = messages
      .map(m => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n\n');

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      system: `Summarize this coaching conversation in 2-3 sentences. Focus on what the USER was working through and any key takeaways. Write in third person ("They discussed..." not "You discussed..."). Be concise.`,
      messages: [
        {
          role: 'user',
          content: conversationText,
        },
      ],
    });

    const summary = response.content[0].type === 'text' 
      ? response.content[0].text 
      : null;

    return summary;

  } catch (error) {
    console.error('[MemoryExtraction] Error generating summary:', error);
    return null;
  }
}

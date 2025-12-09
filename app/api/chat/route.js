// app/api/chat/route.ts
import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { microActionSystemPrompt } from '@/lib/microActionAPI';
import { flowBlockSystemPrompt } from '@/lib/flowBlockAPI';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const mainSystemPrompt = `You are the IOS System Installer - an adaptive AI coach helping users install the Integrated Operating System (IOS).

Your personality:
- Witty, direct, and empowering
- Scientifically grounded but not clinical
- No cheerleading or fluff
- Celebrate real wins, not participation

Your role:
- Guide users through their daily rituals
- Answer questions about the IOS system
- Provide coaching and support
- Track progress and celebrate milestones

Current stage practices are shown in the user's interface. Help them complete their rituals and understand the science behind each practice.

Keep responses concise (2-4 sentences for simple interactions, longer for explanations).
Use markdown formatting sparingly - bold for emphasis, but avoid excessive headers or lists in casual conversation.`;

// ============================================
// DECENTERING PRACTICE SYSTEM PROMPT
// ============================================
const decenteringSystemPrompt = `You are guiding a Decentering Practice session — a 2-5 minute inquiry that helps users recognize thoughts, emotions, and identities as objects within awareness rather than as "me."

## YOUR CORE ROLE
- Guide through reflective dialogue, not explanation
- Point awareness back to itself through gentle questions
- Never lecture or explain — always invite direct noticing
- Create **transparent engagement**: users learn to operate consciously within roles while recognizing they are the player, not the avatar

## SESSION STRUCTURE (follow conversationally, not rigidly)

### 1. Orient Attention
"Take one slow breath. Notice what's happening in your body right now."

### 2. Identify Experience
"What's most present in your mind right now — a thought, feeling, story, or role?"

### 3. Decentering Inquiry (use gentle questions)
- "Who is aware of that thought?"
- "Can you find the 'I' that's feeling this?"
- "Is this happening to awareness, or in awareness?"
- "Where does this experience exist — outside awareness or within it?"

### 4. Decenter the Identity
Point to the identity/role/label as an object appearing in awareness:

**For roles** ("father," "employee"):
- "Notice the label 'father' — is awareness itself a father? Or is that a role appearing in awareness?"
- "Is awareness the player or the avatar?"

**For self-concepts** ("I'm not good enough," "I'm anxious"):
- "Can you find the 'I' that's [attribute]? Or is there just a thought appearing with those words?"

**For sticky labels** ("the person who always fails"):
- "Where does 'the person who [quality]' exist? In your body? In space? Or is it a story appearing in awareness?"

### 5. Re-engage Consciously (CRITICAL - prevents spiritual bypassing)
- "Awareness can play the role of [identity] — but it's not trapped in it. Can you feel the difference?"
- "You can be a [role] fully — and know it's not what you are. How does that feel?"
- "From this spaciousness, what does 'being a good [role]' actually look like?"

### 6. Ground in Embodied Presence (NEVER RUSH THIS)
1. State the integration: "You can live as [role] and rest as awareness — both at once"
2. **Pause** — let it land: "Let that settle" or "Take a moment with that"
3. **Integration anchor**: "Name one moment today when you might notice yourself playing [role] — and remember you're the player, not the avatar"
4. Final grounding: "Take one more breath. Feel the ground beneath you. That recognition is here whenever you need it."

## IDENTITY AUDIT MODE
If user explicitly requests an identity audit, guide through these 6 questions (one at a time):
1. "What identity feels most active right now?"
2. "What beliefs or stories come with that identity?"
3. "Who would you be without that story?"
4. "What's aware of even this identity?"
5. "From this spaciousness, what would it look like to *choose* to play that role without being trapped in it?"
6. "Name one moment today when you might notice yourself playing this role — and remember you're the player, not the avatar."

## CONSTRAINTS
- Keep responses SHORT — 1-3 sentences max for inquiry questions
- Never explain awareness — point to it
- Mirror user's words back as doorway into awareness
- If user intellectualizes: "Let's pause the story. What's happening in direct experience right now?"
- If resistance arises: "Beautiful. Can awareness notice even this resistance?"

## SAFETY
- If acute distress: "Feel your feet on the floor. Take three breaths. You're safe right now." — ground first
- If dissociation signs: Focus on sensory grounding, avoid "Who is aware?" questions
- If crisis: "This practice isn't the right tool right now. Please reach out to a therapist or call 988."

## TONE
- Calm, curious, direct
- No spiritual jargon
- Simple, first-person language

Remember: The goal is **transparent engagement** — not detachment from life, but freedom within form.`;

export async function POST(req) {
  try {
    const body = await req.json();
    const { messages, context } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Set defaults
    let maxTokens = 2048;
    let temperature = 0.7;
    let systemPrompt = mainSystemPrompt;

    // Context-based configuration
    switch (context) {
      case 'micro_action_setup':
        systemPrompt = microActionSystemPrompt;
        maxTokens = 2048;
        temperature = 0.7;
        console.log('[API] Using Micro-Action setup system prompt');
        break;

      case 'micro_action_extraction':
        // Low temperature for consistent structured JSON output
        // Small token limit since we only need a JSON object
        maxTokens = 500;
        temperature = 0.3;
        console.log('[API] Using Micro-Action extraction settings');
        break;

      case 'flow_block_setup':
        systemPrompt = flowBlockSystemPrompt;
        maxTokens = 2048;
        temperature = 0.7;
        console.log('[API] Using Flow Block setup system prompt');
        break;

      case 'flow_block_extraction':
        maxTokens = 500;
        temperature = 0.3;
        console.log('[API] Using Flow Block extraction settings');
        break;

      case 'weekly_check_in':
        maxTokens = 1024;
        temperature = 0.5;
        console.log('[API] Using weekly check-in settings');
        break;

      // DECENTERING PRACTICE CONTEXT
      case 'decentering_practice':
        systemPrompt = decenteringSystemPrompt;
        maxTokens = 1024;  // Shorter responses for inquiry-based practice
        temperature = 0.7;
        console.log('[API] Using Decentering Practice system prompt');
        break;

      default:
        // Use defaults set above
        break;
    }

    // Check if messages already include a system prompt (for extraction calls)
    const hasSystemPrompt = messages.some(msg => msg.role === 'system');
    
    // Filter out any system messages from the input (we'll add our own if needed)
    const conversationMessages = messages.filter(
      (msg) => msg.role !== 'system'
    );

    // Build the API call configuration
    const apiConfig = {
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      messages: conversationMessages.map((msg) => ({
        role: msg.role,
        content: msg.content
      }))
    };

    // Only add system prompt if not already included in messages
    // (extraction calls include their own system prompt in the messages)
    if (!hasSystemPrompt) {
      apiConfig.system = systemPrompt;
    }

    // Make the API call
    const response = await anthropic.messages.create(apiConfig);

    // Extract the response text
    const responseText = response.content[0].type === 'text' 
      ? response.content[0].text 
      : '';

    return NextResponse.json({ 
      response: responseText,
      context: context || 'general'
    });

  } catch (error) {
    console.error('[API] Chat error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { error: 'Failed to process chat request', details: errorMessage },
      { status: 500 }
    );
  }
}

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

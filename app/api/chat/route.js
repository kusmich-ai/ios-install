// app/api/chat/route.ts
// Main chat API route with Micro-Action setup support

import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { microActionSystemPrompt } from '@/lib/microActionAPI';

const anthropic = new Anthropic();

// Main system prompt for IOS coach
const mainSystemPrompt = `You are the IOS System Installer - an adaptive AI coach guiding users through the Integrated Operating System (IOS), a neural and mental transformation protocol.

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, context } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Determine which system prompt to use based on context
    let systemPrompt = mainSystemPrompt;
    
    if (context === 'micro_action_setup') {
      // Use the specialized Micro-Action system prompt
      systemPrompt = microActionSystemPrompt;
      console.log('[API] Using Micro-Action setup system prompt');
    }

    // Filter out any system messages from the input (we'll add our own)
    const conversationMessages = messages.filter(
      (msg: { role: string }) => msg.role !== 'system'
    );

    // Make the API call
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: conversationMessages.map((msg: { role: string; content: string }) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }))
    });

    // Extract the response text
    const responseText = response.content[0].type === 'text' 
      ? response.content[0].text 
      : '';

    return NextResponse.json({ 
      response: responseText,
      context: context || 'general'
    });

  } catch (error: unknown) {
    console.error('[API] Chat error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { error: 'Failed to process chat request', details: errorMessage },
      { status: 500 }
    );
  }
}

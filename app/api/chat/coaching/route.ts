// /app/api/chat/coaching/route.ts
// Lightweight API endpoint for coaching prompts (Micro-Action setup, etc.)

import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const anthropic = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { prompt, context } = await req.json();
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Missing prompt' },
        { status: 400 }
      );
    }

    // Use a smaller, faster model for coaching responses
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300, // Keep responses concise
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      system: `You are an identity coach helping users through the Morning Micro-Action setup process.

Your responses should be:
- 2-4 sentences max
- Warm but direct, no fluff
- Mirror the user's language back to them
- Ask one question at a time
- Never announce frameworks or filters

Context: ${context || 'Identity coaching'}`
    });

    // Extract text response
    const textContent = response.content.find(block => block.type === 'text');
    const responseText = textContent ? textContent.text : '';

    return NextResponse.json({ response: responseText });
    
  } catch (error) {
    console.error('[Coaching API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate coaching response' },
      { status: 500 }
    );
  }
}

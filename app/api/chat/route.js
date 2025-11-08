import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Your complete IOS System Installer instructions
const SYSTEM_PROMPT = `
[PASTE YOUR ENTIRE PROJECT INSTRUCTIONS HERE - ALL THE CONTENT FROM THE MAIN INSTRUCTIONS DOCUMENT]
`;

export async function POST(req) {
  try {
    const { messages, userId } = await req.json();

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: messages,
    });

    return Response.json({
      content: response.content,
      id: response.id,
      model: response.model,
      role: response.role,
      stop_reason: response.stop_reason,
      usage: response.usage,
    });

  } catch (error) {
    console.error('API Error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

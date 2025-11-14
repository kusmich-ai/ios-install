// app/api/chat/route.js - CORRECTED VERSION

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Your complete IOS System Installer instructions
const SYSTEM_PROMPT = `[PASTE YOUR ENTIRE PROJECT INSTRUCTIONS HERE]

Your job is to guide users through the IOS (Integrated Operating System) installation - a neural and mental transformation protocol.

You are witty, ruthless when needed, empowering, and scientifically grounded. You don't coddle - you hold standards while respecting the user's intelligence.

The system has 7 progressive stages that unlock based on competence, not time. Each stage adds new practices that stack on previous ones.

You track adherence, calculate deltas, and determine when users are ready to unlock the next stage.`;

export async function POST(req) {
  try {
    const { messages, userId, baselineData } = await req.json();

    // Build context about user's baseline if available
    let systemContext = SYSTEM_PROMPT;
    
    if (baselineData) {
      systemContext += `\n\n=== CURRENT USER CONTEXT ===
User ID: ${userId}
REwired Index: ${baselineData.rewiredIndex}/100
Tier: ${baselineData.tier}
Current Stage: ${baselineData.currentStage}

Domain Scores:
- Regulation: ${baselineData.domainScores.regulation}/5
- Awareness: ${baselineData.domainScores.awareness}/5
- Outlook: ${baselineData.domainScores.outlook}/5
- Attention: ${baselineData.domainScores.attention}/5

Use this baseline data to contextualize your coaching and track their progress.`;
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      system: systemContext,
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

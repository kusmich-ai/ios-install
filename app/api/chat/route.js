// app/api/chat/route.js
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Read system prompt from file
function loadSystemPrompt() {
  try {
    const promptPath = path.join(process.cwd(), 'instructions', 'system-prompt.txt');
    return fs.readFileSync(promptPath, 'utf-8');
  } catch (error) {
    console.error('Error loading system prompt:', error);
    // Fallback to basic prompt if file can't be read
    return `You are the IOS System Installer. Guide users through the installation process.`;
  }
}

export async function POST(req) {
  try {
    const { messages, userId, baselineData } = await req.json();

    // Load system prompt from file
    let systemContext = loadSystemPrompt();
    
    // Append current user context
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

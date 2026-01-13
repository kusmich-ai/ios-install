import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

const anthropic = new Anthropic();

export async function POST(request: Request) {
  try {
    const { rewiredIndex, tier, domainScores, userName } = await request.json();

    // Find strongest and weakest domains
    const domains = [
      { name: 'Regulation', score: domainScores.regulation },
      { name: 'Awareness', score: domainScores.awareness },
      { name: 'Outlook', score: domainScores.outlook },
      { name: 'Attention', score: domainScores.attention }
    ];
    
    const sorted = [...domains].sort((a, b) => b.score - a.score);
    const strongest = sorted[0];
    const weakest = sorted[sorted.length - 1];
    const avgScore = domains.reduce((sum, d) => sum + d.score, 0) / 4;

    const prompt = `You are the IOS System Installer - a witty, direct neural transformation coach. Generate a 2-3 sentence personalized interpretation of this user's baseline assessment.

USER DATA:
- Name: ${userName || 'User'}
- REwired Index: ${rewiredIndex}/100
- Tier: ${tier}
- Domain Scores (out of 5):
  - Regulation: ${domainScores.regulation.toFixed(2)}
  - Awareness: ${domainScores.awareness.toFixed(2)}
  - Outlook: ${domainScores.outlook.toFixed(2)}
  - Attention: ${domainScores.attention.toFixed(2)}
- Strongest: ${strongest.name} (${strongest.score.toFixed(2)})
- Weakest: ${weakest.name} (${weakest.score.toFixed(2)})

GUIDELINES:
- Be direct and insightful, not generic cheerleading
- Call out their specific strength and weakness by name
- Explain what the IOS will do for them specifically
- Keep it punchy - no fluff
- Don't use bullet points
- 2-3 sentences max

Example tone: "Strong awareness but attention is your bottleneck. You notice when you're off, but can't stay locked in. The IOS will train sustained focus to match your self-awareness."

Generate the interpretation:`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }]
    });

    const interpretation = (response.content[0] as any).text;

    return NextResponse.json({ interpretation });
  } catch (error) {
    console.error('Error generating interpretation:', error);
    // Fallback to generic message
    return NextResponse.json({ 
      interpretation: "Your baseline is set. The IOS will systematically upgrade your neural operating system." 
    });
  }
}

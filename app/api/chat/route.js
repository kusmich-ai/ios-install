// app/api/chat/insight/route.js - SECURED VERSION
import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import {
  verifyAuth,
  unauthorizedResponse,
  rateLimitedResponse,
  badRequestResponse,
} from '@/lib/security/auth';
import { checkRateLimit } from '@/lib/security/rateLimit';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  try {
    // STEP 1: VERIFY AUTHENTICATION
    const authResult = await verifyAuth();
    
    if (!authResult.authenticated || !authResult.userId) {
      console.log('[Insight API] Unauthorized request');
      return unauthorizedResponse('Please sign in to continue.');
    }

    const userId = authResult.userId;

    // STEP 2: CHECK RATE LIMIT
    const rateLimitResult = checkRateLimit(userId, 'chat');
    
    if (!rateLimitResult.allowed) {
      console.log('[Insight API] Rate limited:', userId);
      return rateLimitedResponse(rateLimitResult.blockRemaining || rateLimitResult.resetIn);
    }

    // STEP 3: PARSE AND VALIDATE REQUEST
    const { rewiredIndex, tier, domainScores, userName } = await request.json();

    // Validate required fields
    if (typeof rewiredIndex !== 'number' || rewiredIndex < 0 || rewiredIndex > 100) {
      return badRequestResponse('Invalid rewiredIndex');
    }

    if (!domainScores || typeof domainScores !== 'object') {
      return badRequestResponse('Invalid domainScores');
    }

    // Validate domain scores
    const requiredDomains = ['regulation', 'awareness', 'outlook', 'attention'];
    for (const domain of requiredDomains) {
      if (typeof domainScores[domain] !== 'number' || 
          domainScores[domain] < 0 || 
          domainScores[domain] > 5) {
        return badRequestResponse(`Invalid ${domain} score`);
      }
    }

    // Sanitize userName (if provided)
    const sanitizedUserName = userName 
      ? String(userName).slice(0, 50).replace(/[<>]/g, '') 
      : 'User';

    // STEP 4: CALCULATE METRICS
    const domains = Object.entries(domainScores);
    const sorted = domains.sort((a, b) => b[1] - a[1]);
    const highest = sorted[0];
    const lowest = sorted[sorted.length - 1];
    
    let percentile;
    if (rewiredIndex >= 80) percentile = "top 5%";
    else if (rewiredIndex >= 70) percentile = "top 15%";
    else if (rewiredIndex >= 60) percentile = "top 30%";
    else if (rewiredIndex >= 50) percentile = "around average";
    else if (rewiredIndex >= 40) percentile = "bottom 40%";
    else percentile = "bottom 25%";

    // STEP 5: MAKE API CALL
    const prompt = `You are the IOS System Installer - a witty, direct, scientifically-grounded AI coach. Generate a 2-3 sentence personalized insight about this user's baseline assessment. Be specific about their scores, identify patterns, and add personality. No fluff, no cheerleading.

User Data:
- Name: ${sanitizedUserName}
- REwired Index: ${rewiredIndex}/100 (${tier}) - puts them in ${percentile} of users
- Regulation: ${domainScores.regulation.toFixed(1)}/5
- Awareness: ${domainScores.awareness.toFixed(1)}/5
- Outlook: ${domainScores.outlook.toFixed(1)}/5
- Attention: ${domainScores.attention.toFixed(1)}/5
- Strongest domain: ${highest[0]} (${highest[1].toFixed(1)})
- Weakest domain: ${lowest[0]} (${lowest[1].toFixed(1)})

Guidelines:
- Start with something punchy about their overall score
- Call out the specific pattern you see (e.g., "high-functioning scatter", "emotionally stable but cognitively fragmented", "solid foundation but running on fumes")
- Mention their strength AND their growth edge
- Be direct, slightly provocative, but not mean
- 2-3 sentences max
- Don't use their name in this insight (it's used elsewhere)
- Don't mention the tier name directly

Example good outputs:
- "Well, well. A 74 puts you in rare company - only ~15% of users start this high. Your Awareness and Outlook are firing on most cylinders, but that Attention score? That's your Achilles heel dragging down an otherwise solid foundation. Classic high-functioning scatter pattern."
- "A 42 baseline. Not terrible, not great - your system is running but not optimized. Regulation is your anchor right now, but Outlook at 2.1? That's coloring everything else. We'll need to address that first."
- "58 - right in the middle of the pack. Here's what I see: your Awareness is actually solid, which means you *know* when you're off. Problem is, your Attention can't hold the line long enough to do anything about it. Sound familiar?"

Generate the insight now:`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      messages: [
        { role: 'user', content: prompt }
      ],
    });

    const insight = response.content[0].text;

    return NextResponse.json({ insight });

  } catch (error

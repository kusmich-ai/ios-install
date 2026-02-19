// ============================================
// GUIDED REFLECTION API ROUTE
// ============================================
// File: app/api/mirror/guided-reflection/route.ts
// ============================================

import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { GUIDED_REFLECTION_SYNTHESIS_PROMPT } from '@/lib/mirrorPrompt';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
});

// ============================================
// TYPES
// ============================================

interface QuestionResponse {
  category: string;
  question: string;
  answer: string;
  followUpQuestion?: string | null;
  followUpAnswer?: string | null;
}

interface PatternProfile {
  patterns: Array<{
    name: string;
    description: string;
    severity: number;
    ios_stage: number;
    evidence: string;
  }>;
  core_pattern: {
    name: string;
    description: string;
    connections: string[];
  };
  roadmap: {
    stage1_focus: string;
    stage3_focus: string;
    stage4_focus: string;
    stage5_focus: string;
  };
  quality_score: number;
}

// ============================================
// POST HANDLER
// ============================================

export async function POST(request: Request) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    // Parse request body
    const { responses } = await request.json() as { 
      responses: Record<string, QuestionResponse> 
    };

    if (!responses || Object.keys(responses).length === 0) {
      return NextResponse.json(
        { error: 'No responses provided' },
        { status: 400 }
      );
    }

    // Format responses for Claude
    const formattedResponses = Object.entries(responses)
      .map(([key, value]) => {
        let formatted = `**${value.category}**\n`;
        formatted += `Q: ${value.question}\n`;
        formatted += `A: ${value.answer}`;
        
        if (value.followUpQuestion && value.followUpAnswer) {
          formatted += `\n\nFollow-up Q: ${value.followUpQuestion}`;
          formatted += `\nFollow-up A: ${value.followUpAnswer}`;
        }
        
        return formatted;
      })
      .join('\n\n---\n\n');

    // Build the prompt
    const prompt = GUIDED_REFLECTION_SYNTHESIS_PROMPT.replace(
      '{responses}', 
      formattedResponses
    );

    // Call Claude for synthesis
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    // Extract text response
    const responseText = message.content[0].type === 'text' 
      ? message.content[0].text 
      : '';

    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Failed to parse JSON from Claude response:', responseText);
      throw new Error('Failed to parse pattern profile from response');
    }

    let patternProfile: PatternProfile;
    try {
      patternProfile = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Raw:', jsonMatch[0]);
      throw new Error('Invalid JSON in pattern profile response');
    }

    // Validate required fields
    if (!patternProfile.patterns || !patternProfile.core_pattern || !patternProfile.roadmap) {
      throw new Error('Incomplete pattern profile received');
    }

    // Store in database
   // Map patterns to individual category columns
    const categoryMap: Record<string, any[]> = {
      nervous_system_patterns: [],
      awareness_blind_spots: [],
      identity_loops: [],
      attention_leaks: [],
      relational_patterns: [],
      emotional_outlook: [],
      shadow_material: []
    };

    // Distribute patterns by ios_stage
    (patternProfile.patterns || []).forEach((pattern: any) => {
      const wrapped = { patterns: [] as any[] };
      switch (pattern.ios_stage) {
        case 1: categoryMap.nervous_system_patterns.push(pattern); break;
        case 2: categoryMap.awareness_blind_spots.push(pattern); break;
        case 3: categoryMap.identity_loops.push(pattern); break;
        case 4: categoryMap.attention_leaks.push(pattern); break;
        case 5: categoryMap.relational_patterns.push(pattern); break;
        case 6: categoryMap.emotional_outlook.push(pattern); break;
        default: categoryMap.shadow_material.push(pattern); break;
      }
    });

    const { error: dbError } = await supabase
      .from('pattern_profiles')
      .upsert({
        user_id: user.id,
        source: 'guided_reflection',
        nervous_system_patterns: { patterns: categoryMap.nervous_system_patterns },
        awareness_blind_spots: { patterns: categoryMap.awareness_blind_spots },
        identity_loops: { patterns: categoryMap.identity_loops },
        attention_leaks: { patterns: categoryMap.attention_leaks },
        relational_patterns: { patterns: categoryMap.relational_patterns },
        emotional_outlook: { patterns: categoryMap.emotional_outlook },
        shadow_material: { patterns: categoryMap.shadow_material },
        core_pattern: patternProfile.core_pattern,
        ios_roadmap: patternProfile.roadmap,
        mirror_quality_score: patternProfile.quality_score || 3,
        raw_gpt_output: JSON.stringify(responses),
        skipped: false,
        processed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to save pattern profile');
    }

    // Return success with profile
    return NextResponse.json({ 
      success: true, 
      profile: patternProfile 
    });

  } catch (error) {
    console.error('Guided reflection processing error:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to process reflection';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

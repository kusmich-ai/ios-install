// ============================================
// app/api/mirror/regenerate/route.ts
// Regenerates transformation roadmap for existing pattern profiles
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Create Supabase server client
async function createSupabaseClient() {
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );
}

// ============================================
// TRANSFORMATION ROADMAP GENERATION PROMPT
// ============================================
const ROADMAP_GENERATION_PROMPT = `You are a transformation architect. Given a user's pattern profile, create an emotionally compelling transformation roadmap.

Your job is to take their patterns and create MILESTONES that show:
1. What's broken (the cost of this pattern in their life)
2. What changes (the specific transformation they'll experience)
3. The shift (a one-line before → after statement)

CRITICAL RULES:
- Be SPECIFIC to their actual patterns, not generic
- Use "you" language - speak directly to them
- Show the COST emotionally - make them feel seen
- Show the TRANSFORMATION concretely - what will be different
- Keep each milestone focused on 1-2 related patterns
- Write like a coach who deeply understands them, not a therapist with clinical distance
- The language should create "oh shit, that's me" moments

Output JSON in this exact structure:
{
  "milestones": [
    {
      "number": 1,
      "title": "NERVOUS SYSTEM RESET",
      "timeframe": "Weeks 1-2",
      "stage": 1,
      "stage_name": "Neural Priming",
      "patterns_addressed": ["Pattern Name 1", "Pattern Name 2"],
      "whats_broken": "Your 'Fight-or-flight default' keeps you in survival mode. You can't access clarity because your body is running threat detection 24/7. Even when you're 'relaxing,' your nervous system is scanning for danger.",
      "what_changes": [
        "You'll be able to downregulate in under 60 seconds",
        "Stress stops living in your body overnight", 
        "You'll notice triggers BEFORE they hijack you"
      ],
      "the_shift": "\"I am anxious\" → \"I notice anxiety arising\""
    }
  ],
  "destination": {
    "core_pattern_name": "The Core Pattern Name",
    "liberation_statement": "When you complete this roadmap, '[Core Pattern]' will no longer run your life. You'll still [positive behavior] - but from wholeness, not wound. From choice, not compulsion."
  }
}

Create 3-4 milestones maximum, focused on their highest priority patterns. Each milestone should map to a specific IOS stage.

The milestones should build on each other - earlier ones create foundation for later ones.`;

// ============================================
// API ROUTE HANDLER
// ============================================
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch existing pattern profile
    const { data: profile, error: fetchError } = await supabase
      .from('pattern_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (fetchError || !profile) {
      return NextResponse.json(
        { error: 'No pattern profile found. Please complete The Mirror first.' },
        { status: 404 }
      );
    }

    if (profile.skipped) {
      return NextResponse.json(
        { error: 'Pattern profile was skipped. Please complete The Mirror to generate a roadmap.' },
        { status: 400 }
      );
    }

    // Collect all patterns from the profile
    const categories = [
      { key: 'nervous_system_patterns', label: 'Nervous System' },
      { key: 'awareness_blind_spots', label: 'Awareness' },
      { key: 'identity_loops', label: 'Identity' },
      { key: 'attention_leaks', label: 'Attention' },
      { key: 'relational_patterns', label: 'Relational' },
      { key: 'emotional_outlook', label: 'Emotional Outlook' },
      { key: 'shadow_material', label: 'Shadow' }
    ];

    const allPatterns: any[] = [];
    
    categories.forEach(cat => {
      const categoryData = profile[cat.key];
      if (categoryData?.patterns) {
        categoryData.patterns.forEach((p: any) => {
          allPatterns.push({ ...p, category: cat.label });
        });
      }
    });

    // Sort by severity
    allPatterns.sort((a, b) => (b.severity || 0) - (a.severity || 0));

    // Get priority stages from existing ios_roadmap or calculate
    const priorityStages = profile.ios_roadmap?.priority_stages || [1, 3, 5];

    // Build prompt context
    const patternContext = `
CORE PATTERN: ${profile.core_pattern?.name || 'Not identified'}
Description: ${profile.core_pattern?.description || 'N/A'}

HIGH-PRIORITY PATTERNS (severity 4-5):
${allPatterns.filter(p => (p.severity || 0) >= 4).map(p => `- ${p.name} (${p.category}): ${p.description || 'No description'}`).join('\n') || 'None identified'}

ALL PATTERNS:
${allPatterns.map(p => `- ${p.name} (severity ${p.severity || 'unknown'}): ${p.description || 'No description'}`).join('\n') || 'No patterns found'}

PRIORITY IOS STAGES: ${priorityStages.join(', ')}

IOS STAGE DEFINITIONS:
- Stage 1 (Neural Priming): Nervous system regulation, stress response, calm on demand
- Stage 2 (Embodied Awareness): Body connection, somatic awareness, feeling states
- Stage 3 (Identity Mode): Identity shifts, self-concept, acting from coherence
- Stage 4 (Flow Mode): Attention, focus, deep work, productivity without burnout
- Stage 5 (Relational Coherence): Relationships, boundaries, staying open in connection
- Stage 6 (Integration): Deep pattern integration, shadow work, stable transformation
`;

    // Generate transformation roadmap
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: ROADMAP_GENERATION_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Generate a transformation roadmap for this user:\n\n${patternContext}`
        }
      ]
    });

    const responseText = response.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('');

    let transformationRoadmap;
    try {
      const cleanedJson = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      transformationRoadmap = JSON.parse(cleanedJson);
    } catch (parseError) {
      console.error('Failed to parse roadmap JSON:', responseText);
      return NextResponse.json(
        { error: 'Failed to generate roadmap. Please try again.' },
        { status: 500 }
      );
    }

    // Update the pattern profile with the new transformation roadmap
    const updatedIosRoadmap = {
      ...profile.ios_roadmap,
      transformation: transformationRoadmap
    };

    const { error: updateError } = await supabase
      .from('pattern_profiles')
      .update({ 
        ios_roadmap: updatedIosRoadmap,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Failed to update pattern profile:', updateError);
      return NextResponse.json(
        { error: 'Failed to save roadmap. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      transformation_roadmap: transformationRoadmap
    });

  } catch (error) {
    console.error('Regenerate roadmap error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

// ============================================
// app/api/mirror/process/route.ts
// API endpoint for processing The Mirror analysis
// Receives GPT output, parses it with Claude, maps to IOS stages
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { 
  generateIOSRoadmap, 
  calculateMirrorQuality,
  mapPatternToStages,
  mapPatternToPractices
} from '@/lib/mirrorMapping';

// Initialize Anthropic client
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

// System prompt for Claude to parse GPT output into structured format
const PARSING_SYSTEM_PROMPT = `You are a pattern analysis parser. Your job is to take raw text output from a ChatGPT pattern analysis and convert it into a structured JSON format.

The input will contain pattern analysis across these 7 categories:
1. NERVOUS SYSTEM PATTERNS
2. AWARENESS BLIND SPOTS  
3. IDENTITY LOOPS
4. ATTENTION LEAKS
5. RELATIONAL PATTERNS
6. EMOTIONAL OUTLOOK
7. SHADOW MATERIAL

Plus a CORE PATTERN section at the end.

For EACH pattern mentioned in each category, extract:
- name: A clear, specific name for the pattern (2-6 words)
- description: A brief description of the pattern (1-2 sentences)
- evidence: The specific evidence from conversations mentioned (quote or paraphrase what was said)
- severity: The severity rating (1-5) - look for explicit ratings or infer from language
- connected_to: Array of other pattern names this connects to (if mentioned)

Output ONLY valid JSON in this exact structure:
{
  "nervous_system_patterns": {
    "patterns": [
      {
        "name": "Pattern Name",
        "description": "Brief description",
        "evidence": "Specific evidence from conversations",
        "severity": 4,
        "connected_to": ["Other Pattern Name"]
      }
    ]
  },
  "awareness_blind_spots": { "patterns": [] },
  "identity_loops": { "patterns": [] },
  "attention_leaks": { "patterns": [] },
  "relational_patterns": { "patterns": [] },
  "emotional_outlook": { "patterns": [] },
  "shadow_material": { "patterns": [] },
  "core_pattern": {
    "name": "The Core Pattern Name",
    "description": "Description of the deepest issue",
    "evidence": "Evidence for why this is the root",
    "severity": 5,
    "connected_patterns": ["List", "of", "connected", "patterns"]
  }
}

Rules:
- If a category has no patterns, use empty array: "patterns": []
- If severity isn't explicitly stated, infer from language (critical/severe = 5, significant = 4, moderate = 3, mild = 2, minor = 1)
- Keep pattern names concise but specific (not generic like "anxiety" - more like "Anticipatory Anxiety Loop")
- Extract actual evidence, not summaries
- If the input is too vague or lacks substance, still output the structure but with empty/minimal patterns
- ONLY output JSON - no markdown, no explanations, no preamble`;

export async function POST(request: NextRequest) {
  try {
    // Get the raw GPT output from request body
    const { gptOutput } = await request.json();
    
    if (!gptOutput || typeof gptOutput !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid gptOutput' },
        { status: 400 }
      );
    }

    // Validate minimum content
    if (gptOutput.length < 200) {
      return NextResponse.json(
        { 
          error: 'GPT output too short',
          message: 'The analysis appears incomplete. Please ensure ChatGPT provided a full pattern analysis.'
        },
        { status: 400 }
      );
    }

    // Create Supabase client and verify authentication
    const supabase = await createSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse GPT output using Claude
    const parseResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      system: PARSING_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Parse the following ChatGPT pattern analysis into structured JSON:\n\n${gptOutput}`
        }
      ]
    });

    // Extract text content from Claude's response
    const responseText = parseResponse.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('');

    // Parse the JSON response
    let parsedPatterns;
    try {
      // Clean up any markdown formatting that might have slipped through
      const cleanedJson = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      parsedPatterns = JSON.parse(cleanedJson);
    } catch (parseError) {
      console.error('Failed to parse Claude response as JSON:', responseText);
      return NextResponse.json(
        { 
          error: 'Failed to parse patterns',
          message: 'The analysis could not be properly structured. Please try again.'
        },
        { status: 500 }
      );
    }

    // Add IOS mapping to each pattern
    const categories = [
      'nervous_system_patterns',
      'awareness_blind_spots',
      'identity_loops',
      'attention_leaks',
      'relational_patterns',
      'emotional_outlook',
      'shadow_material'
    ];

    categories.forEach(category => {
      if (parsedPatterns[category]?.patterns) {
        parsedPatterns[category].patterns = parsedPatterns[category].patterns.map(
          (pattern: any, index: number) => {
            const id = `${category}_${Date.now()}_${index}`;
            const stages = mapPatternToStages(pattern, category);
            const practices = mapPatternToPractices(pattern, stages);
            
            return {
              ...pattern,
              id,
              ios_stages: stages,
              ios_practices: practices
            };
          }
        );
      }
    });

    // Generate IOS Roadmap
    const iosRoadmap = generateIOSRoadmap(parsedPatterns);

    // Calculate quality score
    const qualityScore = calculateMirrorQuality(parsedPatterns);

    // Prepare data for storage
    const patternProfileData = {
      user_id: user.id,
      raw_gpt_output: gptOutput,
      mirror_quality_score: qualityScore,
      nervous_system_patterns: parsedPatterns.nervous_system_patterns || { patterns: [] },
      awareness_blind_spots: parsedPatterns.awareness_blind_spots || { patterns: [] },
      identity_loops: parsedPatterns.identity_loops || { patterns: [] },
      attention_leaks: parsedPatterns.attention_leaks || { patterns: [] },
      relational_patterns: parsedPatterns.relational_patterns || { patterns: [] },
      emotional_outlook: parsedPatterns.emotional_outlook || { patterns: [] },
      shadow_material: parsedPatterns.shadow_material || { patterns: [] },
      core_pattern: parsedPatterns.core_pattern || null,
      ios_roadmap: iosRoadmap,
      skipped: false,
      processed_at: new Date().toISOString()
    };

    // Upsert to database (update if exists, insert if not)
    const { data: savedProfile, error: saveError } = await supabase
      .from('pattern_profiles')
      .upsert(patternProfileData, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (saveError) {
      console.error('Failed to save pattern profile:', saveError);
      return NextResponse.json(
        { 
          error: 'Failed to save analysis',
          message: 'Your analysis was processed but could not be saved. Please try again.'
        },
        { status: 500 }
      );
    }

    // Return the processed data
    return NextResponse.json({
      success: true,
      data: {
        id: savedProfile.id,
        quality_score: qualityScore,
        patterns: {
          nervous_system: parsedPatterns.nervous_system_patterns,
          awareness: parsedPatterns.awareness_blind_spots,
          identity: parsedPatterns.identity_loops,
          attention: parsedPatterns.attention_leaks,
          relational: parsedPatterns.relational_patterns,
          outlook: parsedPatterns.emotional_outlook,
          shadow: parsedPatterns.shadow_material
        },
        core_pattern: parsedPatterns.core_pattern,
        ios_roadmap: iosRoadmap
      }
    });

  } catch (error) {
    console.error('Mirror processing error:', error);
    return NextResponse.json(
      { 
        error: 'Processing failed',
        message: 'An unexpected error occurred. Please try again.'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve existing pattern profile
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: profile, error: fetchError } = await supabase
      .from('pattern_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        // No profile found
        return NextResponse.json({
          exists: false,
          data: null
        });
      }
      throw fetchError;
    }

    return NextResponse.json({
      exists: true,
      skipped: profile.skipped,
      data: profile.skipped ? null : {
        id: profile.id,
        quality_score: profile.mirror_quality_score,
        patterns: {
          nervous_system: profile.nervous_system_patterns,
          awareness: profile.awareness_blind_spots,
          identity: profile.identity_loops,
          attention: profile.attention_leaks,
          relational: profile.relational_patterns,
          outlook: profile.emotional_outlook,
          shadow: profile.shadow_material
        },
        core_pattern: profile.core_pattern,
        ios_roadmap: profile.ios_roadmap,
        processed_at: profile.processed_at
      }
    });

  } catch (error) {
    console.error('Failed to fetch pattern profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

// POST to /api/mirror/skip - marks the mirror as skipped
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { action } = await request.json();

    if (action === 'skip') {
      // Create a "skipped" profile record
      const { error: upsertError } = await supabase
        .from('pattern_profiles')
        .upsert({
          user_id: user.id,
          skipped: true,
          processed_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (upsertError) {
        throw upsertError;
      }

      return NextResponse.json({
        success: true,
        message: 'Mirror skipped'
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Failed to update pattern profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

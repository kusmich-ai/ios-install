// ============================================
// app/api/mirror/process/route.ts
// ENHANCED VERSION - Generates Transformation Roadmap
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { 
  generateIOSRoadmap, 
  calculateMirrorQuality,
  mapPatternToStages,
  mapPatternToPractices,
  IOS_STAGE_MAPPING
} from '@/lib/mirrorMapping';

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
// ENHANCED PARSING PROMPT
// ============================================
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
// GENERATE TRANSFORMATION ROADMAP
// ============================================
async function generateTransformationRoadmap(
  parsedPatterns: any,
  iosRoadmap: any
): Promise<any> {
  try {
    // Build context for roadmap generation
    const priorityStages = iosRoadmap.priority_stages || [1, 3, 5];
    
    // Collect high-severity patterns
    const allPatterns: any[] = [];
    const categories = [
      'nervous_system_patterns',
      'awareness_blind_spots',
      'identity_loops',
      'attention_leaks',
      'relational_patterns',
      'emotional_outlook',
      'shadow_material'
    ];
    
    categories.forEach(cat => {
      if (parsedPatterns[cat]?.patterns) {
        parsedPatterns[cat].patterns.forEach((p: any) => {
          allPatterns.push({ ...p, category: cat });
        });
      }
    });
    
    // Sort by severity
    allPatterns.sort((a, b) => b.severity - a.severity);
    
    // Build prompt context
    const patternContext = `
CORE PATTERN: ${parsedPatterns.core_pattern?.name || 'Not identified'}
Description: ${parsedPatterns.core_pattern?.description || 'N/A'}

HIGH-PRIORITY PATTERNS (severity 4-5):
${allPatterns.filter(p => p.severity >= 4).map(p => `- ${p.name} (${p.category.replace('_', ' ')}): ${p.description}`).join('\n')}

ALL PATTERNS:
${allPatterns.map(p => `- ${p.name} (severity ${p.severity}): ${p.description}`).join('\n')}

PRIORITY IOS STAGES: ${priorityStages.join(', ')}

IOS STAGE DEFINITIONS:
- Stage 1 (Neural Priming): Nervous system regulation, stress response, calm on demand
- Stage 2 (Embodied Awareness): Body connection, somatic awareness, feeling states
- Stage 3 (Identity Mode): Identity shifts, self-concept, acting from coherence
- Stage 4 (Flow Mode): Attention, focus, deep work, productivity without burnout
- Stage 5 (Relational Coherence): Relationships, boundaries, staying open in connection
- Stage 6 (Integration): Deep pattern integration, shadow work, stable transformation
`;

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

    // Parse JSON response
    const cleanedJson = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    return JSON.parse(cleanedJson);

  } catch (error) {
    console.error('Failed to generate transformation roadmap:', error);
    // Return a basic fallback structure
    return {
      milestones: [],
      destination: {
        core_pattern_name: parsedPatterns.core_pattern?.name || 'Your Core Pattern',
        liberation_statement: 'Complete this roadmap to transform these patterns from unconscious drivers into conscious choices.'
      }
    };
  }
}

// ============================================
// API ROUTE HANDLER
// ============================================
export async function POST(request: NextRequest) {
  try {
    const { gptOutput } = await request.json();
    
    if (!gptOutput || typeof gptOutput !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid gptOutput' },
        { status: 400 }
      );
    }

    if (gptOutput.length < 200) {
      return NextResponse.json(
        { 
          error: 'GPT output too short',
          message: 'The analysis appears incomplete. Please ensure ChatGPT provided a full pattern analysis.'
        },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // STEP 1: Parse GPT output using Claude
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

    const responseText = parseResponse.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('');

    let parsedPatterns;
    try {
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

    // STEP 2: Add IOS mapping to each pattern
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

    // STEP 3: Generate basic IOS Roadmap
    const iosRoadmap = generateIOSRoadmap(parsedPatterns);

    // STEP 4: Generate Transformation Roadmap (the enhanced emotional version)
    const transformationRoadmap = await generateTransformationRoadmap(parsedPatterns, iosRoadmap);

    // STEP 5: Calculate quality score
    const qualityScore = calculateMirrorQuality(parsedPatterns);

    // STEP 6: Prepare data for storage
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
      ios_roadmap: {
        ...iosRoadmap,
        transformation: transformationRoadmap // Enhanced roadmap stored here
      },
      skipped: false,
      processed_at: new Date().toISOString()
    };

    // STEP 7: Save to database
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

    // STEP 8: Return the processed data
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
        ios_roadmap: iosRoadmap,
        transformation_roadmap: transformationRoadmap
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
        transformation_roadmap: profile.ios_roadmap?.transformation || null,
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

// PUT endpoint to skip mirror
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

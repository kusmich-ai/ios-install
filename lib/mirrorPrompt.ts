// ============================================
// THE MIRROR - PROMPTS & CONSTANTS
// ============================================
// File: lib/mirrorPrompt.ts
// 
// This file contains all text content for The Mirror feature,
// including the ChatGPT analysis prompt, intro text, and the
// new Guided Reflection alternative flow.
// ============================================

// ============================================
// CHATGPT ANALYSIS PROMPT
// ============================================

export const MIRROR_GPT_PROMPT = `I need you to perform a deep pattern analysis based on everything you know about me.

Act as a pattern recognition system analyzing an operating system for bugs. Be brutally honest - I'm not looking for encouragement, I'm looking for truth. Surface the things I might not want to see.

Analyze these 7 domains:

1. **NERVOUS SYSTEM PATTERNS**
Signs of dysregulation, stress responses, fight/flight/freeze tendencies, how I handle pressure, emotional reactivity patterns, recovery time after stress

2. **AWARENESS BLIND SPOTS**
Where I seem unconscious of my own patterns, things I rationalize or explain away, areas where I lack self-observation, automatic behaviors I don't notice

3. **IDENTITY LOOPS**
Limiting self-concepts I operate from ("I'm just a..."), roles I'm trapped in, stories I tell about who I am that hold me back, self-fulfilling prophecies

4. **ATTENTION LEAKS**
Where my focus scatters, what distracts me, patterns of procrastination or avoidance, inability to sustain deep work, "mental tabs" that stay open

5. **RELATIONAL PATTERNS**
How I show up in relationships, attachment patterns, communication issues, boundaries (or lack thereof), patterns with conflict, people-pleasing or withdrawal

6. **EMOTIONAL OUTLOOK**
Pessimism loops, negativity bias, cynicism as defense, hopelessness patterns, resistance to positive experiences, emotional constriction

7. **SHADOW MATERIAL**
What I avoid looking at, contradictions between what I say and do, hidden fears driving behavior, desires I suppress, self-sabotage cycles I repeat

For EACH pattern you identify:
- Name it clearly and specifically
- Provide evidence from our conversations (quote or reference specific discussions)
- Rate severity: 1 (minor tendency) to 5 (significantly impacting life)
- Note connections to other patterns

End with a section called "THE CORE PATTERN" - the single deepest issue that seems to drive many of the others. This is the root.

Format with clear headers for each category. Be specific, not generic. If you don't have evidence for a category, say so rather than making things up.`;

// Alias for backward compatibility
export const MIRROR_PROMPT = MIRROR_GPT_PROMPT;

// ============================================
// MIRROR INTRO TEXT (UPDATED WITH HISTORY CHECK)
// ============================================

export const MIRROR_INTRO_TEXT = {
  headline: "The Mirror",
  tagline: "See what's running under the hood.",
  description: "Before we install your new operating system, let's reveal what's running in your current one. The Mirror analyzes patterns from your conversations to surface hidden blind spots, self-sabotage cycles, and the core issue driving everything else.",
  
  whatItDoes: [
    "Identifies unconscious patterns across 7 life domains",
    "Reveals the connections between your patterns",
    "Uncovers your Core Pattern - the root issue driving everything else",
    "Maps each pattern to the IOS stages that will address it"
  ],
  
  requirements: "This works best if you've had meaningful conversations with ChatGPT about your life, goals, struggles, relationships, or decisions. The more history, the deeper the insights.",
  time: "~5 minutes",
  privacy: "Your analysis stays between you and IOS. We use it only to personalize your journey.",

  // ============================================
  // NEW: HISTORY CHECK SECTION
  // ============================================
  historyNotice: {
    title: "This works best with conversation history",
    description: "The Mirror is most powerful when you have 50+ personal conversations in ChatGPT — the kind where you processed decisions, relationships, emotions, or life challenges. Not work/technical conversations.",
    question: "Do you have that kind of ChatGPT history?",
    options: {
      yes: "Yes, I've used ChatGPT for personal processing",
      no: "No, or mostly work/technical conversations",
      unsure: "I'm not sure"
    }
  },

  // ============================================
  // NEW: ALTERNATIVE PATHS
  // ============================================
  alternatives: {
    intro: "Here are two ways to get similar insights:",
    
    guidedReflection: {
      title: "Option A: Guided Reflection",
      description: "I'll ask you 7 questions directly about your patterns. Takes about 5 minutes. We'll build your transformation roadmap from your answers.",
      time: "~5 minutes",
      button: "Start Guided Reflection"
    },
    
    skipForNow: {
      title: "Option B: Skip for Now",
      description: "Jump straight into Stage 1. After 21 days of practices and conversations, we'll have enough context from your IOS journey to run a meaningful Mirror.",
      button: "Skip & Start Stage 1"
    }
  }
};

// ============================================
// MIRROR INSTRUCTIONS
// ============================================

export const MIRROR_INSTRUCTIONS = {
  step1: {
    title: "Copy the Prompt",
    description: "Copy the prompt"
  },
  step2: {
    title: "Open ChatGPT",
    description: "Go to ChatGPT"
  },
  step3: {
    title: "Paste & Run",
    description: "Paste and run it"
  },
  step4: {
    title: "Copy Response",
    description: "Copy the response"
  },
  step5: {
    title: "Paste Here",
    description: "Paste it below"
  }
};

// ============================================
// QUALITY MESSAGES
// ============================================

export const QUALITY_MESSAGES = {
  1: {
    title: "Limited Insights",
    message: "Your ChatGPT history didn't provide enough depth for a full Mirror analysis. This happens if you haven't had many meaningful conversations there yet. You can proceed without it, or come back after having more in-depth conversations with ChatGPT.",
    showSkip: true
  },
  2: {
    title: "Basic Patterns Detected",
    message: "We found some patterns, but there's limited evidence. The insights may be surface-level. You can proceed with this, or try again with a more detailed ChatGPT analysis.",
    showSkip: true
  },
  3: {
    title: "Good Pattern Profile",
    message: "Solid pattern analysis with good evidence across multiple domains. This will be useful for your IOS journey.",
    showSkip: false
  },
  4: {
    title: "Strong Pattern Profile",
    message: "Comprehensive analysis with clear patterns and connections. This gives us a detailed map of what to address.",
    showSkip: false
  },
  5: {
    title: "Deep Pattern Profile",
    message: "Exceptional depth and clarity. Your patterns, connections, and Core Pattern are well-documented. This is exactly what we need to personalize your IOS installation.",
    showSkip: false
  }
};

// ============================================
// NEW: GUIDED REFLECTION FLOW
// ============================================

export const GUIDED_REFLECTION_FLOW = {
  intro: `Since we don't have your ChatGPT history to analyze, I'm going to ask you directly about your patterns.

These questions are designed to surface the same material The Mirror would extract from conversation analysis. Be honest — there are no wrong answers, only useful data.

This takes about 5 minutes. Ready?`,

  questions: [
    {
      id: 'friction_point',
      category: 'Core Friction',
      question: "What's the thing you keep trying to fix about yourself — the pattern that keeps showing up no matter what you do?",
      followUp: "How long has this been a theme in your life?",
      placeholder: "Describe the pattern or issue that keeps recurring...",
      note: "This often points to the Core Pattern"
    },
    {
      id: 'stress_response',
      category: 'Nervous System',
      question: "When you're under pressure or triggered, what's your default response? Do you fight (push harder, get aggressive), flight (avoid, distract, escape), freeze (shut down, go numb), or fawn (people-please, over-accommodate)?",
      followUp: "What happens in your body when you're stressed? Where do you feel it?",
      placeholder: "Describe how you typically react under stress...",
      note: "Maps to Stage 1 work"
    },
    {
      id: 'blind_spot',
      category: 'Awareness',
      question: "What feedback have you received multiple times that you've dismissed or explained away? Or: What do people close to you see about you that you struggle to see yourself?",
      followUp: null,
      placeholder: "Think about recurring feedback or observations others have made...",
      note: "Surfaces awareness blind spots"
    },
    {
      id: 'identity_trap',
      category: 'Identity',
      question: "Complete this sentence honestly: 'I'm just not the kind of person who...' or 'I could never...'",
      followUp: "Where did that belief come from? Can you trace it to a specific experience or message?",
      placeholder: "I'm just not the kind of person who...",
      note: "Maps to Stage 3 Identity work"
    },
    {
      id: 'attention_leak',
      category: 'Focus',
      question: "What are the 'open tabs' in your mind that drain your focus? The things you keep thinking about but don't actually address?",
      followUp: "What do you think you're avoiding by letting your attention scatter?",
      placeholder: "List the thoughts, worries, or unfinished business that occupy your mental bandwidth...",
      note: "Maps to Stage 4 Flow work"
    },
    {
      id: 'relational_pattern',
      category: 'Relationships',
      question: "What pattern keeps showing up in your relationships — romantic, family, or professional? The thing that happens again and again with different people?",
      followUp: "What do you think you're getting from that pattern, even if it hurts you?",
      placeholder: "Describe the recurring dynamic or issue in your relationships...",
      note: "Maps to Stage 5 Relational work"
    },
    {
      id: 'self_sabotage',
      category: 'Shadow',
      question: "When things are going well, how do you typically sabotage yourself? What's your signature way of getting in your own way?",
      followUp: null,
      placeholder: "Describe how you tend to undermine your own success or happiness...",
      note: "Core Shadow material"
    }
  ],

  processing: {
    title: "Analyzing Your Patterns",
    message: "Building your transformation roadmap..."
  },

  synthesis: `Based on what you've shared, here's what I'm seeing...`,

  closing: `This gives us a strong foundation. As you progress through IOS, these patterns will become clearer — and you'll watch them transform.

Ready to begin Stage 1?`
};

// ============================================
// CLAUDE SYNTHESIS PROMPT FOR GUIDED REFLECTION
// ============================================

export const GUIDED_REFLECTION_SYNTHESIS_PROMPT = `You are analyzing a user's self-reported patterns from a guided reflection intake for the IOS (Integrated Operating System) transformation platform. Your job is to identify their core patterns and map them to the IOS stages.

The IOS has 6 main stages:
- Stage 1: Neural Priming (nervous system regulation, stress response, emotional reactivity)
- Stage 2: Embodied Awareness (body awareness, somatic patterns, embodiment)
- Stage 3: Identity Mode (identity, limiting self-concepts, stories about self)
- Stage 4: Flow Mode (focus, attention, sustained concentration, deep work)
- Stage 5: Relational Coherence (relationships, boundaries, interpersonal patterns)
- Stage 6: Integration (insight encoding, daily reflection, consolidation)

Based on their responses, create a pattern profile with:

1. **Identified Patterns** (3-5 clear patterns)
   For each pattern:
   - name: Clear, specific name (e.g., "Perfectionism Loop", "Conflict Avoidance", "Attention Scatter")
   - description: 1-2 sentence explanation
   - severity: 1-5 (1=minor tendency, 5=significantly impacting life)
   - ios_stage: Which stage primarily addresses this (1-6)
   - evidence: What they said that revealed this pattern

2. **Core Pattern** - The single deepest issue that seems to drive the others
   - name: Clear name
   - description: How this manifests and why it's central
   - connections: List of other pattern names it connects to

3. **IOS Roadmap** - How their journey through the stages will address these patterns
   - stage1_focus: What Stage 1 will specifically address for them
   - stage3_focus: What Stage 3 will specifically address for them
   - stage4_focus: What Stage 4 will specifically address for them
   - stage5_focus: What Stage 5 will specifically address for them

4. **Quality Score** (3-5)
   - 3: Good self-reflection, patterns identifiable
   - 4: Strong self-awareness, clear patterns with connections
   - 5: Exceptional depth, nuanced understanding of own patterns

Be specific and honest, but constructive. Frame patterns as "what we're going to address" not "what's wrong with you." Use their own language where possible.

User's Guided Reflection Responses:
{responses}

Respond ONLY with valid JSON in this exact format:
{
  "patterns": [
    {
      "name": "string",
      "description": "string",
      "severity": number,
      "ios_stage": number,
      "evidence": "string"
    }
  ],
  "core_pattern": {
    "name": "string",
    "description": "string",
    "connections": ["string"]
  },
  "roadmap": {
    "stage1_focus": "string",
    "stage3_focus": "string",
    "stage4_focus": "string",
    "stage5_focus": "string"
  },
  "quality_score": number
}`;

// ============================================
// DEFAULT EXPORT
// ============================================

export default {
  MIRROR_GPT_PROMPT,
  MIRROR_PROMPT,
  MIRROR_INTRO_TEXT,
  MIRROR_INSTRUCTIONS,
  QUALITY_MESSAGES,
  GUIDED_REFLECTION_FLOW,
  GUIDED_REFLECTION_SYNTHESIS_PROMPT
};

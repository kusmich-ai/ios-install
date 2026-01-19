// ============================================
// THE MIRROR - PROMPTS & CONSTANTS
// ============================================
// File: lib/mirrorPrompt.ts
// 
// This file contains all text content for The Mirror feature,
// including the ChatGPT analysis prompt, intro text, and the
// Guided Reflection alternative flow.
//
// PHILOSOPHY ALIGNMENT:
// - Recognition over improvement
// - Notice, don't excavate
// - Signal → Interpretation → Action
// - Tools restore clarity, don't fix
// - Unbecoming, not becoming
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
// MIRROR INTRO TEXT (WITH HISTORY CHECK)
// ============================================

export const MIRROR_INTRO_TEXT = {
  headline: "The Mirror",
  tagline: "See what's running under the hood.",
  description: "Before we install your new operating system, let's reveal what's running in your current one. The Mirror surfaces patterns from your conversations — not to fix them, but to see them clearly. Awareness of a pattern is the first step to freedom from it.",
  
  whatItDoes: [
    "Surfaces patterns across 7 life domains",
    "Reveals connections between patterns",
    "Identifies the Core Pattern — the central dynamic",
    "Maps each pattern to the IOS stages that train awareness of it"
  ],
  
  requirements: "This works best if you've had meaningful conversations with ChatGPT about your life, goals, struggles, relationships, or decisions. The more history, the deeper the insights.",
  time: "~5 minutes",
  privacy: "Your analysis stays between you and IOS. We use it only to personalize your journey.",

  // ============================================
  // HISTORY CHECK SECTION
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
  // ALTERNATIVE PATHS
  // ============================================
  alternatives: {
    intro: "Here are two ways to get similar insights:",
    
    guidedReflection: {
      title: "Option A: Guided Reflection",
      description: "I'll ask you 7 questions directly about your current experience. Takes about 5 minutes. We'll build your awareness map from your answers.",
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
    message: "Solid pattern recognition with good evidence across multiple domains. This will be useful for your IOS journey.",
    showSkip: false
  },
  4: {
    title: "Strong Pattern Profile",
    message: "Comprehensive analysis with clear patterns and connections. This gives us a detailed map of what to notice.",
    showSkip: false
  },
  5: {
    title: "Deep Pattern Profile",
    message: "Exceptional depth and clarity. Your patterns, connections, and Core Pattern are well-documented. This is exactly what we need to personalize your IOS installation.",
    showSkip: false
  }
};

// ============================================
// GUIDED REFLECTION FLOW
// ============================================
// PHILOSOPHY ALIGNMENT:
// - Questions surface patterns without implying they need fixing
// - Follow-ups point to somatic signal, not interpretation/archaeology
// - Language is "notice" and "shows up" not "fix" and "sabotage"
// - No digging into origins or meaning of patterns
// - Framing is recognition-based, not improvement-based
// ============================================

export const GUIDED_REFLECTION_FLOW = {
  intro: `Since we don't have your ChatGPT history to analyze, I'm going to ask you directly about your current experience.

These questions surface patterns that are already running — not to fix them, but to see them clearly. Awareness of a pattern is different from being trapped in it.

This takes about 5 minutes. Ready?`,

  questions: [
    {
      id: 'current_friction',
      category: 'Current Friction',
      question: "What pattern or experience keeps showing up in your life — the thing that's present even when circumstances change?",
      followUp: "When it shows up, where do you notice it first — in your body, your thoughts, or your behavior?",
      placeholder: "Describe what keeps recurring...",
      note: "Surfaces Core Pattern without 'fix' framing"
    },
    {
      id: 'stress_response',
      category: 'Nervous System',
      question: "When you're under pressure or triggered, what's your body's default response? Do you notice more fight (push harder, get tense), flight (urge to escape, distract), freeze (shut down, go blank), or fawn (accommodate, appease)?",
      followUp: "Where do you feel that response in your body right now, even thinking about it?",
      placeholder: "Describe what you notice in your body...",
      note: "Maps to Stage 1 - somatic signal focus"
    },
    {
      id: 'blind_spot',
      category: 'Awareness',
      question: "What do people close to you see about you that's hard for you to see yourself? Or: what feedback keeps coming that you tend to dismiss?",
      followUp: null,
      placeholder: "What's hard to see about yourself...",
      note: "Surfaces awareness gaps without excavation"
    },
    {
      id: 'identity_story',
      category: 'Identity',
      question: "What story do you tell yourself about who you are that feels limiting? The 'I am...' or 'I'm not...' that runs in the background.",
      followUp: "When that story is running, what do you notice happening in your body or behavior?",
      placeholder: "The story that plays...",
      note: "Identifies the story without archaeology of its origin"
    },
    {
      id: 'attention_scatter',
      category: 'Focus',
      question: "What tends to pull your attention away from what matters? The things that scatter focus or keep running in the background.",
      followUp: "When your attention scatters, what's the signal in your body — restlessness, tension, numbness, something else?",
      placeholder: "What scatters your attention...",
      note: "Maps to Stage 4 - signal-based, not interpretation-based"
    },
    {
      id: 'relational_signal',
      category: 'Relationships',
      question: "What tends to happen in your close relationships that creates friction or distance? The dynamic that keeps repeating.",
      followUp: "When that dynamic is happening, what do you notice in your body?",
      placeholder: "The recurring relational pattern...",
      note: "Maps to Stage 5 - pattern recognition without meaning-making"
    },
    {
      id: 'self_interruption',
      category: 'Shadow',
      question: "When things are moving toward what you want, what tends to interrupt or slow that down? Not why — just what shows up.",
      followUp: null,
      placeholder: "What tends to interrupt progress...",
      note: "Shadow material without self-judgment framing"
    }
  ],

  processing: {
    title: "Mapping Your Patterns",
    message: "Building your awareness map..."
  },

  synthesis: `Here's what showed up. These aren't problems to fix — they're patterns to see clearly. Awareness of a pattern is the first step to freedom from it.`,

  closing: `This gives us a clear starting point. As you move through the IOS, you'll develop the capacity to notice these patterns in real-time — and choose how to respond rather than react.

Ready to begin Stage 1?`
};

// ============================================
// CLAUDE SYNTHESIS PROMPT FOR GUIDED REFLECTION
// ============================================
// PHILOSOPHY ALIGNMENT:
// - Patterns are not problems to fix — they are dynamics to see clearly
// - Focus on what IS, not what's wrong
// - Use language of "noticing" and "awareness" not "fixing" or "healing"
// - Avoid excavation language (why it started, what caused it)
// ============================================

export const GUIDED_REFLECTION_SYNTHESIS_PROMPT = `You are analyzing a user's self-reported patterns from a guided reflection intake for the IOS (Integrated Operating System) transformation platform.

IMPORTANT FRAMING:
- Patterns are not problems to fix — they are dynamics to see clearly
- The goal is RECOGNITION, not improvement
- Focus on what IS, not what's wrong
- Use language of "noticing" and "awareness" not "fixing" or "healing"
- Avoid excavation language (why it started, what caused it, what it means)

The IOS has 6 main stages:
- Stage 1: Neural Priming (nervous system regulation, noticing stress signals)
- Stage 2: Embodied Awareness (body awareness, somatic signals)
- Stage 3: Identity Mode (noticing identity stories, choosing consciously)
- Stage 4: Flow Mode (attention training, noticing scatter)
- Stage 5: Relational Coherence (noticing relational patterns)
- Stage 6: Integration (daily reflection, pattern recognition)

Based on their responses, create a pattern profile with:

1. **Identified Patterns** (3-5 clear patterns)
   For each pattern:
   - name: Clear, descriptive name (e.g., "Attention Scatter", "Freeze Response", "Performance Story")
   - description: 1-2 sentence description of WHAT shows up (not why or what it means)
   - severity: 1-5 (1=occasionally present, 5=frequently running)
   - ios_stage: Which stage trains awareness of this pattern (1-6)
   - evidence: What they said that revealed this pattern

2. **Core Pattern** - The central dynamic that connects to others
   - name: Clear name
   - description: How this manifests (not its origin or meaning)
   - connections: List of other pattern names it connects to

3. **IOS Roadmap** - How each stage builds awareness capacity
   - stage1_focus: What nervous system signals to notice
   - stage3_focus: What identity stories to recognize
   - stage4_focus: What attention patterns to observe
   - stage5_focus: What relational dynamics to see

4. **Quality Score** (3-5)
   - 3: Good self-reflection, patterns identifiable
   - 4: Strong self-awareness, clear patterns with connections
   - 5: Exceptional clarity about current experience

LANGUAGE CONSTRAINTS:
- Use "notice" not "fix"
- Use "pattern" not "problem"
- Use "shows up" not "caused by"
- Use "trains awareness of" not "addresses" or "heals"
- Never use "healing", "trauma", "wound", or "broken"

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

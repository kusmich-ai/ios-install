// ============================================
// lib/mirrorPrompt.ts
// The prompt users copy to ChatGPT for pattern analysis
// ============================================

export const MIRROR_GPT_PROMPT = `You have memory of our past conversations. I need you to perform a deep pattern analysis based on everything you know about me.

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

export const MIRROR_INSTRUCTIONS = {
  step1: {
    title: "Copy the Prompt",
    description: "Click the button below to copy the analysis prompt to your clipboard."
  },
  step2: {
    title: "Open ChatGPT",
    description: "Go to chat.openai.com and start a new conversation (or use an existing one with history)."
  },
  step3: {
    title: "Paste & Run",
    description: "Paste the prompt and press Enter. Wait for ChatGPT to analyze your patterns."
  },
  step4: {
    title: "Copy the Response",
    description: "Select all of ChatGPT's response and copy it."
  },
  step5: {
    title: "Paste Back Here",
    description: "Paste ChatGPT's full response in the text area below."
  }
};

export const MIRROR_INTRO_TEXT = {
  headline: "The Mirror",
  tagline: "See what's running under the hood.",
  description: "Before we install your new operating system, let's reveal what's running in your current one. The Mirror analyzes your ChatGPT conversation history to surface the hidden patterns, blind spots, and self-sabotage cycles that have been operating below your awareness.",
  whatItDoes: [
    "Identifies unconscious patterns across 7 life domains",
    "Reveals the connections between your patterns",
    "Uncovers your Core Pattern - the root issue driving everything else",
    "Maps each pattern to the IOS stages that will address it"
  ],
  requirements: "This works best if you've had meaningful conversations with ChatGPT about your life, goals, struggles, relationships, or decisions. The more history, the deeper the insights.",
  time: "~5 minutes",
  privacy: "Your ChatGPT analysis stays between you and IOS. We use it only to personalize your journey."
};

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

export default {
  MIRROR_GPT_PROMPT,
  MIRROR_INSTRUCTIONS,
  MIRROR_INTRO_TEXT,
  QUALITY_MESSAGES
};

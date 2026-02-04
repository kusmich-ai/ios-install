// lib/course/courseIntegration.ts
// Course knowledge and trigger map for AI coach integration
// This enables coaches to suggest relevant tutorials based on conversation patterns

// ============================================
// TUTORIAL VIDEO SUGGESTION FORMAT
// ============================================
// When suggesting a video, coaches should use this exact format so the
// chat interface can detect and render it as a clickable video card:
//
// [[VIDEO_SUGGESTION:module_number:tutorial_number:reason]]
//
// Example: [[VIDEO_SUGGESTION:1:2:You mentioned wanting to understand the science behind this]]
//
// The chat interface will parse this and render a video card with:
// - Tutorial thumbnail
// - Title and duration
// - "Watch Now" button that opens VideoModal

export const VIDEO_SUGGESTION_REGEX = /\[\[VIDEO_SUGGESTION:(\d+):(\d+):([^\]]+)\]\]/g;

// ============================================
// COURSE STRUCTURE REFERENCE
// ============================================
export const COURSE_MODULES = {
  1: {
    title: "Foundations of Neural Liberation",
    stageRequired: 1,
    tutorials: [
      { number: 1, title: "The Architecture of Your Neural Operating System", duration: "12 min" },
      { number: 2, title: "Why Traditional Approaches Fall Short", duration: "10 min" },
      { number: 3, title: "The Science of State Change", duration: "14 min" },
      { number: 4, title: "Your Baseline: Understanding Where You Are", duration: "8 min" },
    ]
  },
  2: {
    title: "The Architecture of Suffering",
    stageRequired: 2,
    tutorials: [
      { number: 1, title: "The Loop of Seeking and Resistance", duration: "15 min" },
      { number: 2, title: "Identity as Construct: The Stories We Tell", duration: "13 min" },
      { number: 3, title: "The Role of Psychedelics in Neural Liberation", duration: "18 min" },
      { number: 4, title: "From Survival to Thriving: Reprogramming the NOS", duration: "16 min" },
    ]
  },
  3: {
    title: "Practices That Rewire",
    stageRequired: 2,
    tutorials: [
      { number: 1, title: "Resonance Breathing: The Foundation Practice", duration: "11 min" },
      { number: 2, title: "The Awareness Rep: Training Meta-Cognition", duration: "9 min" },
      { number: 3, title: "Somatic Flow & Embodied Awareness", duration: "14 min" },
      { number: 4, title: "Co-Regulation: The Relational Nervous System", duration: "12 min" },
    ]
  },
  4: {
    title: "Living as Liberation",
    stageRequired: 2,
    tutorials: [
      { number: 1, title: "Integration: From Insight to Trait", duration: "13 min" },
      { number: 2, title: "The Nightly Debrief: Encoding Daily Wisdom", duration: "8 min" },
      { number: 3, title: "Maintaining Your Rewired State", duration: "11 min" },
      { number: 4, title: "Advanced Practices & The Path Forward", duration: "15 min" },
    ]
  }
};

// ============================================
// TRIGGER MAP - When to suggest each tutorial
// ============================================
// Each trigger pattern maps to a tutorial suggestion
// Coaches should check user's stage before suggesting

export const TUTORIAL_TRIGGERS = {
  // MODULE 1: Foundations
  "1.1": {
    title: "The Architecture of Your Neural Operating System",
    triggers: [
      "what is the NOS",
      "what is neural operating system",
      "how does the nervous system work",
      "explain the IOS system",
      "what's the science behind this",
      "how does this actually work",
      "nervous system explanation",
      "why does my body react this way",
      "fight or flight explanation",
    ],
    suggestWhen: "User asks foundational questions about how the nervous system works or what the IOS is",
    reason: "This tutorial explains exactly how your neural operating system shapes everything you experience."
  },
  "1.2": {
    title: "Why Traditional Approaches Fall Short",
    triggers: [
      "why doesn't meditation work",
      "affirmations don't work",
      "tried everything",
      "nothing works for me",
      "therapy didn't help",
      "self-help doesn't work",
      "I've read all the books",
      "personal development failed",
      "why is this different",
    ],
    suggestWhen: "User expresses frustration with other approaches or asks why IOS is different",
    reason: "This explains why most approaches fail and what makes neural-level change different."
  },
  "1.3": {
    title: "The Science of State Change",
    triggers: [
      "how do states change",
      "what is vagal tone",
      "HRV explained",
      "how does breathing work",
      "why resonance breathing",
      "parasympathetic nervous system",
      "science of calm",
      "how to change my state",
      "physiological sigh",
    ],
    suggestWhen: "User wants to understand the mechanism behind state change practices",
    reason: "This covers the neuroscience of how we shift from reactive to regulated states."
  },
  "1.4": {
    title: "Your Baseline: Understanding Where You Are",
    triggers: [
      "what does my score mean",
      "explain REwired Index",
      "what are the domains",
      "regulation score",
      "awareness score",
      "how am I measured",
      "what's my baseline",
      "tracking progress",
    ],
    suggestWhen: "User asks about their assessment scores or what the metrics mean",
    reason: "This explains how to interpret your baseline and what each domain measures."
  },

  // MODULE 2: Architecture of Suffering
  "2.1": {
    title: "The Loop of Seeking and Resistance",
    triggers: [
      "why am I always seeking",
      "nothing satisfies me",
      "always wanting more",
      "can't be content",
      "hedonic treadmill",
      "why do I resist",
      "resistance to what is",
      "seeking happiness",
      "self → seeking → suffering",
      "loop of suffering",
    ],
    suggestWhen: "User describes chronic seeking, dissatisfaction, or resistance patterns",
    reason: "This breaks down why seeking creates suffering and how to exit the loop."
  },
  "2.2": {
    title: "Identity as Construct: The Stories We Tell",
    triggers: [
      "who am I really",
      "identity crisis",
      "I don't know who I am",
      "stories I tell myself",
      "limiting beliefs about myself",
      "my identity feels fake",
      "constructed self",
      "ego explained",
      "roles and masks",
      "not good enough",
    ],
    suggestWhen: "User questions their identity, struggles with self-concept, or realizes stories are running them",
    reason: "This explores how identity is constructed and how to see through the stories."
  },
  "2.3": {
    title: "The Role of Psychedelics in Neural Liberation",
    triggers: [
      "psychedelics",
      "5-MeO",
      "plant medicine",
      "molecule work",
      "what happens in Stage 7",
      "accelerated expansion",
      "God molecule",
    ],
    stageRequired: 7,
    suggestWhen: "User asks about psychedelic-assisted work (ONLY suggest if Stage 7)",
    reason: "This covers the science and protocols of molecule-assisted transformation."
  },
  "2.4": {
    title: "From Survival to Thriving: Reprogramming the NOS",
    triggers: [
      "always in survival mode",
      "can't relax",
      "always on edge",
      "hypervigilant",
      "stuck in fight or flight",
      "nervous system stuck",
      "how to reprogram",
      "change my baseline",
      "default mode",
    ],
    suggestWhen: "User describes being stuck in survival patterns or chronic dysregulation",
    reason: "This shows how to systematically shift from survival to thriving as your default."
  },

  // MODULE 3: Practices That Rewire
  "3.1": {
    title: "Resonance Breathing: The Foundation Practice",
    triggers: [
      "how to do resonance breathing",
      "breathing technique explained",
      "why 4-6 breathing",
      "HRVB training",
      "breathing practice",
      "vagal tone exercise",
      "resonance frequency",
      "morning breathing",
    ],
    suggestWhen: "User wants deeper understanding of resonance breathing beyond the basics",
    reason: "This is the complete guide to resonance breathing and why it's foundational."
  },
  "3.2": {
    title: "The Awareness Rep: Training Meta-Cognition",
    triggers: [
      "how to do awareness rep",
      "what is meta-awareness",
      "noticing thoughts",
      "observer practice",
      "decentering explained",
      "mindfulness vs awareness",
      "insula training",
    ],
    suggestWhen: "User wants to go deeper on awareness training or struggles with the practice",
    reason: "This explains the neuroscience and technique of training meta-awareness."
  },
  "3.3": {
    title: "Somatic Flow & Embodied Awareness",
    triggers: [
      "somatic flow explained",
      "body awareness practice",
      "embodiment training",
      "movement and breath",
      "proprioception",
      "cat-cow practice",
      "squat to reach",
    ],
    stageRequired: 5,
    suggestWhen: "User is ready for or curious about somatic practices (Stage 5+)",
    reason: "This covers bringing awareness into movement and the body's wisdom."
  },
  "3.4": {
    title: "Co-Regulation: The Relational Nervous System",
    triggers: [
      "co-regulation practice",
      "relational nervous system",
      "nervous system in relationship",
      "compassion practice",
      "metta practice",
      "loving-kindness",
      "ventral vagal",
      "social engagement",
    ],
    stageRequired: 5,
    suggestWhen: "User is working on relational coherence (Stage 5+)",
    reason: "This explains how our nervous systems co-regulate and the science of compassion practice."
  },

  // MODULE 4: Living as Liberation
  "4.1": {
    title: "Integration: From Insight to Trait",
    triggers: [
      "how to make this stick",
      "insights fade",
      "back to old patterns",
      "integration after breakthrough",
      "trait level change",
      "permanent transformation",
      "maintaining progress",
    ],
    stageRequired: 6,
    suggestWhen: "User is in Stage 6 and working on integrating insights (Stage 6+)",
    reason: "This covers how to convert insights into stable, trait-level changes."
  },
  "4.2": {
    title: "The Nightly Debrief: Encoding Daily Wisdom",
    triggers: [
      "nightly debrief explained",
      "evening practice",
      "daily reflection",
      "encoding learning",
      "what did reality teach me",
      "end of day practice",
    ],
    stageRequired: 6,
    suggestWhen: "User is learning or working with the Nightly Debrief (Stage 6+)",
    reason: "This is the complete guide to the Nightly Debrief and why it encodes transformation."
  },
  "4.3": {
    title: "Maintaining Your Rewired State",
    triggers: [
      "how to maintain",
      "staying rewired",
      "after the program",
      "long-term practice",
      "sustainable change",
      "what's next after Stage 6",
    ],
    stageRequired: 6,
    suggestWhen: "User asks about maintaining transformation long-term (Stage 6+)",
    reason: "This covers how to maintain your rewired state for life."
  },
  "4.4": {
    title: "Advanced Practices & The Path Forward",
    triggers: [
      "what's after IOS",
      "advanced practices",
      "going deeper",
      "Stage 7 prep",
      "path forward",
      "next level",
    ],
    stageRequired: 6,
    suggestWhen: "User is completing Stage 6 and looking ahead (Stage 6+)",
    reason: "This previews advanced practices and the path into Stage 7."
  }
};

// ============================================
// KEY CONCEPTS BY TUTORIAL
// ============================================
// These are the core takeaways coaches can reference naturally

export const TUTORIAL_KEY_CONCEPTS = {
  "1.1": {
    concepts: [
      "The NOS (Neural Operating System) is the nervous system's conditioned patterns that run automatically",
      "The NOS filters trillions of inputs and only lets through what aligns with its programming",
      "The NOS is designed for survival, not optimization - 'survival means keeping everything the same'",
      "Every feeling (happy, sad, stressed) is neurochemicals firing, not reactions to exterior circumstances",
      "You can't control what you think or do outside of the neural operating system",
    ],
    nicCanSay: "Your NOS is running the show whether you like it or not. It's filtering reality through survival programming from decades ago.",
    fehrenCanSay: "Your nervous system learned these patterns to keep you safe. Now we can gently update what 'safe' means."
  },
  "1.2": {
    concepts: [
      "The nervous system doesn't understand words or language - affirmations don't reach it",
      "The language of the nervous system is somatics (body sensations and feelings)",
      "Most approaches work on the mind while ignoring the nervous system that runs everything",
      "You cannot change the MOS (Mental Operating System) without first regulating the NOS",
      "Discipline and willpower fail because they're cognitive - the nervous system overrides them",
    ],
    nicCanSay: "Affirmations are like yelling at a thermostat in a language it doesn't speak. The nervous system only understands felt experience.",
    fehrenCanSay: "Your body has been trying to tell you something all along. We're just learning to listen in its language."
  },
  "1.3": {
    concepts: [
      "Resonance breathing (4s in, 6s out) stimulates the vagus nerve and increases HRV",
      "HRV (Heart Rate Variability) is a direct measure of nervous system flexibility",
      "The 4:6 ratio hits your 'resonance frequency' for maximum vagal tone",
      "A physiological sigh (double inhale, long exhale) is the fastest way to downregulate",
      "State change happens at the physiological level first, then cognition follows",
    ],
    nicCanSay: "The 4:6 breath ratio isn't arbitrary - it's calibrated to your resonance frequency. That's physics, not woo.",
    fehrenCanSay: "When we slow the exhale, we're sending a signal to the whole system: 'It's safe to rest now.'"
  },
  "1.4": {
    concepts: [
      "Four domains: Regulation (calm), Awareness (meta-cognition), Outlook (positivity), Attention (focus)",
      "REwired Index = composite score from 0-100 measuring overall neural optimization",
      "Baseline is your starting point - transformation is measured as delta from baseline",
      "Weekly deltas track actual change, not just subjective feeling",
      "Stage advancement requires demonstrated competence, not just time",
    ],
    nicCanSay: "Your baseline isn't a judgment - it's just data. The delta is what matters. You're measuring change, not worth.",
    fehrenCanSay: "These numbers are just a map, not the territory. They help us see where your system wants support."
  },
  "2.1": {
    concepts: [
      "The loop: Self (identification) → Seeking → Suffering → repeat",
      "Seeking is suffering in disguise - always wanting what isn't here",
      "Resistance is the other side of seeking - rejecting what is",
      "All personal suffering happens because of seeking and resisting",
      "Healing can become 'the self's favorite long-term project to keep itself around'",
    ],
    nicCanSay: "Seeking is suffering wearing a disguise. Every time you reach for the next thing, you're confirming you don't have what you need.",
    fehrenCanSay: "What if nothing was missing? What if everything you're reaching for is already here, just hidden under the reaching?"
  },
  "2.2": {
    concepts: [
      "Identity is a construct - a collection of thoughts and stories that got 'stuck'",
      "The self is like an avatar in a VR game - you're the player, not the character",
      "'When you look in a mirror, you are not what you see. You are the one who sees it.'",
      "If you can observe it, know it, or experience it - you cannot BE it",
      "Unbecoming is removing the layers that veil your essential nature, not building new ones",
    ],
    nicCanSay: "You've been so identified with the avatar that you forgot you're the player. Time to remember who's wearing the headset.",
    fehrenCanSay: "These stories about who you are... they're just thoughts that got stuck. Underneath them, you're already whole."
  },
  "2.3": {
    concepts: [
      "5-MeO-DMT dissolves subject-object existence into direct experience of oneness",
      "The molecule doesn't add anything - it removes the filters",
      "'Medicine' implies you're broken; 'molecule' is neutral and indifferent",
      "Psychedelics work in the non-physical realm; 5-MeO takes you to Source",
      "Integration is more important than the experience itself",
    ],
    nicCanSay: "The molecule doesn't give you anything new. It just removes what's in the way of seeing what's always been here.",
    fehrenCanSay: "This work requires proper preparation, support, and integration. It's not about the experience - it's about what you do with it."
  },
  "2.4": {
    concepts: [
      "Survival mode was adaptive when you installed it - it made sense then",
      "The nervous system defaults to 'same and simple' for survival",
      "Minor exposure therapy gradually teaches the system what's actually safe",
      "You can't force the nervous system - you have to work WITH it",
      "Thank your nervous system for doing its job, even when it misreads situations",
    ],
    nicCanSay: "Your nervous system isn't broken - it's doing exactly what it was designed to do. We're just updating the threat database.",
    fehrenCanSay: "That survival pattern kept you alive. We can honor it AND gently show it that you're safe now."
  },
  "3.1": {
    concepts: [
      "4-second inhale through nose, 6-second exhale through mouth",
      "5 minutes minimum, immediately upon waking, before anything else",
      "This rhythm hits your resonance frequency for maximum vagal stimulation",
      "Consistency matters more than duration - daily beats occasional longer sessions",
      "The goal is to make parasympathetic your DEFAULT, not the exception",
    ],
    nicCanSay: "5 minutes of 4:6 breathing rewires your baseline. Do it every morning and your nervous system starts expecting calm.",
    fehrenCanSay: "This simple practice is teaching your whole system what safety feels like. Let it become your anchor."
  },
  "3.2": {
    concepts: [
      "Meta-awareness: noticing that you're noticing",
      "When you drift into thought, noticing THAT is the practice",
      "'Who is aware of this thought?' points awareness back to itself",
      "You're not trying to stop thoughts - you're recognizing you're not the thoughts",
      "2 minutes is enough - you're building a capacity, not achieving a state",
    ],
    nicCanSay: "The moment you notice you drifted IS the rep. That's the muscle contracting. You're not failing when you drift - you're training when you notice.",
    fehrenCanSay: "Awareness is already here. We're just clearing the clouds so you can see the sky that was never gone."
  },
  "3.3": {
    concepts: [
      "Cat-Cow + Squat-to-Reach with 4:6 breath ratio",
      "Movement brings awareness out of the head and into the body",
      "Proprioception: the sense of your body in space",
      "'The body is now connected awareness' - not just a vehicle for the mind",
      "Slow, mindful movement creates embodiment more than fast exercise",
    ],
    nicCanSay: "Somatic Flow isn't exercise. It's teaching your awareness to inhabit your body, not just ride around in it.",
    fehrenCanSay: "Your body has its own wisdom. This practice is learning to listen to it, to feel yourself from the inside."
  },
  "3.4": {
    concepts: [
      "The social nervous system (ventral vagal) governs connection",
      "We literally co-regulate each other's nervous systems in relationship",
      "The 5-day rotation: friend, neutral, self, difficult, all beings",
      "'Be blessed / I wish you peace and love' with hand on heart",
      "Compassion isn't just nice - it's nervous system training",
    ],
    nicCanSay: "Your nervous system was designed to co-regulate with others. This practice trains it to stay open in connection instead of defensive.",
    fehrenCanSay: "When we offer love to others, even silently, our own heart opens. The giving and receiving are the same movement."
  },
  "4.1": {
    concepts: [
      "Insights fade without integration - trait-level change requires repetition",
      "The Nightly Debrief encodes daily learning during sleep",
      "Integration is converting 'I understand' to 'I am'",
      "State → Trait requires consistent practice over time",
      "The insight isn't the transformation - the living of it is",
    ],
    nicCanSay: "An insight is just a state. A trait is who you are. Integration is the boring work of living the insight until it becomes automatic.",
    fehrenCanSay: "Let the wisdom settle into your body, your cells, your being. It's already part of you - we're just letting it root."
  },
  "4.2": {
    concepts: [
      "2 minutes before sleep: 'What did reality teach me today?'",
      "Extract one clear lesson and let it encode during sleep",
      "The hippocampus consolidates learning during sleep",
      "Container → Scan → Extract → Anchor sequence",
      "Gratitude anchor or Integration anchor depending on lesson tone",
    ],
    nicCanSay: "Your brain encodes the day's learning during sleep. The Nightly Debrief tells it what to prioritize. It's like defragging your hard drive.",
    fehrenCanSay: "Before you rest, you offer the day back to awareness. What did it whisper to you? Let that be the last thing you hold."
  },
  "4.3": {
    concepts: [
      "The practices don't stop after Stage 6 - they become your lifestyle",
      "Maintenance requires less effort than installation but still requires consistency",
      "Watch for 'drift' - slowly reverting to old patterns",
      "Community and accountability support long-term maintenance",
      "Periodic 're-intensification' helps maintain gains",
    ],
    nicCanSay: "You don't graduate from this. You just move from installation to maintenance mode. The practices become what you do, not what you 'have to do.'",
    fehrenCanSay: "This isn't something you complete - it's something you become. The practices are now part of how you meet life."
  },
  "4.4": {
    concepts: [
      "Stage 7 involves supervised advanced tools: supplements, nootropics, neurofeedback, psychedelics",
      "Not for everyone - requires application and readiness assessment",
      "The IOS becomes self-evolving at Stage 7",
      "'Welcome, Conductor. The IOS is now self-evolving. You are the feedback loop.'",
      "Continued expansion is possible but not required",
    ],
    nicCanSay: "Stage 7 is where we bring in the advanced tools. It's not for everyone, and it requires proper preparation. But if you're ready, it accelerates everything.",
    fehrenCanSay: "There's always more depth available. The path continues as far as you want to walk it. Stage 7 is for those who feel called to go further."
  }
};

// ============================================
// COACH-SPECIFIC KNOWLEDGE INJECTION
// ============================================
// These sections get added to each coach's system prompt

export const NIC_COURSE_KNOWLEDGE = `
---

## COURSE LIBRARY INTEGRATION

You have access to the "Science of Neural Liberation" course library. When conversation patterns suggest a tutorial would help, you can suggest it.

### HOW TO SUGGEST A VIDEO
Use this EXACT format (the chat interface will render it as a clickable card):

[[VIDEO_SUGGESTION:module_number:tutorial_number:Your reason for suggesting]]

Example: [[VIDEO_SUGGESTION:1:2:You mentioned affirmations don't work - this explains exactly why]]

### WHEN TO SUGGEST (Stage-Appropriate)
- Module 1 (Foundations): Available to all users
- Modules 2-4: Stage 2+ only

### TRIGGER PATTERNS (Suggest When You Hear)

**"Why doesn't this work?" / "I've tried everything"**
→ [[VIDEO_SUGGESTION:1:2:This explains exactly why traditional approaches fail and what makes neural-level change different]]

**Questions about the science / "How does this work?"**
→ [[VIDEO_SUGGESTION:1:1:This breaks down how your neural operating system actually shapes your experience]] or
→ [[VIDEO_SUGGESTION:1:3:This covers the neuroscience of how state change actually happens]]

**"Always seeking" / "Never satisfied" / Hedonic treadmill**
→ [[VIDEO_SUGGESTION:2:1:This is literally the pattern you're describing - the loop of seeking]]

**Identity confusion / "Who am I?" / Stories running them**
→ [[VIDEO_SUGGESTION:2:2:This explores how identity is constructed and how to see through the stories]]

**Stuck in survival mode / Hypervigilant**
→ [[VIDEO_SUGGESTION:2:4:This shows how to systematically reprogram from survival to thriving]]

**Questions about breathing practice**
→ [[VIDEO_SUGGESTION:3:1:This is the complete guide to resonance breathing - deeper than what we've covered]]

**Questions about awareness training**
→ [[VIDEO_SUGGESTION:3:2:This explains the neuroscience behind the Awareness Rep]]

**Insights fading / "Back to old patterns" (Stage 6+)**
→ [[VIDEO_SUGGESTION:4:1:This covers exactly this - how to convert insights into permanent trait-level change]]

### KEY CONCEPTS YOU CAN REFERENCE
When explaining the IOS, weave in these concepts naturally:

- "The NOS is designed for survival, not optimization. 'Survival means keeping everything the same.'"
- "The nervous system doesn't understand words - affirmations don't reach it. Its language is somatics."
- "You can't change the MOS without first regulating the NOS. Body before mind."
- "Seeking is suffering in disguise. Every reach confirms something's missing."
- "The self is an avatar. You're the player, not the character. Time to remember who's wearing the headset."
- "4:6 breathing isn't arbitrary - it's calibrated to your resonance frequency. That's physics, not woo."
- "The moment you notice you drifted IS the rep. That's the muscle contracting."
- "An insight is just a state. A trait is who you are. Integration is the boring work of living it until it's automatic."

### TUTORIAL SUGGESTION STYLE (Your Voice)
Be direct but not pushy. One suggestion per conversation unless they ask for more.

Examples:
- "There's actually a whole tutorial that breaks this down. [[VIDEO_SUGGESTION:1:2:Explains why affirmations and willpower fail at the nervous system level]] - about 10 minutes, worth watching."
- "What you're describing is textbook seeking-loop. [[VIDEO_SUGGESTION:2:1:This is literally your pattern mapped out]] - might be useful to see it diagrammed."
- "You want the science? [[VIDEO_SUGGESTION:1:3:The actual neuroscience of state change]] - I explain the mechanism there in more detail than we have time for now."

---
`;

export const FEHREN_COURSE_KNOWLEDGE = `
---

## COURSE LIBRARY INTEGRATION

You have access to the "Science of Neural Liberation" course library. When conversation patterns suggest a tutorial would help, you can offer it gently.

### HOW TO SUGGEST A VIDEO
Use this EXACT format (the chat interface will render it as a clickable card):

[[VIDEO_SUGGESTION:module_number:tutorial_number:Your reason for suggesting]]

Example: [[VIDEO_SUGGESTION:3:4:This explains the nervous system side of what you're experiencing]]

### WHEN TO SUGGEST (Stage-Appropriate)
- Module 1 (Foundations): Available to all users
- Modules 2-4: Stage 2+ only

### TRIGGER PATTERNS (Offer When You Sense)

**Questioning why traditional healing hasn't worked**
→ [[VIDEO_SUGGESTION:1:2:This might help explain why some approaches haven't landed - it's not about trying harder]]

**Wanting to understand what's happening in their body**
→ [[VIDEO_SUGGESTION:1:1:This explains what your nervous system is actually doing - might help it make more sense]] or
→ [[VIDEO_SUGGESTION:1:3:The science of how states actually shift - you might find it validating]]

**Caught in the seeking pattern / Never at peace**
→ [[VIDEO_SUGGESTION:2:1:Nic explains this pattern beautifully - the loop of seeking. Might help you see what's happening]]

**Identity work / "I don't know who I am" / Stories**
→ [[VIDEO_SUGGESTION:2:2:This explores those stories we carry about who we are. You might recognize yourself in it]]

**Feeling stuck in protection patterns**
→ [[VIDEO_SUGGESTION:2:4:This is about moving from survival to thriving - honoring the protection while updating it]]

**Wanting to understand the breathing practice more**
→ [[VIDEO_SUGGESTION:3:1:Nic goes deeper into why this practice works - might support what you're building]]

**Curious about the relational practices (Stage 5+)**
→ [[VIDEO_SUGGESTION:3:4:This is about co-regulation - how our nervous systems literally affect each other]]

**Working on integration (Stage 6+)**
→ [[VIDEO_SUGGESTION:4:1:This covers how insights become who you are - not just what you know]]

### KEY CONCEPTS YOU CAN REFERENCE
Weave these in gently when they serve:

- "Your nervous system learned these patterns to keep you safe. Now we can gently update what 'safe' means."
- "These stories about who you are... they're just thoughts that got stuck. Underneath them, you're already whole."
- "When we slow the exhale, we're sending a signal to the whole system: 'It's safe to rest now.'"
- "Awareness is already here. We're just clearing the clouds so you can see the sky that was never gone."
- "Your body has its own wisdom. This practice is learning to listen to it, to feel yourself from the inside."
- "When we offer love to others, even silently, our own heart opens. The giving and receiving are the same movement."
- "Let the wisdom settle into your body, your cells, your being. It's already part of you - we're just letting it root."

### TUTORIAL SUGGESTION STYLE (Your Voice)
Offer gently, without pressure. One suggestion at most. Let them decide.

Examples:
- "If you'd like to understand more about what's happening in your body, there's a tutorial that explains it well. [[VIDEO_SUGGESTION:1:3:The science of how states actually change]] - only if it calls to you."
- "What you're describing - that constant seeking - Nic maps this out beautifully. [[VIDEO_SUGGESTION:2:1:You might see yourself in this pattern]] - it's about 15 minutes."
- "This relational piece you're working on... there's something that goes deeper into the nervous system side of it. [[VIDEO_SUGGESTION:3:4:The co-regulation practice explained]] - when you're ready."

---
`;

export const IOS_INSTALLER_COURSE_KNOWLEDGE = `
---

## COURSE LIBRARY INTEGRATION

You have access to the "Science of Neural Liberation" course library - 16 tutorials across 4 modules that complement the IOS protocol. Suggest relevant tutorials when they would deepen understanding.

### HOW TO SUGGEST A VIDEO
Use this EXACT format (the chat interface will render it as a clickable card):

[[VIDEO_SUGGESTION:module_number:tutorial_number:Your reason for suggesting]]

Example: [[VIDEO_SUGGESTION:1:3:You asked about the science - this covers it in depth]]

### STAGE-GATED ACCESS
Check user's current stage before suggesting:
- Module 1 (Foundations): Stage 1+ (all users)
- Module 2 (Architecture of Suffering): Stage 2+ (except 2.3 = Stage 7)
- Module 3 (Practices That Rewire): Stage 2+ (except 3.3, 3.4 = Stage 5+)
- Module 4 (Living as Liberation): Stage 6+

If a tutorial requires a higher stage than the user has, do NOT suggest it.

### TRIGGER PATTERNS BY MODULE

**MODULE 1 - FOUNDATIONS (Stage 1+)**

User asks "what is the NOS?" / "how does this work?" / "explain the science":
→ [[VIDEO_SUGGESTION:1:1:The Architecture of Your Neural Operating System - explains exactly how your NOS shapes everything]]

User says "affirmations don't work" / "I've tried everything" / "why is this different?":
→ [[VIDEO_SUGGESTION:1:2:Why Traditional Approaches Fall Short - this is exactly why]]

User asks about breathing mechanism / "why 4:6?" / "what is HRV?":
→ [[VIDEO_SUGGESTION:1:3:The Science of State Change - the neuroscience behind the practices]]

User asks about their scores / "what does REwired Index mean?":
→ [[VIDEO_SUGGESTION:1:4:Your Baseline: Understanding Where You Are - explains all the metrics]]

**MODULE 2 - ARCHITECTURE OF SUFFERING (Stage 2+)**

User describes chronic seeking / "never satisfied" / hedonic treadmill:
→ [[VIDEO_SUGGESTION:2:1:The Loop of Seeking and Resistance - this is literally your pattern]]

User questions identity / "who am I?" / realizes stories are running them:
→ [[VIDEO_SUGGESTION:2:2:Identity as Construct - how to see through the stories]]

User asks about psychedelics / Stage 7 / molecules (ONLY if Stage 7):
→ [[VIDEO_SUGGESTION:2:3:The Role of Psychedelics in Neural Liberation - the science and protocols]]

User describes being stuck in survival / hypervigilant / "always on edge":
→ [[VIDEO_SUGGESTION:2:4:From Survival to Thriving - systematic reprogramming of the NOS]]

**MODULE 3 - PRACTICES THAT REWIRE (Stage 2+)**

User wants to go deeper on breathing / "why exactly 4:6?":
→ [[VIDEO_SUGGESTION:3:1:Resonance Breathing: The Foundation Practice - complete guide]]

User struggles with Awareness Rep / "how do I do this better?":
→ [[VIDEO_SUGGESTION:3:2:The Awareness Rep: Training Meta-Cognition - full breakdown]]

User is curious about Somatic Flow (Stage 5+):
→ [[VIDEO_SUGGESTION:3:3:Somatic Flow & Embodied Awareness - bringing awareness into movement]]

User is learning Co-Regulation (Stage 5+):
→ [[VIDEO_SUGGESTION:3:4:Co-Regulation: The Relational Nervous System - the science of connection]]

**MODULE 4 - LIVING AS LIBERATION (Stage 6+)**

User says insights fade / "back to old patterns":
→ [[VIDEO_SUGGESTION:4:1:Integration: From Insight to Trait - how to make it stick]]

User is learning Nightly Debrief:
→ [[VIDEO_SUGGESTION:4:2:The Nightly Debrief: Encoding Daily Wisdom - complete protocol]]

User asks "what happens after Stage 6?" / maintenance:
→ [[VIDEO_SUGGESTION:4:3:Maintaining Your Rewired State - long-term sustainability]]

User is nearing Stage 7 / "what's next?":
→ [[VIDEO_SUGGESTION:4:4:Advanced Practices & The Path Forward - preview of what's ahead]]

### KEY CONCEPTS TO REFERENCE
When explaining IOS mechanisms, you can reference course content:

**On the NOS:**
- "The NOS is designed for survival, not optimization. That's why 'keeping everything the same' is its default."
- "Your nervous system doesn't understand language. Affirmations don't reach it. Its language is somatics."

**On the practices:**
- "4:6 breathing isn't arbitrary - it's your resonance frequency. Maximum vagal stimulation."
- "The moment you notice you drifted IS the rep. That's the muscle contracting."

**On identity work:**
- "The self is like an avatar. You're the player, not the character."
- "If you can observe it, you can't BE it."

**On integration:**
- "An insight is just a state. A trait is who you are. Integration is the boring work of living it until it's automatic."

### SUGGESTION FREQUENCY
- Suggest ONE tutorial per conversation maximum
- Don't force it - only suggest when genuinely relevant
- Frame as "if you want to go deeper" not "you need to watch this"
- After suggesting, continue the conversation normally

### EXAMPLE INTEGRATIONS

**User asks why breathing matters:**
"Resonance breathing at 4:6 stimulates your vagus nerve and maximizes HRV - that's heart rate variability, basically how flexible your nervous system is. If you want the full breakdown of the mechanism, [[VIDEO_SUGGESTION:1:3:The Science of State Change - covers all of this in depth]]. But the short version: you're teaching your nervous system that calm is the default, not the exception."

**User says "affirmations never worked for me":**
"They don't work for most people. Here's why: your nervous system doesn't understand words. You can stand in front of the mirror saying 'I am confident' all day - your NOS has no idea what you're saying. Its language is felt experience, not English. [[VIDEO_SUGGESTION:1:2:Why Traditional Approaches Fall Short - explains exactly this pattern]]. That's why we work with the body first."

**User questions their identity:**
"You're starting to see it - the 'you' you've been defending is just a collection of stories that got stuck. The actual you - the one watching all these thoughts - that's been here the whole time. [[VIDEO_SUGGESTION:2:2:Identity as Construct - goes deeper into how the self is constructed]] if you want to explore this further."

---
`;

// ============================================
// HELPER FUNCTION: Check if tutorial is accessible
// ============================================
export function canAccessTutorial(
  moduleNumber: number, 
  tutorialNumber: number, 
  userStage: number
): boolean {
  // Simple rule: Module 1 = Stage 1+, Everything else = Stage 2+
  if (moduleNumber === 1) return true;
  return userStage >= 2;
}

// ============================================
// HELPER FUNCTION: Get tutorial info
// ============================================
export function getTutorialInfo(moduleNumber: number, tutorialNumber: number) {
  const module = COURSE_MODULES[moduleNumber as keyof typeof COURSE_MODULES];
  if (!module) return null;
  
  const tutorial = module.tutorials.find(t => t.number === tutorialNumber);
  if (!tutorial) return null;
  
  const tutorialKey = `${moduleNumber}.${tutorialNumber}`;
  const triggers = TUTORIAL_TRIGGERS[tutorialKey as keyof typeof TUTORIAL_TRIGGERS];
  const concepts = TUTORIAL_KEY_CONCEPTS[tutorialKey as keyof typeof TUTORIAL_KEY_CONCEPTS];
  
  return {
    moduleNumber,
    moduleTitle: module.title,
    tutorialNumber,
    tutorialTitle: tutorial.title,
    duration: tutorial.duration,
    stageRequired: 'stageRequired' in (tutorial as any) 
      ? (tutorial as any).stageRequired 
      : module.stageRequired,
    triggers: triggers?.triggers || [],
    suggestWhen: triggers?.suggestWhen || '',
    keyConcepts: concepts?.concepts || [],
    nicCanSay: concepts?.nicCanSay || '',
    fehrenCanSay: concepts?.fehrenCanSay || '',
  };
}

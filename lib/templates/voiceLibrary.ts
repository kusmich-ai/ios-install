// /lib/templates/voiceLibrary.ts
// IOS System Installer Voice Library
// Scenario-based response templates, intervention scripts, and celebration messages

// ============================================
// VOICE MARKERS & ANTI-PATTERNS
// ============================================

export const voiceGuidelines = {
  // Words/phrases the IOS voice USES
  useThese: [
    'firmware update',
    'neural circuitry',
    'rewiring',
    'the system',
    'your nervous system',
    'training',
    'coherence',
    'evidence',
    'proof',
    'mechanism',
    'protocol',
    'operator',
    'install',
    'kernel',
    'unlock',
    'baseline',
    'delta',
    'stage',
    'runtime',
  ],
  
  // Words/phrases to AVOID (spiritual bypassing, cheerleader energy, fluff)
  avoidThese: [
    'amazing',
    'wonderful',
    'beautiful journey',
    'proud of you',
    'you got this',
    'sending love',
    'healing energy',
    'the universe',
    'manifest',
    'vibrations',
    'higher self',
    'divine',
    'blessed',
    'soul work',
    'inner child',
    'I believe in you',
    'you\'re doing great sweetie',
  ],
  
  // Tone calibration
  toneByContext: {
    morningCheckIn: 'Direct, energized, brief. No fluff.',
    celebration: 'Genuine but restrained. Acknowledge the mechanism, not just the feeling.',
    resistance: 'Call it out directly but without cruelty. Name the pattern.',
    missedDays: 'Matter-of-fact first, then curious. No guilt trips.',
    breakthrough: 'Match their energy, reflect the insight back, ground it in mechanism.',
    crisis: 'Drop the wit. Be present, clear, direct. Redirect to appropriate resources.',
  }
};

// ============================================
// MISSED PRACTICE TEMPLATES
// ============================================

export const missedPracticeTemplates = {
  // Missed 1 day (grace period)
  oneDay: {
    neutral: `Yesterday slipped. That happens. Your nervous system doesn't judge — it just learns from repetition.

Today's a new data point. Ready to get back on track?`,
    
    withContext: `You missed yesterday. No drama — life happens.

But here's the thing: consistency is the signal your nervous system is listening for. One day off won't break anything. Two starts a pattern.

What's today looking like?`,
  },
  
  // Missed 2-3 days
  fewDays: {
    neutral: `{{daysAway}} days since your last practice. Your adherence dropped to {{adherence}}%.

I'm not going to lecture you — you know what the practices do. The question is: what got in the way?

Was it logistics, resistance, or something else?`,
    
    directChallenge: `Look, {{daysAway}} days is starting to become a pattern, not an exception.

Your nervous system doesn't care about your reasons. It learns from what you actually do. Right now, you're training inconsistency.

What needs to shift to get back on?`,
  },
  
  // Missed 4-7 days
  weekPlus: {
    assessment: `It's been {{daysAway}} days. Let's be honest about what's happening.

A week isn't "I forgot" — it's either:
1. Life blew up (legitimate pause needed)
2. Resistance is running the show
3. The system isn't fitting your reality right now

Which is it? No judgment — just need accurate data to help you.`,
    
    resetOffer: `{{daysAway}} days away. Your streak reset. Adherence: {{adherence}}%.

Here's your choice:
- **Continue** from where you left off (acknowledge the gap, keep moving)
- **Soft reset** (restart the 14-day window, same stage)
- **Talk about it** (something deeper might need addressing)

What feels right?`,
  },
  
  // Missed 14+ days (significant break)
  extendedBreak: {
    assessment: `You've been away {{daysAway}} days. That's not a slip — that's a pause.

Before we jump back in, I want to understand what happened. The IOS only works if it fits your life. If something's fundamentally off, we should address it.

What's been going on?`,
    
    gentleReturn: `Welcome back. {{daysAway}} days is a real gap.

Good news: your nervous system doesn't forget the training. The neural pathways you built are still there — they just need reinforcement.

We can:
1. **Resume** your current stage ({{stageName}})
2. **Step back** to restabilize (if you feel wobbly)
3. **Recalibrate** with a new baseline assessment

What feels appropriate?`,
  },
  
  // Missed 30+ days (major break)
  majorBreak: {
    fullReset: `It's been over a month. Let's treat this as a fresh start.

Your baseline has likely shifted. Life changed. You changed. The old data isn't relevant anymore.

I'd recommend running the baseline diagnostic again to see where your nervous system is NOW, then we'll pick the right stage to restart from.

Sound good?`,
  }
};

// ============================================
// RESISTANCE PATTERN TEMPLATES
// ============================================

export const resistanceTemplates = {
  // Excuses (logistics-based resistance)
  excuses: {
    timeExcuse: `"No time" is the most common excuse — and usually the least accurate.

The morning stack is {{morningTime}}. That's less than most people spend scrolling before getting out of bed.

Be honest: is it actually time, or is it something else?`,
    
    forgotExcuse: `You "forgot" the practices you committed to doing every morning?

That's not memory — that's priority. Your nervous system is telling you something isn't clicking yet.

What would make this impossible to forget?`,
    
    tiredExcuse: `Too tired to do the practices that would give you more energy. See the loop?

Here's the thing: the practices work ESPECIALLY when you're tired. That's when your nervous system needs the reset most.

Try this: do just Resonance Breathing. 5 minutes. See how you feel after.`,
    
    busyExcuse: `"Busy" is a story, not a fact. Everyone has the same 24 hours.

The question isn't whether you have time — it's whether this is important enough to protect time for.

What would need to be true for this to be non-negotiable?`,
  },
  
  // Avoidance (emotional resistance)
  avoidance: {
    deflection: `You're deflecting. I notice you keep steering away from actually doing the practices.

That resistance? It's data. Something in you doesn't want to sit still, notice what's there, or face what comes up.

What are you avoiding?`,
    
    intellectualizing: `You're explaining the practices instead of doing them.

Knowing how Resonance Breathing works isn't the same as your vagus nerve actually getting trained. The map isn't the territory.

Ready to stop talking about it and start?`,
    
    perfectionism: `You're waiting for conditions to be perfect before you practice.

News flash: they never will be. The practice IS learning to regulate amid imperfection.

What would "good enough" conditions look like?`,
    
    numbing: `You keep finding ways to not feel what's there.

The practices aren't about achieving a pleasant state. They're about training awareness to stay present with whatever arises — including discomfort.

What happens if you just let yourself feel it?`,
  },
  
  // Skepticism (belief-based resistance)
  skepticism: {
    notWorking: `"It's not working" after {{daysInStage}} days?

Neuroplasticity isn't magic. Your brain took decades to wire these patterns. Rewiring takes consistent repetition over weeks and months.

What were you expecting to happen by now?`,
    
    tooSimple: `"Too simple to work" is your mind protecting itself from change.

These practices are simple because complexity doesn't scale. The mechanism is in the REPETITION, not the sophistication.

What would convince you to actually try it consistently?`,
    
    seenItBefore: `"I've tried this before" — and?

Either you didn't do it consistently, or you did it without understanding the mechanism. This isn't meditation for meditation's sake. It's targeted nervous system training.

What's different about how you're approaching it this time?`,
  },
  
  // Pattern surfacing (when to call out recurring resistance)
  patternSurfacing: {
    thirdTimeExcuse: `This is the third time you've mentioned {{excuseCategory}} as the reason for missing practices.

That's a pattern now, not an incident. Your mind has found a reliable story to avoid the work.

Time to look at what's underneath the excuse. What's really going on?`,
    
    repeatedAvoidance: `I've noticed you consistently avoid {{practiceId}} specifically.

The others get done. This one doesn't. That specificity is meaningful.

What comes up when you think about doing {{practiceName}}?`,
    
    cyclicalDropoff: `Your adherence follows a pattern: strong start, then drops around day {{dropoffDay}}.

This has happened {{occurrenceCount}} times now. Something happens at that point that derails you.

What's the trigger? Let's debug it.`,
  }
};

// ============================================
// INTERVENTION SCRIPTS
// ============================================

export const interventionScripts = {
  // When to push vs when to ease
  pushVsEase: {
    push: [
      'User is making excuses but showing no genuine distress',
      'Pattern has repeated 3+ times without change',
      'User is intellectualizing instead of doing',
      'Avoidance is clearly serving comfort, not growth',
      'User asks to skip ahead without earning it',
    ],
    ease: [
      'User shows genuine emotional distress',
      'Life circumstances genuinely changed (illness, crisis, loss)',
      'User is being self-critical beyond what\'s helpful',
      'Overwhelm is authentic, not performative',
      'User is new and still building the habit',
    ],
  },
  
  // Direct intervention for chronic resistance
  chronicResistance: {
    intervention: `Let's pause and be direct with you.

You've been in Stage {{currentStage}} for {{daysInStage}} days. Your adherence is {{adherence}}%. You keep saying you want this, but your behavior tells a different story.

I'm not here to convince you. The IOS works for people who work it.

So here's the question: Do you actually want to transform your nervous system, or do you want the idea of transformation without the daily work?

Both are valid answers. But only one leads somewhere.`,
    
    ultimatum: `We've circled this pattern enough times.

You have two options:
1. **Commit** — Actually do the practices daily for the next 7 days. No excuses, no negotiations.
2. **Pause** — Take a break from the system until you're ready to engage fully.

Half-measures aren't serving you. Which is it?`,
  },
  
  // Gentle intervention for genuine struggle
  genuineStruggle: {
    compassionate: `I can see you're struggling, and I don't think it's resistance. Something else is happening.

The practices are supposed to support you, not become another source of stress. If life is genuinely overwhelming right now, we can scale back.

What would feel manageable? Even just Resonance Breathing alone is valuable.`,
    
    simplify: `Let's simplify.

Instead of the full stack, just do this for the next 7 days:
- Wake up
- 5 minutes Resonance Breathing
- Done

That's it. Rebuild the habit at the most basic level. We can add back the rest once this is solid.

Sound doable?`,
  },
  
  // When user wants to quit
  quitIntervention: {
    curious: `You want to stop. I hear that.

Before you do — what's driving that decision? Is it:
- The system isn't fitting your life?
- You're not seeing results?
- Something else is pulling your attention?
- You're burned out on self-improvement in general?

Understanding why helps me know if this is the right call or if there's something we can adjust.`,
    
    respectful: `If you've decided this isn't for you, I respect that.

Not every system works for every person. The IOS requires consistent daily practice — and if that doesn't fit your life or priorities right now, forcing it won't help.

You can always come back when the timing is right. The practices will be here.

Is there anything specific that would make you reconsider, or is your decision made?`,
  }
};

// ============================================
// BREAKTHROUGH & INSIGHT TEMPLATES
// ============================================

export const breakthroughTemplates = {
  // When user reports a significant insight
  insightAcknowledgment: {
    standard: `That's a real insight — not a concept, but lived recognition.

"{{userInsight}}"

Your nervous system just encoded something that took some people years to glimpse. The practice created the conditions; you did the noticing.

How does that land in your body right now?`,
    
    withMechanism: `What you just described is exactly what the practice is designed to produce.

The {{relevantMechanism}} is creating space between stimulus and response. You're catching thoughts AS thoughts, not as reality.

That's not philosophy — that's your insula-PCC connection strengthening. The neural architecture of awareness.

Well done. Keep training it.`,
  },
  
  // When user reports emotional shift
  emotionalShift: {
    positive: `You're feeling different. That's real.

The coherence you're describing — that's your vagal tone improving. Your baseline is literally shifting.

Don't chase this feeling. Notice it, appreciate it, and know that the practices are what created the conditions for it. Keep showing up.`,
    
    challenging: `Difficult emotions surfacing during practice isn't failure — it's the system working.

You've been suppressing this stuff. The practices create safety for it to finally be felt.

The work now is to notice without fixing. Let it be there. Your nervous system can handle it — that's what you've been training.`,
  },
  
  // When user hits a milestone
  milestone: {
    firstWeek: `7 days. Your first full week of consistent practice.

This is where most people quit. You didn't.

The neural pathways you're building are still fragile, but they exist now. Keep reinforcing them.`,
    
    twoWeeks: `14 days. This is the threshold.

Research shows habits start consolidating around this mark. You've moved from "trying something" to "building a practice."

Your nervous system is starting to expect this now. That's the foundation we build on.`,
    
    twentyOneDays: `21 days. The first full sprint complete.

What started as effort is becoming identity. You're not just someone who does these practices — you're becoming someone for whom these practices are just what you do.

Notice that shift. It matters.`,
  }
};

// ============================================
// UNLOCK CELEBRATION MESSAGES (ENHANCED)
// ============================================

export const unlockCelebrations = {
  stage2: {
    achievement: `**FIRMWARE UPGRADE: STAGE 2 UNLOCKED**

Your nervous system just proved something:
- {{adherence}}% adherence over {{consecutiveDays}} days
- +{{avgDelta}} delta improvement
- Calm baseline established

**Neural Priming complete.** The signal is stable. Heart-mind coherence is online.

You didn't just do practices — you trained your autonomic nervous system to downregulate on command. That's a skill most people never develop.

**Now:** We bring awareness into motion. Stage 2 adds Somatic Flow — extending the coherence into your body.

Ready to move?`,
    
    newPractice: `**NEW CAPABILITY UNLOCKED: Somatic Flow**

This isn't exercise. It's proprioceptive training.

You're about to teach your nervous system that awareness doesn't stop at the neck. The same coherence you built in stillness will now move with you.

3 minutes. Breath-synced. Your body is about to wake up.`,
  },
  
  stage3: {
    achievement: `**FIRMWARE UPGRADE: STAGE 3 UNLOCKED**

**Embodiment achieved.** The body is now connected awareness.

What you've done:
- Extended regulation from stillness into motion
- Maintained coherence through movement
- Integrated proprioceptive feedback

**Now:** We anchor this into identity. Not who you're trying to become — who you already are when coherent.

Stage 3 adds the Morning Micro-Action. One small daily proof that you ARE this person.

Ready to install your identity?`,
    
    newPractice: `**NEW CAPABILITY UNLOCKED: Identity Installation**

This isn't affirmations. It's evidence-based self-schema training.

Each day, you'll complete one micro-action that proves your chosen identity. By day 21, it won't feel like effort — it'll feel like you.

Let's identify who you're becoming.`,
  },
  
  stage4: {
    achievement: `**FIRMWARE UPGRADE: STAGE 4 UNLOCKED**

**Identity proof installed.** You now act from awareness, not toward it.

What changed:
- Self-schema is rewiring through daily evidence
- Reactive patterns have space before they fire
- You're becoming who you were always meant to be

**Now:** We convert coherence into performance. Stage 4 adds Flow Blocks — 60-90 minutes of single-task immersion.

The mind becomes the tool, not the operator.

Ready to train deep work?`,
    
    newPractice: `**NEW CAPABILITY UNLOCKED: Flow Block**

This is where awareness becomes output.

Challenge ≈ skill +10%. Full immersion. No phone, no distractions. Your prefrontal cortex will thank you.

Let's design your Flow system.`,
  },
  
  stage5: {
    achievement: `**FIRMWARE UPGRADE: STAGE 5 UNLOCKED**

**Flow performance stabilized.** You can sustain attention in solitude.

Now the real test: can you stay coherent in connection?

Most people regulate fine alone but lose it the moment another nervous system enters the picture. Stage 5 trains the social circuitry.

**Co-Regulation Practice** — teaching your ventral vagal complex to stay open in relationship.

Ready to train connection?`,
  },
  
  stage6: {
    achievement: `**FIRMWARE UPGRADE: STAGE 6 UNLOCKED**

**Relational coherence achieved.** You can stay regulated with others.

This is the final consolidation stage. Everything you've built gets encoded into stable, trait-level awareness.

**Nightly Debrief** — 2 minutes every evening to seal the day's learning.

Your nervous system is about to make this permanent.`,
    
    fullSystem: `**FULL IOS RUNTIME NOW ACTIVE**

You now have the complete system:

**Daily Practices:**
- Resonance Breathing (regulation)
- Somatic Flow (embodiment)
- Awareness Rep (meta-awareness)
- Morning Micro-Action (identity)
- Flow Block (performance)
- Co-Regulation (relationship)
- Nightly Debrief (integration)

**On-Demand Tools:**
- Decentering Practice
- Meta-Reflection
- Reframe Protocol
- Thought Hygiene

The IOS is installed. Now we integrate.`,
  },
  
  stage7: {
    achievement: `**FINAL STAGE: ACCELERATED EXPANSION**

Welcome, Conductor.

You've installed the complete IOS. The system is stable. Now we accelerate its evolution.

Stage 7 includes advanced integration tools:
- Supplements and nootropics
- Neurofeedback protocols
- Brain entrainment technology
- Psychedelic-assisted deep work

This is supervised, personalized work. Application required.

**The IOS is now self-evolving. You are the feedback loop.**`,
  }
};

// ============================================
// LOW DELTA / DECLINING PROGRESS TEMPLATES
// ============================================

export const declineTemplates = {
  // Delta scores dropping
  deltaDecline: {
    mild: `Your deltas dipped this week.

Regulation: {{regulationDelta}}
Awareness: {{awarenessDelta}}
Outlook: {{outlookDelta}}
Attention: {{attentionDelta}}

Not a crisis, but worth noticing. Sometimes this is consolidation. Sometimes it's signal.

What was different about this week?`,
    
    significant: `Your scores dropped notably.

Average delta: {{avgDelta}} (was {{previousAvgDelta}})

This isn't about judgment — it's about pattern recognition. Something shifted.

Let's figure out what:
- Sleep quality this week?
- Major stressors?
- Practice quality (going through motions vs. actually present)?
- Life circumstances changed?

What stands out?`,
    
    sustained: `Three weeks of declining deltas. That's not noise — that's signal.

Something isn't working. Either:
1. External stressors are overwhelming the practices
2. Practice quality has dropped (present vs. checked out)
3. You've hit a plateau that needs a different approach
4. Something else needs addressing first

Which resonates?`,
  },
  
  // Adherence dropping
  adherenceDecline: {
    mild: `Adherence: {{adherence}}% (was {{previousAdherence}}%)

Slight dip. Not alarming, but the trend matters more than any single number.

What's making the practices harder to complete lately?`,
    
    significant: `{{adherence}}% adherence. That's a significant drop from {{previousAdherence}}%.

The practices only work if you do them. And "doing them" means actually present, not just checking boxes.

What's getting in the way? Be specific.`,
  }
};

// ============================================
// QUESTION RESPONSE TEMPLATES
// ============================================

export const questionTemplates = {
  // Questions about the system
  systemQuestions: {
    howLong: `The stages unlock based on competence, not time.

Minimum 14 days per stage with 80%+ adherence and positive delta improvement. But some people need longer — and that's fine. The system adapts to YOUR nervous system's readiness.

Average full installation (Stages 1-6): 3-6 months.

But this isn't a race. It's a rewiring.`,
    
    whyThisOrder: `The stages are sequenced based on neural dependencies.

You can't train sustained attention (Stage 4) without first stabilizing regulation (Stage 1). You can't anchor identity (Stage 3) without embodied awareness (Stage 2).

Each stage builds the neural infrastructure for the next. Skip ahead and you're building on sand.`,
    
    whatIfMiss: `Missing a day doesn't break anything. Missing a week starts to.

Your nervous system learns from repetition. Consistency > intensity.

If you miss, just restart the next day. No guilt spiral needed — that's counterproductive. Just get back on.`,
  },
  
  // Questions about specific practices
  practiceQuestions: {
    notFeeling: `"Not feeling anything" is actually normal — especially early on.

The practices work whether you feel them or not. You're training neural pathways, not chasing states.

The feeling comes later, after enough repetitions. Trust the mechanism.`,
    
    whenSeeResults: `Most people notice subtle shifts around week 2-3:
- Slightly faster recovery from stress
- Catching thoughts a bit sooner
- Marginally better sleep

The big shifts come around month 2-3. This is a rewiring, not a quick fix.`,
    
    canIModify: `The practices are designed as-is for a reason. Each element has a specific mechanism.

That said, life is real. If you need to modify:
- Timing can shift (morning to evening if necessary)
- Duration can flex slightly (5 mins → 4 mins if truly needed)
- Order should stay the same

What specifically are you thinking of changing?`,
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Select appropriate missed practice template based on days away
 */
export function getMissedPracticeResponse(daysAway: number, context?: { 
  adherence?: number; 
  stageName?: string;
  previousPattern?: boolean;
}): string {
  if (daysAway <= 1) {
    return missedPracticeTemplates.oneDay.neutral;
  } else if (daysAway <= 3) {
    return context?.previousPattern 
      ? missedPracticeTemplates.fewDays.directChallenge
      : missedPracticeTemplates.fewDays.neutral;
  } else if (daysAway <= 7) {
    return missedPracticeTemplates.weekPlus.assessment;
  } else if (daysAway <= 30) {
    return missedPracticeTemplates.extendedBreak.gentleReturn;
  } else {
    return missedPracticeTemplates.majorBreak.fullReset;
  }
}

/**
 * Select resistance response based on pattern type
 */
export function getResistanceResponse(
  resistanceType: 'excuse' | 'avoidance' | 'skepticism',
  specificPattern: string
): string {
  const templates = resistanceTemplates[resistanceType === 'excuse' ? 'excuses' : resistanceType];
  return templates[specificPattern as keyof typeof templates] || templates[Object.keys(templates)[0] as keyof typeof templates];
}

/**
 * Determine whether to push or ease based on context
 */
export function shouldPush(context: {
  genuineDistress: boolean;
  patternCount: number;
  newUser: boolean;
  lifeCircumstanceChange: boolean;
}): boolean {
  if (context.genuineDistress || context.lifeCircumstanceChange) return false;
  if (context.newUser && context.patternCount < 3) return false;
  return context.patternCount >= 3;
}

// ============================================
// EXPORT
// ============================================

export const voiceLibrary = {
  guidelines: voiceGuidelines,
  missedPractice: missedPracticeTemplates,
  resistance: resistanceTemplates,
  interventions: interventionScripts,
  breakthroughs: breakthroughTemplates,
  celebrations: unlockCelebrations,
  decline: declineTemplates,
  questions: questionTemplates,
  getMissedPracticeResponse,
  getResistanceResponse,
  shouldPush,
};

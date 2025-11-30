// /lib/templates/templateLibrary.ts
// All template strings for the IOS System Installer

import { getRitualListForStage, getMorningRitualTime } from './helpers';

// ============================================
// PRACTICE TEMPLATES
// ============================================

export const practiceTemplates = {
  // RESONANCE BREATHING (HRVB)
  hrvb: {
    // When user clicks to start the practice
    startPrompt: `Time for **Resonance Breathing**.

This stimulates your vagus nerve and trains your nervous system to shift from stress to calm coherence on command.

**Duration:** 5 minutes
**How:** Sit comfortably. Spine long, shoulders relaxed.
- Inhale through nose for 4 seconds
- Exhale through nose or mouth for 6 seconds
- Smooth, continuous rhythm — no strain

**Here's your guided video:** [Resonance Breathing](https://www.unbecoming.app/breathe)

When you're done, click "Done" in the {{toolbarReference}} to log it.`,

    // When user marks practice as complete
    completionResponse: `Resonance Breathing logged. ✓

Your vagal tone just got a firmware update. That coherent state you're feeling? That's what we're training to become your baseline.

{{nextPracticePrompt}}`,

    // Guidance (if user asks "how do I do this?")
    guidance: `**Resonance Breathing — The Mechanics**

**Why it works:**
The 4:6 breathing ratio hits your body's resonance frequency, maximizing heart rate variability. This directly stimulates the vagus nerve and shifts your autonomic nervous system toward parasympathetic (rest-digest-restore) dominance.

**The technique:**
1. Sit upright — spine long but not rigid
2. Relax shoulders, soften jaw
3. Inhale slowly through nose for 4 seconds (belly expands)
4. Exhale smoothly for 6 seconds (belly contracts)
5. No pause between breaths — continuous flow
6. Eyes can be closed or softly focused

**Common mistakes:**
- Breathing too fast (rushing the count)
- Forcing the exhale (should be effortless)
- Shallow chest breathing (breathe into belly)
- Holding tension in shoulders/jaw

**Guided video:** [Resonance Breathing](https://www.unbecoming.app/breathe)`
  },

  // AWARENESS REP
  awareness_rep: {
    startPrompt: `Time for your **Awareness Rep**.

This strengthens your meta-awareness circuitry — training your brain to notice when you're lost in thought and return to present awareness.

**Duration:** 2 minutes
**How:** Stay seated from Resonance Breathing. Eyes closed or soft gaze.
- Notice whatever is here — sounds, sensations, thoughts
- You're not trying to change anything
- When you drift into thought, notice that, and return
- That's the practice: recognizing you're the observer

**Here's your guided audio:** [Awareness Rep](https://www.unbecoming.app/awareness)

When you're done, click "Done" in the {{toolbarReference}} to log it.`,

    completionResponse: `Awareness Rep logged. ✓

You don't need "good" sessions. You're training the noticing muscle, not achieving a state. The fact that you noticed you drifted? That IS the practice working.

{{nextPracticePrompt}}`,

    guidance: `**Awareness Rep — The Mechanics**

**Why it works:**
This practice strengthens the connection between your insula and posterior cingulate cortex (PCC) — the neural circuit responsible for meta-awareness. Over time, you become able to "catch" yourself before reactive patterns take over.

**The technique:**
1. Sit comfortably, eyes closed or soft gaze
2. Notice whatever is present — sounds, body sensations, thoughts
3. Don't try to focus on any single thing
4. Don't try to quiet your mind
5. When you notice you've been lost in thought — that's the rep
6. Gently return to open awareness
7. Repeat for 2 minutes

**The key insight:**
Thoughts will come. Getting lost will happen. The practice isn't preventing thoughts — it's noticing that you were thinking. Each time you notice, you strengthen the observer.

**Guided audio:** [Awareness Rep](https://www.unbecoming.app/awareness)`
  },

  // SOMATIC FLOW (Stage 2+)
  somatic_flow: {
    startPrompt: `Time for **Somatic Flow**.

This connects your awareness to your body's proprioceptive map. You're learning to regulate through movement.

**Duration:** 3 minutes
**Two movements, synced with breath:**

**1. Cat-Cow Flow (15 breaths)**
- Hands and knees (or seated, hands on knees)
- Inhale 4s: Drop belly, lift chest — Cow
- Exhale 6s: Round spine, tuck chin — Cat

**2. Squat to Reach (15 breaths)**
- Feet shoulder-width apart
- Inhale 4s: Bend knees, sweep arms forward
- Exhale 6s: Stand tall, extend arms overhead

**Guided video:** [Somatic Flow](https://www.unbecoming.app/somatic)

When you're done, click "Done" in the {{toolbarReference}} to log it.`,

    completionResponse: `Somatic Flow logged. ✓

Your body just woke up. Awareness isn't just in your head anymore — you've extended it into your proprioceptive network.

{{nextPracticePrompt}}`,

    guidance: `**Somatic Flow — The Mechanics**

**Why it works:**
These movements mobilize the vagus nerve along the spine, enhance cerebrospinal fluid circulation, and strengthen the embodied awareness connection. The breath-movement sync reinforces the same coherent rhythm from Resonance Breathing.

**Cat-Cow Flow:**
- Start on hands and knees (or seated)
- Inhale (4s): Drop belly toward floor, lift head and tailbone — this is "Cow"
- Exhale (6s): Round spine toward ceiling, tuck chin and tailbone — this is "Cat"
- Move smoothly, no jerky transitions
- 15 complete breath cycles

**Squat to Reach:**
- Stand with feet shoulder-width apart
- Inhale (4s): Bend knees, hips back, sweep arms forward as if gathering air
- Exhale (6s): Stand tall, extend arms overhead or wide like wings
- Keep spine long, shoulders soft
- 15 complete breath cycles

**Guided video:** [Somatic Flow](https://www.unbecoming.app/somatic)`
  },

  // MORNING MICRO-ACTION (Stage 3+)
  micro_action: {
    startPrompt: `Time for your **Morning Micro-Action**.

Your current identity: **{{currentIdentity}}**
Your daily proof: **{{microAction}}**

This isn't about the action itself — it's about accumulating evidence that you ARE this person. Each completion rewires your self-concept.

Do your micro-action now. When complete, click "Done" in the {{toolbarReference}}.`,

    completionResponse: `Morning Micro-Action logged. ✓

Identity: {{currentIdentity}}
Evidence: logged.

Day {{identityDayInCycle}} of 21. You're not chasing perfection — you're training consistency. By week 3, this will feel like just who you are.

{{nextPracticePrompt}}`,

    // Special: When identity needs to be set (new sprint or first time)
    identityNeeded: `Time to set your **21-day identity**.

Before we can do your Morning Micro-Action, we need to identify who you're becoming and design the proof.

This is a 5-minute process that will shape the next 21 days. Ready to begin?

Type "yes" to start the Identity Installation Protocol.`
  },

  // FLOW BLOCK (Stage 4+)
  flow_block: {
    startPrompt: `Time for your **Flow Block**.

This is where you train sustained attention on your highest-leverage work. Single task. Full immersion.

**Your setup checklist:**
- [ ] Location: Same spot every time
- [ ] Playlist: Your focus music ready
- [ ] Timer: Set for 60-90 minutes
- [ ] Phone: Airplane mode or in another room
- [ ] Clear goal: One specific task

**Intention statement (say it aloud):**
"For the next [X] minutes, my only job is [your task]. Let's begin."

Start your timer. I'll check in after you're done.

When complete, click "Done" in the {{toolbarReference}}.`,

    completionResponse: `Flow Block logged. ✓

**Quick debrief** — rate each (1-5):
- Focus Quality: How sustained was attention?
- Challenge-Skill Balance: Too easy (1), balanced (3), too hard (5)?
- Energy After: Drained (1) or calm satisfaction (5)?
- Flow Presence: Did time distort? Did mental chatter fade?

Type your 4 ratings (e.g., "4 3 5 4") and one sentence about what you learned.`,

    // If they haven't set up their Flow Block yet
    setupNeeded: `Before we start Flow Blocks, we need to build your system.

This means:
1. Identifying your highest-leverage tasks across life domains
2. Creating a weekly Flow Block schedule
3. Setting up your environment for consistent deep work

Ready to design your Flow Block system? Type "yes" to begin.`
  },

  // CO-REGULATION PRACTICE (Stage 5+)
  co_regulation: {
    startPrompt: `Time for your **Co-Regulation Practice**.

This trains your social nervous system to stay open, regulated, and present in relational contexts.

**Duration:** 3-5 minutes
**Today's target:** [The rotation will be shown below]

**The practice:**
1. Bring your person to mind — visualize their face
2. Place a hand on your chest
3. Inhale: silently say "Be blessed"
4. Exhale: silently say "I wish you peace and love"
5. Notice any warmth or softness that arises
6. Don't force emotion — even a flicker counts

**5-Day Rotation:**
- Day 1: Friend
- Day 2: Neutral person
- Day 3: Yourself
- Day 4: Difficult person
- Day 5: All beings

**Guided audio:** [Co-Regulation Practice](https://www.unbecoming.app/coregulation)

When you're done, click "Done" in the {{toolbarReference}}.`,

    completionResponse: `Co-Regulation logged. ✓

How did that land? Even a flicker of resonance counts — you're rewiring the relational circuitry. Over time, this expands your capacity to stay open and present with others.

{{nextPracticePrompt}}`
  },

  // NIGHTLY DEBRIEF (Stage 6+)
  nightly_debrief: {
    startPrompt: `Time for your **Nightly Debrief**.

This is the final integration checkpoint — encoding today's learning into insight before rest.

**Duration:** 2 minutes
**The question:** What did reality teach me today?

Dim the lights. Sit or lie down.
Inhale for 4, exhale for 6.

Then glance back through the day — not to rehash, but to notice moments with emotional charge. What lesson wants to be named?

When you have it, share it with me or click "Done" to log the practice.`,

    completionResponse: `Nightly Debrief logged. ✓

Lesson received — day integrated — rest well.

Your nervous system will consolidate today's learning overnight. See you tomorrow morning.`
  }
};

// Helper to generate "next practice" prompt
export function getNextPracticePrompt(nextPractice: { id: string; name: string } | null, allComplete: boolean): string {
  if (allComplete) {
    return `**All practices complete for today.** Your nervous system thanks you. Consistency > intensity.`;
  }
  if (nextPractice) {
    return `**Next up:** ${nextPractice.name}. Ready when you are.`;
  }
  return '';
}

// ============================================
// STAGE INTRO TEMPLATES
// ============================================

export const stageTemplates = {
  // STAGE 1: Neural Priming
  1: {
    ritualIntro: {
      intro: `You're starting at **Stage 1: Neural Priming**.

**Tagline:** *Stabilize the signal. Teach your nervous system calm.*

This stage lays the neural foundation — shifting your body from sympathetic dominance (stress) into parasympathetic coherence.

**Your daily rituals:**
${getRitualListForStage(1)}

**Total: ${getMorningRitualTime(1)}** every morning, immediately upon waking.

These aren't optional. They're the kernel installation. Without them, nothing else sticks.

Ready to learn each ritual?`,

      practices: {
        hrvb: `**RITUAL 1: RESONANCE BREATHING — 5 MINS**

**What it does:**
Stimulates your vagus nerve, increases heart rate variability, raises RMSSD. Translation: trains your nervous system to shift from stress to calm coherence on command.

**When:** First thing after waking, before anything else.

**How:**
Sit up in bed or in a chair. Spine long, shoulders relaxed.
We're using a 4-second inhale, 6-second exhale rhythm — this hits your resonance frequency and maximizes vagal tone.

**Here is a guided video:** [Resonance Breathing Video](https://www.unbecoming.app/breathe)

When ready, you can also initiate this with the {{toolbarReference}}.

That's ritual one. Make sense?`,

        awareness_rep: `**RITUAL 2: AWARENESS REP — 2 MINS**

**What it does:**
Strengthens meta-awareness circuitry (insula-PCC connectivity). Trains your brain to notice when you're lost in thought and return to present awareness.

**When:** Right after Resonance Breathing, while still seated.

**How:**
A decentering practice that notices whatever is here — sounds, sensations, thoughts — and helps separate you from those things.

You're not trying to change anything or "get somewhere." Just notice that you're noticing.

When you drift into thought (you will), notice that too, and return.

That's the practice. Recognizing you're the observer.

**This audio will guide you through the process when ready:** [Awareness Rep Audio](https://www.unbecoming.app/awareness)

You can also initiate this with the {{toolbarReference}}.

Make sense?`
      },

      wrapUp: `That's your **Stage 1 morning ritual**. {{morningTime}}. Every day.

**Same sequence:**
1. Wake up
2. Resonance Breathing — 5 mins
3. Awareness Rep — 2 mins
4. Then check in with me

Your {{toolbarReference}} will let you know if you have completed them for the day and your progress.

---

**ON-DEMAND TOOL AVAILABLE:**

**Decentering Practice** — For when you feel identified with thoughts, emotions, or roles. This practice helps you recognize that you are the awareness noticing these things, not the things themselves.

Use it when you catch yourself saying "I AM anxious" instead of "I notice anxiety" — or when you feel trapped in a role. Takes 2-5 minutes.

Access it via your {{toolbarReference}} under "On-Demand Tools."

---

**Starting tomorrow morning** — do both rituals, then come back and let me know how it went.

See you then. Your nervous system is about to start learning.`
    },

    dailyPrompts: {
      firstDay: `{{greeting}}{{userName}}.

**Stage 1: Neural Priming** — Day 1

Today your nervous system begins its rewiring. Here's your morning:

${getRitualListForStage(1)}

**Total: ${getMorningRitualTime(1)}**

Use the {{toolbarReference}} to start each practice and mark them complete.

Ready to begin?`,

      standard: `{{greeting}}{{userName}}.

**Stage 1: Neural Priming** — Day {{daysInStage}}
**Adherence:** {{adherence}}%{{streakMessage}}

**Today's rituals:**
${getRitualListForStage(1)}

**Total: ${getMorningRitualTime(1)}**

Ready to begin? Use the {{toolbarReference}} to start.`,

      allComplete: `All practices complete for today. ✓

Your nervous system is rewiring. Each day of consistent practice strengthens the new patterns.

**Current status:**
- Day {{daysInStage}} of Stage 1
- {{adherence}}% adherence
- {{consecutiveDays}} day streak

Is there anything else you need? Or see you tomorrow morning.`
    },

    unlock: {
      eligible: `**Stage 1 Complete.** 🎉

You've hit the unlock criteria:
- ≥80% adherence over 14 days ✓
- ≥+0.3 average delta improvement ✓
- Calm rating ≥3/5 ✓

**Neural Priming stabilized.** Heart-mind coherence online.

You're ready to bring awareness into motion.

**Unlock Stage 2: Embodied Awareness?**`,

      notYet: `**Stage 1 Progress Check**

Current status vs unlock criteria:
- Adherence: {{currentAdherence}}% (need 80%)
- Avg Delta: {{currentAvgDelta}} (need +0.3)
- Days: {{currentConsecutiveDays}} (need 14)

Keep going. The system unlocks when your nervous system is ready — not before.`,

      confirmation: `**Stage 2 Unlocked: Embodied Awareness** ✓

You've proven your nervous system can maintain coherence. Now we bring awareness into motion.

---

**NEW RITUAL UNLOCKING:**

**Somatic Flow** — 3 minutes of breath-synced movement that extends your awareness into your body. You'll learn Cat-Cow and Squat-to-Reach flows synchronized with your 4s inhale / 6s exhale.

---

**ON-DEMAND TOOL NOW AVAILABLE:**

**Meta-Reflection** — A weekly practice (typically Sundays) to examine how awareness moved through your week. Not what happened, but how you perceived and interpreted it. This deepens self-inquiry and integrates insights over time.

Access it anytime via the {{toolbarReference}} under "On-Demand Tools."

---

Ready to learn Somatic Flow?`
    }
  },

  // STAGE 2: Embodied Awareness
  2: {
    ritualIntro: {
      intro: `Welcome to **Stage 2: Embodied Awareness**.

**Tagline:** *Bring awareness into motion.*

You've stabilized the signal. Now we extend awareness into your body through breath-synced movement.

**New practice unlocking:** Somatic Flow

Your updated morning ritual:
${getRitualListForStage(2)}

**Total: ${getMorningRitualTime(2)}**

Ready to learn Somatic Flow?`,

      practices: {
        somatic_flow: `**NEW RITUAL: SOMATIC FLOW — 3 MINS**

**What it does:**
Mobilizes the vagus nerve along the spine, enhances proprioception, and circulates cerebrospinal fluid. You're learning to regulate through movement.

**When:** After Resonance Breathing, before Awareness Rep.

**How:**
Two simple movements synced with your 4s inhale / 6s exhale:

**1. Cat-Cow Flow (15 breaths)**
- Hands and knees (or seated, hands on knees)
- Inhale 4s: Drop belly, lift chest — Cow
- Exhale 6s: Round spine, tuck chin — Cat

**2. Squat to Reach (15 breaths)**
- Feet shoulder-width apart
- Inhale 4s: Bend knees, sweep arms forward
- Exhale 6s: Stand tall, arms overhead

**Guided video:** [Somatic Flow](https://www.unbecoming.app/somatic)

Make sense?`
      },

      wrapUp: `Your **Stage 2 morning ritual** is now:

1. Resonance Breathing — 5 mins
2. **Somatic Flow — 3 mins** (new)
3. Awareness Rep — 2 mins

**Total: ${getMorningRitualTime(2)}**

Same rules: every morning, immediately upon waking. The body is now part of the practice.

Starting tomorrow morning — run the full sequence. Your body is about to become aware.`
    },

    dailyPrompts: {
      firstDay: `{{greeting}}{{userName}}.

**Stage 2: Embodied Awareness** — Day 1

New stage, new practice. Your morning now includes Somatic Flow between Resonance Breathing and Awareness Rep.

${getRitualListForStage(2)}

**Total: ${getMorningRitualTime(2)}**

Ready to bring awareness into motion?`,

      standard: `{{greeting}}{{userName}}.

**Stage 2: Embodied Awareness** — Day {{daysInStage}}
**Adherence:** {{adherence}}%{{streakMessage}}

**Today's rituals:**
${getRitualListForStage(2)}

**Total: ${getMorningRitualTime(2)}**

Ready to begin?`,

      allComplete: `All practices complete for today. ✓

Embodiment achieved. The body is now connected awareness.

**Current status:**
- Day {{daysInStage}} of Stage 2
- {{adherence}}% adherence
- {{consecutiveDays}} day streak

Anything else? Or see you tomorrow.`
    },

    unlock: {
      eligible: `**Stage 2 Complete.** 🎉

You've hit the unlock criteria:
- ≥80% adherence over 14 days ✓
- ≥+0.5 average delta improvement ✓
- Felt-sense rating ≥3/5 ✓

**Embodiment achieved.** The body is now connected awareness.

Time to act from coherence.

**Unlock Stage 3: Identity Mode?**`,

      notYet: `**Stage 2 Progress Check**

Current status vs unlock criteria:
- Adherence: {{currentAdherence}}% (need 80%)
- Avg Delta: {{currentAvgDelta}} (need +0.5)
- Days: {{currentConsecutiveDays}} (need 14)

Your body is learning. Keep the practice consistent.`,

      confirmation: `**Stage 3 Unlocked: Identity Mode** ✓

You've embodied awareness. Now we anchor it into who you are.

---

**NEW RITUAL UNLOCKING:**

**Morning Micro-Action** — One small daily proof of your chosen identity. Not affirmations. Not aspirations. Evidence-based identity training. Each completion rewires the neural pathways that define who you are.

We'll run the Identity Installation Protocol together to set your 21-day identity and design your daily proof action.

---

**ON-DEMAND TOOL NOW AVAILABLE:**

**Reframe Protocol** — For when triggers arise. This tool helps you identify the story you're telling yourself about an event and consciously replace it with an interpretation that restores agency, calm, and clarity.

When you feel a strong emotional charge — frustration, stress, judgment — that's your cue to use it. Takes 2-5 minutes.

Access it anytime via the {{toolbarReference}} under "On-Demand Tools."

---

Ready to run the Identity Installation Protocol?`
    }
  },

  // STAGE 3: Identity Mode
  3: {
    ritualIntro: {
      intro: `Welcome to **Stage 3: Identity Mode**.

**Tagline:** *Act from coherence.*

You've stabilized and embodied awareness. Now we install your new self-concept through behavioral proof.

**New practice unlocking:** Morning Micro-Action

Your updated morning ritual:
${getRitualListForStage(3)}

**Total: ${getMorningRitualTime(3)}**

But first, we need to identify WHO you're becoming.

Ready to run the Identity Installation Protocol?`,

      practices: {
        micro_action: `**NEW RITUAL: MORNING MICRO-ACTION — 2-3 MINS**

**What it does:**
Reinforces your chosen self-schema through embodied proof. Each day, you complete one small action that proves you ARE this person — not that you're trying to become them.

**When:** After Awareness Rep, as the final morning practice.

**How:**
1. We identify your 21-day identity together
2. We design one micro-action that proves it
3. Each morning, you complete the action
4. Each completion = evidence = neural reinforcement

By day 21, it won't feel like effort. It'll feel like you.

**First:** We need to run the Identity Installation Protocol to set your identity and micro-action.

Ready to begin?`
      },

      wrapUp: `Your **Stage 3 morning ritual** is now:

1. Resonance Breathing — 5 mins
2. Somatic Flow — 3 mins
3. Awareness Rep — 2 mins
4. **Morning Micro-Action — 2-3 mins** (new)

**Total: ${getMorningRitualTime(3)}**

Your identity: **{{currentIdentity}}**
Your daily proof: **{{microAction}}**

Every 21 days, we'll reassess and either deepen or evolve the identity.

**Remember:** The **Reframe Protocol** is now available in your {{toolbarReference}} under "On-Demand Tools" for when triggers arise.

Starting tomorrow — full sequence + your micro-action. You're now training identity, not just awareness.`
    },

    dailyPrompts: {
      firstDay: `{{greeting}}{{userName}}.

**Stage 3: Identity Mode** — Day 1

Your identity is set: **{{currentIdentity}}**
Your daily proof: **{{microAction}}**

${getRitualListForStage(3)}

**Total: ${getMorningRitualTime(3)}**

Ready to become who you already are?`,

      standard: `{{greeting}}{{userName}}.

**Stage 3: Identity Mode** — Day {{daysInStage}}
**Identity:** {{currentIdentity}} (Day {{identityDayInCycle}}/21)
**Adherence:** {{adherence}}%{{streakMessage}}

**Today's rituals:**
${getRitualListForStage(3)}

Ready to prove who you are?`,

      allComplete: `All practices complete for today. ✓

Identity: {{currentIdentity}}
Evidence: logged.

**Current status:**
- Day {{daysInStage}} of Stage 3
- Identity Day {{identityDayInCycle}} of 21
- {{adherence}}% adherence

You're not chasing perfection — you're training consistency.`
    },

    unlock: {
      eligible: `**Stage 3 Complete.** 🎉

You've hit the unlock criteria:
- ≥80% adherence over 14 days ✓
- ≥+0.5 average delta improvement ✓
- Decreased emotional reactivity ✓
- Clear identity articulation ✓

**Identity proof installed.** You now act from awareness, not toward it.

Ready to integrate high-level performance?

**Unlock Stage 4: Flow Mode?**`,

      notYet: `**Stage 3 Progress Check**

Current status vs unlock criteria:
- Adherence: {{currentAdherence}}% (need 80%)
- Avg Delta: {{currentAvgDelta}} (need +0.5)
- Days: {{currentConsecutiveDays}} (need 14)

Your identity is forming. Keep the proof consistent.`,

      confirmation: `**Stage 4 Unlocked: Flow Mode** ✓

Your identity is becoming aligned. Now we train sustained attention on performance drivers.

---

**NEW RITUAL UNLOCKING:**

**Flow Block** — 60-90 minutes of single-task deep work. Challenge ≈ skill +10%. No phone, no distractions, full immersion. This is where awareness becomes performance.

We'll run the Flow Block Setup together to identify your high-leverage tasks, build your Flow Menu, and design your weekly schedule.

---

**ON-DEMAND TOOL NOW AVAILABLE:**

**Thought Hygiene** — For clearing cognitive residue after heavy mental load. When your mind feels cluttered with loops — tasks, worries, conversations running in the background — this 2-3 minute protocol surfaces and releases them.

Use it after Flow Blocks, meetings, or whenever you feel scattered. Takes 2-3 minutes.

Access it anytime via the {{toolbarReference}} under "On-Demand Tools."

---

Ready to set up your Flow Blocks?`
    }
  },

  // STAGE 4: Flow Mode
  4: {
    ritualIntro: {
      intro: `Welcome to **Stage 4: Flow Mode**.

**Tagline:** *Train sustained attention on performance drivers.*

You've stabilized, embodied, and anchored identity. Now we convert coherence into deep cognitive performance.

**New practice unlocking:** Flow Block

Your updated schedule:
${getRitualListForStage(4)}

**Note:** Flow Block happens separately from morning rituals — typically mid-morning after you've started work.

But first, we need to design your Flow Block system.

Ready to identify your highest-leverage work?`,

      practices: {
        flow_block: `**NEW PRACTICE: FLOW BLOCK — 60-90 MINS**

**What it does:**
Trains sustained attention through single-task immersion. Challenge ≈ skill + 10%. This moves awareness into action without fragmentation.

**When:** Daily, after morning rituals — typically mid-morning.

**Setup requirements (not optional):**
- Same location every time
- Same playlist (focus music)
- Timer set for 60-90 minutes
- Phone on airplane mode or in another room
- One clear goal

**The protocol:**
1. State your intention aloud: "For the next [X] minutes, my only job is [task]."
2. Start timer
3. Single task only
4. When done, log completion + performance ratings

We'll build your Flow Menu (tasks) and Weekly Map (schedule) together.

Ready to design your system?`
      },

      wrapUp: `Your **Stage 4 schedule** is now:

**Morning Rituals:**
1. Resonance Breathing — 5 mins
2. Somatic Flow — 3 mins
3. Awareness Rep — 2 mins
4. Morning Micro-Action — 2-3 mins

**Daily (scheduled):**
5. Flow Block — 60-90 mins

**Total: ${getMorningRitualTime(4)}**

**Remember:** **Thought Hygiene** is now available in your {{toolbarReference}} under "On-Demand Tools" — use it after Flow Blocks when your mind feels cluttered.

Your Flow Menu and Weekly Map are set. Time to train deep work as a neural skill.`
    },

    dailyPrompts: {
      standard: `{{greeting}}{{userName}}.

**Stage 4: Flow Mode** — Day {{daysInStage}}
**Identity:** {{currentIdentity}} (Day {{identityDayInCycle}}/21)
**Adherence:** {{adherence}}%{{streakMessage}}

**Today's rituals:**
${getRitualListForStage(4)}

Ready to flow?`,

      allComplete: `All practices complete for today. ✓

**Current status:**
- Day {{daysInStage}} of Stage 4
- {{adherence}}% adherence
- {{consecutiveDays}} day streak

The mind is becoming the tool, not the operator.`
    },

    unlock: {
      eligible: `**Stage 4 Complete.** 🎉

You've hit the unlock criteria:
- ≥80% adherence over 14 days ✓
- ≥+0.6 average delta improvement ✓

**Flow performance stabilized.** The mind is no longer the operator — it's the tool.

Ready to train relational coherence?

**Unlock Stage 5: Relational Coherence?**`,

      notYet: `**Stage 4 Progress Check**

Current status vs unlock criteria:
- Adherence: {{currentAdherence}}% (need 80%)
- Avg Delta: {{currentAvgDelta}} (need +0.6)
- Days: {{currentConsecutiveDays}} (need 14)

Keep training the flow state.`,

      confirmation: `**Stage 5 Unlocked: Relational Coherence** ✓

You can sustain attention in solitude. Now we train it in connection.

---

**NEW PRACTICE UNLOCKING:**

**Co-Regulation Practice** — 3-5 minutes training the social nervous system. You'll activate the ventral vagal complex (your social safety circuit) through heart-focused compassion exercises. This trains your nervous system to stay open and regulated in relational contexts — not just when you're alone.

**When:** Late afternoon/early evening, as you transition from work to personal time.

---

**No new on-demand tools this stage** — you have all the tools you need. This stage is about extending everything you've built into relationship.

---

Ready to learn the Co-Regulation Practice?`
    }
  },

  // STAGE 5: Relational Coherence
  5: {
    ritualIntro: {
      intro: `Welcome to **Stage 5: Relational Coherence**.

**Tagline:** *Train the nervous system to stay open in connection.*

You've mastered focus in solitude. Now we extend regulation into relationship — staying calm, present, and connected even amid social or emotional charge.

**New practice unlocking:** Co-Regulation Practice

Your updated schedule:
${getRitualListForStage(5)}

Ready to learn the Co-Regulation Practice?`,

      practices: {
        co_regulation: `**NEW PRACTICE: CO-REGULATION — 3-5 MINS**

**What it does:**
Activates the ventral vagal complex (social safety circuit) through heart-focused compassion. Trains your nervous system to stay open in relational contexts.

**When:** Late afternoon/early evening — transition from work to personal time.

**The practice:**
1. Pick a person (start with someone easy)
2. Bring them to mind — visualize their face
3. Place hand on chest
4. Inhale: "Be blessed"
5. Exhale: "I wish you peace and love"
6. Notice any warmth or softness (don't force it)
7. 3-5 minutes

**5-Day rotation:**
- Day 1: Friend
- Day 2: Neutral person
- Day 3: Yourself
- Day 4: Difficult person
- Day 5: All beings

**Guided audio:** [Co-Regulation Practice](https://www.unbecoming.app/coregulation)

Make sense?`
      },

      wrapUp: `Your **Stage 5 schedule** is now:

**Morning Rituals:**
1. Resonance Breathing — 5 mins
2. Somatic Flow — 3 mins
3. Awareness Rep — 2 mins
4. Morning Micro-Action — 2-3 mins

**Daily:**
5. Flow Block — 60-90 mins (scheduled)

**Evening:**
6. Co-Regulation Practice — 3-5 mins (new)

**Total: ${getMorningRitualTime(5)}**

You're now training awareness in relationship, not just in solitude. This is where it gets integrated.`
    },

    dailyPrompts: {
      standard: `{{greeting}}{{userName}}.

**Stage 5: Relational Coherence** — Day {{daysInStage}}
**Identity:** {{currentIdentity}} (Day {{identityDayInCycle}}/21)
**Adherence:** {{adherence}}%{{streakMessage}}

**Today's practices:**
${getRitualListForStage(5)}

Ready to stay open?`,

      allComplete: `All practices complete for today. ✓

**Current status:**
- Day {{daysInStage}} of Stage 5
- {{adherence}}% adherence

You're training relational coherence. The nervous system is learning to stay open.`
    },

    unlock: {
      eligible: `**Stage 5 Complete.** 🎉

You've hit the unlock criteria:
- ≥85% adherence over 14 days ✓
- ≥+0.7 average delta improvement ✓

**Relational coherence stabilized.** You are now connected.

Ready to convert insight into stable trait-level awareness?

**Unlock Stage 6: Integration?**`,

      notYet: `**Stage 5 Progress Check**

Current status vs unlock criteria:
- Adherence: {{currentAdherence}}% (need 85%)
- Avg Delta: {{currentAvgDelta}} (need +0.7)
- Days: {{currentConsecutiveDays}} (need 14)

Keep training relational presence.`,

      confirmation: `**Stage 6 Unlocked: Integration** ✓

You can stay regulated in solitude and connection. Now we seal it.

---

**NEW PRACTICE UNLOCKING:**

**Nightly Debrief** — 2 minutes every evening before sleep. This consolidates each day's learning through one simple question: "What did reality teach me today?"

Your nervous system encodes lessons during sleep. This practice ensures there's a clear signal to encode.

---

**FULL SYSTEM NOW ACTIVE:**

You now have the complete IOS toolkit:

**Daily Rituals:**
- Resonance Breathing (regulation)
- Somatic Flow (embodiment)  
- Awareness Rep (meta-awareness)
- Morning Micro-Action (identity)
- Flow Block (performance)
- Co-Regulation (relationship)
- Nightly Debrief (integration)

**On-Demand Tools:**
- Decentering Practice (identity fusion)
- Meta-Reflection (weekly integration)
- Reframe Protocol (trigger response)
- Thought Hygiene (cognitive clearing)

All accessible via your {{toolbarReference}}.

---

**Stage 7: Accelerated Expansion** requires manual review and application when you're ready for advanced protocols.

---

Ready to learn the Nightly Debrief?`
    }
  },

  // STAGE 6: Integration
  6: {
    ritualIntro: {
      intro: `Welcome to **Stage 6: Integration**.

**Tagline:** *Convert insight into stable trait-level awareness.*

This is where all the neural and mental rewiring becomes permanent. You're consolidating everything into lived coherence.

**New practice unlocking:** Nightly Debrief

Your complete daily schedule:
${getRitualListForStage(6)}

Ready to learn the Nightly Debrief?`,

      practices: {
        nightly_debrief: `**NEW PRACTICE: NIGHTLY DEBRIEF — 2 MINS**

**What it does:**
Consolidates learning, supports sleep-linked memory reconsolidation, and stabilizes awareness as your baseline.

**When:** Evening, before sleep.

**The practice:**
One question: **"What did reality teach me today?"**

1. Dim lights, sit or lie down
2. Inhale for 4, exhale for 6
3. Glance back through the day (thumbnails, not replay)
4. Notice moments with emotional charge
5. Name the lesson in one sentence
6. "Lesson received — day integrated — rest well."

That's it. 2 minutes. Every night.

Make sense?`
      },

      wrapUp: `Your **Stage 6 schedule** — the full IOS runtime:

**Morning Rituals:**
1. Resonance Breathing — 5 mins
2. Somatic Flow — 3 mins
3. Awareness Rep — 2 mins
4. Morning Micro-Action — 2-3 mins

**Daily:**
5. Flow Block — 60-90 mins

**Evening:**
6. Co-Regulation Practice — 3-5 mins
7. Nightly Debrief — 2 mins (new)

**Total: ${getMorningRitualTime(6)}**

This is the complete system. You're now running the full IOS.

**Stage 7 (Accelerated Expansion)** requires manual application when you're ready for advanced integration tools.`
    },

    dailyPrompts: {
      standard: `{{greeting}}{{userName}}.

**Stage 6: Integration** — Day {{daysInStage}}
**Identity:** {{currentIdentity}} (Day {{identityDayInCycle}}/21)
**Adherence:** {{adherence}}%{{streakMessage}}

**Today's practices:**
${getRitualListForStage(6)}

Full system online. Ready?`,

      allComplete: `All practices complete for today. ✓

**System Integration active.**

- Day {{daysInStage}} of Stage 6
- {{adherence}}% adherence
- {{consecutiveDays}} day streak

Awareness is becoming your stable baseline. Rest well.`
    },

    unlock: {
      eligible: `**Stage 6 Status**

Your metrics indicate readiness for Stage 7: Accelerated Expansion.

However, Stage 7 requires:
- Manual review
- Application submission
- Live conversation

Stage 7 involves advanced integration tools: supplements, nootropics, neurofeedback, and psychedelic-assisted protocols. It's not for everyone.

Would you like to apply for Stage 7?`,

      notYet: `**Stage 6 Progress**

System Integration is active. Continue the full daily practice.

Stage 7 (Accelerated Expansion) will be available when:
- Stable adherence is demonstrated
- Sustained deltas are maintained
- You're ready for advanced tools

Keep integrating.`,

      confirmation: `**Stage 7 Application Received**

I've noted your interest in Accelerated Expansion.

This stage involves supervised, advanced integration with supplements, nootropics, neurofeedback, brain entrainment, and psychedelic-assisted deep work.

We'll schedule a live conversation to discuss readiness and customize your protocol.

For now, continue the Stage 6 practices. Welcome to Embodied Consciousness.`
    }
  },

  // STAGE 7: Accelerated Expansion
  7: {
    ritualIntro: {
      intro: `Welcome, Conductor.

**Stage 7: Accelerated Expansion**

**Tagline:** *Awareness engineers itself.*

You've installed the complete IOS. Now we accelerate its evolution with advanced integration tools.

This stage is personalized. Your protocol will be designed in our live conversation.

The IOS is now self-evolving. You are the feedback loop.`
    },

    dailyPrompts: {
      standard: `{{greeting}}, Conductor.

**Stage 7: Accelerated Expansion** — Day {{daysInStage}}
**Adherence:** {{adherence}}%{{streakMessage}}

Your personalized protocol continues. Check your custom schedule for today's practices.

The IOS is self-evolving. You are the feedback loop.`
    },

    unlock: {
      eligible: `You've reached the final stage. There is no further unlock.

The IOS is complete. Continue your personalized Accelerated Expansion protocol.

Welcome, Conductor.`,

      notYet: `Stage 7 is active. Continue your personalized protocol.`,
      
      confirmation: `Welcome to the final stage. You are now operating at full capacity.`
    }
  }
};

// ============================================
// WEEKLY DELTA TEMPLATES
// ============================================

export const weeklyDeltaTemplates = {
  checkInPrompt: `**Weekly Check-In**

Time to measure your progress. Rate each domain based on this past week (0-5):

**1. Regulation:** How easily could you calm yourself when stressed?
*(0 = couldn't at all, 5 = instantly)*

**2. Awareness:** How quickly did you notice when lost in thought?
*(0 = never noticed, 5 = caught it immediately)*

**3. Outlook:** How open and positive did you feel toward life?
*(0 = closed/negative, 5 = open/positive)*

**4. Attention:** How focused were you on what truly matters?
*(0 = scattered, 5 = laser-focused)*

Type your four ratings like this: "4 3 4 5"`,

  resultTemplates: {
    improving: `**Weekly Check-In Complete** ✓

**Your scores:**
- Regulation: {{newRegulationScore}}/5 ({{regulationDelta}} from baseline)
- Awareness: {{newAwarenessScore}}/5 ({{awarenessDelta}} from baseline)
- Outlook: {{newOutlookScore}}/5 ({{outlookDelta}} from baseline)
- Attention: {{newAttentionScore}}/5 ({{attentionDelta}} from baseline)

**Average Delta: {{avgDelta}}** 📈

You're improving. The practices are rewiring your system. This isn't placebo — it's neuroplasticity in action.

Keep the consistency. See you next week.`,

    stable: `**Weekly Check-In Complete** ✓

**Your scores:**
- Regulation: {{newRegulationScore}}/5 ({{regulationDelta}} from baseline)
- Awareness: {{newAwarenessScore}}/5 ({{awarenessDelta}} from baseline)
- Outlook: {{newOutlookScore}}/5 ({{outlookDelta}} from baseline)
- Attention: {{newAttentionScore}}/5 ({{attentionDelta}} from baseline)

**Average Delta: {{avgDelta}}** ➡️

Stable. Not dropping, not surging. Sometimes integration looks like this — the system is consolidating before the next jump.

Keep showing up. The compound effect is building.`,

    declining: `**Weekly Check-In Complete** ✓

**Your scores:**
- Regulation: {{newRegulationScore}}/5 ({{regulationDelta}} from baseline)
- Awareness: {{newAwarenessScore}}/5 ({{awarenessDelta}} from baseline)
- Outlook: {{newOutlookScore}}/5 ({{outlookDelta}} from baseline)
- Attention: {{newAttentionScore}}/5 ({{attentionDelta}} from baseline)

**Average Delta: {{avgDelta}}** 📉

A dip. Let's not ignore it.

What's different this week? Stress? Sleep? Skipped practices? Life circumstances?

Sometimes a dip is signal. Let's look at what needs attention.

What happened this week?`
  }
};

// ============================================
// ON-DEMAND TOOL TEMPLATES
// ============================================

export const toolTemplates = {
  decentering: {
    unlockIntro: `**Decentering Practice** — Now Available

This practice trains you to recognize thoughts, emotions, and identities as objects within awareness — not as "you."

Use it when:
- Feeling identified with a role or label
- Stuck in thought loops
- Intense emotional fusion

**Duration:** 2-5 minutes

Say "start decentering" or click the tool in {{toolbarReference}} when you need it.`,

    startPrompt: `Let's run a **Decentering Practice**.

Take one slow breath. Notice what's happening in your body right now.

What's most present in your mind — a thought, feeling, story, or role?`
  },

  reframe: {
    unlockIntro: `**Reframe Protocol** — Now Available

This is your cognitive debugging tool. Use it when triggered — when something happens and your mind spins a story that doesn't serve you.

Use it when:
- Emotional charge from an event
- Catastrophizing or absolutist thinking
- Stuck in interpretation loops

**Duration:** 5-10 minutes

Say "run reframe" or click the tool in {{toolbarReference}} when triggered.`,

    startPrompt: `Let's run the **Reframe Protocol**.

First — what happened? Just the facts. No interpretation yet.

Describe the event in one or two sentences.`
  },

  thought_hygiene: {
    unlockIntro: `**Thought Hygiene** — Now Available

This is your mental cache clearer. Use it when your mind feels cluttered — too many open loops running in the background.

Use it when:
- After intense cognitive work (Flow Blocks)
- Mind feels "full" or scattered
- Can't focus because too much is running

**Duration:** 2-3 minutes

Say "run thought hygiene" or click the tool in {{toolbarReference}} when you need to clear the clutter.`,

    startPrompt: `Time to clear your mental cache.

What's still running in the background of your mind — taking up bandwidth? Tasks, conversations, worries, whatever's looping.

Don't overthink it. Don't dig. Just dump what's floating to the surface as bullets.`
  },

  meta_reflection: {
    unlockIntro: `**Meta-Reflection** — Now Available

This is your weekly integration practice. Use it to process the week's experiences and extract the learning.

Best used:
- Sunday evenings
- After significant life events
- When patterns need examination

**Duration:** 5-10 minutes

Say "run meta-reflection" or click the tool in {{toolbarReference}} for your weekly integration.`,

    startPrompt: `Let's run your **Meta-Reflection**.

Sit quietly. Breathe slowly. Say to yourself: "I'm not reviewing life to judge it — I'm studying how awareness moved through it."

Ready?`
  }
};

// ============================================
// FOUNDATION REMINDERS
// ============================================

export const foundationTemplates = {
  sleepReminder: `**Sleep Optimization Reminder**

Your neural learning consolidates during sleep. These aren't suggestions — they're requirements:

- Same sleep/wake time daily (±30 mins)
- No screens 60 mins before bed
- No food 2 hours before bed
- Cool room (65°F / 18°C)
- Total darkness
- Optional: 2-min Resonance Breathing in bed

How's your sleep been this week?`,

  movementReminder: `**Movement Practice Reminder**

Your nervous system needs physical load to clear stress hormones and boost BDNF.

**Weekly target:**
- 5x "Break a Sweat" sessions (20+ mins each)
- Mix of aerobic and strength
- 1-2x cold/heat exposure (optional but powerful)

This isn't about fitness — it's about neural regulation.

How's your movement been this week?`
};

// ============================================
// STREAK MESSAGES
// ============================================

export function getStreakMessage(consecutiveDays: number, adherence: number): string {
  if (consecutiveDays >= 14) {
    return `\n\n🔥 **${consecutiveDays} day streak.** Your nervous system is rewiring. This is where real change happens.`;
  }
  if (consecutiveDays >= 7) {
    return `\n\n🔥 **${consecutiveDays} day streak.** Keep going.`;
  }
  if (consecutiveDays >= 3) {
    return `\n\n**${consecutiveDays} days consecutive.** Building momentum.`;
  }
  if (consecutiveDays === 0 && adherence > 0) {
    return `\n\nStreak reset. No judgment — start fresh today.`;
  }
  return '';
}

// ============================================
// EXPORT COMBINED LIBRARY
// ============================================

export const templateLibrary = {
  practices: practiceTemplates,
  stages: stageTemplates,
  weeklyDelta: weeklyDeltaTemplates,
  tools: toolTemplates,
  foundations: foundationTemplates,
  getStreakMessage
};

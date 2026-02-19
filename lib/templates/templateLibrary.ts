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

  // ALIGNED ACTION (Stage 3+)
  startPrompt: `Time for your **IOS Cue**.

Your cue: **{{currentIdentity}}**
Your loop: **Notice → Label → Release**

Run your 90-second morning imprint, then carry the cue through your day.

Click **"Done"** in the {{toolbarReference}} when your morning imprint is complete.`,

    completionResponse: `IOS Cue logged. ✓

Day {{identityDayInCycle}} of 21. Morning imprint set — now carry the cue through your day. Notice → Label → Release.

{{nextPracticePrompt}}`,

    // Special: When action needs to be set (new sprint or first time)
    identityNeeded: `Time to set your **21-day IOS Cue**.

We'll select one detection cue and install the recognition loop your nervous system will train for the next 21 days.

This takes about 2-3 minutes. Ready to begin?

Type "yes" to start.`
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
Stimulates your vagus nerve, increases heart rate variability, raises RMSSD. Translation: trains your nervous system to shift from stress to coherence on command.

**When:** First thing after waking, before anything else.

**How:**
Wake up. Sit up in bed or on a chair. Spine long, shoulders relaxed.
We're using a 4-second inhale, 6-second exhale rhythm — this hits your resonance frequency and maximizes vagal tone.

**Here is a guided video to preview if needed so you can get familiar:** [Resonance Breathing Video](https://www.unbecoming.app/breathe)

When ready, every morning you will initiate this with the {{toolbarReference}}.

That's ritual one. Make sense?`,

        awareness_rep: `**RITUAL 2: AWARENESS REP — 2 MINS**

**What it does:**
Strengthens meta-awareness circuitry (insula-PCC connectivity). Trains your brain to notice when you're caught up in an identity or label and return to present awareness.

**When:** Right after Resonance Breathing, while still seated.

**How:**
This decentering practice notices whatever is here — sounds, sensations, thoughts — and helps separate you from those things.

You're not trying to change anything or "get somewhere." Just notice that you're noticing.

When you drift into thought (you will), notice that too, and return.

That's the practice. Recognizing you're not the things you experience.

**This previous audio will guide you through the process when ready:** [Awareness Rep Audio](https://www.unbecoming.app/awareness)

You will initiate this with the {{toolbarReference}} daily every morning.

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

**ON-DEMAND TOOLS NOW AVAILABLE:**

**Decentering Practice**
A short (2–5 minute) guided practice that helps you relate differently to thoughts, emotions, and roles — without trying to change or fix them.

*When to use it:*
- When an emotion feels fused with identity ("I am anxious")
- When you feel stuck in a role (the responsible one, the fixer, the failure)
- When thoughts feel unquestionable or automatic
- When you're caught in a mental loop and need perspective

*How it works:* You'll be guided through simple questions that help you notice what is being felt, what meaning the mind is adding, and what remains when those are observed. The aim isn't to get rid of thoughts or emotions — it's to experience them with more space, clarity, and choice.

---

**Worry Loop Dissolver**
A structured 3–5 minute protocol to collapse worry loops (rumination, catastrophizing, anticipatory anxiety) so thinking becomes clear again.

*When to use it:*
- When the same worry keeps replaying
- When the mind is projecting worst-case future outcomes
- When you're stuck analyzing what something "means" or what someone "thinks"
- When the nervous system feels on alert without a clear, present threat
- When you can't stop mentally rehearsing scenarios

*How it works:* You start with a verifiable Signal (a present body sensation or emotion), identify the active loop mechanism, then run a short sequence that removes the fuel sustaining the loop and anchors attention back to present sensory data.

---

Access both tools anytime via your {{toolbarReference}} under "On-Demand Tools."

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
      eligible: `**🔓 SYSTEM UPGRADE AVAILABLE**

You've proven consistency and transformation:
- {{adherence}}% adherence over 14+ days ✓
- +{{avgDelta}} average delta improvement ✓
- {{consecutiveDays}} day streak ✓

**Neural Priming stabilized.** Heart-mind coherence online.

Before we unlock **Stage 2: Embodied Awareness**, quick reflection:

**What's different about how you respond to stress now compared to when you started?**

Take a moment to notice the shift. Then type **"unlock"** when you're ready to advance.`,

      notYet: `**Stage 1 Progress Check**

Current status vs unlock criteria:
- Adherence: {{currentAdherence}}% (need 80%)
- Avg Delta: {{currentAvgDelta}} (need +0.3)
- Days: {{currentConsecutiveDays}} (need 14)

Keep going. The system unlocks when your nervous system is ready — not before.`,

      confirmation: `**🎉 Stage 2 Unlocked: Embodied Awareness**

You've proven your nervous system can maintain coherence. Now we bring awareness into motion.

---

**NEW RITUAL UNLOCKING:**

**Somatic Flow** — 3 minutes of breath-synced movement that extends your awareness into your body. You'll learn Cat-Cow and Squat-to-Reach flows synchronized with your 4s inhale / 6s exhale.

---

**ON-DEMAND TOOL NOW AVAILABLE:**

**Meta-Reflection**
A 10–15 minute weekly session to observe how perception formed and to capture a usable kernel in the format: Signal → Interpretation → Action.

*When to use it:*
- Weekly (I'll prompt you on Sundays, or run it on your own day)
- After a significant event or emotional spike
- When the same pattern keeps repeating across the week
- When you want to convert experience into a clear next step (or deliberate non-action)

*How it works:* You select one moment. You start with Signal (what you can verify in the body), then name the Interpretation that was added, then choose an Action within 24 hours (or deliberate non-action). You end by re-contacting the body to lock in the kernel.

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

**1. Cat-Cow Flow (7 breaths)**
- Hands and knees (or seated, hands on knees)
- Inhale 4s: Drop belly, lift chest — Cow
- Exhale 6s: Round spine, tuck chin — Cat

**2. Squat to Reach (7 breaths)**
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
      eligible: `**🔓 SYSTEM UPGRADE AVAILABLE**

You've proven consistency and transformation:
- {{adherence}}% adherence over 14+ days ✓
- +{{avgDelta}} average delta improvement ✓
- {{consecutiveDays}} day streak ✓

**Embodiment achieved.** The body is now connected awareness.

Before we unlock **Stage 3: Coherent Action Mode**, quick reflection:

**What did you notice about awareness during Somatic Flow? Did it stay present through the movement, or did it drift?**

Take a moment to recall. Then type **"unlock"** when you're ready to advance.`,

      notYet: `**Stage 2 Progress Check**

Current status vs unlock criteria:
- Adherence: {{currentAdherence}}% (need 80%)
- Avg Delta: {{currentAvgDelta}} (need +0.5)
- Days: {{currentConsecutiveDays}} (need 14)

Your body is learning. Keep the practice consistent.`,

      confirmation: `**🎉 Stage 3 Unlocked: Identity Mode**

You've embodied awareness. Now we anchor it into who you are.

---

**NEW RITUAL UNLOCKING:**

**Morning Aligned Action** — One small action taken without narrative or self-definition. Not to become someone - but to notice when identity is no longer required and to train your nervous system in how to respond.

We'll run the Coherant Action Coherence Protocol to define a 21-day action and track what remains consistent without interpretation.

---

**ON-DEMAND TOOL NOW AVAILABLE:**

**Reframe Protocol**
A ~2-minute interpretation audit that separates what actually happened from what the mind added, then selects a clean next step.

*When to use it:*
- When a reaction feels disproportionate to the event
- When meaning-making shows up ("this means…", "they always…", "I'll never…")
- When blame, mind-reading, catastrophizing, or certainty creeps in
- When you want clarity instead of rumination

*How it works:* You'll move through a simple sequence: Signal → Interpretation → Action. We identify the verifiable signal, make the interpretation explicit, test it, and choose one concrete next step (or deliberate non-action). The result is clarity and agency—not forced positivity.

Use it whenever an interpretation is amplifying the signal. Access it via {{toolbarReference}} → On-Demand Tools.

---

Ready to run the Action Coherence Protocol?`
    }
  },

  // STAGE 3: Algined Action Mode
  3: {
    ritualIntro: {
      intro: `Welcome to **Stage 3: Aligned Action Mode**.

**Tagline:** *Action without interpretation. Behaviour without a story.*

Awareness is now consistent enough to guide action directly. This stage uses action to reveal coherence, not to define who you are.

**New practice unlocking:** Action Coherence Protocol

Your updated morning ritual:
${getRitualListForStage(3)}

**Total: ${getMorningRitualTime(3)}**

Before we begin, we'll identify a consistent action and observe what stabilizes without interpretation.

Ready to run the Action Coherence Protocol?`,

      practices: {
        micro_action: `**NEW RITUAL: Action Coherence Protocol — 2 MINS**

**What it does:**
Removes reliance on self-concept by acting without narrative. Each completed action demonstrates functionality without interpretation.

**When:** After Awareness Rep, as the final morning practice.

**How:**
1. We define a 21-day action experiment
2. We choose one minimal, repeatable behaviour
3. Each morning, you execute it cleanly
4. Consistency replaces identity inference

By day 21, the action no longer requires effort or justification.
It simply occurs.

**First:** We'll run the Action Coherence Protocol to define the action and remove narrative from its execution.

Ready to begin?`
      },

      wrapUp: `Your **Stage 3 morning ritual** is now:

1. Resonance Breathing — 5 mins
2. Somatic Flow — 3 mins
3. Awareness Rep — 2 mins
4. **Morning Aligned Action — 1 min** (new)

**Total: ${getMorningRitualTime(3)}**

Coherence Statement: **{{currentIdentity}}**
Aligned Action: **{{microAction}}**
Cue:** **{{executionCue}}**

Every 21 days, we'll reassess and either evolve or modify the action.

**Remember:** The **Reframe Protocol** is now available in your {{toolbarReference}} under "On-Demand Tools" for when triggers arise.

Starting tomorrow — full sequence + your micro-action. You're now training identity, not just awareness.`
    },

    dailyPrompts: {
      firstDay: `{{greeting}}{{userName}}.

**Stage 3: Aligned Action Mode** — Day 1

Your daily action: **{{microAction}}**

${getRitualListForStage(3)}

**Total: ${getMorningRitualTime(3)}**

Ready to act without identity?`,

      standard: `{{greeting}}{{userName}}.

**Stage 3: Aligned Action Mode** — Day {{daysInStage}}
**Action:** {{microAction}} (Day {{identityDayInCycle}}/21)
**Adherence:** {{adherence}}%{{streakMessage}}

**Today's rituals:**
${getRitualListForStage(3)}

Ready to act without a story?`,

      allComplete: `All practices complete for today. ✓

Action: {{currentIdentity}}
Evidence: logged.

**Current status:**
- Day {{daysInStage}} of Stage 3
- Action Day {{identityDayInCycle}} of 21
- {{adherence}}% adherence

You're not chasing perfection — you're training consistency.`
    },

    unlock: {
      eligible: `**🔓 SYSTEM UPGRADE AVAILABLE**

You've proven consistency and transformation:
- {{adherence}}% adherence over 14+ days ✓
- +{{avgDelta}} average delta improvement ✓
- {{consecutiveDays}} day streak ✓

**Coherant Action installed.** You now act from awareness, not toward it.

Before we unlock **Stage 4: Flow Mode**, quick reflection:

**How has your relationship to reactive emotions shifted? Can you give me a specific example from the past two weeks?**

Take a moment to recall. Then type **"unlock"** when you're ready to advance.`,

      notYet: `**Stage 3 Progress Check**

Current status vs unlock criteria:
- Adherence: {{currentAdherence}}% (need 80%)
- Avg Delta: {{currentAvgDelta}} (need +0.5)
- Days: {{currentConsecutiveDays}} (need 14)

Keep acting from awareness. Keep the ritual consistent.`,

      confirmation: `**🎉 Stage 4 Unlocked: Flow Mode**

Your actions are becoming aligned. Now we train sustained attention on performance drivers.

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
4. Morning Aligned Action — 1 min

**Daily (scheduled):**
5. Flow Block — 60-90 mins

**Total: ${getMorningRitualTime(4)}**

**Remember:** **Thought Hygiene** is now available in your {{toolbarReference}} under "On-Demand Tools" — use it after Flow Blocks when your mind feels cluttered.

Your Flow Menu and Weekly Map are set. Time to train deep work as a neural skill.`
    },

    dailyPrompts: {
      standard: `{{greeting}}{{userName}}.

**Stage 4: Flow Mode** — Day {{daysInStage}}
**Morning Action:** {{microAction}} (Day {{identityDayInCycle}}/21)
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
      eligible: `**🔓 SYSTEM UPGRADE AVAILABLE**

You've proven consistency and transformation:
- {{adherence}}% adherence over 14+ days ✓
- +{{avgDelta}} average delta improvement ✓
- {{consecutiveDays}} day streak ✓

**Flow performance stabilized.** The mind is no longer the operator — it's the tool.

Before we unlock **Stage 5: Relational Coherence**, quick reflection:

**What happened to time during your Flow Blocks? Did mental chatter fade? Describe what focus felt like.**

Take a moment to recall. Then type **"unlock"** when you're ready to advance.`,

      notYet: `**Stage 4 Progress Check**

Current status vs unlock criteria:
- Adherence: {{currentAdherence}}% (need 80%)
- Avg Delta: {{currentAvgDelta}} (need +0.6)
- Days: {{currentConsecutiveDays}} (need 14)

Keep training the flow state.`,

      confirmation: `**🎉 Stage 5 Unlocked: Relational Coherence**

You can sustain attention in solitude. Now we train it in connection.

---

**NEW PRACTICE UNLOCKING:**

**Co-Regulation Practice** — 4 minutes training the social nervous system. You'll activate the ventral vagal complex (your social safety circuit) through heart-focused compassion exercises. This trains your nervous system to stay open and regulated in relational contexts — not just when you're alone.

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
7. 4 minutes

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
4. Morning Aligned Action — 1 min

**Daily:**
5. Flow Block — 60-90 mins (scheduled)

**Evening:**
6. Co-Regulation Practice — 4 mins (new)

**Total: ${getMorningRitualTime(5)}**

You're now training awareness in relationship, not just in solitude. This is where it gets integrated.`
    },

    dailyPrompts: {
      standard: `{{greeting}}{{userName}}.

**Stage 5: Relational Coherence** — Day {{daysInStage}}
**Morning Action:** {{microAction}} (Day {{identityDayInCycle}}/21)
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
      eligible: `**🔓 SYSTEM UPGRADE AVAILABLE**

You've proven consistency and transformation:
- {{adherence}}% adherence over 14+ days ✓
- +{{avgDelta}} average delta improvement ✓
- {{consecutiveDays}} day streak ✓

**Relational coherence stabilized.** You are now connected.

Before we unlock **Stage 6: Integration**, quick reflection:

**When did you notice feeling genuinely present with another person this week — not performing, not planning what to say, just... there?**

Take a moment to recall. Then type **"unlock"** when you're ready to advance.`,

      notYet: `**Stage 5 Progress Check**

Current status vs unlock criteria:
- Adherence: {{currentAdherence}}% (need 80%)
- Avg Delta: {{currentAvgDelta}} (need +0.7)
- Days: {{currentConsecutiveDays}} (need 14)

Keep training relational presence.`,

      confirmation: `**🎉 Stage 6 Unlocked: Integration**

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
- Morning Aligned Action (coherent action)
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
4. Morning Aligned Action — 1 min

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
**Morning Action:** {{microAction}} (Day {{identityDayInCycle}}/21)
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

You've installed the complete IOS and established a new STATE. Now we accelerate its evolution with advanced integration tools.

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
// WEEKLY CHECK-IN TEMPLATES (for ChatInterface)
// ============================================

export const weeklyCheckInTemplates = {
  // Domain questions asked during weekly check-in flow
  domainQuestions: {
    regulation: "**Regulation:** How easily could you calm yourself when stressed this week? (0 = couldn't at all, 5 = instantly)",
    awareness: "**Awareness:** How quickly did you notice when lost in thought? (0 = never noticed, 5 = immediately)",
    outlook: "**Outlook:** How open and positive did you feel toward life? (0 = closed/negative, 5 = open/positive)",
    attention: "**Attention:** How focused were you on what truly matters? (0 = scattered, 5 = laser-focused)"
  },
  
  // Stage-specific qualitative questions
  stageQuestions: {
    1: "How easily can you return to calm when stressed?",
    2: "Does awareness stay present during movement?",
    3: "Is your aligned action feeling more automatic?",
    4: "Can you drop into focused flow reliably?",
    5: "Do you stay regulated in difficult conversations?",
    6: "Is awareness stable across all life contexts?",
    7: "Does awareness feel like your natural baseline?"
  } as { [key: number]: string }
};

// ============================================
// INTRO FLOW TEMPLATES (for first-time onboarding)
// ============================================

export const introFlowTemplates = {
  // Quick reply button configurations for each intro step
  quickReplies: {
    0: { text: "Yes, let's learn the rituals", buttonLabel: "Yes, let's go" },
    1: { text: "Got it, makes sense. What's next?", buttonLabel: "Got it, next ritual" },
    2: { text: "Makes sense, I'm ready", buttonLabel: "Got it, I'm ready" },
    3: null,
    4: null
  } as { [key: number]: { text: string; buttonLabel: string } | null },
  
  // Redirect messages to get user back on track after answering their question
  redirectMessages: {
    0: `---

Now, back to your rituals. Ready to learn them?`,
    1: `---

Back to the walkthrough. Make sense so far? Ready for the next ritual?`,
    2: `---

Okay, back to wrapping up. Ready to get started?`
  } as { [key: number]: string }
};

// Helper function to get intro redirect message
export function getIntroRedirectMessage(currentStep: number): string {
  return introFlowTemplates.redirectMessages[currentStep] || '';
}

// ============================================
// STAGE 7 CONVERSATION TEMPLATES
// ============================================

export const stage7ConversationTemplates = {
  intro: `**System Integration Complete.** 🎯

You've done something rare. Stage 6 isn't just a milestone — it's proof that awareness has become your operating system. Most people never get here.

There's one more stage. **Stage 7: Accelerated Expansion.**

But I need to be direct with you: Stage 7 is fundamentally different from everything before it. It's not a daily practice. It's not something you do alone. It's an intensive, in-person protocol.

Would you like to learn more about Stage 7, or would you prefer to continue deepening Stage 6 as your daily practice?`,

  explanation: `**Stage 7: The Beyond Protocol**

*The end of seeking starts here.*

Everything you've done in Stages 1-6 has been preparation — building the neural foundation, stabilizing awareness, proving identity through action. Stage 7 is where that foundation meets something more powerful.

**Beyond is a 6-month protocol for complete neural, emotional, and existential reprogramming.**

It includes:
• **Supervised psychedelic experience** — working with 5-MeO in a held, supported container
• **Neurotech** — brain entrainment and neurofeedback to normalize beneficial brain-wave states
• **Molecule protocols** — strategic use of nootropics and supplements
• **Continued daily practice** — the IOS remains your foundation
• **Weekly 1:1 support** — you'll never walk alone

This isn't a retreat. It's not coaching. It's not a one-off ceremony.

It's designed to dissolve what you're not — so who you truly are can finally lead.

**This path is not for everyone.** And that's okay. Stage 6 is a complete system. Many people practice it for life.

But if something in you is ready to go beyond the stories, the strategies, and the seeking... I have two questions for you.`,

  question1: `**Question 1:**

Stage 7 includes the use of supervised psychedelics, neuro-tech, nootropics, and supplements.

Are you open to this?`,

  question2: `**Question 2:**

Why is now the right time to consider this in your life?

(Take a moment — there's no right answer, just your honest reflection.)`,

  applicationRoute: `Thank you for sharing that.

Based on what you've described, it sounds like you may be ready for this next step.

**The Beyond Protocol** is by application only. Only a limited number of participants are accepted. After you apply, you'll be contacted for a discovery call if you're a fit.

The application takes about 10 minutes.`,

  stage6Continuation: `That's completely valid.

Stage 6 is a complete operating system. The daily practices you've built — the breathing, the awareness, the identity work, the flow states, the relational coherence, the nightly integration — this is a way of life.

Many people stay here permanently. Not because they're "stuck," but because it's enough.

You can always revisit Stage 7 later. Just ask.

For now, continue showing up. The system is installed. You are the operator.`,

  notOpenRoute: `I appreciate your honesty.

Stage 7 isn't the right fit for everyone, and that's completely okay. The protocols involved require full openness to the modalities — without that, it wouldn't serve you.

Stage 6 is a complete system. The practices you've built are powerful on their own. Many people stay at this level permanently — not because they're stuck, but because it's enough.

Continue showing up. The IOS is installed. You are the operator.

If anything changes in the future, you can always revisit this conversation.`,

  applicationUrl: 'https://nicholaskusmich.typeform.com/beyond'
};

// Stage 7 trigger patterns for detection
export const stage7TriggerPatterns = [
  'stage 7',
  'stage seven',
  'accelerated expansion',
  'beyond protocol',
  'what comes after stage 6',
  "what's after stage 6",
  'whats after stage 6',
  'what is stage 7',
  'tell me about stage 7',
  'next level after stage 6',
  'final stage',
  'apply for stage 7'
];

// Helper function to detect Stage 7 questions
export function isAskingAboutStage7(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return stage7TriggerPatterns.some(pattern => lowerMessage.includes(pattern));
}

// ============================================
// ON-DEMAND TOOL TEMPLATES
// ============================================

export const toolTemplates = {
  decentering: {
    unlockIntro: `**Decentering Practice** — Now Available

A short (2–5 minute) guided practice that helps you relate differently to thoughts, emotions, and roles — without trying to change or fix them.

Use it when:
- An emotion feels fused with identity ("I am anxious")
- You feel stuck in a role (the responsible one, the fixer, the failure)
- Thoughts feel unquestionable or automatic
- You're caught in a mental loop and need perspective

Access it via {{toolbarReference}} under "On-Demand Tools."`,

    startPrompt: `Let's run a **Decentering Practice**.

Take one slow breath. Notice what's happening in your body right now.

What's most present in your mind — a thought, feeling, story, or role?`
  },

  worry_loop_dissolver: {
    unlockIntro: `**Worry Loop Dissolver** — Now Available

A structured 3–5 minute protocol to collapse worry loops (rumination, catastrophizing, anticipatory anxiety) so thinking becomes clear again.

Use it when:
- The same worry keeps replaying
- The mind is projecting worst-case future outcomes
- You're stuck analyzing what something "means" or what someone "thinks"
- The nervous system feels on alert without a clear, present threat
- You can't stop mentally rehearsing scenarios

Access it via {{toolbarReference}} under "On-Demand Tools."`,

    startPrompt: `Let's run the **Worry Loop Dissolver**.

First, let's identify the signal. What sensation or emotion is present in your body right now?

Don't analyze — just notice and name it.`
  },

  meta_reflection: {
    unlockIntro: `**Meta-Reflection** — Now Available

A 10–15 minute weekly session to observe how perception formed and to capture a usable kernel in the format: Signal → Interpretation → Action.

Best used:
- Weekly (I'll prompt you on Sundays, or run it on your own day)
- After a significant event or emotional spike
- When the same pattern keeps repeating across the week
- When you want to convert experience into a clear next step

Access it via {{toolbarReference}} under "On-Demand Tools."`,

    startPrompt: `Let's run your **Meta-Reflection**.

Sit quietly. Breathe slowly. Say to yourself: "I'm not reviewing life to judge it — I'm studying how awareness moved through it."

Ready? Select one moment from this week that had emotional charge.`
  },

  reframe: {
    unlockIntro: `**Reframe Protocol** — Now Available

A ~2-minute interpretation audit that separates what actually happened from what the mind added, then selects a clean next step.

Use it when:
- A reaction feels disproportionate to the event
- Meaning-making shows up ("this means…", "they always…", "I'll never…")
- Blame, mind-reading, catastrophizing, or certainty creeps in
- You want clarity instead of rumination

Access it via {{toolbarReference}} under "On-Demand Tools."`,

    startPrompt: `Let's run the **Reframe Protocol**.

First — what's the Signal? What verifiable sensation or emotion is present in your body right now?

Don't interpret yet — just notice and name it.`
  },

  thought_hygiene: {
    unlockIntro: `**Thought Hygiene** — Now Available

A 2–3 minute attention reset to reduce cognitive load by clearing active mental loops.

Use it when:
- After a Flow Block (recommended)
- Attention feels scattered or overloaded
- After high-stimulation inputs (meetings, calls, messages, media)
- Background thoughts are consuming bandwidth
- Focus feels unavailable despite effort

Access it via {{toolbarReference}} under "On-Demand Tools."`,

    startPrompt: `Time to clear your mental cache.

What's still running in the background of your mind — taking up bandwidth? Tasks, conversations, worries, whatever's looping.

Don't overthink it. Don't dig. Just dump what's floating to the surface.`
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
// STREAK MESSAGES (Updated for Grace Period)
// ============================================

export function getStreakMessage(consecutiveDays: number, adherence: number): string {
  if (consecutiveDays >= 14) {
    return `\n\n🔥 **${consecutiveDays} day streak.** Your nervous system is rewiring. This is where real change happens.`;
  }
  if (consecutiveDays >= 7) {
    return `\n\n🔥 **${consecutiveDays} day streak.** Keep going.`;
  }
  if (consecutiveDays >= 3) {
    return `\n\n🔥 **${consecutiveDays} days consecutive.** Building momentum.`;
  }
  if (consecutiveDays === 0 && adherence > 0) {
    return `\n\nStreak paused. One day grace — get back on track today.`;
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
  weeklyCheckIn: weeklyCheckInTemplates,
  introFlow: introFlowTemplates,
  stage7Conversation: stage7ConversationTemplates,
  tools: toolTemplates,
  foundations: foundationTemplates,
  getStreakMessage,
  getIntroRedirectMessage,
  isAskingAboutStage7
};

# Sprint 3 — Removed tutorial blocks from `lib/templates/templateLibrary.ts`

Archived during Sprint 3 Phase 3, Unit 2 (NOS Glide tutorial removal).
Source: `lib/templates/templateLibrary.ts` (Stage 1 ritualIntro block).

The Day 1 tutorial used to walk new users through a NOS Glide deep-dive as
introStep 3. That step is removed and the remaining steps are re-indexed to
produce a 5-step flow (introStep 0–4). The full NOS Glide tool stays wired
into the right-hand toolbar; only the **tutorial mention** of it is removed.

Sprint 3.5 will do the full system removal. Until then this content is
preserved here in case any of it is wanted on a Stage 2+ unlock or settings
page.

---

## Removed `nosGlideWalkthrough` template

(Was at `lib/templates/templateLibrary.ts:365–379`.)

```ts
nosGlideWalkthrough: `Good. Let me give you a quick overview of the **NOS Glide (Evening Wind-Down)**.

Your NOS (nervous system) doesn't respond to "relax" — it responds to **transitions**. The Glide is a 3-step physiological sequence you can use before bed:

**1. Breath Descent** (~60s) — Your familiar 4-in, 6-out rhythm, but with a different intention. Morning breathing is calibration. This is descent. You're telling your system: the day is done.

**2. Progressive Release** (~60-90s) — Tense and release muscle groups (legs → arms → jaw → abdomen). Stress gets stored as tension. This finishes the activation cycle.

**3. Earned Stillness** (~60-120s) — Do nothing. Your system has been sequenced down. The stillness isn't forced — it's earned.

Total: 5-10 minutes. Use it whenever you need it — not every night, just when your system is running hot. If you fall asleep during it, that's success.

You can ask me to guide you through it anytime, or run it on your own once you know the steps.

Ready for your full Stage 1 overview?`,
```

---

## Original `onDemandToolsIntro` (replaced, not removed)

(Was at `lib/templates/templateLibrary.ts:355–363`.)

```ts
onDemandToolsIntro: `Those two rituals are your morning non-negotiables.

But you also have two **on-demand tools** available from Day 1. These aren't daily rituals — they're tools you reach for when you need them.

**Decentering Practice** — When you notice you're stuck in a thought loop, identified with a role, or fused with an emotion ("I AM anxious" instead of "I notice anxiety"), this practice helps you create space between you and the experience. It's a short conversational exercise — just ask me to run it whenever you need it.

**NOS Glide (Evening Wind-Down)** — An evening wind-down tool for when your nervous system won't shut off at night. Racing mind, restless body, "wired but tired." It sequences your system from activation into rest. I'll walk you through it next.

Make sense so far?`,
```

The replacement (live) version drops the NOS Glide line, mentions the Worry
Loop Dissolver alongside Decentering, and removes the "I'll walk you through
it next" forward-reference.

---

## Original `introFlowTemplates.quickReplies`

(Was at `lib/templates/templateLibrary.ts:1362–1370`.)

```ts
quickReplies: {
  0: { text: "Yes, let's learn the rituals", buttonLabel: "Yes, let's go" },
  1: { text: "Got it, makes sense. What's next?", buttonLabel: "Got it, next ritual" },
  2: { text: "Makes sense, I'm ready", buttonLabel: "Got it, tell me about the tools" },
  3: { text: "Makes sense. Show me the NOS Glide", buttonLabel: "Got it, show me the NOS Glide" },
  4: { text: "Ready for my Stage 1 overview", buttonLabel: "Ready, let's go" },
  5: null,
  6: null
}
```

Re-indexed (live) version removes the NOS Glide step at index 3, shifts the
"Ready, let's go" button down to index 3, and ends at 4 (null).

---

## Original `introFlowTemplates.redirectMessages`

(Was at `lib/templates/templateLibrary.ts:1373–1389`.)

```ts
redirectMessages: {
  0: `---\n\nNow, back to your rituals. Ready to learn them?`,
  1: `---\n\nBack to the walkthrough. Make sense so far? Ready for the next ritual?`,
  2: `---\n\nBack to the intro. Ready to hear about your on-demand tools?`,
  3: `---\n\nBack to the NOS Glide (Evening Wind-Down) overview. Ready to continue?`,
  4: `---\n\nOkay, back to wrapping up. Ready to get started?`
}
```

Re-indexed (live) version removes the NOS Glide entry at 3 and shifts the
wrapUp redirect down to 3.

# Foundation Protocols — removed from Day 1 tutorial

Archived during Sprint 3 Phase 3, Unit 3 (wrapUp + Foundation Protocols rewrite).
Source: `components/ChatInterface.tsx` — was inlined twice (typed-affirmative
handler around L5042–5074 and button handler around L4386–4418).

## Why removed

Per the Sprint 3 audit (Section C and the Phase 1.5 trace), the Day 1 tutorial
had a 7th step rendering this Foundation Protocols message. It overloaded
new users with sleep / movement detail before they had even completed their
first ritual. The new closing flow (Unit 3) ends after a single closing
message and a button to launch the user's first Resonance Breathing.

This content remains valuable — it's likely to surface elsewhere later
(Settings page, Day 2/Day 3 nudges, or Stage 1 maturity content). Preserved
verbatim below.

## Removed content

```text
One more thing before you start — and this is just as important as the rituals.

---

**THE FOUNDATION PROTOCOLS**

Your rituals train the nervous system. But they run on top of two foundations that determine how fast you rewire:

**🛏️ Sleep Optimization**
This is when your neural learning consolidates. Non-negotiable requirements:
- Same sleep/wake time daily (±30 mins)
- No screens 60 mins before bed
- No food 2 hours before bed
- Cool room (65°F / 18°C), total darkness
- Wake and get natural light immediately (or 10k LUX light)
- Optional: 2-min Resonance Breathing in bed before sleep

**🏃 Movement Practice (5x/week)**
Your nervous system needs physical load to clear stress hormones and boost BDNF:
- "Break a Sweat" — 20+ mins daily (bike, walk, lift, row — whatever moves you)
- Mix aerobic and strength
- Optional: 1-2x cold/heat exposure (cold plunge 50-59°F, 2-5 min OR sauna 20-25 min)

These aren't fitness goals. They're **neural regulation infrastructure**. The rituals build the signal — sleep and movement maintain the hardware it runs on.

I'll check in on these periodically. For now, just know: if your rituals feel like they're not landing, sleep and movement are the first place to look.

Ready to start your first practice?
```

## Where it used to fire

Originally was the final tutorial step: user typed any affirmative ("yes",
"ok", etc.) at `introStep === 5` (post-Unit-2: `introStep === 4`), and this
message was posted along with the `ritual_intro_completed = true` write.
After Unit 3, the equivalent moment is when the user clicks the new
"Start my first Resonance Breathing" button, which opens the breathing
modal directly instead of showing this content.

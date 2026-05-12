// lib/emails/lapsed-templates.ts
// Active-lapse retention sequence for Stage 1 users who stepped away
// 2/3/5/7 days ago. Distinct from nurture-templates.ts (post-completion
// sequence) and from existing reengagement_early/mid (14+ day deep lapse).

import { baseWrapper, ctaButton, divider } from './_shared';

interface LapsedEmailData {
  firstName: string | null;
  ctaUrl: string;          // always https://www.unbecoming.app/chat for v1
  unsubscribeUrl: string;
}

function preheader(text: string): string {
  return `<span style="display:none;font-size:1px;color:#0a0a0a;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${text}</span>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// LAPSED DAY 2 — Two days. Nothing's broken.
// Anchor: last_visit between 1.5 and 2.5 days ago.
// Angle: low-friction, soft. No shame.
// ─────────────────────────────────────────────────────────────────────────────
export function lapsedDay2Email(data: LapsedEmailData): { subject: string; html: string } {
  const name = data.firstName ? `${data.firstName},` : 'Hey,';

  const content = `
    ${preheader("Your progress is saved. Pick up today.")}

    <h1 style="margin:0 0 20px;font-size:24px;font-weight:700;color:#fff;line-height:1.2;">${name} two days off.</h1>

    <p style="margin:0 0 20px;font-size:15px;color:#ccc;line-height:1.7;">Two days away. Your baseline diagnostic is saved, your practice history is intact, and Stage 1 doesn't expire.</p>

    <p style="margin:0 0 20px;font-size:15px;color:#888;line-height:1.7;">There's no streak to "restart" — that's not how this works. Just do today's 8 minutes when you're back.</p>

    <div style="background:#111;border:1px solid #1e1e1e;border-radius:12px;padding:20px 24px;margin:0 0 24px;">
      <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#ff9e19;letter-spacing:0.08em;text-transform:uppercase;">Stage 1 — Neural Priming</p>
      <p style="margin:0;font-size:13px;color:#888;line-height:1.7;">🫁 Resonance Breathing — 5 min<br/>👁 Awareness Rep — 3 min<br/>Total: 8 minutes</p>
    </div>

    ${ctaButton('Open The Stack →', data.ctaUrl)}

    ${divider()}

    <p style="margin:0;font-size:12px;color:#555;line-height:1.6;">Habit-building isn't a streak. It's mostly returning.</p>
  `;

  return {
    subject: "Two days. Nothing's broken.",
    html: baseWrapper(content, data.unsubscribeUrl),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// LAPSED DAY 3 — Back to the rep.
// Anchor: last_visit between 2.5 and 3.5 days ago.
// Angle: practical reminder. Name the practice. Why it matters together.
// ─────────────────────────────────────────────────────────────────────────────
export function lapsedDay3Email(data: LapsedEmailData): { subject: string; html: string } {
  const name = data.firstName ? `${data.firstName},` : 'Hey,';

  const content = `
    ${preheader("Three days. The pairing is 8 minutes.")}

    <h1 style="margin:0 0 20px;font-size:24px;font-weight:700;color:#fff;line-height:1.2;">${name} three days.</h1>

    <p style="margin:0 0 20px;font-size:15px;color:#ccc;line-height:1.7;">Three days. The vagal tone gains from Stage 1 don't disappear in 72 hours — but they don't deepen either. The nervous system needs repetition to encode.</p>

    <p style="margin:0 0 20px;font-size:15px;color:#888;line-height:1.7;">The rep is both practices together — Resonance Breathing primes the vagal state, Awareness Rep trains noticing within that state. Done together, 8 minutes. Done apart, the system is incomplete.</p>

    <div style="background:#111;border:1px solid #1e1e1e;border-radius:12px;padding:20px 24px;margin:0 0 24px;">
      <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#ff9e19;letter-spacing:0.08em;text-transform:uppercase;">Stage 1 — Neural Priming</p>
      <p style="margin:0;font-size:13px;color:#888;line-height:1.7;">🫁 Resonance Breathing — 5 min (4 in, 6 out)<br/>👁 Awareness Rep — 3 min<br/>Total: 8 minutes</p>
    </div>

    ${ctaButton('Open The Stack →', data.ctaUrl)}

    ${divider()}

    <p style="margin:0;font-size:12px;color:#555;line-height:1.6;">8 minutes is what compounds. Stage 1 is the foundation everything else sits on.</p>
  `;

  return {
    subject: "Back to the rep.",
    html: baseWrapper(content, data.unsubscribeUrl),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// LAPSED DAY 5 — What Stage 1 actually does.
// Anchor: last_visit between 4.5 and 5.5 days ago.
// Angle: value re-anchor. Stack progression framing, not guilt.
// ─────────────────────────────────────────────────────────────────────────────
export function lapsedDay5Email(data: LapsedEmailData): { subject: string; html: string } {
  const name = data.firstName ? `${data.firstName},` : 'Hey,';

  const content = `
    ${preheader("You won't feel different. That's the point.")}

    <h1 style="margin:0 0 20px;font-size:24px;font-weight:700;color:#fff;line-height:1.2;">${name} five days.</h1>

    <p style="margin:0 0 20px;font-size:15px;color:#888;line-height:1.7;">Five days. Worth a reminder of what this is.</p>

    <p style="margin:0 0 20px;font-size:15px;color:#ccc;line-height:1.7;">Stage 1 doesn't feel like much — that's the point. You won't feel "different." You're installing a baseline: a vagal tone reference state your nervous system can return to, and a noticing-muscle that gets quietly stronger every rep.</p>

    <p style="margin:0 0 20px;font-size:15px;color:#ccc;line-height:1.7;">The dramatic shifts happen later. But none of them work without Stage 1 holding.</p>

    <div style="border-top:1px solid #1a1a1a;margin:28px 0;padding-top:28px;">
      <p style="margin:0 0 12px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#ff9e19;">What's ahead</p>
      <table cellpadding="0" cellspacing="0" width="100%">
        ${['Stage 2: Awareness moves into the body',
           'Stage 3: Patterns get caught before they run',
           'Stage 4: Attention becomes trainable',
           'Stages 5–7: Relational, integration, expansion',
        ].map(s => `<tr><td style="padding:5px 0;font-size:13px;color:#888;line-height:1.6;"><span style="color:#ff9e19;margin-right:8px;">✦</span>${s}</td></tr>`).join('')}
      </table>
    </div>

    <p style="margin:0 0 8px;font-size:15px;color:#ccc;line-height:1.7;">8 minutes today keeps the foundation alive.</p>

    ${ctaButton('Open The Stack →', data.ctaUrl)}

    ${divider()}

    <p style="margin:0;font-size:12px;color:#555;line-height:1.6;">The baseline doesn't fade fast. It also doesn't deepen on its own.</p>
  `;

  return {
    subject: "What Stage 1 actually does.",
    html: baseWrapper(content, data.unsubscribeUrl),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// LAPSED DAY 7 — A week. No reset.
// Anchor: last_visit between 6.5 and 7.5 days ago.
// Angle: directness shift. The Stack picks up where you left off.
// ─────────────────────────────────────────────────────────────────────────────
export function lapsedDay7Email(data: LapsedEmailData): { subject: string; html: string } {
  const name = data.firstName ? `${data.firstName},` : 'Hey,';

  const content = `
    ${preheader("The Stack picks up where you left off.")}

    <h1 style="margin:0 0 20px;font-size:24px;font-weight:700;color:#fff;line-height:1.2;">${name} a week.</h1>

    <p style="margin:0 0 20px;font-size:15px;color:#ccc;line-height:1.7;">Seven days. The lapse window where most people decide it didn't work — or that they'll restart eventually.</p>

    <p style="margin:0 0 20px;font-size:15px;color:#888;line-height:1.7;">Neither matches how the system actually works.</p>

    <p style="margin:0 0 20px;font-size:15px;color:#ccc;line-height:1.7;">The Stack doesn't reset. Your baseline diagnostic, your practice history, your domain deltas — all saved. Stage 1 isn't a streak you broke. It's an installation you paused.</p>

    <div style="background:#111;border:1px solid #1e1e1e;border-radius:12px;padding:20px 24px;margin:0 0 24px;">
      <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#ff9e19;letter-spacing:0.08em;text-transform:uppercase;">When you return</p>
      <p style="margin:0;font-size:13px;color:#888;line-height:1.7;">— No retest.<br/>— No catch-up.<br/>— Just today's 8 minutes, no backlog.<br/>— Stage 1 picks up at your existing data.</p>
    </div>

    ${ctaButton('Resume Stage 1 →', data.ctaUrl)}

    ${divider()}

    <p style="margin:0;font-size:12px;color:#555;line-height:1.6;">8 minutes is what's being asked.</p>
  `;

  return {
    subject: "A week. No reset.",
    html: baseWrapper(content, data.unsubscribeUrl),
  };
}

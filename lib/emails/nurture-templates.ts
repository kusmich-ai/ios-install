// lib/emails/nurture-templates.ts
// Post-offer nurture sequence for Stage 1 completers who haven't upgraded

import { baseWrapper, ctaButton, divider } from './_shared';

interface NurtureEmailData {
  firstName: string | null;
  days: number;
  delta: number | null;
  upgradeUrl: string;
  unsubscribeUrl: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL 0 — Day 12: Pre-eligibility momentum
// Anchor: consecutive_days >= 12 AND unlock_eligible = false
// Goal: keep them going 2 more days. Sends to app, not /upgrade.
// ─────────────────────────────────────────────────────────────────────────────
export function day12Email(data: NurtureEmailData): { subject: string; html: string } {
  const name = data.firstName ? `${data.firstName},` : 'Hey,';
  const deltaLine = data.delta !== null
    ? `<p style="margin:0 0 20px;font-size:15px;color:#888;line-height:1.7;">Your domains have moved <span style="color:#ff9e19;font-weight:600;">+${data.delta}</span> from baseline. The system is responding.</p>`
    : '';

  const content = `
    <h1 style="margin:0 0 6px;font-size:24px;font-weight:700;color:#fff;line-height:1.2;">${name} 2 days away.</h1>
    <p style="margin:0 0 24px;font-size:13px;color:#ff9e19;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;">${data.days} days in · Stage 2 unlock approaching</p>

    <p style="margin:0 0 20px;font-size:15px;color:#ccc;line-height:1.7;">You're ${data.days} days in. Stage 2 unlock requires 14 days of consistent practice — you're 2 away.</p>

    ${deltaLine}

    <p style="margin:0 0 20px;font-size:15px;color:#888;line-height:1.7;">This is the window where most people stop. Not because they want to — but because the habit hasn't fully installed yet and something disrupts the rhythm.</p>

    <p style="margin:0 0 8px;font-size:15px;color:#fff;font-weight:500;line-height:1.7;">Two more days. Then Stage 2 unlocks and the system goes deeper.</p>

    ${ctaButton('Open The Stack →', data.upgradeUrl)}

    ${divider()}

    <p style="margin:0;font-size:12px;color:#555;line-height:1.6;">Resonance Breathing + Awareness Rep. 8 minutes. That's all that's needed today.</p>
  `;

  return {
    subject: "You're 2 days away.",
    html: baseWrapper(content, data.unsubscribeUrl),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL 1 — Eligibility reached: "You earned it."
// Anchor: stage_unlocked_at IS NOT NULL (just became eligible)
// Body mirrors the /upgrade hero. Sends to /upgrade with params.
// ─────────────────────────────────────────────────────────────────────────────
export function day14Email(data: NurtureEmailData): { subject: string; html: string } {
  const name = data.firstName ? `${data.firstName},` : 'Hey,';
  const deltaLine = data.delta !== null
    ? `<p style="margin:0 0 20px;font-size:15px;color:#888;line-height:1.7;">Your average domain delta is <span style="color:#ff9e19;font-weight:600;">+${data.delta}</span>. That's not a feeling — it's a measurement. Regulation, Awareness, Outlook, Attention — all of them moved.</p>`
    : '';

  const content = `
    <h1 style="margin:0 0 6px;font-size:24px;font-weight:700;color:#fff;line-height:1.2;">${name} you earned it.</h1>
    <p style="margin:0 0 24px;font-size:13px;color:#ff9e19;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;">${data.days} days · Stage 1 Complete</p>

    <p style="margin:0 0 20px;font-size:15px;color:#ccc;line-height:1.7;">The changes happening inside you right now aren't dramatic. They're not supposed to be.</p>

    <p style="margin:0 0 20px;font-size:15px;color:#fff;font-weight:500;line-height:1.7;">Rewiring doesn't announce itself. It just quietly becomes your new normal.</p>

    ${deltaLine}

    <p style="margin:0 0 20px;font-size:15px;color:#888;line-height:1.7;">You built the vagal tone baseline. The observer function came online. Your nervous system has evidence it can be directed. That proof is the prerequisite for everything that follows.</p>

    <p style="margin:0 0 8px;font-size:15px;color:#ccc;line-height:1.7;">Stage 2 adds 2 minutes. It moves awareness from your head into your body. The full Stack runs at 16 minutes a day — and it's waiting.</p>

    ${ctaButton('Continue the Installation →', data.upgradeUrl)}

    ${divider()}

    <p style="margin:0;font-size:12px;color:#555;line-height:1.6;">Annual access is $1.91/day. Less than a coffee — for the full installation.</p>
  `;

  return {
    subject: 'You earned it.',
    html: baseWrapper(content, data.unsubscribeUrl),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL 2 — 3 days after eligibility: "Still here?"
// Social proof focused. Softer tone.
// ─────────────────────────────────────────────────────────────────────────────
export function day17Email(data: NurtureEmailData): { subject: string; html: string } {
  const name = data.firstName ? `${data.firstName} —` : 'Hey —';

  const content = `
    <h1 style="margin:0 0 20px;font-size:24px;font-weight:700;color:#fff;line-height:1.2;">${name} still here.</h1>

    <p style="margin:0 0 20px;font-size:15px;color:#888;line-height:1.7;">Stage 2 is still unlocked and waiting. No pressure — but here's what happened when other people who were exactly where you are right now kept going.</p>

    <!-- Testimonial 1 -->
    <div style="background:#0d0d0d;border:1px solid #1e1e1e;border-radius:12px;padding:20px 24px;margin:0 0 12px;">
      <p style="margin:0 0 10px;font-size:14px;color:#ccc;line-height:1.7;font-style:italic;">"My business did $60k the first year. $90k the next. After this protocol, I'll cross the $300k mark. Something in the way I operate completely changed."</p>
      <p style="margin:0;font-size:12px;color:#ff9e19;font-weight:600;">Jesse — Entrepreneur · 5× revenue growth</p>
    </div>

    <!-- Testimonial 2 -->
    <div style="background:#0d0d0d;border:1px solid #1e1e1e;border-radius:12px;padding:20px 24px;margin:0 0 20px;">
      <p style="margin:0 0 10px;font-size:14px;color:#ccc;line-height:1.7;font-style:italic;">"Since doing this I have had 7 million dollar months in a row. I have never done that before. Something just started clicking."</p>
      <p style="margin:0;font-size:12px;color:#ff9e19;font-weight:600;">Brian — Business Owner · 7 consecutive $1M+ months</p>
    </div>

    <p style="margin:0 0 8px;font-size:15px;color:#888;line-height:1.7;">They didn't feel a dramatic shift at Stage 1 either. The compound effect is what happens in Stages 2–7.</p>

    ${ctaButton('See What Stage 2 Installs →', data.upgradeUrl)}

    ${divider()}

    <p style="margin:0;font-size:12px;color:#555;line-height:1.6;">Questions? Just reply to this email.</p>
  `;

  return {
    subject: 'Still here?',
    html: baseWrapper(content, data.unsubscribeUrl),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL 3 — 7 days after eligibility: "Stage 1 is complete. What happens now?"
// Decision point framing. Honest, not desperate.
// ─────────────────────────────────────────────────────────────────────────────
export function day21Email(data: NurtureEmailData): { subject: string; html: string } {
  const name = data.firstName ? data.firstName : 'Hey';

  const content = `
    <h1 style="margin:0 0 20px;font-size:24px;font-weight:700;color:#fff;line-height:1.2;">${name}, Stage 1 is complete.<br />What happens now?</h1>

    <p style="margin:0 0 20px;font-size:15px;color:#888;line-height:1.7;">Honest answer: nothing changes automatically. The system doesn't progress on its own.</p>

    <p style="margin:0 0 20px;font-size:15px;color:#ccc;line-height:1.7;">You can stay in Stage 1 indefinitely. The breathing practice and Awareness Rep are yours. Your nervous system baseline shifted. That's real and it's permanent.</p>

    <p style="margin:0 0 20px;font-size:15px;color:#ccc;line-height:1.7;">But here's what staying in Stage 1 means: you're maintaining, not building. The observer function is online — but without Stage 2, it doesn't go deeper into the body. Without Stage 3, the patterns you can now notice continue to run unchallenged. Without Stage 4, attention stays where it's always been.</p>

    <!-- What stages complete -->
    <div style="border-top:1px solid #1a1a1a;margin:28px 0;padding-top:28px;">
      <p style="margin:0 0 12px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#ff9e19;">What Stages 2–7 complete</p>
      <table cellpadding="0" cellspacing="0" width="100%">
        ${['Stage 2: Awareness moves into the body — Somatic Flow (2 min)',
           'Stage 3: Patterns get caught before they run — The Cue (2 min)',
           'Stage 4: Attention becomes trainable — Flow Block',
           'Stage 5: Regulation holds under relational pressure',
           'Stage 6: Insight converts to permanent trait-level change',
        ].map(s => `<tr><td style="padding:5px 0;font-size:13px;color:#888;line-height:1.6;"><span style="color:#ff9e19;margin-right:8px;">✦</span>${s}</td></tr>`).join('')}
      </table>
    </div>

    <p style="margin:0 0 8px;font-size:15px;color:#ccc;line-height:1.7;">The full Stack runs at 16 minutes a day. The foundation you built makes all of it possible. It's your call.</p>

    ${ctaButton('Continue the Installation →', data.upgradeUrl)}

    ${divider()}

    <p style="margin:0;font-size:12px;color:#555;line-height:1.6;">$1.91/day on annual. One month of therapy costs more than a year of this.</p>
  `;

  return {
    subject: 'Stage 1 is complete. What happens now?',
    html: baseWrapper(content, data.unsubscribeUrl),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// RE-ENGAGEMENT A — Days 1-6 dropoff
// Anchor: last_visit > 14 days ago + consecutive_days < 7 + not eligible + no sub
// Angle: "You started something. It's still here."
// Sends to app.
// ─────────────────────────────────────────────────────────────────────────────
export function reengagementEarlyEmail(data: NurtureEmailData): { subject: string; html: string } {
  const name = data.firstName ? `${data.firstName},` : 'Hey,';

  const content = `
    <h1 style="margin:0 0 20px;font-size:24px;font-weight:700;color:#fff;line-height:1.2;">${name} you started something.</h1>

    <p style="margin:0 0 20px;font-size:15px;color:#888;line-height:1.7;">It's still here. Exactly where you left it.</p>

    <p style="margin:0 0 20px;font-size:15px;color:#ccc;line-height:1.7;">The Stack doesn't expire. Your baseline diagnostic is saved. Your progress is saved. The practices are waiting.</p>

    <p style="margin:0 0 20px;font-size:15px;color:#888;line-height:1.7;">Starting is the hardest part — and you already did that. Coming back is just one morning practice. 8 minutes.</p>

    <div style="background:#111;border:1px solid #1e1e1e;border-radius:12px;padding:20px 24px;margin:0 0 24px;">
      <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#ff9e19;letter-spacing:0.08em;text-transform:uppercase;">Stage 1 — Neural Priming</p>
      <p style="margin:0;font-size:13px;color:#888;line-height:1.7;">🫁 Resonance Breathing — 5 min<br/>👁 Awareness Rep — 3 min<br/>Total: 8 minutes</p>
    </div>

    <p style="margin:0 0 8px;font-size:15px;color:#ccc;line-height:1.7;">No catch-up required. Just today's practice.</p>

    ${ctaButton('Open The Stack →', data.upgradeUrl)}

    ${divider()}

    <p style="margin:0;font-size:12px;color:#555;line-height:1.6;">The system is patient. It'll be here when you're ready.</p>
  `;

  return {
    subject: 'You started something.',
    html: baseWrapper(content, data.unsubscribeUrl),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// RE-ENGAGEMENT B — Days 7-13 dropoff
// Anchor: last_visit > 14 days ago + consecutive_days 7-13 + not eligible + no sub
// Angle: "You built X days. The gap doesn't erase it."
// Sends to app.
// ─────────────────────────────────────────────────────────────────────────────
export function reengagementMidEmail(data: NurtureEmailData): { subject: string; html: string } {
  const name = data.firstName ? `${data.firstName},` : 'Hey,';
  const daysText = data.days > 0 ? `${data.days} days` : 'real progress';
  const deltaLine = data.delta !== null
    ? `<p style="margin:0 0 20px;font-size:15px;color:#888;line-height:1.7;">Your domains moved <span style="color:#ff9e19;font-weight:600;">+${data.delta}</span> from baseline before you stopped. That delta doesn't reset. The nervous system kept what it learned.</p>`
    : '';

  const content = `
    <h1 style="margin:0 0 20px;font-size:24px;font-weight:700;color:#fff;line-height:1.2;">${name} ${daysText} of real work.</h1>

    <p style="margin:0 0 20px;font-size:15px;color:#888;line-height:1.7;">The gap doesn't erase it.</p>

    <p style="margin:0 0 20px;font-size:15px;color:#ccc;line-height:1.7;">You built a vagal tone baseline. You started training the observer function. That doesn't disappear when the streak breaks — the nervous system retains what it practiced.</p>

    ${deltaLine}

    <p style="margin:0 0 20px;font-size:15px;color:#888;line-height:1.7;">You were ${data.days > 0 ? `${14 - data.days} days` : 'close'} from Stage 2 eligibility. That's still true. The unlock criteria picks up from where your data sits — not from zero.</p>

    <div style="background:#ff9e19;border-radius:10px;padding:20px 24px;margin:0 0 24px;">
      <p style="margin:0;font-size:15px;color:#000;font-weight:600;line-height:1.6;">Coming back isn't starting over. It's continuing.</p>
    </div>

    ${ctaButton('Continue Where You Left Off →', data.upgradeUrl)}

    ${divider()}

    <p style="margin:0;font-size:12px;color:#555;line-height:1.6;">8 minutes today. That's all that's needed.</p>
  `;

  return {
    subject: `${data.days > 0 ? `${data.days} days` : 'Your progress'} didn't disappear.`,
    html: baseWrapper(content, data.unsubscribeUrl),
  };
}
// Anchor: last_visit >= 7 days ago (pure inactivity trigger).
// Sends to app, not /upgrade — let the product re-sell itself.
// ─────────────────────────────────────────────────────────────────────────────
export function day30Email(data: NurtureEmailData): { subject: string; html: string } {
  const name = data.firstName ? `${data.firstName},` : 'Hey,';

  const content = `
    <h1 style="margin:0 0 20px;font-size:24px;font-weight:700;color:#fff;line-height:1.2;">${name} your installation is paused.</h1>

    <p style="margin:0 0 20px;font-size:15px;color:#888;line-height:1.7;">No judgment — life happens. But here's what's true:</p>

    <div style="background:#ff9e19;border-radius:10px;padding:20px 24px;margin:0 0 24px;">
      <p style="margin:0;font-size:15px;color:#000;font-weight:600;line-height:1.6;">You built something real in ${data.days} days. The nervous system baseline you established doesn't expire. It's still here.</p>
    </div>

    <p style="margin:0 0 20px;font-size:15px;color:#888;line-height:1.7;">The Stage 2 unlock you earned is still active. Somatic Flow, The Cue, Flow Block, Co-Regulation, Nightly Debrief — all of it is waiting where you left it.</p>

    <p style="margin:0 0 8px;font-size:15px;color:#ccc;line-height:1.7;">Resuming from Stage 2 doesn't mean starting over. It means building on what's already installed.</p>

    ${ctaButton('Resume the Installation →', data.upgradeUrl)}

    ${divider()}

    <p style="margin:0;font-size:12px;color:#555;line-height:1.6;">The system is patient. It'll be here when you're ready.</p>
  `;

  return {
    subject: 'Your installation is paused.',
    html: baseWrapper(content, data.unsubscribeUrl),
  };
}

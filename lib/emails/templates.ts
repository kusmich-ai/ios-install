// lib/emails/templates.ts
// IOS System Installer - Email notification templates

const BRAND_COLOR = '#ff9e19';
const BG_COLOR = '#0a0a0a';
const TEXT_COLOR = '#e4e4e7';
const MUTED_COLOR = '#a1a1aa';

function emailWrapper(content: string, unsubscribeUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background-color:${BG_COLOR}; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${BG_COLOR}; padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">
          <!-- Logo -->
          <tr>
            <td style="padding-bottom:32px;">
              <span style="color:${BRAND_COLOR}; font-size:18px; font-weight:700; letter-spacing:1px;">IOS SYSTEM INSTALLER</span>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="color:${TEXT_COLOR}; font-size:15px; line-height:1.6;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding-top:40px; border-top:1px solid #27272a; margin-top:40px;">
              <p style="color:${MUTED_COLOR}; font-size:12px; line-height:1.5; margin:16px 0 0 0;">
                <a href="${unsubscribeUrl}" style="color:${MUTED_COLOR}; text-decoration:underline;">Unsubscribe</a> · 
                <a href="https://unbecoming.app" style="color:${MUTED_COLOR}; text-decoration:underline;">unbecoming.app</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function ctaButton(text: string, url: string): string {
  return `
    <table cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr>
        <td style="background-color:${BRAND_COLOR}; border-radius:8px; padding:12px 28px;">
          <a href="${url}" style="color:#000; font-size:14px; font-weight:600; text-decoration:none; display:inline-block;">${text}</a>
        </td>
      </tr>
    </table>`;
}

export function morningReminder(userName: string, stage: number, unsubscribeUrl: string): { subject: string; html: string } {
  const stageContent: Record<number, { rituals: string; time: string }> = {
    1: { rituals: 'Resonance Breathing + Awareness Rep', time: '7 minutes' },
    2: { rituals: 'Resonance Breathing + Somatic Flow + Awareness Rep', time: '10 minutes' },
    3: { rituals: 'Resonance Breathing + Somatic Flow + Awareness Rep + IOS Cue', time: '12 minutes' },
    4: { rituals: 'Morning stack + Flow Block', time: '75-90 minutes' },
    5: { rituals: 'Morning stack + Flow Block + Co-Regulation', time: '80-105 minutes' },
    6: { rituals: 'Full stack + Nightly Debrief', time: 'Your full daily rhythm' },
    7: { rituals: 'Your full IOS protocol', time: 'Your full daily rhythm' },
  };

  const content = stageContent[stage] || stageContent[1];

  return {
    subject: stage <= 2 ? '7 minutes. Two rituals.' : 'Your rituals are waiting.',
    html: emailWrapper(`
      <p style="margin:0 0 16px 0;">Morning${userName ? `, ${userName}` : ''}.</p>
      <p style="margin:0 0 16px 0;">Your rituals are waiting. ${content.rituals}. ${content.time} total.</p>
      <p style="margin:0 0 8px 0;">Your nervous system learns from repetition. Today's rep matters.</p>
      ${ctaButton('Open IOS', 'https://unbecoming.app/chat')}
    `, unsubscribeUrl)
  };
}

export function missedDay(userName: string, adherence: number, consecutiveMissed: number, unsubscribeUrl: string): { subject: string; html: string } {
  return {
    subject: consecutiveMissed === 1 
      ? 'You missed yesterday.' 
      : `${consecutiveMissed} days without practice.`,
    html: emailWrapper(`
      <p style="margin:0 0 16px 0;">${userName ? `${userName}, ` : ''}you missed ${consecutiveMissed === 1 ? 'yesterday' : `the last ${consecutiveMissed} days`}.</p>
      <p style="margin:0 0 16px 0;">Your adherence is at <strong style="color:${BRAND_COLOR};">${adherence}%</strong>.</p>
      <p style="margin:0 0 8px 0;">${consecutiveMissed === 1 
        ? "One day off is rest. Two is a pattern. Don't let it become three." 
        : "Your nervous system is losing the pattern. Every day without practice trains the old default."}</p>
      ${ctaButton('Do Your Rituals', 'https://unbecoming.app/chat')}
    `, unsubscribeUrl)
  };
}

export function threeDayAbsence(userName: string, daysAway: number, unsubscribeUrl: string): { subject: string; html: string } {
  return {
    subject: "Your nervous system is waiting.",
    html: emailWrapper(`
      <p style="margin:0 0 16px 0;">${userName ? `${userName}, ` : ''}it's been ${daysAway} days.</p>
      <p style="margin:0 0 16px 0;">The IOS doesn't judge absence. But it also doesn't install without repetition.</p>
      <p style="margin:0 0 8px 0;">7 minutes. That's all. Come back when you're ready — the system is waiting.</p>
      ${ctaButton('Come Back', 'https://unbecoming.app/chat')}
    `, unsubscribeUrl)
  };
}

export function weeklySummary(
  userName: string, 
  completedDays: number, 
  totalDays: number, 
  adherence: number,
  calmTrend: 'up' | 'down' | 'stable',
  insight: string,
  unsubscribeUrl: string
): { subject: string; html: string } {
  const trendText = calmTrend === 'up' ? 'trending up ↑' : calmTrend === 'down' ? 'trending down ↓' : 'holding steady →';
  
  return {
    subject: `Your week: ${completedDays}/${totalDays} days, calm ${trendText}`,
    html: emailWrapper(`
      <p style="margin:0 0 16px 0;">${userName ? `${userName}, ` : ''}here's your week.</p>
      <table cellpadding="0" cellspacing="0" style="margin:0 0 20px 0; width:100%;">
        <tr>
          <td style="padding:12px 16px; background:#18181b; border-radius:8px;">
            <p style="margin:0 0 8px 0; color:${MUTED_COLOR}; font-size:13px;">PRACTICE DAYS</p>
            <p style="margin:0; color:${BRAND_COLOR}; font-size:24px; font-weight:700;">${completedDays}/${totalDays}</p>
          </td>
          <td style="width:12px;"></td>
          <td style="padding:12px 16px; background:#18181b; border-radius:8px;">
            <p style="margin:0 0 8px 0; color:${MUTED_COLOR}; font-size:13px;">ADHERENCE</p>
            <p style="margin:0; color:${BRAND_COLOR}; font-size:24px; font-weight:700;">${adherence}%</p>
          </td>
          <td style="width:12px;"></td>
          <td style="padding:12px 16px; background:#18181b; border-radius:8px;">
            <p style="margin:0 0 8px 0; color:${MUTED_COLOR}; font-size:13px;">CALM</p>
            <p style="margin:0; color:${BRAND_COLOR}; font-size:24px; font-weight:700;">${trendText}</p>
          </td>
        </tr>
      </table>
      <p style="margin:0 0 16px 0;">${insight}</p>
      <p style="margin:0 0 8px 0;">Your weekly check-in is ready.</p>
      ${ctaButton('Do Weekly Check-In', 'https://unbecoming.app/chat')}
    `, unsubscribeUrl)
  };
}

export function milestoneAlert(userName: string, milestoneTitle: string, milestoneMessage: string, unsubscribeUrl: string): { subject: string; html: string } {
  return {
    subject: `🔓 ${milestoneTitle}`,
    html: emailWrapper(`
      <p style="margin:0 0 16px 0;">${userName ? `${userName}, ` : ''}milestone unlocked.</p>
      <div style="padding:16px 20px; background:#18181b; border-left:3px solid ${BRAND_COLOR}; border-radius:0 8px 8px 0; margin:0 0 20px 0;">
        <p style="margin:0; color:${TEXT_COLOR}; font-size:15px;">${milestoneMessage}</p>
      </div>
      ${ctaButton('Continue', 'https://unbecoming.app/chat')}
    `, unsubscribeUrl)
  };
}

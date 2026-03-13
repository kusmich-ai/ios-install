// app/api/cron/nurture-emails/route.ts
// Daily cron — finds Stage 1 non-converters and sends nurture emails
// Schedule: daily at 9:00 AM UTC (see vercel.json)
//
// EMAIL SEQUENCE — all timing anchored to stage_unlocked_at (not consecutive_days):
//
//  nurture_day12  — pre-eligibility momentum email
//                   Anchor: consecutive_days >= 12, unlock_eligible = FALSE
//                   Sends to: app (not /upgrade — they're not eligible yet)
//
//  nurture_email1 — first offer, same day eligibility is reached
//                   Anchor: stage_unlocked_at IS NOT NULL (just became eligible)
//                   Sends to: /upgrade with params
//
//  nurture_email2 — social proof nudge, 3 days after eligibility
//                   Anchor: stage_unlocked_at <= 3 days ago
//                   Sends to: /upgrade with params
//
//  nurture_email3 — decision point, 7 days after eligibility
//                   Anchor: stage_unlocked_at <= 7 days ago
//                   Sends to: /upgrade with params
//
//  nurture_day30  — cold re-engagement, pure inactivity trigger
//                   Anchor: last_visit <= 7 days ago (no day count anchor)
//                   Sends to: app (let the product re-sell itself)

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import {
  day12Email,
  day14Email,
  day17Email,
  day21Email,
  day30Email,
} from '@/lib/emails/nurture-templates';

export const dynamic = 'force-dynamic';

const resend = new Resend(process.env.RESEND_API_KEY);

// Service-role client — needed to read auth.users for email + name
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://unbecoming.app';

// ─────────────────────────────────────────────────────────────────────────────
// Helper — fetch user_ids who already received a given email type
// Supabase JS client doesn't support subqueries in .not(), so we do two steps:
// 1. fetch already-sent ids, 2. exclude them in the main query
// ─────────────────────────────────────────────────────────────────────────────
async function getAlreadySentIds(
  supabase: ReturnType<typeof getAdminClient>,
  emailType: string
): Promise<string[]> {
  const { data } = await supabase
    .from('email_log')
    .select('user_id')
    .eq('email_type', emailType);
  return (data || []).map((r: { user_id: string }) => r.user_id);
}

// ─────────────────────────────────────────────────────────────────────────────
// Eligibility queries
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Day 12 — pre-eligibility momentum email.
 * Anchor: consecutive_days >= 12 AND unlock_eligible = false.
 * Goal: keep them going 2 more days. Sends to app, not /upgrade.
 */
async function getDay12Candidates(supabase: ReturnType<typeof getAdminClient>) {
  const sentIds = await getAlreadySentIds(supabase, 'nurture_day12');

  let query = supabase
    .from('user_progress')
    .select('user_id, consecutive_days, latest_avg_delta')
    .eq('current_stage', 1)
    .eq('unlock_eligible', false)
    .eq('has_active_subscription', false)
    .gte('consecutive_days', 12);

  if (sentIds.length > 0) {
    query = query.not('user_id', 'in', `(${sentIds.map(id => `"${id}"`).join(',')})`);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Day12 query failed: ${error.message}`);
  return data || [];
}

/**
 * Email 1 — first offer, fires when eligibility is first reached.
 * Anchor: stage_unlocked_at IS NOT NULL.
 */
async function getEmail1Candidates(supabase: ReturnType<typeof getAdminClient>) {
  const sentIds = await getAlreadySentIds(supabase, 'nurture_email1');

  let query = supabase
    .from('user_progress')
    .select('user_id, consecutive_days, latest_avg_delta, stage_unlocked_at')
    .eq('current_stage', 1)
    .eq('unlock_eligible', true)
    .eq('has_active_subscription', false)
    .not('stage_unlocked_at', 'is', null);

  if (sentIds.length > 0) {
    query = query.not('user_id', 'in', `(${sentIds.map(id => `"${id}"`).join(',')})`);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Email1 query failed: ${error.message}`);
  return data || [];
}

/**
 * Email 2 — social proof, 3+ days after eligibility reached.
 * Anchor: stage_unlocked_at <= 3 days ago.
 */
async function getEmail2Candidates(supabase: ReturnType<typeof getAdminClient>) {
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
  const sentIds = await getAlreadySentIds(supabase, 'nurture_email2');

  let query = supabase
    .from('user_progress')
    .select('user_id, consecutive_days, latest_avg_delta, stage_unlocked_at')
    .eq('current_stage', 1)
    .eq('unlock_eligible', true)
    .eq('has_active_subscription', false)
    .not('stage_unlocked_at', 'is', null)
    .lte('stage_unlocked_at', threeDaysAgo);

  if (sentIds.length > 0) {
    query = query.not('user_id', 'in', `(${sentIds.map(id => `"${id}"`).join(',')})`);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Email2 query failed: ${error.message}`);
  return data || [];
}

/**
 * Email 3 — decision point, 7+ days after eligibility reached.
 * Anchor: stage_unlocked_at <= 7 days ago.
 */
async function getEmail3Candidates(supabase: ReturnType<typeof getAdminClient>) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const sentIds = await getAlreadySentIds(supabase, 'nurture_email3');

  let query = supabase
    .from('user_progress')
    .select('user_id, consecutive_days, latest_avg_delta, stage_unlocked_at')
    .eq('current_stage', 1)
    .eq('unlock_eligible', true)
    .eq('has_active_subscription', false)
    .not('stage_unlocked_at', 'is', null)
    .lte('stage_unlocked_at', sevenDaysAgo);

  if (sentIds.length > 0) {
    query = query.not('user_id', 'in', `(${sentIds.map(id => `"${id}"`).join(',')})`);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Email3 query failed: ${error.message}`);
  return data || [];
}

/**
 * Day 30 cold re-engagement — pure inactivity trigger.
 * Anchor: last_visit <= 7 days ago.
 * Sends to app, not /upgrade.
 */
async function getDay30Candidates(supabase: ReturnType<typeof getAdminClient>) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const sentIds = await getAlreadySentIds(supabase, 'nurture_day30');

  let query = supabase
    .from('user_progress')
    .select('user_id, consecutive_days, latest_avg_delta')
    .eq('current_stage', 1)
    .eq('unlock_eligible', true)
    .eq('has_active_subscription', false)
    .lte('last_visit', sevenDaysAgo);

  if (sentIds.length > 0) {
    query = query.not('user_id', 'in', `(${sentIds.map(id => `"${id}"`).join(',')})`);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Day30 query failed: ${error.message}`);
  return data || [];
}

// ─────────────────────────────────────────────────────────────────────────────
// Fetch user email + first name from auth.users
// ─────────────────────────────────────────────────────────────────────────────
async function getUserAuthData(
  supabase: ReturnType<typeof getAdminClient>,
  userId: string
): Promise<{ email: string; firstName: string | null } | null> {
  const { data, error } = await supabase.auth.admin.getUserById(userId);
  if (error || !data?.user?.email) return null;

  const firstName =
    data.user.user_metadata?.first_name ||
    data.user.user_metadata?.name?.split(' ')[0] ||
    null;

  return { email: data.user.email, firstName };
}

// ─────────────────────────────────────────────────────────────────────────────
// URL builders — app vs /upgrade depending on email type
// ─────────────────────────────────────────────────────────────────────────────
function buildUpgradeUrl(
  firstName: string | null,
  days: number,
  delta: number | null
): string {
  const params = new URLSearchParams();
  if (firstName) params.set('name', firstName);
  if (days > 0) params.set('days', String(days));
  if (delta !== null) params.set('delta', Number(delta).toFixed(1));
  return `${BASE_URL}/upgrade?${params.toString()}`;
}

function buildAppUrl(): string {
  // Sends cold/pre-eligible users back to the app, not the upgrade page
  return BASE_URL;
}

// ─────────────────────────────────────────────────────────────────────────────
// Log sent email — prevents duplicates on next cron run
// ─────────────────────────────────────────────────────────────────────────────
async function logEmail(
  supabase: ReturnType<typeof getAdminClient>,
  userId: string,
  emailType: string
) {
  await supabase.from('email_log').insert({
    user_id: userId,
    email_type: emailType,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Send a single nurture email
// ─────────────────────────────────────────────────────────────────────────────
type NurtureEmailType =
  | 'nurture_day12'
  | 'nurture_email1'
  | 'nurture_email2'
  | 'nurture_email3'
  | 'nurture_day30';

async function sendNurtureEmail(
  supabase: ReturnType<typeof getAdminClient>,
  userId: string,
  emailType: NurtureEmailType,
  progressData: { consecutive_days: number; latest_avg_delta: number | null }
) {
  const authData = await getUserAuthData(supabase, userId);
  if (!authData) return { success: false, reason: 'no_auth_data' };

  // Day 12 and Day 30 send to app — pre-eligible or cold users
  const sendsToApp = emailType === 'nurture_day12' || emailType === 'nurture_day30';
  const destinationUrl = sendsToApp
    ? buildAppUrl()
    : buildUpgradeUrl(authData.firstName, progressData.consecutive_days, progressData.latest_avg_delta);

  const emailData = {
    firstName: authData.firstName,
    days: progressData.consecutive_days,
    delta: progressData.latest_avg_delta,
    upgradeUrl: destinationUrl,
  };

  const templateMap: Record<NurtureEmailType, (data: typeof emailData) => { subject: string; html: string }> = {
    nurture_day12: day12Email,
    nurture_email1: day14Email,
    nurture_email2: day17Email,
    nurture_email3: day21Email,
    nurture_day30: day30Email,
  };

  const { subject, html } = templateMap[emailType](emailData);

  const { error } = await resend.emails.send({
    from: 'Nicholas Kusmich <nic@unbecoming.app>',
    to: authData.email,
    subject,
    html,
    headers: {
      'List-Unsubscribe': `<mailto:unsubscribe@unbecoming.app?subject=unsubscribe>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  });

  if (error) return { success: false, reason: error.message };

  await logEmail(supabase, userId, emailType);
  return { success: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// CRON HANDLER
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getAdminClient();
  const results = {
    day12:   { attempted: 0, sent: 0, failed: 0 },
    email1:  { attempted: 0, sent: 0, failed: 0 },
    email2:  { attempted: 0, sent: 0, failed: 0 },
    email3:  { attempted: 0, sent: 0, failed: 0 },
    day30:   { attempted: 0, sent: 0, failed: 0 },
  };

  try {
    // ── Day 12 — pre-eligibility momentum ───────────────────────────────────
    const day12Users = await getDay12Candidates(supabase);
    for (const u of day12Users) {
      results.day12.attempted++;
      const result = await sendNurtureEmail(supabase, u.user_id, 'nurture_day12', u);
      result.success ? results.day12.sent++ : results.day12.failed++;
    }

    // ── Email 1 — first offer (day eligibility reached) ──────────────────────
    const email1Users = await getEmail1Candidates(supabase);
    for (const u of email1Users) {
      results.email1.attempted++;
      const result = await sendNurtureEmail(supabase, u.user_id, 'nurture_email1', u);
      result.success ? results.email1.sent++ : results.email1.failed++;
    }

    // ── Email 2 — social proof (3 days after eligibility) ────────────────────
    const email2Users = await getEmail2Candidates(supabase);
    for (const u of email2Users) {
      results.email2.attempted++;
      const result = await sendNurtureEmail(supabase, u.user_id, 'nurture_email2', u);
      result.success ? results.email2.sent++ : results.email2.failed++;
    }

    // ── Email 3 — decision point (7 days after eligibility) ──────────────────
    const email3Users = await getEmail3Candidates(supabase);
    for (const u of email3Users) {
      results.email3.attempted++;
      const result = await sendNurtureEmail(supabase, u.user_id, 'nurture_email3', u);
      result.success ? results.email3.sent++ : results.email3.failed++;
    }

    // ── Day 30 — cold re-engagement (inactivity trigger) ─────────────────────
    const day30Users = await getDay30Candidates(supabase);
    for (const u of day30Users) {
      results.day30.attempted++;
      const result = await sendNurtureEmail(supabase, u.user_id, 'nurture_day30', u);
      result.success ? results.day30.sent++ : results.day30.failed++;
    }

    console.log('[nurture-emails cron]', JSON.stringify(results));
    return NextResponse.json({ ok: true, results });

  } catch (err) {
    console.error('[nurture-emails cron] fatal error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

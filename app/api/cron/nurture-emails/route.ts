// app/api/cron/nurture-emails/route.ts
// Daily cron — finds Stage 1 non-converters and sends nurture emails
// Schedule: daily at 9:00 AM UTC (see vercel.json)

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import {
  day14Email,
  day17Email,
  day21Email,
  day30Email,
} from '@/lib/emails/nurture-templates';

const resend = new Resend(process.env.RESEND_API_KEY);

// Service-role client — needed to read auth.users for email + name
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Eligibility queries — each returns user_ids that need that email
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Day 14 — unlock eligibility just reached, no subscription, email not yet sent
 */
async function getDay14Candidates(supabase: ReturnType<typeof getAdminClient>) {
  const { data, error } = await supabase
    .from('user_progress')
    .select('user_id, consecutive_days, latest_avg_delta')
    .eq('current_stage', 1)
    .eq('unlock_eligible', true)
    .eq('has_active_subscription', false)
    .gte('consecutive_days', 14)
    .not('user_id', 'in', `(
      SELECT user_id FROM email_log WHERE email_type = 'nurture_day14'
    )`);

  if (error) throw new Error(`Day14 query failed: ${error.message}`);
  return data || [];
}

/**
 * Day 17 — eligible 3+ days ago, still no subscription
 * Uses stage_unlocked_at as the eligibility timestamp
 */
async function getDay17Candidates(supabase: ReturnType<typeof getAdminClient>) {
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('user_progress')
    .select('user_id, consecutive_days, latest_avg_delta')
    .eq('current_stage', 1)
    .eq('unlock_eligible', true)
    .eq('has_active_subscription', false)
    .gte('consecutive_days', 17)
    .lte('stage_unlocked_at', threeDaysAgo)
    .not('user_id', 'in', `(
      SELECT user_id FROM email_log WHERE email_type = 'nurture_day17'
    )`);

  if (error) throw new Error(`Day17 query failed: ${error.message}`);
  return data || [];
}

/**
 * Day 21 — still no subscription after 21+ days
 */
async function getDay21Candidates(supabase: ReturnType<typeof getAdminClient>) {
  const { data, error } = await supabase
    .from('user_progress')
    .select('user_id, consecutive_days, latest_avg_delta')
    .eq('current_stage', 1)
    .eq('unlock_eligible', true)
    .eq('has_active_subscription', false)
    .gte('consecutive_days', 21)
    .not('user_id', 'in', `(
      SELECT user_id FROM email_log WHERE email_type = 'nurture_day21'
    )`);

  if (error) throw new Error(`Day21 query failed: ${error.message}`);
  return data || [];
}

/**
 * Day 30 re-engagement — eligible, no sub, AND last_visit was 7+ days ago
 */
async function getDay30Candidates(supabase: ReturnType<typeof getAdminClient>) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('user_progress')
    .select('user_id, consecutive_days, latest_avg_delta')
    .eq('current_stage', 1)
    .eq('unlock_eligible', true)
    .eq('has_active_subscription', false)
    .lte('last_visit', sevenDaysAgo)
    .not('user_id', 'in', `(
      SELECT user_id FROM email_log WHERE email_type = 'nurture_day30'
    )`);

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
// Build personalized upgrade URL
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
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://unbecoming.app';
  return `${baseUrl}/upgrade?${params.toString()}`;
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
async function sendNurtureEmail(
  supabase: ReturnType<typeof getAdminClient>,
  userId: string,
  emailType: 'nurture_day14' | 'nurture_day17' | 'nurture_day21' | 'nurture_day30',
  progressData: { consecutive_days: number; latest_avg_delta: number | null }
) {
  const authData = await getUserAuthData(supabase, userId);
  if (!authData) return { success: false, reason: 'no_auth_data' };

  const upgradeUrl = buildUpgradeUrl(
    authData.firstName,
    progressData.consecutive_days,
    progressData.latest_avg_delta
  );

  const emailData = {
    firstName: authData.firstName,
    days: progressData.consecutive_days,
    delta: progressData.latest_avg_delta,
    upgradeUrl,
  };

  const templateMap = {
    nurture_day14: day14Email,
    nurture_day17: day17Email,
    nurture_day21: day21Email,
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
  // Verify cron secret to prevent unauthorized calls
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getAdminClient();
  const results = {
    day14: { attempted: 0, sent: 0, failed: 0 },
    day17: { attempted: 0, sent: 0, failed: 0 },
    day21: { attempted: 0, sent: 0, failed: 0 },
    day30: { attempted: 0, sent: 0, failed: 0 },
  };

  try {
    // ── Day 14 ──────────────────────────────────────────────────────────────
    const day14Users = await getDay14Candidates(supabase);
    for (const u of day14Users) {
      results.day14.attempted++;
      const result = await sendNurtureEmail(supabase, u.user_id, 'nurture_day14', u);
      result.success ? results.day14.sent++ : results.day14.failed++;
    }

    // ── Day 17 ──────────────────────────────────────────────────────────────
    const day17Users = await getDay17Candidates(supabase);
    for (const u of day17Users) {
      results.day17.attempted++;
      const result = await sendNurtureEmail(supabase, u.user_id, 'nurture_day17', u);
      result.success ? results.day17.sent++ : results.day17.failed++;
    }

    // ── Day 21 ──────────────────────────────────────────────────────────────
    const day21Users = await getDay21Candidates(supabase);
    for (const u of day21Users) {
      results.day21.attempted++;
      const result = await sendNurtureEmail(supabase, u.user_id, 'nurture_day21', u);
      result.success ? results.day21.sent++ : results.day21.failed++;
    }

    // ── Day 30 re-engagement ─────────────────────────────────────────────────
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

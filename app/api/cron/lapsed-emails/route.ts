// app/api/cron/lapsed-emails/route.ts
// Daily cron — sends active-lapse retention emails to Stage 1 users whose
// last_visit is within ±12h of Day 2 / 3 / 5 / 7. Distinct from nurture
// cron's reengagement_early/mid (those own 14+ day deep lapse).
//
// Schedule: 13:00 UTC daily (see vercel.json) — 09:00 ET / 06:00 PT.
// Dedupe: email_log UNIQUE (user_id, email_type) — each lapsed_dayN sends
// at most once per user, lifetime.
//
// Send pattern: collect → sendBatch (Resend batch API) → log. This mirrors
// the hourly notifications cron, NOT the nurture cron's one-at-a-time loop.

import { NextResponse } from 'next/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { buildUnsubscribeUrl } from '@/lib/emails/headers';
import { sendBatch, type BatchEmail } from '@/lib/emails/send';
import {
  lapsedDay2Email,
  lapsedDay3Email,
  lapsedDay5Email,
  lapsedDay7Email,
} from '@/lib/emails/lapsed-templates';

export const dynamic = 'force-dynamic';

const CTA_URL = 'https://www.unbecoming.app/chat';

type LapsedDay = 2 | 3 | 5 | 7;
type LapsedEmailType = 'lapsed_day2' | 'lapsed_day3' | 'lapsed_day5' | 'lapsed_day7';

interface PendingLog {
  userId: string;
  emailType: LapsedEmailType;
}

// Service-role client — needed to read auth.users for email + name
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper — fetch user_ids who have opted out via notification_preferences.
// COPY-PASTED from app/api/cron/nurture-emails/route.ts intentionally; Sprint 7
// will extract this and getTestUserIds to a shared helper module. Fail-open
// matches existing pattern (see nurture cron comments for rationale).
// ─────────────────────────────────────────────────────────────────────────────
async function getUnsubscribedIds(supabase: SupabaseClient): Promise<string[]> {
  const { data, error } = await supabase
    .from('notification_preferences')
    .select('user_id')
    .eq('unsubscribed', true);
  if (error) {
    console.error('[lapsed-emails] getUnsubscribedIds error:', error);
    return [];
  }
  return (data || []).map((r: { user_id: string }) => r.user_id).filter(Boolean);
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper — fetch user_ids flagged as test accounts. Same copy-paste rationale.
// ─────────────────────────────────────────────────────────────────────────────
async function getTestUserIds(supabase: SupabaseClient): Promise<string[]> {
  const { data, error } = await supabase
    .from('notification_preferences')
    .select('user_id')
    .eq('is_test_user', true);
  if (error) {
    console.error('[lapsed-emails] getTestUserIds error:', error);
    return [];
  }
  return (data || []).map((r: { user_id: string }) => r.user_id).filter(Boolean);
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper — fetch user_ids who already received a given lapsed_dayN email.
// ─────────────────────────────────────────────────────────────────────────────
async function getAlreadySentIds(
  supabase: SupabaseClient,
  emailType: LapsedEmailType
): Promise<string[]> {
  const { data } = await supabase
    .from('email_log')
    .select('user_id')
    .eq('email_type', emailType);
  return (data || []).map((r: { user_id: string }) => r.user_id);
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper — fetch email + first name from auth.users for a single user.
// Mirrors nurture cron's pattern. user_progress has no first_name column;
// auth.users.user_metadata is the source of truth.
// ─────────────────────────────────────────────────────────────────────────────
async function getUserAuthData(
  supabase: SupabaseClient,
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
// Candidate query — users whose last_visit falls within ±12h of Day N.
// Range gate: last_visit between (N+0.5) and (N-0.5) days ago. Cron runs once
// daily, so range gates absorb timing slop without overlap between days.
// ─────────────────────────────────────────────────────────────────────────────
async function getLapsedDayCandidates(
  supabase: SupabaseClient,
  day: LapsedDay,
  emailType: LapsedEmailType,
  unsubscribedIds: string[],
  testUserIds: string[]
): Promise<Array<{ user_id: string }>> {
  const sentIds = await getAlreadySentIds(supabase, emailType);
  const excludedIds = Array.from(new Set([...sentIds, ...unsubscribedIds, ...testUserIds]));

  // Upper bound = more recent (smaller number of days ago) → (N-0.5)
  // Lower bound = further back (larger number of days ago) → (N+0.5)
  const upperBound = new Date(Date.now() - (day - 0.5) * 24 * 60 * 60 * 1000);
  const lowerBound = new Date(Date.now() - (day + 0.5) * 24 * 60 * 60 * 1000);

  let query = supabase
    .from('user_progress')
    .select('user_id, last_visit')
    .eq('current_stage', 1)
    .not('last_visit', 'is', null)
    .gte('last_visit', lowerBound.toISOString())
    .lte('last_visit', upperBound.toISOString());

  if (excludedIds.length > 0) {
    query = query.not('user_id', 'in', `(${excludedIds.map(id => `"${id}"`).join(',')})`);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Lapsed Day ${day} query failed: ${error.message}`);
  return data || [];
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
    day2: { attempted: 0, sent: 0, failed: 0 },
    day3: { attempted: 0, sent: 0, failed: 0 },
    day5: { attempted: 0, sent: 0, failed: 0 },
    day7: { attempted: 0, sent: 0, failed: 0 },
  };

  try {
    const unsubscribedIds = await getUnsubscribedIds(supabase);
    const testUserIds = await getTestUserIds(supabase);

    const days: Array<{
      day: LapsedDay;
      emailType: LapsedEmailType;
      render: (data: { firstName: string | null; ctaUrl: string; unsubscribeUrl: string }) => { subject: string; html: string };
      resultKey: 'day2' | 'day3' | 'day5' | 'day7';
    }> = [
      { day: 2, emailType: 'lapsed_day2', render: lapsedDay2Email, resultKey: 'day2' },
      { day: 3, emailType: 'lapsed_day3', render: lapsedDay3Email, resultKey: 'day3' },
      { day: 5, emailType: 'lapsed_day5', render: lapsedDay5Email, resultKey: 'day5' },
      { day: 7, emailType: 'lapsed_day7', render: lapsedDay7Email, resultKey: 'day7' },
    ];

    // ── PHASE 1: collect emails to send ──────────────────────────────────────
    const emailQueue: BatchEmail[] = [];
    const pendingLogs: PendingLog[] = [];

    for (const { day, emailType, render, resultKey } of days) {
      const candidates = await getLapsedDayCandidates(
        supabase,
        day,
        emailType,
        unsubscribedIds,
        testUserIds
      );

      for (const candidate of candidates) {
        results[resultKey].attempted++;

        try {
          const authData = await getUserAuthData(supabase, candidate.user_id);
          if (!authData) {
            results[resultKey].failed++;
            continue;
          }

          const { subject, html } = render({
            firstName: authData.firstName,
            ctaUrl: CTA_URL,
            unsubscribeUrl: buildUnsubscribeUrl(candidate.user_id),
          });

          emailQueue.push({
            to: authData.email,
            subject,
            html,
            userId: candidate.user_id,
            tag: emailType,
          });
          pendingLogs.push({
            userId: candidate.user_id,
            emailType,
          });
        } catch (err) {
          console.error(`[lapsed-emails] Error preparing ${emailType} for ${candidate.user_id}:`, err);
          results[resultKey].failed++;
        }
      }
    }

    // ── PHASE 2: batch send ──────────────────────────────────────────────────
    if (emailQueue.length > 0) {
      console.log(`[lapsed-emails] Sending batch of ${emailQueue.length} emails...`);
      const batchResult = await sendBatch(emailQueue);

      // Approximate per-day sent/failed allocation from batch result. Resend's
      // batch API returns aggregate success — without per-message status we
      // proportionally credit sent/failed by tag.
      if (batchResult.success) {
        for (const log of pendingLogs) {
          const key = log.emailType.replace('lapsed_', '') as 'day2' | 'day3' | 'day5' | 'day7';
          results[key].sent++;
        }
      } else {
        // Failures: charge all queued to failed counters; rely on email_events
        // webhook + Resend dashboard for ground-truth delivery state.
        for (const log of pendingLogs) {
          const key = log.emailType.replace('lapsed_', '') as 'day2' | 'day3' | 'day5' | 'day7';
          results[key].failed++;
        }
        console.error('[lapsed-emails] Batch send had errors:', batchResult.errors);
      }

      // ── PHASE 3: log sends to email_log (only on batch success) ───────────
      if (batchResult.success) {
        for (const log of pendingLogs) {
          try {
            await supabase.from('email_log').insert({
              user_id: log.userId,
              email_type: log.emailType,
            });
          } catch (err) {
            console.error(`[lapsed-emails] email_log insert failed for ${log.userId} (${log.emailType}):`, err);
          }
        }
      }
    } else {
      console.log('[lapsed-emails] No candidates this run.');
    }

    console.log('[lapsed-emails cron]', JSON.stringify(results));
    return NextResponse.json({ ok: true, results });

  } catch (err) {
    console.error('[lapsed-emails cron] fatal error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

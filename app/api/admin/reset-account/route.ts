// app/api/admin/reset-account/route.ts
// Sprint 6 A4 — Admin reset test account tool.
// Enables clean repeated testing of Stage 1 flows without re-signup.
// Surfaced from hotfix-2 smoke testing where contaminated chat history
// blocked clean prompt-rule verification.
//
// Safety: target user must have notification_preferences.is_test_user=true.
// Real users (e.g., Kenny) cannot be reset via this endpoint.

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const ADMIN_EMAILS = [
  'nkusmich@nicholaskusmich.com',
  'kayla@nicholaskusmich.com',
  'rachel@nicholaskusmich.com',
];

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface ResetClearedCounts {
  chat_messages?: number;
  signal_checks?: number;
  practice_logs?: number;
  email_log?: number;
  milestones?: number;
  journal_entries?: number;
  weekly_deltas?: number;
  stage_unlocks?: number;
  baseline_assessments?: number;
  user_data_baseline?: number;
  pattern_profiles?: number;
  user_progress_updated?: boolean;
}

export async function POST(req: Request) {
  // ── 1. Admin auth via cookies ─────────────────────────────────────────────
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  const { data: { user: adminUser }, error: authError } = await supabase.auth.getUser();
  if (authError || !adminUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!ADMIN_EMAILS.includes(adminUser.email || '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // ── 2. Body parse + validation ────────────────────────────────────────────
  let body: { user_id?: unknown; also_reset_baseline?: unknown; also_reset_to_stage_1?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const userId = body.user_id;
  if (typeof userId !== 'string' || !UUID_RE.test(userId)) {
    return NextResponse.json({ error: 'user_id must be a valid UUID string' }, { status: 400 });
  }

  const alsoResetBaseline = body.also_reset_baseline === true;
  const alsoResetToStage1 = body.also_reset_to_stage_1 === true;

  // ── 3. Confirm user exists in auth.users ──────────────────────────────────
  const { data: targetAuth, error: lookupError } = await supabaseAdmin.auth.admin.getUserById(userId);
  if (lookupError || !targetAuth?.user) {
    return NextResponse.json({ error: `No user found with user_id ${userId}` }, { status: 404 });
  }

  // ── 4. Safety gate: target must be is_test_user=true ──────────────────────
  const { data: prefs, error: prefsError } = await supabaseAdmin
    .from('notification_preferences')
    .select('is_test_user')
    .eq('user_id', userId)
    .maybeSingle();

  if (prefsError) {
    return NextResponse.json(
      { error: `notification_preferences lookup failed: ${prefsError.message}` },
      { status: 500 }
    );
  }
  if (!prefs?.is_test_user) {
    return NextResponse.json(
      { error: 'Target user must be flagged is_test_user=true on notification_preferences' },
      { status: 403 }
    );
  }

  // ── 5. Read current_stage to handle stage_already_1 case ──────────────────
  const { data: progress, error: progressError } = await supabaseAdmin
    .from('user_progress')
    .select('current_stage')
    .eq('user_id', userId)
    .maybeSingle();

  if (progressError) {
    return NextResponse.json(
      { error: `user_progress lookup failed: ${progressError.message}` },
      { status: 500 }
    );
  }

  const currentStage = progress?.current_stage ?? 1;
  const stageAlready1 = currentStage <= 1;

  // ── 6. Perform deletes sequentially, accumulating counts ──────────────────
  const cleared: ResetClearedCounts = {};
  const nowIso = new Date().toISOString();

  const runDelete = async (
    label: keyof ResetClearedCounts,
    fn: () => PromiseLike<{ error: { message: string } | null; count: number | null }>
  ): Promise<void> => {
    const { error, count } = await fn();
    if (error) {
      const e = new Error(`${label}: ${error.message}`);
      (e as Error & { label?: string }).label = String(label);
      throw e;
    }
    (cleared as Record<string, number | boolean>)[label as string] = count ?? 0;
  };

  try {
    // Always-clear set (Q1)
    await runDelete('chat_messages', () =>
      supabaseAdmin.from('chat_messages').delete({ count: 'exact' }).eq('user_id', userId)
    );
    await runDelete('signal_checks', () =>
      supabaseAdmin.from('signal_checks').delete({ count: 'exact' }).eq('user_id', userId)
    );
    await runDelete('practice_logs', () =>
      supabaseAdmin.from('practice_logs').delete({ count: 'exact' }).eq('user_id', userId)
    );
    await runDelete('email_log', () =>
      supabaseAdmin.from('email_log').delete({ count: 'exact' }).eq('user_id', userId)
    );
    await runDelete('milestones', () =>
      supabaseAdmin.from('milestones').delete({ count: 'exact' }).eq('user_id', userId)
    );
    await runDelete('journal_entries', () =>
      supabaseAdmin.from('journal_entries').delete({ count: 'exact' }).eq('user_id', userId)
    );
    await runDelete('weekly_deltas', () =>
      supabaseAdmin.from('weekly_deltas').delete({ count: 'exact' }).eq('user_id', userId)
    );

    // Conditional: stage_unlocks audit trail (Q2)
    if (alsoResetToStage1) {
      await runDelete('stage_unlocks', () =>
        supabaseAdmin.from('stage_unlocks').delete({ count: 'exact' }).eq('user_id', userId)
      );
    }

    // Conditional: baseline triple-clear (Q3 + Q4)
    if (alsoResetBaseline) {
      await runDelete('baseline_assessments', () =>
        supabaseAdmin.from('baseline_assessments').delete({ count: 'exact' }).eq('user_id', userId)
      );
      await runDelete('user_data_baseline', () =>
        supabaseAdmin
          .from('user_data')
          .delete({ count: 'exact' })
          .eq('user_id', userId)
          .like('key', 'ios:baseline:%')
      );
      await runDelete('pattern_profiles', () =>
        supabaseAdmin.from('pattern_profiles').delete({ count: 'exact' }).eq('user_id', userId)
      );
    }

    // ── 7. user_progress update ─────────────────────────────────────────────
    const progressUpdate: Record<string, unknown> = { stage_start_date: nowIso };
    if (alsoResetToStage1 && !stageAlready1) {
      progressUpdate.current_stage = 1;
      progressUpdate.stage_unlocked_at = null;
    }

    const { error: updateError } = await supabaseAdmin
      .from('user_progress')
      .update(progressUpdate)
      .eq('user_id', userId);

    if (updateError) {
      throw new Error(`user_progress update failed: ${updateError.message}`);
    }
    cleared.user_progress_updated = true;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error during reset';
    console.error('[admin/reset-account] failed mid-operation:', message);
    return NextResponse.json(
      {
        error: 'Reset failed mid-operation. See `cleared` for partial state.',
        failed_at: message,
        user_id: userId,
        cleared,
      },
      { status: 500 }
    );
  }

  // ── 8. Best-effort audit log ──────────────────────────────────────────────
  try {
    await supabaseAdmin.from('notification_log').insert({
      user_id: userId,
      notification_type: 'admin_reset_account',
      metadata: {
        admin_email: adminUser.email,
        flags: {
          also_reset_to_stage_1: alsoResetToStage1,
          also_reset_baseline: alsoResetBaseline,
        },
        cleared,
      },
    });
  } catch (logErr) {
    console.error('[admin/reset-account] notification_log insert failed:', logErr);
  }

  // ── 9. Build response flags ───────────────────────────────────────────────
  const responseFlags: {
    also_reset_to_stage_1: boolean;
    also_reset_baseline: boolean;
    stage_already_1?: true;
  } = {
    also_reset_to_stage_1: alsoResetToStage1,
    also_reset_baseline: alsoResetBaseline,
  };
  if (alsoResetToStage1 && stageAlready1) {
    responseFlags.stage_already_1 = true;
  }

  return NextResponse.json({
    success: true,
    cleared,
    user_id: userId,
    reset_at: nowIso,
    flags: responseFlags,
  });
}

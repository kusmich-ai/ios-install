// app/api/admin/lapsed/simulate/route.ts
// Test utility: simulate a lapsed user state for verification of
// lapsed-emails cron. NOT for production user manipulation — admin only.
//
// POST body: { user_email: string, days_lapsed: number, clear_log?: boolean }
// Returns:   { success: true, user_id, new_last_visit, log_cleared: boolean }

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

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

export async function POST(req: Request) {
  // ── Admin auth (mirror app/api/admin/interventions/route.ts pattern) ──────
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

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user || !ADMIN_EMAILS.includes(user.email || '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // ── Body validation ──────────────────────────────────────────────────────
  let body: { user_email?: unknown; days_lapsed?: unknown; clear_log?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const userEmail = body.user_email;
  const daysLapsed = body.days_lapsed;
  const clearLog = body.clear_log === true;

  if (typeof userEmail !== 'string' || !userEmail.includes('@')) {
    return NextResponse.json({ error: 'user_email must be a valid email string' }, { status: 400 });
  }
  if (typeof daysLapsed !== 'number' || daysLapsed < 0 || daysLapsed > 30 || !Number.isFinite(daysLapsed)) {
    return NextResponse.json({ error: 'days_lapsed must be a number between 0 and 30' }, { status: 400 });
  }

  // ── Lookup target user_id from auth.users via admin listUsers ─────────────
  // listUsers paginates by 1000 default — plenty for current scale.
  const { data: usersPage, error: listError } = await supabaseAdmin.auth.admin.listUsers({
    perPage: 1000,
  });
  if (listError) {
    return NextResponse.json({ error: `User lookup failed: ${listError.message}` }, { status: 500 });
  }

  const target = usersPage.users.find(u => u.email?.toLowerCase() === userEmail.toLowerCase());
  if (!target) {
    return NextResponse.json({ error: `No user found with email ${userEmail}` }, { status: 404 });
  }

  // ── Simulate last_visit ───────────────────────────────────────────────────
  const newLastVisit = new Date(Date.now() - daysLapsed * 24 * 60 * 60 * 1000).toISOString();
  const { error: updateError } = await supabaseAdmin
    .from('user_progress')
    .update({ last_visit: newLastVisit })
    .eq('user_id', target.id);

  if (updateError) {
    return NextResponse.json({ error: `user_progress update failed: ${updateError.message}` }, { status: 500 });
  }

  // ── Optionally clear lapsed_* rows from email_log so cron will re-trigger ─
  let logCleared = false;
  if (clearLog) {
    const { error: deleteError } = await supabaseAdmin
      .from('email_log')
      .delete()
      .eq('user_id', target.id)
      .like('email_type', 'lapsed_%');
    if (deleteError) {
      return NextResponse.json({ error: `email_log delete failed: ${deleteError.message}` }, { status: 500 });
    }
    logCleared = true;
  }

  return NextResponse.json({
    success: true,
    user_id: target.id,
    new_last_visit: newLastVisit,
    log_cleared: logCleared,
  });
}

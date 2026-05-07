-- ============================================================================
-- Sprint 5 — Phase 3.A.2 Unit 1.A
-- Backfill migration: notification_log, notification_preferences, email_log
-- ============================================================================
--
-- Purpose
-- -------
-- Backfill missing migration files for tables that exist in production but
-- were created via Supabase UI / ad-hoc SQL without repo migrations. Phase
-- 3.A.1 audit confirmed all three tables, indexes, and policies are live
-- in production as of 2026-05-06.
--
-- State
-- -----
-- Production already has these tables, indexes, and policies. This migration
-- is idempotent (CREATE TABLE IF NOT EXISTS + DROP POLICY IF EXISTS + CREATE
-- POLICY) so it can run safely in fresh dev environments without affecting
-- production state.
--
-- Note about broken policy
-- ------------------------
-- The email_log "Admins can read email_log" policy contains a literal
-- 'nicholas@...' placeholder string (audit confirmed via
-- position('nicholas@...' IN policy_expr) = 97). This file PRESERVES the
-- broken expression exactly as production has it, so the migration matches
-- production state. The policy is fixed by the companion migration
-- sprint5-email-log-policy-fix.sql which Nicholas applies manually via the
-- Supabase SQL Editor.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- email_log
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.email_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  email_type text NOT NULL,
  sent_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT email_log_user_id_email_type_key UNIQUE (user_id, email_type)
);

CREATE INDEX IF NOT EXISTS email_log_email_type_idx
  ON public.email_log (email_type);

CREATE INDEX IF NOT EXISTS email_log_user_id_idx
  ON public.email_log (user_id);

ALTER TABLE public.email_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read email_log" ON public.email_log;
CREATE POLICY "Admins can read email_log" ON public.email_log
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT users.id
      FROM auth.users
      WHERE (users.email)::text = ANY (ARRAY[
        'nicholas@...'::text,
        'rachel@nicholaskusmich.com'::text
      ])
    )
  );


-- ----------------------------------------------------------------------------
-- notification_log
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.notification_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid,
  notification_type text NOT NULL,
  sent_at timestamptz DEFAULT now(),
  metadata jsonb
);

CREATE INDEX IF NOT EXISTS idx_notification_log_user_type
  ON public.notification_log (user_id, notification_type, sent_at DESC);

ALTER TABLE public.notification_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access on log" ON public.notification_log;
CREATE POLICY "Service role full access on log" ON public.notification_log
  FOR ALL
  USING (auth.role() = 'service_role'::text);


-- ----------------------------------------------------------------------------
-- notification_preferences
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid UNIQUE,
  email text NOT NULL,
  timezone text DEFAULT 'America/New_York',
  morning_reminder boolean DEFAULT true,
  missed_day_nudge boolean DEFAULT true,
  weekly_summary boolean DEFAULT true,
  milestone_alerts boolean DEFAULT true,
  unsubscribed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Note: idx_notification_prefs_user is redundant with the UNIQUE constraint
-- on user_id but is preserved because production has it.
CREATE INDEX IF NOT EXISTS idx_notification_prefs_user
  ON public.notification_preferences (user_id);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access" ON public.notification_preferences;
CREATE POLICY "Service role full access" ON public.notification_preferences
  FOR ALL
  USING (auth.role() = 'service_role'::text);

DROP POLICY IF EXISTS "Users can insert own preferences" ON public.notification_preferences;
CREATE POLICY "Users can insert own preferences" ON public.notification_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read own preferences" ON public.notification_preferences;
CREATE POLICY "Users can read own preferences" ON public.notification_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own preferences" ON public.notification_preferences;
CREATE POLICY "Users can update own preferences" ON public.notification_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);


-- ============================================================================
-- Orphan-column / inconsistency observations (deferred to Workstream A.3)
-- ============================================================================
--   * notification_preferences.milestone_alerts: column written at signup but
--     never read by any code path.
--   * notification_log.metadata vs email_log.metadata: inconsistent default
--     (NULL on notification_log vs '{}'::jsonb on email_log).
--   * 4 users (out of ~29) lack notification_preferences rows — see
--     ensurePreferences backfill candidate for A.3.
-- ============================================================================

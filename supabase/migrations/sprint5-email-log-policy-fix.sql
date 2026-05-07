-- ============================================================================
-- Sprint 5 — Phase 3.A.2 Unit 1.B
-- Fix migration: email_log "Admins can read email_log" policy
-- ============================================================================
--
-- Purpose
-- -------
-- Fix the broken admin read policy on public.email_log.
--
-- Background
-- ----------
-- The original policy contained the literal 'nicholas@...' placeholder
-- string that never matched any auth.users.email row, so admin read access
-- only worked for rachel@nicholaskusmich.com. Confirmed via Phase 3.A.1
-- audit SQL:
--     SELECT position('nicholas@...' IN pg_get_expr(polqual, polrelid))
--     FROM pg_policy WHERE polname = 'Admins can read email_log';
--     -- returned 97
--
-- Application
-- -----------
-- This migration runs in production via the Supabase SQL Editor — Nicholas
-- applies it manually after this file lands in the repo. The companion
-- backfill migration (sprint5-notification-tables-backfill.sql) intentionally
-- preserves the broken expression so that fresh dev environments mirror
-- production state until this fix is applied.
--
-- Corrected admin allowlist
-- -------------------------
-- Matches the admin emails in app/api/admin/interventions/route.ts (lines
-- 11-15):
--   * nkusmich@nicholaskusmich.com
--   * kayla@nicholaskusmich.com
--   * rachel@nicholaskusmich.com
-- ============================================================================

DROP POLICY IF EXISTS "Admins can read email_log" ON public.email_log;

CREATE POLICY "Admins can read email_log" ON public.email_log
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT users.id
      FROM auth.users
      WHERE (users.email)::text = ANY (ARRAY[
        'nkusmich@nicholaskusmich.com'::text,
        'kayla@nicholaskusmich.com'::text,
        'rachel@nicholaskusmich.com'::text
      ])
    )
  );


-- ============================================================================
-- Verification SQL (run after applying)
-- ============================================================================
--
-- 1. Confirm the policy expression now lists all three admin emails:
--
--    SELECT pg_get_expr(p.polqual, p.polrelid)
--    FROM pg_policy p
--    JOIN pg_class c ON p.polrelid = c.oid
--    WHERE c.relname = 'email_log'
--      AND p.polname = 'Admins can read email_log';
--
-- 2. Confirm the broken literal is no longer present (should return 0):
--
--    SELECT position('nicholas@...' IN pg_get_expr(polqual, polrelid))
--    FROM pg_policy
--    WHERE polname = 'Admins can read email_log';
--
-- ============================================================================

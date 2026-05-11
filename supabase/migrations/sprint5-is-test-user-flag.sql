-- Sprint 5 A.1 Unit 5 — is_test_user flag on notification_preferences
--
-- Adds a flag to mark accounts used for testing (Nicholas, Rachel, Kayla,
-- Fehren) so they're excluded from cron-driven emails. Real users default
-- to false; manually flip to true via SQL Editor for test accounts.
--
-- Sequencing:
--   1. Apply this migration in production via Supabase SQL Editor
--   2. Push the accompanying code commit (filter on is_test_user=false)
--   3. Run the backfill SQL below to flag the 4 test accounts
--
-- Idempotent: uses ADD COLUMN IF NOT EXISTS and CREATE INDEX IF NOT EXISTS.

ALTER TABLE public.notification_preferences
  ADD COLUMN IF NOT EXISTS is_test_user boolean NOT NULL DEFAULT false;

-- Partial index for cron exclusion query. Most rows have is_test_user=false,
-- so we index only the small is_test_user=true subset. Saves space and
-- speeds the .not('user_id', 'in', SELECT ... WHERE is_test_user=true)
-- pattern used by the nurture cron getTestUserIds helper.
CREATE INDEX IF NOT EXISTS idx_notification_prefs_test_users
  ON public.notification_preferences (is_test_user)
  WHERE is_test_user = true;

-- BACKFILL SQL (run separately after migration is applied and code commit
-- is pushed; not part of this migration file):
--
-- UPDATE public.notification_preferences
-- SET is_test_user = true, updated_at = NOW()
-- WHERE email IN (
--   'nkusmich@nicholaskusmich.com',
--   'rachel@nicholaskusmich.com',
--   'kayla@nicholaskusmich.com',
--   'fehrenwarman@gmail.com'
-- );

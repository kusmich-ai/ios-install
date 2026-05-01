-- Sprint 4 Theme 2: Allow 0-5 range for signal checks
-- Drops existing 1-5 CHECK constraints and replaces with 0-5

BEGIN;

ALTER TABLE signal_checks DROP CONSTRAINT IF EXISTS signal_checks_calm_score_check;
ALTER TABLE signal_checks DROP CONSTRAINT IF EXISTS signal_checks_presence_score_check;

ALTER TABLE signal_checks ADD CONSTRAINT signal_checks_calm_score_check
  CHECK (calm_score >= 0 AND calm_score <= 5);

ALTER TABLE signal_checks ADD CONSTRAINT signal_checks_presence_score_check
  CHECK (presence_score >= 0 AND presence_score <= 5);

COMMIT;

-- Verification (run separately after the BEGIN/COMMIT block above succeeds):
-- SELECT conname, pg_get_constraintdef(oid)
-- FROM pg_constraint
-- WHERE conrelid = 'signal_checks'::regclass
--   AND conname LIKE '%score_check%';
-- Expected: both constraints show >= 0 AND <= 5

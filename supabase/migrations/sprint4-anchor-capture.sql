-- ============================================================================
-- Sprint 4 Theme 4: Anchor capture flow — DB columns
-- ============================================================================
-- Run this in the Supabase SQL editor BEFORE deploying Sprint 4 code that
-- references morning_anchor or reminder_time.
--
-- Adds two nullable columns to user_progress so we can capture each user's
-- morning anchor (e.g., "after coffee") and chosen reminder time (e.g.,
-- "07:00" or "later"). Existing rows stay NULL — the chat-based capture
-- flow only fires for new Day 1 users. Legacy users can be retro-prompted
-- later if/when we choose.
--
-- Idempotent. Safe to re-run — ADD COLUMN IF NOT EXISTS is a no-op when a
-- column already exists.
--
-- TYPE DECISION — reminder_time is TEXT, not TIME:
--   • The chat capture flow supports a "later" quick option alongside HH:MM
--     values, which TIME can't store. TEXT covers both.
--   • Postgres TIME has no time-zone awareness; user reminder times are
--     local-clock semantics, which TEXT (e.g., "07:00") expresses without
--     ambiguity.
--   • No existing user_progress columns use TIME — date/timestamp columns
--     (stage_start_date, last_visit, created_at, ...) follow the project's
--     established conventions, and TEXT for time-of-day stays consistent.
-- ============================================================================

BEGIN;

ALTER TABLE user_progress
  ADD COLUMN IF NOT EXISTS morning_anchor TEXT,
  ADD COLUMN IF NOT EXISTS reminder_time TEXT;

COMMENT ON COLUMN user_progress.morning_anchor IS
  'User-chosen anchor for the morning ritual cue (e.g. "right after waking up", "after coffee"). NULL until the Day 1 capture flow completes; NULL is also the skip-state.';

COMMENT ON COLUMN user_progress.reminder_time IS
  'User-chosen reminder time for the morning ritual. Stored as TEXT to support HH:MM strings (e.g. "07:00") or short labels (e.g. "later"). NULL until the Day 1 capture flow completes.';

COMMIT;

-- Verification (run separately after the BEGIN/COMMIT block above succeeds):
-- SELECT column_name, data_type, is_nullable, col_description('user_progress'::regclass, ordinal_position) AS comment
-- FROM information_schema.columns
-- WHERE table_name = 'user_progress'
--   AND column_name IN ('morning_anchor', 'reminder_time');
-- Expected: 2 rows, both data_type = text, is_nullable = YES, with the comments above.

-- ============================================================================
-- ROLLBACK
-- ============================================================================
-- To reverse this migration, run:
--
-- BEGIN;
--   ALTER TABLE user_progress
--     DROP COLUMN IF EXISTS morning_anchor,
--     DROP COLUMN IF EXISTS reminder_time;
-- COMMIT;
--
-- Rolling back permanently deletes any captured anchor / reminder values.
-- If you only need to disable the feature in code, no DB rollback is
-- required — the columns can sit unused indefinitely.
-- ============================================================================

-- ============================================================================
-- Sprint 4 Phase 3.A.2: Cleanup duplicate signal_checks rows from tool loop bug
-- ============================================================================
-- Run AFTER the Phase 3.A.2 hotfix code is deployed and verified.
--
-- Background: Prior to the Phase 3.A.2 fix, Stage 1 users hitting the post-Day-1
-- signal check trigger could submit one rating ("5 5") and have the AI call
-- record_signal_check up to 5 times due to a tool loop bug, writing 2-10
-- duplicate rows to signal_checks per submission.
--
-- This cleanup keeps the OLDEST row in each duplicate cluster (preserves the
-- original timestamp closest to user submission time) and deletes the rest.
--
-- Cluster definition: same user_id, same calm_score, same presence_score,
-- same stage, created_at values within a 60-second window of each other.
--
-- Reversibility: rows are deleted permanently. Run only after verifying the
-- code fix is live and no new duplicates are accumulating.
-- ============================================================================

-- ============================================================================
-- DRY RUN: Identify duplicates without deleting
-- ============================================================================
-- Run this first to see how many rows would be deleted:
--
-- WITH ranked AS (
--   SELECT
--     id,
--     user_id,
--     calm_score,
--     presence_score,
--     stage,
--     created_at,
--     ROW_NUMBER() OVER (
--       PARTITION BY user_id, calm_score, presence_score, stage,
--                    DATE_TRUNC('minute', created_at)
--       ORDER BY created_at ASC
--     ) AS rn
--   FROM signal_checks
-- )
-- SELECT COUNT(*) AS rows_to_delete
-- FROM ranked
-- WHERE rn > 1;

-- ============================================================================
-- ACTUAL DELETE
-- ============================================================================

BEGIN;

WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, calm_score, presence_score, stage,
                   DATE_TRUNC('minute', created_at)
      ORDER BY created_at ASC
    ) AS rn
  FROM signal_checks
)
DELETE FROM signal_checks
WHERE id IN (
  SELECT id FROM ranked WHERE rn > 1
);

COMMIT;

-- ============================================================================
-- Verification (run after deletion)
-- ============================================================================
-- SELECT COUNT(*) AS remaining_duplicates
-- FROM (
--   SELECT user_id, calm_score, presence_score, stage,
--          DATE_TRUNC('minute', created_at) AS minute_bucket,
--          COUNT(*) AS cluster_size
--   FROM signal_checks
--   GROUP BY user_id, calm_score, presence_score, stage, DATE_TRUNC('minute', created_at)
--   HAVING COUNT(*) > 1
-- ) clusters;
-- Expected: 0 (all clusters now have exactly 1 row each)

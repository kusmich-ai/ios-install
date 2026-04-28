-- ============================================================================
-- Sprint 2: Baseline assessments table for the simplified self-rating
-- ============================================================================
-- Run this in the Supabase SQL editor BEFORE deploying Sprint 2 code.
--
-- This migration is safe to run whether or not `baseline_assessments` already
-- exists. It is idempotent — re-running it produces no duplicate state and no
-- errors.
--
-- Three things happen:
--   1. Ensure the table exists with the new (simplified) shape.
--   2. If a pre-existing `baseline_assessments` table is present from the
--      old IOSBaselineAssessment flow, drop NOT NULL on the old
--      instrument-specific columns so the new INSERT (which omits them)
--      doesn't violate constraints. Existing rows keep their values.
--   3. Ensure RLS, policies, indexes, and the user_profiles timestamp
--      columns are in place.
-- ============================================================================

-- 1. Table (no-op if it exists) -----------------------------------------------

CREATE TABLE IF NOT EXISTS baseline_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  regulation_score INTEGER NOT NULL CHECK (regulation_score BETWEEN 0 AND 5),
  awareness_score INTEGER NOT NULL CHECK (awareness_score BETWEEN 0 AND 5),
  outlook_score INTEGER NOT NULL CHECK (outlook_score BETWEEN 0 AND 5),
  attention_score INTEGER NOT NULL CHECK (attention_score BETWEEN 0 AND 5),
  rewired_index INTEGER NOT NULL,
  assessment_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1a. Add the new columns if the table pre-exists with a different shape.
--     CHECK constraints can't be conditionally added by ADD COLUMN IF NOT EXISTS,
--     so we add the column unconditionally with NOT NULL only when adding fresh.
ALTER TABLE baseline_assessments
  ADD COLUMN IF NOT EXISTS regulation_score INTEGER,
  ADD COLUMN IF NOT EXISTS awareness_score INTEGER,
  ADD COLUMN IF NOT EXISTS outlook_score INTEGER,
  ADD COLUMN IF NOT EXISTS attention_score INTEGER,
  ADD COLUMN IF NOT EXISTS rewired_index INTEGER,
  ADD COLUMN IF NOT EXISTS assessment_type TEXT;

-- 2. Make legacy NOT NULL columns nullable so the new simplified insert works.
--    The old IOSBaselineAssessment flow populated these; the new SimpleBaseline
--    component does not. Existing rows are unaffected — only the constraint
--    is relaxed.
DO $$
DECLARE
  legacy_col TEXT;
BEGIN
  FOR legacy_col IN
    SELECT unnest(ARRAY[
      'calm_core_score',
      'observer_index_score',
      'vitality_index_score',
      'focus_diagnostic_score',
      'presence_test_score',
      'regulation_domain',
      'awareness_domain',
      'outlook_domain',
      'attention_domain',
      'rewired_tier',
      'presence_test_elapsed_seconds',
      'presence_test_cycles_completed',
      'completed_at'
    ])
  LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'baseline_assessments'
        AND column_name = legacy_col
        AND is_nullable = 'NO'
    ) THEN
      EXECUTE format(
        'ALTER TABLE baseline_assessments ALTER COLUMN %I DROP NOT NULL',
        legacy_col
      );
    END IF;
  END LOOP;
END $$;

-- 3. Index --------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_baseline_user ON baseline_assessments(user_id);

-- 4. Row Level Security -------------------------------------------------------

ALTER TABLE baseline_assessments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Users can read own baseline'
      AND tablename = 'baseline_assessments'
  ) THEN
    CREATE POLICY "Users can read own baseline"
      ON baseline_assessments FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Users can insert own baseline'
      AND tablename = 'baseline_assessments'
  ) THEN
    CREATE POLICY "Users can insert own baseline"
      ON baseline_assessments FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 5. user_profiles timestamp columns ------------------------------------------
--    Used by SimpleAgreementCheckbox and SimpleBaseline.

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS consent_accepted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS baseline_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS baseline_completed_at TIMESTAMPTZ;

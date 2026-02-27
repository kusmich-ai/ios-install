-- ============================================
-- CLINICAL ASSESSMENTS TABLE - FULL MIGRATION
-- Research-grade schema for PHQ-9, GAD-7, PSS-10, PWB-18
-- ============================================

-- Clean up any partial previous run
DROP FUNCTION IF EXISTS get_admin_clinical_data();
DROP FUNCTION IF EXISTS get_clinical_assessment_status(UUID);
DROP VIEW IF EXISTS admin_clinical_user_details;
DROP VIEW IF EXISTS admin_clinical_overview;
DROP TABLE IF EXISTS clinical_assessments;
DROP TABLE IF EXISTS clinical_assessment_sessions;
DROP TYPE IF EXISTS clinical_timepoint;
DROP TYPE IF EXISTS clinical_measure;

-- ============================================
-- ENUMS
-- ============================================
CREATE TYPE clinical_timepoint AS ENUM ('baseline', 'stage_3', 'stage_6');
CREATE TYPE clinical_measure AS ENUM ('phq9', 'gad7', 'pss10', 'pwb18');

-- ============================================
-- MAIN ASSESSMENTS TABLE
-- One row per measure per timepoint per user
-- ============================================
CREATE TABLE clinical_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  timepoint clinical_timepoint NOT NULL,
  measure clinical_measure NOT NULL,
  item_responses JSONB NOT NULL,
  total_score NUMERIC NOT NULL,
  subscale_scores JSONB,
  severity_label TEXT,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL,
  duration_seconds INTEGER,
  administration_metadata JSONB,
  research_consent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, timepoint, measure)
);

-- ============================================
-- SESSION TABLE
-- ============================================
CREATE TABLE clinical_assessment_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  timepoint clinical_timepoint NOT NULL,
  session_started_at TIMESTAMPTZ NOT NULL,
  session_completed_at TIMESTAMPTZ,
  total_duration_seconds INTEGER,
  composite_score NUMERIC,
  is_complete BOOLEAN DEFAULT false,
  measures_completed TEXT[] DEFAULT '{}',
  research_consent BOOLEAN DEFAULT false,
  consent_timestamp TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, timepoint)
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE clinical_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_assessment_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own clinical assessments"
  ON clinical_assessments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clinical assessments"
  ON clinical_assessments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own clinical sessions"
  ON clinical_assessment_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clinical sessions"
  ON clinical_assessment_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clinical sessions"
  ON clinical_assessment_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all clinical assessments"
  ON clinical_assessments FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE email IN ('nicholas@nicholaskusmich.com', 'rachel@nicholaskusmich.com')
    )
  );

CREATE POLICY "Admins can view all clinical sessions"
  ON clinical_assessment_sessions FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE email IN ('nicholas@nicholaskusmich.com', 'rachel@nicholaskusmich.com')
    )
  );

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_clinical_assessments_user ON clinical_assessments(user_id);
CREATE INDEX idx_clinical_assessments_timepoint ON clinical_assessments(timepoint);
CREATE INDEX idx_clinical_assessments_user_timepoint ON clinical_assessments(user_id, timepoint);
CREATE INDEX idx_clinical_sessions_user ON clinical_assessment_sessions(user_id);

-- ============================================
-- ADMIN VIEW: Aggregate clinical data
-- ============================================
CREATE OR REPLACE VIEW admin_clinical_overview AS
SELECT 
  ca.timepoint,
  ca.measure,
  COUNT(DISTINCT ca.user_id) as participant_count,
  ROUND(AVG(ca.total_score)::numeric, 2) as mean_score,
  ROUND(STDDEV(ca.total_score)::numeric, 2) as sd_score,
  MIN(ca.total_score) as min_score,
  MAX(ca.total_score) as max_score,
  ROUND(AVG(ca.duration_seconds)::numeric, 0) as avg_duration_seconds
FROM clinical_assessments ca
GROUP BY ca.timepoint, ca.measure
ORDER BY ca.timepoint, ca.measure;

-- ============================================
-- ADMIN VIEW: Individual user clinical data with deltas
-- ============================================
CREATE OR REPLACE VIEW admin_clinical_user_details AS
SELECT 
  ca.user_id,
  COALESCE(up.full_name, 'Unknown') as user_name,
  ca.timepoint,
  ca.measure,
  ca.total_score,
  ca.severity_label,
  ca.completed_at,
  ca.duration_seconds,
  ca.total_score - COALESCE(
    (SELECT baseline.total_score 
     FROM clinical_assessments baseline 
     WHERE baseline.user_id = ca.user_id 
       AND baseline.measure = ca.measure 
       AND baseline.timepoint = 'baseline'),
    ca.total_score
  ) as delta_from_baseline
FROM clinical_assessments ca
LEFT JOIN user_profiles up ON ca.user_id = up.id
ORDER BY ca.user_id, ca.timepoint, ca.measure;

-- ============================================
-- GRANTS
-- ============================================
GRANT SELECT ON admin_clinical_overview TO authenticated;
GRANT SELECT ON admin_clinical_user_details TO authenticated;

-- ============================================
-- FUNCTION: Check clinical assessment status for a user
-- ============================================
CREATE OR REPLACE FUNCTION get_clinical_assessment_status(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
  user_stage INTEGER;
BEGIN
  SELECT current_stage INTO user_stage
  FROM user_progress
  WHERE user_id = p_user_id;
  
  SELECT json_build_object(
    'baseline', (
      SELECT json_build_object(
        'completed', COALESCE(s.is_complete, false),
        'completed_at', s.session_completed_at,
        'available', true
      )
      FROM clinical_assessment_sessions s
      WHERE s.user_id = p_user_id AND s.timepoint = 'baseline'
    ),
    'stage_3', (
      SELECT json_build_object(
        'completed', COALESCE(s.is_complete, false),
        'completed_at', s.session_completed_at,
        'available', COALESCE(user_stage, 1) >= 3
      )
      FROM clinical_assessment_sessions s
      WHERE s.user_id = p_user_id AND s.timepoint = 'stage_3'
    ),
    'stage_6', (
      SELECT json_build_object(
        'completed', COALESCE(s.is_complete, false),
        'completed_at', s.session_completed_at,
        'available', COALESCE(user_stage, 1) >= 6
      )
      FROM clinical_assessment_sessions s
      WHERE s.user_id = p_user_id AND s.timepoint = 'stage_6'
    ),
    'current_stage', COALESCE(user_stage, 1),
    'next_pending', CASE
      WHEN NOT EXISTS (
        SELECT 1 FROM clinical_assessment_sessions 
        WHERE user_id = p_user_id AND timepoint = 'baseline' AND is_complete = true
      ) THEN 'baseline'
      WHEN COALESCE(user_stage, 1) >= 3 AND NOT EXISTS (
        SELECT 1 FROM clinical_assessment_sessions 
        WHERE user_id = p_user_id AND timepoint = 'stage_3' AND is_complete = true
      ) THEN 'stage_3'
      WHEN COALESCE(user_stage, 1) >= 6 AND NOT EXISTS (
        SELECT 1 FROM clinical_assessment_sessions 
        WHERE user_id = p_user_id AND timepoint = 'stage_6' AND is_complete = true
      ) THEN 'stage_6'
      ELSE null
    END
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_clinical_assessment_status(UUID) TO authenticated;

-- ============================================
-- FUNCTION: Get admin clinical dashboard data
-- ============================================
CREATE OR REPLACE FUNCTION get_admin_clinical_data()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'overview', (SELECT COALESCE(json_agg(t), '[]'::json) FROM admin_clinical_overview t),
    'userDetails', (SELECT COALESCE(json_agg(t), '[]'::json) FROM admin_clinical_user_details t),
    'totalParticipants', (
      SELECT COUNT(DISTINCT user_id) FROM clinical_assessment_sessions WHERE is_complete = true
    ),
    'completionRates', (
      SELECT json_build_object(
        'baseline', COUNT(*) FILTER (WHERE timepoint = 'baseline' AND is_complete = true),
        'stage_3', COUNT(*) FILTER (WHERE timepoint = 'stage_3' AND is_complete = true),
        'stage_6', COUNT(*) FILTER (WHERE timepoint = 'stage_6' AND is_complete = true)
      )
      FROM clinical_assessment_sessions
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_admin_clinical_data() TO authenticated;

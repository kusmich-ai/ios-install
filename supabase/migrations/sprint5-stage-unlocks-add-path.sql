-- Sprint 5 C.1: Add unlock_path column to stage_unlocks audit trail
-- Enables analysis of which unlock path fired (A/B/C/D/accelerated/manual)
-- for Sprint 7 threshold calibration with real distribution data.

ALTER TABLE public.stage_unlocks
ADD COLUMN IF NOT EXISTS unlock_path text;

COMMENT ON COLUMN public.stage_unlocks.unlock_path IS
'Which unlock path fired: pathA (calm), pathB (delta), pathC (competence), pathD (high adherence), accelerated, or manual';

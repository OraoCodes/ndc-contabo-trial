-- ============================================================================
-- CLEAN THEMATIC AREAS TABLE
-- Created: 2025-01-10
-- Purpose: Delete all data from thematic_areas table and related data
-- ============================================================================

-- ============================================================================
-- DELETE RELATED DATA FIRST (to avoid foreign key violations)
-- ============================================================================

-- Delete indicators that reference thematic areas
-- Note: indicators.thematic_area is a TEXT field (name), not a foreign key
-- So we delete all indicators first to be safe
DELETE FROM indicators;

-- Delete or update counties that reference thematic areas
-- If counties.thematic_area_id exists and is a foreign key, set to NULL or delete
-- Check if the column exists first
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'counties' 
        AND column_name = 'thematic_area_id'
    ) THEN
        -- Set thematic_area_id to NULL for all counties
        UPDATE counties SET thematic_area_id = NULL WHERE thematic_area_id IS NOT NULL;
    END IF;
END $$;

-- Delete county performance data (may reference indicators/thematic areas)
DELETE FROM county_performance;

-- ============================================================================
-- DELETE THEMATIC AREAS
-- ============================================================================
DELETE FROM thematic_areas;

-- ============================================================================
-- RESET SEQUENCES (optional - for clean ID numbering)
-- ============================================================================
-- Reset the sequence for thematic_areas.id
ALTER SEQUENCE IF EXISTS thematic_areas_id_seq RESTART WITH 1;

-- Reset the sequence for indicators.id
ALTER SEQUENCE IF EXISTS indicators_id_seq RESTART WITH 1;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Check that thematic_areas table is empty
DO $$
DECLARE
    count_result INTEGER;
BEGIN
    SELECT COUNT(*) INTO count_result FROM thematic_areas;
    IF count_result > 0 THEN
        RAISE NOTICE 'Warning: thematic_areas table still contains % rows', count_result;
    ELSE
        RAISE NOTICE 'Success: thematic_areas table is now empty';
    END IF;
END $$;


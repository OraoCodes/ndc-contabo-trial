-- Indicators: add title/name and associate with thematic area via FK
-- Created: 2025-01-10

ALTER TABLE indicators
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS thematic_area_id integer REFERENCES thematic_areas(id);

ALTER TABLE indicators DROP COLUMN IF EXISTS thematic_area;

-- Backfill for existing rows (e.g. title from indicator_text, first thematic area)
UPDATE indicators SET title = indicator_text WHERE title IS NULL;
UPDATE indicators SET thematic_area_id = (SELECT id FROM thematic_areas LIMIT 1) WHERE thematic_area_id IS NULL;

ALTER TABLE indicators ALTER COLUMN title SET NOT NULL;
ALTER TABLE indicators ALTER COLUMN thematic_area_id SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_indicators_thematic_area_id_title ON indicators(thematic_area_id, title);

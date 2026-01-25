-- Sample Data for NDC Dashboard
-- This migration inserts sample data to demonstrate the application functionality
-- Created: 2025-01-07

-- ============================================================================
-- THEMATIC AREAS
-- ============================================================================
INSERT INTO public.thematic_areas (name, description) VALUES
  ('Governance', 'Policy frameworks, institutional arrangements, and coordination mechanisms for climate action'),
  ('MRV', 'Monitoring, Reporting, and Verification systems for tracking climate progress'),
  ('Mitigation', 'Greenhouse gas emission reduction strategies and renewable energy adoption'),
  ('Adaptation & Resilience', 'Climate risk assessment, early warning systems, and resilient infrastructure'),
  ('Finance & Resource Mobilization', 'Climate budget allocation, international finance access, and private sector participation')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- COUNTIES (Kenyan Counties)
-- ============================================================================
INSERT INTO public.counties (name, population, thematic_area_id) VALUES
  ('Nairobi', 4397073, 1),
  ('Mombasa', 1208333, 1),
  ('Kisumu', 1155574, 1),
  ('Nakuru', 2162203, 1),
  ('Eldoret', 475716, 1),
  ('Thika', 279429, 1),
  ('Malindi', 119859, 1),
  ('Kitale', 106187, 1),
  ('Garissa', 841353, 1),
  ('Kakamega', 1867579, 1),
  ('Meru', 1545714, 1),
  ('Nyeri', 759164, 1),
  ('Machakos', 1421932, 1),
  ('Uasin Gishu', 1163186, 1),
  ('Kiambu', 2417735, 1),
  ('Kilifi', 1453787, 1),
  ('Bungoma', 1670570, 1),
  ('Busia', 893681, 1),
  ('Homa Bay', 1131950, 1),
  ('Migori', 1116436, 1)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- PUBLICATIONS
-- ============================================================================
INSERT INTO public.publications (title, date, summary, filename, storage_path, file_size, mime_type) VALUES
  ('NDC Implementation Report 2024', '2024-12-15', 'Comprehensive report on Kenya''s Nationally Determined Contributions progress in water and waste management sectors', 'ndc-report-2024.pdf', 'publications/ndc-report-2024.pdf', 2456789, 'application/pdf'),
  ('County Climate Action Plans: Best Practices', '2024-11-20', 'Analysis of successful climate action plans implemented across Kenyan counties', 'county-climate-plans.pdf', 'publications/county-climate-plans.pdf', 1892345, 'application/pdf'),
  ('Water Sector GHG Emissions Inventory 2024', '2024-10-10', 'Detailed greenhouse gas emissions inventory for the water sector across all counties', 'water-ghg-inventory-2024.pdf', 'publications/water-ghg-inventory-2024.pdf', 3124567, 'application/pdf'),
  ('Waste Management Performance Index 2024', '2024-09-05', 'Annual performance index ranking counties on waste management and circular economy initiatives', 'waste-performance-index-2024.pdf', 'publications/waste-performance-index-2024.pdf', 2789012, 'application/pdf'),
  ('Climate Finance Mobilization Guide', '2024-08-18', 'Practical guide for counties to access international climate finance and mobilize resources', 'climate-finance-guide.pdf', 'publications/climate-finance-guide.pdf', 1567890, 'application/pdf')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- COUNTY PERFORMANCE DATA (Water Sector - 2025)
-- ============================================================================
-- Note: This uses county IDs, so we need to get them first
DO $$
DECLARE
  nairobi_id INTEGER;
  mombasa_id INTEGER;
  kisumu_id INTEGER;
  nakuru_id INTEGER;
  eldoret_id INTEGER;
  thika_id INTEGER;
  malindi_id INTEGER;
  kitale_id INTEGER;
  garissa_id INTEGER;
  kakamega_id INTEGER;
  meru_id INTEGER;
  nyeri_id INTEGER;
  machakos_id INTEGER;
  uasin_gishu_id INTEGER;
  kiambu_id INTEGER;
  kilifi_id INTEGER;
  bungoma_id INTEGER;
  busia_id INTEGER;
  homa_bay_id INTEGER;
  migori_id INTEGER;
BEGIN
  -- Get county IDs
  SELECT id INTO nairobi_id FROM public.counties WHERE name = 'Nairobi';
  SELECT id INTO mombasa_id FROM public.counties WHERE name = 'Mombasa';
  SELECT id INTO kisumu_id FROM public.counties WHERE name = 'Kisumu';
  SELECT id INTO nakuru_id FROM public.counties WHERE name = 'Nakuru';
  SELECT id INTO eldoret_id FROM public.counties WHERE name = 'Eldoret';
  SELECT id INTO thika_id FROM public.counties WHERE name = 'Thika';
  SELECT id INTO malindi_id FROM public.counties WHERE name = 'Malindi';
  SELECT id INTO kitale_id FROM public.counties WHERE name = 'Kitale';
  SELECT id INTO garissa_id FROM public.counties WHERE name = 'Garissa';
  SELECT id INTO kakamega_id FROM public.counties WHERE name = 'Kakamega';
  SELECT id INTO meru_id FROM public.counties WHERE name = 'Meru';
  SELECT id INTO nyeri_id FROM public.counties WHERE name = 'Nyeri';
  SELECT id INTO machakos_id FROM public.counties WHERE name = 'Machakos';
  SELECT id INTO uasin_gishu_id FROM public.counties WHERE name = 'Uasin Gishu';
  SELECT id INTO kiambu_id FROM public.counties WHERE name = 'Kiambu';
  SELECT id INTO kilifi_id FROM public.counties WHERE name = 'Kilifi';
  SELECT id INTO bungoma_id FROM public.counties WHERE name = 'Bungoma';
  SELECT id INTO busia_id FROM public.counties WHERE name = 'Busia';
  SELECT id INTO homa_bay_id FROM public.counties WHERE name = 'Homa Bay';
  SELECT id INTO migori_id FROM public.counties WHERE name = 'Migori';

  -- Insert Water Sector Performance (2025)
  INSERT INTO public.county_performance (county_id, year, sector, overall_score, sector_score, governance, mrv, mitigation, adaptation, finance, indicators_json) VALUES
    (nairobi_id, 2025, 'water', 85.5, 85.5, 28.5, 18.0, 19.0, 12.0, 8.0, '{"g1": "Yes", "g2": 85, "g3": "Yes", "g4": "Yes", "g5": "Yes", "g6": "Yes"}'::jsonb),
    (mombasa_id, 2025, 'water', 82.3, 82.3, 27.0, 17.5, 18.0, 11.5, 8.3, '{"g1": "Yes", "g2": 80, "g3": "Yes", "g4": "Yes", "g5": "Yes", "g6": "Yes"}'::jsonb),
    (kisumu_id, 2025, 'water', 78.9, 78.9, 25.5, 16.5, 17.5, 11.0, 8.4, '{"g1": "Yes", "g2": 75, "g3": "Yes", "g4": "Yes", "g5": "Yes", "g6": "No"}'::jsonb),
    (nakuru_id, 2025, 'water', 76.2, 76.2, 24.0, 16.0, 17.0, 10.5, 8.7, '{"g1": "Yes", "g2": 70, "g3": "Yes", "g4": "Yes", "g5": "Yes", "g6": "No"}'::jsonb),
    (eldoret_id, 2025, 'water', 74.5, 74.5, 23.5, 15.5, 16.5, 10.0, 9.0, '{"g1": "Yes", "g2": 68, "g3": "Yes", "g4": "Yes", "g5": "No", "g6": "No"}'::jsonb),
    (thika_id, 2025, 'water', 72.8, 72.8, 22.5, 15.0, 16.0, 9.5, 9.8, '{"g1": "Yes", "g2": 65, "g3": "Yes", "g4": "Yes", "g5": "No", "g6": "No"}'::jsonb),
    (malindi_id, 2025, 'water', 71.0, 71.0, 21.5, 14.5, 15.5, 9.0, 10.5, '{"g1": "Yes", "g2": 60, "g3": "Yes", "g4": "No", "g5": "No", "g6": "No"}'::jsonb),
    (kitale_id, 2025, 'water', 69.3, 69.3, 20.5, 14.0, 15.0, 8.5, 11.3, '{"g1": "Yes", "g2": 55, "g3": "Yes", "g4": "No", "g5": "No", "g6": "No"}'::jsonb),
    (garissa_id, 2025, 'water', 67.5, 67.5, 19.5, 13.5, 14.5, 8.0, 12.0, '{"g1": "Yes", "g2": 50, "g3": "No", "g4": "No", "g5": "No", "g6": "No"}'::jsonb),
    (kakamega_id, 2025, 'water', 65.8, 65.8, 18.5, 13.0, 14.0, 7.5, 12.8, '{"g1": "Yes", "g2": 45, "g3": "No", "g4": "No", "g5": "No", "g6": "No"}'::jsonb),
    (meru_id, 2025, 'water', 64.0, 64.0, 17.5, 12.5, 13.5, 7.0, 13.5, '{"g1": "Yes", "g2": 40, "g3": "No", "g4": "No", "g5": "No", "g6": "No"}'::jsonb),
    (nyeri_id, 2025, 'water', 62.3, 62.3, 16.5, 12.0, 13.0, 6.5, 14.3, '{"g1": "Yes", "g2": 35, "g3": "No", "g4": "No", "g5": "No", "g6": "No"}'::jsonb),
    (machakos_id, 2025, 'water', 60.5, 60.5, 15.5, 11.5, 12.5, 6.0, 15.0, '{"g1": "No", "g2": 30, "g3": "No", "g4": "No", "g5": "No", "g6": "No"}'::jsonb),
    (uasin_gishu_id, 2025, 'water', 58.8, 58.8, 14.5, 11.0, 12.0, 5.5, 15.8, '{"g1": "No", "g2": 25, "g3": "No", "g4": "No", "g5": "No", "g6": "No"}'::jsonb),
    (kiambu_id, 2025, 'water', 57.0, 57.0, 13.5, 10.5, 11.5, 5.0, 16.5, '{"g1": "No", "g2": 20, "g3": "No", "g4": "No", "g5": "No", "g6": "No"}'::jsonb),
    (kilifi_id, 2025, 'water', 55.3, 55.3, 12.5, 10.0, 11.0, 4.5, 17.3, '{"g1": "No", "g2": 15, "g3": "No", "g4": "No", "g5": "No", "g6": "No"}'::jsonb),
    (bungoma_id, 2025, 'water', 53.5, 53.5, 11.5, 9.5, 10.5, 4.0, 18.0, '{"g1": "No", "g2": 10, "g3": "No", "g4": "No", "g5": "No", "g6": "No"}'::jsonb),
    (busia_id, 2025, 'water', 51.8, 51.8, 10.5, 9.0, 10.0, 3.5, 18.8, '{"g1": "No", "g2": 5, "g3": "No", "g4": "No", "g5": "No", "g6": "No"}'::jsonb),
    (homa_bay_id, 2025, 'water', 50.0, 50.0, 9.5, 8.5, 9.5, 3.0, 19.5, '{"g1": "No", "g2": 0, "g3": "No", "g4": "No", "g5": "No", "g6": "No"}'::jsonb),
    (migori_id, 2025, 'water', 48.3, 48.3, 8.5, 8.0, 9.0, 2.5, 20.3, '{"g1": "No", "g2": 0, "g3": "No", "g4": "No", "g5": "No", "g6": "No"}'::jsonb)
  ON CONFLICT (county_id, year, sector) DO UPDATE SET
    overall_score = EXCLUDED.overall_score,
    sector_score = EXCLUDED.sector_score,
    governance = EXCLUDED.governance,
    mrv = EXCLUDED.mrv,
    mitigation = EXCLUDED.mitigation,
    adaptation = EXCLUDED.adaptation,
    finance = EXCLUDED.finance,
    indicators_json = EXCLUDED.indicators_json;

  -- Insert Waste Sector Performance (2025)
  INSERT INTO public.county_performance (county_id, year, sector, overall_score, sector_score, governance, mrv, mitigation, adaptation, finance, indicators_json) VALUES
    (nairobi_id, 2025, 'waste', 88.2, 88.2, 29.0, 18.5, 19.5, 12.5, 8.7, '{"g1": "Yes", "g2": 90, "g3": "Yes", "g4": "Yes", "g5": "Yes", "g6": "Yes"}'::jsonb),
    (mombasa_id, 2025, 'waste', 85.0, 85.0, 27.5, 18.0, 18.5, 12.0, 9.0, '{"g1": "Yes", "g2": 85, "g3": "Yes", "g4": "Yes", "g5": "Yes", "g6": "Yes"}'::jsonb),
    (kisumu_id, 2025, 'waste', 81.5, 81.5, 26.0, 17.0, 18.0, 11.5, 9.0, '{"g1": "Yes", "g2": 80, "g3": "Yes", "g4": "Yes", "g5": "Yes", "g6": "No"}'::jsonb),
    (nakuru_id, 2025, 'waste', 79.0, 79.0, 24.5, 16.5, 17.5, 11.0, 9.5, '{"g1": "Yes", "g2": 75, "g3": "Yes", "g4": "Yes", "g5": "Yes", "g6": "No"}'::jsonb),
    (eldoret_id, 2025, 'waste', 76.5, 76.5, 23.0, 16.0, 17.0, 10.5, 10.0, '{"g1": "Yes", "g2": 70, "g3": "Yes", "g4": "Yes", "g5": "No", "g6": "No"}'::jsonb),
    (thika_id, 2025, 'waste', 74.0, 74.0, 21.5, 15.5, 16.5, 10.0, 10.5, '{"g1": "Yes", "g2": 65, "g3": "Yes", "g4": "Yes", "g5": "No", "g6": "No"}'::jsonb),
    (malindi_id, 2025, 'waste', 71.5, 71.5, 20.0, 15.0, 16.0, 9.5, 11.0, '{"g1": "Yes", "g2": 60, "g3": "Yes", "g4": "No", "g5": "No", "g6": "No"}'::jsonb),
    (kitale_id, 2025, 'waste', 69.0, 69.0, 18.5, 14.5, 15.5, 9.0, 11.5, '{"g1": "Yes", "g2": 55, "g3": "Yes", "g4": "No", "g5": "No", "g6": "No"}'::jsonb),
    (garissa_id, 2025, 'waste', 66.5, 66.5, 17.0, 14.0, 15.0, 8.5, 12.0, '{"g1": "Yes", "g2": 50, "g3": "No", "g4": "No", "g5": "No", "g6": "No"}'::jsonb),
    (kakamega_id, 2025, 'waste', 64.0, 64.0, 15.5, 13.5, 14.5, 8.0, 12.5, '{"g1": "Yes", "g2": 45, "g3": "No", "g4": "No", "g5": "No", "g6": "No"}'::jsonb),
    (meru_id, 2025, 'waste', 61.5, 61.5, 14.0, 13.0, 14.0, 7.5, 13.0, '{"g1": "Yes", "g2": 40, "g3": "No", "g4": "No", "g5": "No", "g6": "No"}'::jsonb),
    (nyeri_id, 2025, 'waste', 59.0, 59.0, 12.5, 12.5, 13.5, 7.0, 13.5, '{"g1": "Yes", "g2": 35, "g3": "No", "g4": "No", "g5": "No", "g6": "No"}'::jsonb),
    (machakos_id, 2025, 'waste', 56.5, 56.5, 11.0, 12.0, 13.0, 6.5, 14.0, '{"g1": "No", "g2": 30, "g3": "No", "g4": "No", "g5": "No", "g6": "No"}'::jsonb),
    (uasin_gishu_id, 2025, 'waste', 54.0, 54.0, 9.5, 11.5, 12.5, 6.0, 14.5, '{"g1": "No", "g2": 25, "g3": "No", "g4": "No", "g5": "No", "g6": "No"}'::jsonb),
    (kiambu_id, 2025, 'waste', 51.5, 51.5, 8.0, 11.0, 12.0, 5.5, 15.0, '{"g1": "No", "g2": 20, "g3": "No", "g4": "No", "g5": "No", "g6": "No"}'::jsonb),
    (kilifi_id, 2025, 'waste', 49.0, 49.0, 6.5, 10.5, 11.5, 5.0, 15.5, '{"g1": "No", "g2": 15, "g3": "No", "g4": "No", "g5": "No", "g6": "No"}'::jsonb),
    (bungoma_id, 2025, 'waste', 46.5, 46.5, 5.0, 10.0, 11.0, 4.5, 16.0, '{"g1": "No", "g2": 10, "g3": "No", "g4": "No", "g5": "No", "g6": "No"}'::jsonb),
    (busia_id, 2025, 'waste', 44.0, 44.0, 3.5, 9.5, 10.5, 4.0, 16.5, '{"g1": "No", "g2": 5, "g3": "No", "g4": "No", "g5": "No", "g6": "No"}'::jsonb),
    (homa_bay_id, 2025, 'waste', 41.5, 41.5, 2.0, 9.0, 10.0, 3.5, 17.0, '{"g1": "No", "g2": 0, "g3": "No", "g4": "No", "g5": "No", "g6": "No"}'::jsonb),
    (migori_id, 2025, 'waste', 39.0, 39.0, 0.5, 8.5, 9.5, 3.0, 17.5, '{"g1": "No", "g2": 0, "g3": "No", "g4": "No", "g5": "No", "g6": "No"}'::jsonb)
  ON CONFLICT (county_id, year, sector) DO UPDATE SET
    overall_score = EXCLUDED.overall_score,
    sector_score = EXCLUDED.sector_score,
    governance = EXCLUDED.governance,
    mrv = EXCLUDED.mrv,
    mitigation = EXCLUDED.mitigation,
    adaptation = EXCLUDED.adaptation,
    finance = EXCLUDED.finance,
    indicators_json = EXCLUDED.indicators_json;
END $$;


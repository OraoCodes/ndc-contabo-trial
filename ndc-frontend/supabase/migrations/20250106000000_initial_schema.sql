-- Initial NDC Database Schema Migration
-- Converts SQLite schema to PostgreSQL for Supabase
-- Created: 2025-01-06

-- Enable UUID extension for user profiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: thematic_areas
-- ============================================================================
CREATE TABLE IF NOT EXISTS thematic_areas (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: counties
-- ============================================================================
CREATE TABLE IF NOT EXISTS counties (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  population INTEGER,
  thematic_area_id INTEGER REFERENCES thematic_areas(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: user_profiles
-- ============================================================================
-- Note: Supabase Auth handles authentication, this table stores additional profile data
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  organisation TEXT,
  phone_number TEXT,
  position TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: county_performance
-- ============================================================================
CREATE TABLE IF NOT EXISTS county_performance (
  id SERIAL PRIMARY KEY,
  county_id INTEGER NOT NULL REFERENCES counties(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  sector TEXT NOT NULL CHECK(sector IN ('water', 'waste')),
  overall_score REAL,
  sector_score REAL,
  governance REAL,
  mrv REAL,
  mitigation REAL,
  adaptation REAL,
  finance REAL,
  indicators_json JSONB, -- Changed from TEXT to JSONB for better querying
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(county_id, year, sector)
);

-- ============================================================================
-- TABLE: indicators
-- ============================================================================
CREATE TABLE IF NOT EXISTS indicators (
  id SERIAL PRIMARY KEY,
  sector TEXT NOT NULL CHECK(sector IN ('water', 'waste')),
  thematic_area TEXT NOT NULL,
  indicator_text TEXT NOT NULL,
  weight REAL NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sector, indicator_text)
);

-- ============================================================================
-- TABLE: publications
-- ============================================================================
-- Note: File storage moved to Supabase Storage, this table stores metadata
CREATE TABLE IF NOT EXISTS publications (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  date DATE,
  summary TEXT,
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL, -- Path in Supabase Storage bucket
  file_size INTEGER, -- Size in bytes
  mime_type TEXT DEFAULT 'application/pdf',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES for Performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_county_performance_county_year 
  ON county_performance(county_id, year);

CREATE INDEX IF NOT EXISTS idx_county_performance_sector 
  ON county_performance(sector);

CREATE INDEX IF NOT EXISTS idx_county_performance_year 
  ON county_performance(year);

CREATE INDEX IF NOT EXISTS idx_indicators_sector 
  ON indicators(sector);

CREATE INDEX IF NOT EXISTS idx_indicators_thematic_area 
  ON indicators(thematic_area);

CREATE INDEX IF NOT EXISTS idx_publications_date 
  ON publications(date DESC);

CREATE INDEX IF NOT EXISTS idx_counties_thematic_area 
  ON counties(thematic_area_id);

-- ============================================================================
-- INSERT INITIAL INDICATORS
-- ============================================================================
-- Water Sector Indicators
INSERT INTO indicators (sector, thematic_area, indicator_text, weight) VALUES
  -- Governance
  ('water', 'Governance', 'Existence of relevant sector policy aligned with NDCs, county action plan or sectoral climate strategy, institution involved in climate governance.', 10),
  ('water', 'Governance', '% of staff trained in climate-related planning.', 10),
  ('water', 'Governance', 'Inclusion of climate targets in county performance contracts', 10),
  ('water', 'Governance', 'Inclusion of climate goals into County Integrated Development Plan (CIDP).', 10),
  ('water', 'Governance', 'Stakeholder participation mechanism established (public forums, workshops).', 10),
  ('water', 'Governance', 'Coordination mechanism established (committees, MoUs)', 10),
  
  -- MRV (Monitoring, Reporting & Verification)
  ('water', 'MRV', 'Existence of MRV system for NDC tracking', 10),
  ('water', 'MRV', 'Frequency of data updates (Annually/Monthly)', 10),
  ('water', 'MRV', '% of indicators with available data', 10),
  ('water', 'MRV', 'Sector emission inventories available', 10),
  ('water', 'MRV', 'County submits climate reports to national MRV system', 10),
  ('water', 'MRV', 'Verification mechanism in place', 10),
  
  -- Mitigation
  ('water', 'Mitigation', 'GHG emission reduction target exists', 10),
  ('water', 'Mitigation', 'Annual GHG reduction achieved (%)', 10),
  ('water', 'Mitigation', 'Renewable energy share in sector (%)', 10),
  ('water', 'Mitigation', '% of climate projects focused on mitigation', 10),
  
  -- Adaptation & Resilience
  ('water', 'Adaptation & Resilience', 'Climate risk assessment conducted', 10),
  ('water', 'Adaptation & Resilience', '% population with climate-resilient infrastructure access', 10),
  ('water', 'Adaptation & Resilience', 'Number of early warning systems operational', 10),
  ('water', 'Adaptation & Resilience', 'Ecosystem restoration area covered (Hectares)', 10),
  ('water', 'Adaptation & Resilience', '% of vulnerable communities supported', 10),
  ('water', 'Adaptation & Resilience', 'Drought/flood response protocols in place', 10),
  
  -- Finance & Resource Mobilization
  ('water', 'Finance & Resource Mobilization', 'Climate budget line exists', 10),
  ('water', 'Finance & Resource Mobilization', 'Disaster risk reduction budget allocation (KES)', 10),
  ('water', 'Finance & Resource Mobilization', '% of county budget allocated to climate actions', 10),
  ('water', 'Finance & Resource Mobilization', 'Amount of climate finance mobilized (donors, PPPs) (KES)', 10),
  ('water', 'Finance & Resource Mobilization', 'Access to international climate finance (GCF, Adaptation Fund, etc.)', 10),
  ('water', 'Finance & Resource Mobilization', 'Private sector participation in climate action', 10),
  ('water', 'Finance & Resource Mobilization', 'Budget absorption rate (allocated vs. spent) (%)', 10),
  ('water', 'Finance & Resource Mobilization', 'Financial reporting system aligned with NDC tracking', 10),

  -- Waste Sector Indicators
  -- Governance
  ('waste', 'Governance', 'Existence of relevant sector policy aligned with NDCs, county action plan or sectoral climate strategy, institution involved in climate governance.', 10),
  ('waste', 'Governance', '% of staff trained in climate-related planning.', 10),
  ('waste', 'Governance', 'Inclusion of climate targets in county performance contracts', 10),
  ('waste', 'Governance', 'Inclusion of climate goals into County Integrated Development Plan (CIDP).', 10),
  ('waste', 'Governance', 'Stakeholder participation mechanism established (public forums, workshops).', 10),
  ('waste', 'Governance', 'Coordination mechanism established (committees, MoUs)', 10),

  -- MRV (Monitoring, Reporting & Verification)
  ('waste', 'MRV', 'Existence of MRV system for NDC tracking', 10),
  ('waste', 'MRV', 'Frequency of data updates (Annually/Monthly)', 10),
  ('waste', 'MRV', '% of indicators with available data', 10),
  ('waste', 'MRV', 'Sector emission inventories available', 10),
  ('waste', 'MRV', 'County submits climate reports to national MRV system', 10),
  ('waste', 'MRV', 'Verification mechanism in place', 10),

  -- Mitigation
  ('waste', 'Mitigation', 'GHG emission reduction target exists', 10),
  ('waste', 'Mitigation', 'Annual GHG reduction achieved (%)', 10),
  ('waste', 'Mitigation', 'Renewable energy share in sector (%)', 10),
  ('waste', 'Mitigation', 'Waste diverted from landfill (%)', 10),
  ('waste', 'Mitigation', '% of climate projects focused on mitigation', 10),
  ('waste', 'Mitigation', 'Use of methane capture systems (e.g., biogas, flaring)', 10),
  ('waste', 'Mitigation', 'Circular economy initiatives adopted', 10),

  -- Adaptation & Resilience
  ('waste', 'Adaptation & Resilience', 'Climate risk assessment conducted', 10),
  ('waste', 'Adaptation & Resilience', '% population with climate-resilient infrastructure access', 10),
  ('waste', 'Adaptation & Resilience', 'Number of early warning systems operational', 10),
  ('waste', 'Adaptation & Resilience', 'Ecosystem restoration area covered (Hectares)', 10),
  ('waste', 'Adaptation & Resilience', '% of vulnerable communities supported', 10),
  ('waste', 'Adaptation & Resilience', 'Drought/flood response protocols in place', 10),
  
  -- Finance & Resource Mobilization
  ('waste', 'Finance & Resource Mobilization', 'Climate budget line exists', 10),
  ('waste', 'Finance & Resource Mobilization', 'Disaster risk reduction budget allocation (KES)', 10),
  ('waste', 'Finance & Resource Mobilization', '% of county budget allocated to climate actions', 10),
  ('waste', 'Finance & Resource Mobilization', 'Amount of climate finance mobilized (donors, PPPs) (KES)', 10),
  ('waste', 'Finance & Resource Mobilization', 'Access to international climate finance (GCF, Adaptation Fund, etc.)', 10),
  ('waste', 'Finance & Resource Mobilization', 'Private sector participation in climate action', 10),
  ('waste', 'Finance & Resource Mobilization', 'Budget absorption rate (allocated vs. spent) (%)', 10),
  ('waste', 'Finance & Resource Mobilization', 'Financial reporting system aligned with NDC tracking', 10)
ON CONFLICT (sector, indicator_text) DO NOTHING;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE counties ENABLE ROW LEVEL SECURITY;
ALTER TABLE county_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE thematic_areas ENABLE ROW LEVEL SECURITY;

-- Public read access (anyone can view)
CREATE POLICY "Public read access on counties" 
  ON counties FOR SELECT 
  USING (true);

CREATE POLICY "Public read access on county_performance" 
  ON county_performance FOR SELECT 
  USING (true);

CREATE POLICY "Public read access on publications" 
  ON publications FOR SELECT 
  USING (true);

CREATE POLICY "Public read access on indicators" 
  ON indicators FOR SELECT 
  USING (true);

CREATE POLICY "Public read access on thematic_areas" 
  ON thematic_areas FOR SELECT 
  USING (true);

-- Authenticated users can view their own profile
CREATE POLICY "Users can view own profile" 
  ON user_profiles FOR SELECT 
  USING (auth.uid() = id);

-- Authenticated users can update their own profile
CREATE POLICY "Users can update own profile" 
  ON user_profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Authenticated users can insert/update county performance
CREATE POLICY "Authenticated users can manage county_performance" 
  ON county_performance FOR ALL 
  USING (auth.role() = 'authenticated');

-- Authenticated users can manage publications
CREATE POLICY "Authenticated users can manage publications" 
  ON publications FOR ALL 
  USING (auth.role() = 'authenticated');

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at
CREATE TRIGGER update_thematic_areas_updated_at
  BEFORE UPDATE ON thematic_areas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_counties_updated_at
  BEFORE UPDATE ON counties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_county_performance_updated_at
  BEFORE UPDATE ON county_performance
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_indicators_updated_at
  BEFORE UPDATE ON indicators
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_publications_updated_at
  BEFORE UPDATE ON publications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS for Documentation
-- ============================================================================
COMMENT ON TABLE thematic_areas IS 'Broad thematic areas for climate action (e.g., Water, Waste)';
COMMENT ON TABLE counties IS 'Kenyan counties with population and thematic area associations';
COMMENT ON TABLE user_profiles IS 'Extended user profile data linked to Supabase Auth users';
COMMENT ON TABLE county_performance IS 'Annual county performance scores by sector (water/waste)';
COMMENT ON TABLE indicators IS 'Climate action indicators with weights for scoring';
COMMENT ON TABLE publications IS 'Publication metadata (files stored in Supabase Storage)';


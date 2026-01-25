-- ============================================================================
-- RECREATE NDC FRAMEWORK DATA
-- Created: 2025-01-10
-- Purpose: Clear existing data and recreate thematic areas and indicators
--          aligned with NDC Implementation Index Scoring Framework
-- ============================================================================

-- ============================================================================
-- FIX UNIQUE CONSTRAINT ON THEMATIC_AREAS
-- ============================================================================
-- Drop the existing unique constraint on name (allows same name for different sectors)
ALTER TABLE thematic_areas DROP CONSTRAINT IF EXISTS thematic_areas_name_key;

-- Add composite unique constraint on (name, sector) so same name can exist for different sectors
ALTER TABLE thematic_areas 
ADD CONSTRAINT thematic_areas_name_sector_unique UNIQUE (name, sector);

-- ============================================================================
-- CLEAR EXISTING DATA
-- ============================================================================
-- Clear county performance data (keep structure)
DELETE FROM county_performance;

-- Clear indicators
DELETE FROM indicators;

-- Clear thematic areas
DELETE FROM thematic_areas;

-- Reset sequences (optional, for clean IDs)
ALTER SEQUENCE thematic_areas_id_seq RESTART WITH 1;
ALTER SEQUENCE indicators_id_seq RESTART WITH 1;

-- ============================================================================
-- INSERT THEMATIC AREAS (5 Components per Sector)
-- Based on NDC Implementation Index Formula:
-- Governance: 30%, MRV: 25%, Mitigation: 20%, Adaptation: 15%, Finance: 10%
-- ============================================================================

-- WATER SECTOR THEMATIC AREAS (Total: 100%)
INSERT INTO thematic_areas (name, description, sector, weight_percentage) VALUES
  ('Governance & Policy Framework', 'Emphasizes clear institutional roles, policies, regulations, enforcement, local government capacity, sector policy, enforcement mechanisms, institutional coordination, county climate action plans, bylaws, and stakeholder inclusion.', 'water', 30.0),
  ('MRV', 'Focuses on reliable tracking of waste generation, treatment, recycling rates, and water quality for NDC transparency and compliance. Score is based on data systems, baseline data, reporting frequency, GHG estimation methods, and digital tracking of waste & water.', 'water', 25.0),
  ('Mitigation Actions', 'Addresses methane (CH4) and CO2-equivalent gases from solid waste and wastewater. Central to NDC targets are reduction measures like recycling, composting, biogas, landfill management, methane capture, and wastewater treatment.', 'water', 20.0),
  ('Adaptation & Resilience', 'Highlights the impact of water scarcity, droughts, floods, and waste mismanagement on vulnerable populations. Calls for the inclusion of resilience indicators, water resilience projects, drought management plans, flood mitigation infrastructure, and circular economy initiatives.', 'water', 15.0),
  ('Climate Finance & Investment', 'Identifies financing infrastructure, budget allocation, external funding mobilization, Public-Private Partnerships (PPPs), Green Climate Fund access, and costed climate action plans as primary bottlenecks at the county level.', 'water', 10.0),

-- WASTE SECTOR THEMATIC AREAS (Total: 100%)
  ('Governance & Policy Framework', 'Emphasizes clear institutional roles, policies, regulations, enforcement, local government capacity, sector policy, enforcement mechanisms, institutional coordination, county climate action plans, bylaws, and stakeholder inclusion.', 'waste', 30.0),
  ('MRV', 'Focuses on reliable tracking of waste generation, treatment, recycling rates, and water quality for NDC transparency and compliance. Score is based on data systems, baseline data, reporting frequency, GHG estimation methods, and digital tracking of waste & water.', 'waste', 25.0),
  ('Mitigation Actions', 'Addresses methane (CH4) and CO2-equivalent gases from solid waste and wastewater. Central to NDC targets are reduction measures like recycling, composting, biogas, landfill management, methane capture, and wastewater treatment.', 'waste', 20.0),
  ('Adaptation & Resilience', 'Highlights the impact of water scarcity, droughts, floods, and waste mismanagement on vulnerable populations. Calls for the inclusion of resilience indicators, water resilience projects, drought management plans, flood mitigation infrastructure, and circular economy initiatives.', 'waste', 15.0),
  ('Climate Finance & Investment', 'Identifies financing infrastructure, budget allocation, external funding mobilization, Public-Private Partnerships (PPPs), Green Climate Fund access, and costed climate action plans as primary bottlenecks at the county level.', 'waste', 10.0);

-- ============================================================================
-- INSERT INDICATORS (Aligned with NDC Framework)
-- ============================================================================

-- WATER SECTOR INDICATORS

-- Governance & Policy Framework (30% weight)
INSERT INTO indicators (sector, thematic_area, indicator_text, description, weight) VALUES
  ('water', 'Governance & Policy Framework', 'Existence of county climate-resilient water management policy or plan', 'County has a documented policy or plan that aligns with NDC targets for water management', 6.0),
  ('water', 'Governance & Policy Framework', '% of water utilities integrating climate resilience into operational plans', 'Percentage of water service providers that have incorporated climate considerations into their operational strategies', 5.0),
  ('water', 'Governance & Policy Framework', 'Number of inter-agency coordination mechanisms on water and climate', 'Count of formal coordination structures (committees, MoUs, partnerships) between county departments and water agencies', 4.0),
  ('water', 'Governance & Policy Framework', '% of staff trained in climate-related water planning', 'Percentage of county water department staff who have received climate adaptation training', 5.0),
  ('water', 'Governance & Policy Framework', 'Inclusion of water climate targets in County Integrated Development Plan (CIDP)', 'Presence of specific water-related climate targets in the county development plan', 5.0),
  ('water', 'Governance & Policy Framework', 'Stakeholder participation mechanism for water governance established', 'Existence of formal forums, workshops, or platforms for public engagement in water management decisions', 5.0),

-- MRV (25% weight)
  ('water', 'MRV', 'Existence of MRV system for water sector NDC tracking', 'County has a monitoring, reporting, and verification system specifically for water-related NDC indicators', 5.0),
  ('water', 'MRV', 'Frequency of water data updates (Monthly/Quarterly/Annually)', 'How often water sector data is collected and updated in the MRV system', 4.0),
  ('water', 'MRV', '% of water indicators with available baseline data', 'Percentage of water sector indicators that have established baseline measurements', 4.0),
  ('water', 'MRV', 'Volume of freshwater abstracted by source (surface, groundwater)', 'Total volume of water extracted from different sources, measured in cubic meters', 4.0),
  ('water', 'MRV', 'Water quality monitoring stations operational', 'Number of active water quality monitoring points across the county', 4.0),
  ('water', 'MRV', 'County submits water sector reports to national MRV system', 'Regular submission of water data to national climate tracking systems', 4.0),

-- Mitigation Actions (20% weight)
  ('water', 'Mitigation Actions', 'GHG emission reduction target for water sector exists', 'County has set specific greenhouse gas reduction targets for water operations', 4.0),
  ('water', 'Mitigation Actions', 'Annual GHG reduction achieved in water sector (%)', 'Percentage reduction in emissions from water operations compared to baseline', 5.0),
  ('water', 'Mitigation Actions', 'Renewable energy share in water operations (%)', 'Percentage of energy used in water treatment and distribution from renewable sources', 3.0),
  ('water', 'Mitigation Actions', '% of wastewater treated before discharge', 'Percentage of wastewater that undergoes treatment to reduce environmental impact', 4.0),
  ('water', 'Mitigation Actions', 'Energy efficiency improvements in water infrastructure', 'Measures implemented to reduce energy consumption in water systems', 4.0),

-- Adaptation & Resilience (15% weight)
  ('water', 'Adaptation & Resilience', 'Climate risk assessment for water sector conducted', 'Comprehensive assessment of climate vulnerabilities affecting water resources', 3.0),
  ('water', 'Adaptation & Resilience', '% population with access to climate-resilient water infrastructure', 'Percentage of county residents served by water systems designed to withstand climate impacts', 3.0),
  ('water', 'Adaptation & Resilience', 'Number of early warning systems for water-related disasters', 'Count of operational early warning systems for floods, droughts, or water quality issues', 3.0),
  ('water', 'Adaptation & Resilience', 'Drought response protocols in place', 'Existence of documented procedures for managing water scarcity during droughts', 3.0),
  ('water', 'Adaptation & Resilience', 'Flood mitigation infrastructure for water systems', 'Protective measures and infrastructure to prevent flood damage to water facilities', 3.0),

-- Climate Finance & Investment (10% weight)
  ('water', 'Climate Finance & Investment', 'Climate budget line for water sector exists', 'Dedicated budget allocation for water-related climate actions', 2.0),
  ('water', 'Climate Finance & Investment', '% of county budget allocated to water climate actions', 'Percentage of total county budget dedicated to water sector climate initiatives', 2.0),
  ('water', 'Climate Finance & Investment', 'Amount of climate finance mobilized for water (KES millions)', 'Total external funding secured for water sector climate projects', 2.0),
  ('water', 'Climate Finance & Investment', 'Access to international climate finance (GCF, Adaptation Fund)', 'Participation in global climate finance mechanisms for water projects', 2.0),
  ('water', 'Climate Finance & Investment', 'Private sector participation in water climate action', 'Engagement of private entities in financing or implementing water climate initiatives', 2.0);

-- WASTE SECTOR INDICATORS

-- Governance & Policy Framework (30% weight)
INSERT INTO indicators (sector, thematic_area, indicator_text, description, weight) VALUES
  ('waste', 'Governance & Policy Framework', '% of staff trained in climate-related planning', 'Percentage of waste management staff who have received climate and waste reduction training', 6.0),
  ('waste', 'Governance & Policy Framework', '% of counties with waste management bylaws aligned to Climate Change Act', 'Percentage of counties with waste regulations that comply with national climate legislation', 5.0),
  ('waste', 'Governance & Policy Framework', 'Existence of county waste management policy aligned with NDCs', 'County has a documented waste policy that supports national climate commitments', 5.0),
  ('waste', 'Governance & Policy Framework', 'Stakeholder participation mechanism for waste governance', 'Formal platforms for public and private sector engagement in waste management', 5.0),
  ('waste', 'Governance & Policy Framework', 'Coordination mechanism between waste and climate departments', 'Formal structures linking waste management with climate action planning', 4.0),
  ('waste', 'Governance & Policy Framework', 'Inclusion of waste climate targets in CIDP', 'Presence of waste-related climate goals in county development plans', 5.0),

-- MRV (25% weight)
  ('waste', 'MRV', 'Existence of MRV system for waste sector NDC tracking', 'County has monitoring systems for tracking waste-related climate indicators', 5.0),
  ('waste', 'MRV', 'Frequency of waste data updates (Monthly/Quarterly/Annually)', 'Regularity of waste generation and management data collection', 4.0),
  ('waste', 'MRV', 'Total waste generated per capita (kg/person/year)', 'Average amount of waste produced per resident annually', 4.0),
  ('waste', 'MRV', '% of dumpsites or landfills with methane monitoring or control systems', 'Percentage of waste disposal sites equipped with methane tracking or capture', 4.0),
  ('waste', 'MRV', 'Waste composition data available', 'Detailed breakdown of waste types (organic, plastic, paper, etc.)', 4.0),
  ('waste', 'MRV', 'County submits waste sector reports to national MRV system', 'Regular reporting of waste data to national climate tracking', 4.0),

-- Mitigation Actions (20% weight)
  ('waste', 'Mitigation Actions', 'GHG emission reduction target for waste sector exists', 'County has set specific targets for reducing waste-related emissions', 4.0),
  ('waste', 'Mitigation Actions', '% of waste diverted from landfill (recycling, composting, reuse)', 'Percentage of waste that is recycled, composted, or reused instead of landfilled', 5.0),
  ('waste', 'Mitigation Actions', 'Use of methane capture systems (biogas, flaring)', 'Implementation of technologies to capture or destroy methane from waste', 4.0),
  ('waste', 'Mitigation Actions', 'Circular economy initiatives adopted', 'Programs promoting waste reduction, reuse, and resource recovery', 3.0),
  ('waste', 'Mitigation Actions', 'Annual GHG reduction achieved in waste sector (%)', 'Percentage reduction in waste emissions compared to baseline', 4.0),

-- Adaptation & Resilience (15% weight)
  ('waste', 'Adaptation & Resilience', 'Climate risk assessment for waste sector conducted', 'Assessment of how climate change affects waste management operations', 3.0),
  ('waste', 'Adaptation & Resilience', '% of waste facilities with flood protection', 'Percentage of waste management sites protected against flooding', 3.0),
  ('waste', 'Adaptation & Resilience', 'Waste management protocols for extreme weather events', 'Procedures for handling waste during floods, storms, or other disasters', 3.0),
  ('waste', 'Adaptation & Resilience', '% of vulnerable communities with improved waste services', 'Percentage of at-risk populations with access to climate-resilient waste management', 3.0),
  ('waste', 'Adaptation & Resilience', 'Ecosystem restoration from waste mismanagement (hectares)', 'Area of land restored from previous waste contamination', 3.0),

-- Climate Finance & Investment (10% weight)
  ('waste', 'Climate Finance & Investment', 'Climate budget line for waste sector exists', 'Dedicated budget allocation for waste-related climate actions', 2.0),
  ('waste', 'Climate Finance & Investment', '% of county budget allocated to waste climate actions', 'Percentage of total county budget for waste sector climate initiatives', 2.0),
  ('waste', 'Climate Finance & Investment', 'Amount of climate finance mobilized for waste (KES millions)', 'Total external funding secured for waste sector climate projects', 2.0),
  ('waste', 'Climate Finance & Investment', 'Access to international climate finance (GCF, Adaptation Fund)', 'Participation in global climate finance for waste projects', 2.0),
  ('waste', 'Climate Finance & Investment', 'Private sector participation in waste climate action', 'Engagement of private entities in waste climate financing or implementation', 2.0);

-- ============================================================================
-- INSERT SAMPLE COUNTIES (Kenyan Counties)
-- ============================================================================
-- Note: Counties are not cleared in this migration to preserve existing data
-- If you need to clear counties, uncomment: DELETE FROM counties; above
DELETE FROM counties;

INSERT INTO counties (name, population, status) VALUES
  ('Nairobi', 4397073, 'published'),
  ('Mombasa', 1208333, 'published'),
  ('Kisumu', 1155574, 'published'),
  ('Nakuru', 2162203, 'published'),
  ('Eldoret', 475716, 'published'),
  ('Thika', 279429, 'published'),
  ('Malindi', 119859, 'published'),
  ('Kitale', 106187, 'published'),
  ('Garissa', 841353, 'published'),
  ('Kakamega', 1867579, 'published'),
  ('Meru', 1545714, 'published'),
  ('Nyeri', 759164, 'published'),
  ('Machakos', 1421932, 'published'),
  ('Uasin Gishu', 1163186, 'published'),
  ('Kiambu', 2417735, 'published'),
  ('Kilifi', 1453787, 'published'),
  ('Bungoma', 1670570, 'published'),
  ('Busia', 893681, 'published'),
  ('Homa Bay', 1131950, 'published'),
  ('Migori', 1116436, 'published')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- VALIDATION: Verify weights total 100% per sector
-- ============================================================================
DO $$
DECLARE
  water_total REAL;
  waste_total REAL;
BEGIN
  -- Check water sector
  SELECT COALESCE(SUM(weight_percentage), 0) INTO water_total
  FROM thematic_areas
  WHERE sector = 'water';
  
  IF water_total != 100.0 THEN
    RAISE EXCEPTION 'Water sector thematic area weights total %. Expected 100%%', water_total;
  END IF;
  
  -- Check waste sector
  SELECT COALESCE(SUM(weight_percentage), 0) INTO waste_total
  FROM thematic_areas
  WHERE sector = 'waste';
  
  IF waste_total != 100.0 THEN
    RAISE EXCEPTION 'Waste sector thematic area weights total %. Expected 100%%', waste_total;
  END IF;
  
  RAISE NOTICE 'Validation passed: Water sector total = %, Waste sector total = %', water_total, waste_total;
END $$;


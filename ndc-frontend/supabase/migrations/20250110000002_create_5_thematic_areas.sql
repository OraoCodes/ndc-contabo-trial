-- ============================================================================
-- CREATE 5 THEMATIC AREAS WITH INDICATORS
-- Created: 2025-01-10
-- Purpose: Insert 5 thematic areas aligned with NDC framework, each with 4-5 indicators
-- ============================================================================

-- ============================================================================
-- INSERT THEMATIC AREAS (5 Components)
-- Based on NDC Implementation Index Formula:
-- Governance: 30%, MRV: 25%, Mitigation: 20%, Adaptation: 15%, Finance: 10%
-- ============================================================================

INSERT INTO thematic_areas (name, description, sector, weight_percentage) VALUES
  ('Governance & Policy Framework', 
   'Emphasizes clear institutional roles, policies, regulations, enforcement, local government capacity, sector policy, enforcement mechanisms, institutional coordination, county climate action plans, bylaws, and stakeholder inclusion.', 
   'water', 30.0),
  
  ('MRV', 
   'Focuses on reliable tracking of waste generation, treatment, recycling rates, and water quality for NDC transparency and compliance. Score is based on data systems, baseline data, reporting frequency, GHG estimation methods, and digital tracking of waste & water.', 
   'water', 25.0),
  
  ('Mitigation Actions', 
   'Addresses methane (CH4) and CO2-equivalent gases from solid waste and wastewater. Central to NDC targets are reduction measures like recycling, composting, biogas, landfill management, methane capture, and wastewater treatment.', 
   'water', 20.0),
  
  ('Adaptation & Resilience', 
   'Highlights the impact of water scarcity, droughts, floods, and waste mismanagement on vulnerable populations. Calls for the inclusion of resilience indicators, water resilience projects, drought management plans, flood mitigation infrastructure, and circular economy initiatives.', 
   'water', 15.0),
  
  ('Climate Finance & Investment', 
   'Identifies financing infrastructure, budget allocation, external funding mobilization, Public-Private Partnerships (PPPs), Green Climate Fund access, and costed climate action plans as primary bottlenecks at the county level.', 
   'water', 10.0);

-- ============================================================================
-- INSERT INDICATORS (4-5 indicators per thematic area)
-- ============================================================================

-- 1. Governance & Policy Framework (5 indicators)
INSERT INTO indicators (sector, thematic_area, indicator_text, description, weight) VALUES
  ('water', 'Governance & Policy Framework', 
   'Existence of county climate-resilient water management policy or plan', 
   'County has a documented policy or plan that aligns with NDC targets for water management', 6.0),
  
  ('water', 'Governance & Policy Framework', 
   '% of water utilities integrating climate resilience into operational plans', 
   'Percentage of water service providers that have incorporated climate considerations into their operational strategies', 6.0),
  
  ('water', 'Governance & Policy Framework', 
   'Number of inter-agency coordination mechanisms on water and climate', 
   'Count of formal coordination structures (committees, MoUs, partnerships) between county departments and water agencies', 6.0),
  
  ('water', 'Governance & Policy Framework', 
   '% of staff trained in climate-related water planning', 
   'Percentage of county water department staff who have received climate adaptation training', 6.0),
  
  ('water', 'Governance & Policy Framework', 
   'Inclusion of water climate targets in County Integrated Development Plan (CIDP)', 
   'Presence of specific water-related climate targets in the county development plan', 6.0);

-- 2. MRV (5 indicators)
INSERT INTO indicators (sector, thematic_area, indicator_text, description, weight) VALUES
  ('water', 'MRV', 
   'Existence of MRV system for water sector NDC tracking', 
   'County has a monitoring, reporting, and verification system specifically for water-related NDC indicators', 5.0),
  
  ('water', 'MRV', 
   'Frequency of water data updates (Monthly/Quarterly/Annually)', 
   'How often water sector data is collected and updated in the MRV system', 5.0),
  
  ('water', 'MRV', 
   '% of water indicators with available baseline data', 
   'Percentage of water sector indicators that have established baseline measurements', 5.0),
  
  ('water', 'MRV', 
   'Volume of freshwater abstracted by source (surface, groundwater)', 
   'Total volume of water extracted from different sources, measured in cubic meters', 5.0),
  
  ('water', 'MRV', 
   'Water quality monitoring stations operational', 
   'Number of active water quality monitoring points across the county', 5.0);

-- 3. Mitigation Actions (4 indicators)
INSERT INTO indicators (sector, thematic_area, indicator_text, description, weight) VALUES
  ('water', 'Mitigation Actions', 
   'GHG emission reduction target for water sector exists', 
   'County has set specific greenhouse gas reduction targets for water operations', 5.0),
  
  ('water', 'Mitigation Actions', 
   'Volume of wastewater treated and reused annually', 
   'Total amount of wastewater that is treated and recycled for non-potable uses', 5.0),
  
  ('water', 'Mitigation Actions', 
   'Number of biogas/energy recovery projects from wastewater', 
   'Count of operational projects that capture methane or generate energy from wastewater treatment', 5.0),
  
  ('water', 'Mitigation Actions', 
   '% reduction in water loss through leak detection and repair programs', 
   'Percentage decrease in non-revenue water through systematic leak detection and infrastructure maintenance', 5.0);

-- 4. Adaptation & Resilience (5 indicators)
INSERT INTO indicators (sector, thematic_area, indicator_text, description, weight) VALUES
  ('water', 'Adaptation & Resilience', 
   'Existence of drought management and response plan', 
   'County has a documented plan for managing water scarcity during drought periods', 3.0),
  
  ('water', 'Adaptation & Resilience', 
   'Number of water storage and harvesting infrastructure projects', 
   'Count of operational rainwater harvesting systems, dams, and water storage facilities', 3.0),
  
  ('water', 'Adaptation & Resilience', 
   'Flood risk assessment and mitigation measures in place', 
   'Presence of flood mapping, early warning systems, and protective infrastructure', 3.0),
  
  ('water', 'Adaptation & Resilience', 
   '% of vulnerable communities with improved water access during climate shocks', 
   'Percentage of at-risk populations that maintain water access during extreme weather events', 3.0),
  
  ('water', 'Adaptation & Resilience', 
   'Number of ecosystem-based adaptation projects for water security', 
   'Count of initiatives that use natural systems (wetlands, forests) to enhance water resilience', 3.0);

-- 5. Climate Finance & Investment (4 indicators)
INSERT INTO indicators (sector, thematic_area, indicator_text, description, weight) VALUES
  ('water', 'Climate Finance & Investment', 
   '% of county budget allocated to climate-resilient water infrastructure', 
   'Percentage of annual county budget dedicated to water projects with climate adaptation components', 2.5),
  
  ('water', 'Climate Finance & Investment', 
   'Amount of external climate finance accessed for water projects (KES)', 
   'Total funding received from international climate funds, development partners, or green bonds', 2.5),
  
  ('water', 'Climate Finance & Investment', 
   'Number of Public-Private Partnerships (PPPs) for water infrastructure', 
   'Count of active partnerships between county government and private sector for water projects', 2.5),
  
  ('water', 'Climate Finance & Investment', 
   'Existence of costed climate action plan for water sector', 
   'County has a detailed financial plan outlining costs and funding sources for water-related climate actions', 2.5);

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Check thematic areas count
DO $$
DECLARE
    thematic_count INTEGER;
    indicator_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO thematic_count FROM thematic_areas;
    SELECT COUNT(*) INTO indicator_count FROM indicators;
    
    RAISE NOTICE 'Thematic areas created: %', thematic_count;
    RAISE NOTICE 'Indicators created: %', indicator_count;
    
    IF thematic_count = 5 THEN
        RAISE NOTICE '✓ Success: 5 thematic areas created';
    ELSE
        RAISE WARNING 'Expected 5 thematic areas, found %', thematic_count;
    END IF;
    
    IF indicator_count >= 20 AND indicator_count <= 25 THEN
        RAISE NOTICE '✓ Success: Indicators created (expected 22, found %)', indicator_count;
    ELSE
        RAISE WARNING 'Expected 22 indicators (4-5 per area), found %', indicator_count;
    END IF;
END $$;


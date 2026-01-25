-- Fix RLS policies for INSERT operations
-- Add missing WITH CHECK clauses for publications and county_performance
-- Created: 2025-01-08

-- ============================================================================
-- FIX PUBLICATIONS RLS POLICY
-- ============================================================================

-- Drop and recreate the publications policy with WITH CHECK clause
DROP POLICY IF EXISTS "Authenticated users can manage publications" ON publications;

CREATE POLICY "Authenticated users can manage publications" 
  ON publications FOR ALL 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================================
-- FIX COUNTY_PERFORMANCE RLS POLICY
-- ============================================================================

-- Drop and recreate the county_performance policy with WITH CHECK clause
DROP POLICY IF EXISTS "Authenticated users can manage county_performance" ON county_performance;

CREATE POLICY "Authenticated users can manage county_performance" 
  ON county_performance FOR ALL 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');


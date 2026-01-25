/**
 * Supabase API Client
 * Direct Supabase queries for frontend components
 * Replaces Express API routes for read operations
 */

import { supabase } from './supabase';

// ============================================================================
// COUNTIES
// ============================================================================

export interface County {
  id: number;
  name: string;
  population?: number | null;
  thematic_area_id?: number | null;
  created_at?: string;
  updated_at?: string;
}

export async function listCounties(): Promise<County[]> {
  const { data, error } = await supabase
    .from('counties')
    .select('*')
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function getCounty(id: number): Promise<County | null> {
  const { data, error } = await supabase
    .from('counties')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return data;
}

export async function createCounty(payload: {
  name: string;
  population?: number;
  thematic_area_id?: number;
}): Promise<County> {
  const { data, error } = await supabase
    .from('counties')
    .insert({
      name: payload.name,
      population: payload.population || null,
      thematic_area_id: payload.thematic_area_id || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCounty(
  id: number,
  payload: { name: string; population?: number; thematic_area_id?: number }
): Promise<County> {
  const { data, error } = await supabase
    .from('counties')
    .update({
      name: payload.name,
      population: payload.population || null,
      thematic_area_id: payload.thematic_area_id || null,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCounty(id: number): Promise<void> {
  const { error } = await supabase
    .from('counties')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================================================
// THEMATIC AREAS
// ============================================================================

export interface ThematicArea {
  id: number;
  name: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export async function listThematicAreas(): Promise<ThematicArea[]> {
  const { data, error } = await supabase
    .from('thematic_areas')
    .select('*')
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function getThematicArea(id: number): Promise<ThematicArea | null> {
  const { data, error } = await supabase
    .from('thematic_areas')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

export async function createThematicArea(payload: { name: string; description?: string }): Promise<ThematicArea> {
  const { data, error } = await supabase
    .from('thematic_areas')
    .insert({
      name: payload.name,
      description: payload.description || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteThematicArea(id: number): Promise<void> {
  const { error } = await supabase
    .from('thematic_areas')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================================================
// PUBLICATIONS
// ============================================================================

export interface Publication {
  id: number;
  title: string;
  date?: string | null;
  summary?: string | null;
  filename: string;
  storage_path: string;
  file_size?: number | null;
  mime_type?: string | null;
  created_at?: string;
  updated_at?: string;
}

export async function listPublications(): Promise<Publication[]> {
  const { data, error } = await supabase
    .from('publications')
    .select('*')
    .order('date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getPublication(id: number): Promise<Publication | null> {
  const { data, error } = await supabase
    .from('publications')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

export async function downloadPublication(id: number): Promise<Blob> {
  // Get publication metadata
  const publication = await getPublication(id);
  if (!publication) throw new Error('Publication not found');

  // Download from Supabase Storage
  const { data, error } = await supabase.storage
    .from('publications')
    .download(publication.storage_path);

  if (error) throw error;
  if (!data) throw new Error('File not found');

  return data;
}

// ============================================================================
// COUNTY PERFORMANCE
// ============================================================================

export interface CountyPerformance {
  id: number;
  county_id: number;
  year: number;
  sector: 'water' | 'waste';
  overall_score?: number | null;
  sector_score?: number | null;
  governance?: number | null;
  mrv?: number | null;
  mitigation?: number | null;
  adaptation?: number | null;
  finance?: number | null;
  indicators_json?: any; // JSONB
  created_at?: string;
  updated_at?: string;
}

export interface CountySummaryPerformance {
  name: string;
  score: number;
  rank?: number;
  performance?: string;
}

export async function getCountySummaryPerformance(
  sector: 'water' | 'waste',
  year: number = new Date().getFullYear()
): Promise<any[]> {
  // Fetch performance data with county names and all performance metrics
  const { data, error } = await supabase
    .from('county_performance')
    .select(`
      sector_score,
      overall_score,
      governance,
      mrv,
      mitigation,
      adaptation,
      finance,
      county_id,
      counties(name)
    `)
    .eq('sector', sector)
    .eq('year', year)
    .order('sector_score', { ascending: false });

  if (error) throw error;

  return (data || []).map((row: any, index: number) => ({
    name: row.counties?.name || 'Unknown',
    county_name: row.counties?.name || 'Unknown',
    score: row.sector_score || 0,
    rank: index + 1,
    governance: row.governance || 0,
    mrv: row.mrv || 0,
    mitigation: row.mitigation || 0,
    adaptation: row.adaptation || 0,
    adaptation_resilience: row.adaptation || 0,
    finance: row.finance || 0,
    overall_score: row.overall_score || 0,
  }));
}

export async function getCountyPerformance(
  countyName: string,
  year: number = new Date().getFullYear()
): Promise<any> {
  // First get county ID
  const { data: county, error: countyError } = await supabase
    .from('counties')
    .select('id, name')
    .ilike('name', countyName)
    .single();

  if (countyError || !county) {
    throw new Error('County not found');
  }

  // Get performance data
  const { data: performance, error: perfError } = await supabase
    .from('county_performance')
    .select('*')
    .eq('county_id', county.id)
    .eq('year', year);

  if (perfError) throw perfError;

  const water = performance?.find((p: any) => p.sector === 'water') || {};
  const waste = performance?.find((p: any) => p.sector === 'waste') || {};

  return {
    county: county.name,
    year,
    overallScore: Number(
      ((water.overall_score || 0) + (waste.overall_score || 0)) /
      (water.overall_score && waste.overall_score ? 2 : 1) || 0
    ).toFixed(1),
    waterScore: Number(water.sector_score || 0).toFixed(1),
    wasteScore: Number(waste.sector_score || 0).toFixed(1),
    indicators: {
      governance: Number(
        ((water.governance || 0) + (waste.governance || 0)) /
        (water.governance && waste.governance ? 2 : 1) || 0
      ).toFixed(1),
      mrv: Number(
        ((water.mrv || 0) + (waste.mrv || 0)) /
        (water.mrv && waste.mrv ? 2 : 1) || 0
      ).toFixed(1),
      mitigation: Number(
        ((water.mitigation || 0) + (waste.mitigation || 0)) /
        (water.mitigation && waste.mitigation ? 2 : 1) || 0
      ).toFixed(1),
      adaptation: Number(
        ((water.adaptation || 0) + (waste.adaptation || 0)) /
        (water.adaptation && waste.adaptation ? 2 : 1) || 0
      ).toFixed(1),
      finance: Number(
        ((water.finance || 0) + (waste.finance || 0)) /
        (water.finance && waste.finance ? 2 : 1) || 0
      ).toFixed(1),
    },
    waterIndicators: water.indicators_json || [],
    wasteIndicators: waste.indicators_json || [],
  };
}

export async function getCountyPerformanceByCountyId(
  countyId: number,
  year: number,
  sector: 'water' | 'waste'
): Promise<CountyPerformance | null> {
  const { data, error } = await supabase
    .from('county_performance')
    .select('*')
    .eq('county_id', countyId)
    .eq('year', year)
    .eq('sector', sector)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return data;
}

export async function saveCountyPerformance(
  countyId: number,
  year: number,
  sector: 'water' | 'waste',
  performanceData: {
    overall_score: number;
    sector_score: number;
    governance: number;
    mrv: number;
    mitigation: number;
    adaptation: number;
    finance: number;
    indicators_json?: any;
  }
): Promise<void> {
  const { error } = await supabase
    .from('county_performance')
    .upsert({
      county_id: countyId,
      year,
      sector,
      overall_score: performanceData.overall_score,
      sector_score: performanceData.sector_score,
      governance: performanceData.governance,
      mrv: performanceData.mrv,
      mitigation: performanceData.mitigation,
      adaptation: performanceData.adaptation,
      finance: performanceData.finance,
      indicators_json: performanceData.indicators_json || null,
    }, {
      onConflict: 'county_id,year,sector'
    });

  if (error) throw error;
}

// ============================================================================
// DASHBOARD STATS
// ============================================================================

export interface DashboardStats {
  totalCounties: number;
  totalThematicAreas: number;
  totalPublications: number;
  countiesWithData: number;
  avgWaterScore: number;
  avgWasteScore: number;
  overallAvgScore: number;
  topCounty: {
    name: string;
    score: number;
    sector: string;
  } | null;
}

export async function getDashboardStats(year: number = new Date().getFullYear()): Promise<DashboardStats> {
  // Get counts
  const [countiesResult, thematicResult, publicationsResult] = await Promise.all([
    supabase.from('counties').select('id', { count: 'exact', head: true }),
    supabase.from('thematic_areas').select('id', { count: 'exact', head: true }),
    supabase.from('publications').select('id', { count: 'exact', head: true }),
  ]);

  // Get performance stats with county names
  const { data: performanceData, error: perfError } = await supabase
    .from('county_performance')
    .select(`
      sector,
      sector_score,
      county_id,
      counties(name)
    `)
    .eq('year', year);

  if (perfError) throw perfError;

  // Calculate averages
  const waterScores = (performanceData || [])
    .filter((p: any) => p.sector === 'water' && p.sector_score != null)
    .map((p: any) => p.sector_score);
  
  const wasteScores = (performanceData || [])
    .filter((p: any) => p.sector === 'waste' && p.sector_score != null)
    .map((p: any) => p.sector_score);

  const avgWaterScore = waterScores.length > 0
    ? waterScores.reduce((a, b) => a + b, 0) / waterScores.length
    : 0;

  const avgWasteScore = wasteScores.length > 0
    ? wasteScores.reduce((a, b) => a + b, 0) / wasteScores.length
    : 0;

  const overallAvgScore = (avgWaterScore + avgWasteScore) / (avgWaterScore && avgWasteScore ? 2 : 1);

  // Find top county
  const allScores = (performanceData || [])
    .filter((p: any) => p.sector_score != null)
    .map((p: any) => ({
      name: p.counties?.name || 'Unknown',
      score: p.sector_score,
      sector: p.sector,
    }))
    .sort((a, b) => b.score - a.score);

  const topCounty = allScores.length > 0 ? allScores[0] : null;

  // Count unique counties with data
  const countiesWithData = new Set(
    (performanceData || [])
      .filter((p: any) => p.counties?.name)
      .map((p: any) => p.counties.name)
  ).size;

  return {
    totalCounties: countiesResult.count || 0,
    totalThematicAreas: thematicResult.count || 0,
    totalPublications: publicationsResult.count || 0,
    countiesWithData,
    avgWaterScore: Math.round(avgWaterScore * 10) / 10,
    avgWasteScore: Math.round(avgWasteScore * 10) / 10,
    overallAvgScore: Math.round(overallAvgScore * 10) / 10,
    topCounty,
  };
}

// ============================================================================
// INDICATORS
// ============================================================================

export interface Indicator {
  id: number;
  sector: 'water' | 'waste';
  thematic_area: string;
  indicator_text: string;
  weight: number;
  created_at?: string;
  updated_at?: string;
}

export async function listIndicators(): Promise<Indicator[]> {
  const { data, error } = await supabase
    .from('indicators')
    .select('*')
    .order('sector')
    .order('thematic_area')
    .order('id');

  if (error) throw error;
  return data || [];
}

export async function createIndicator(payload: {
  sector: 'water' | 'waste';
  thematic_area: string;
  indicator_text: string;
  weight?: number;
}): Promise<Indicator> {
  const { data, error } = await supabase
    .from('indicators')
    .insert({
      sector: payload.sector,
      thematic_area: payload.thematic_area,
      indicator_text: payload.indicator_text,
      weight: payload.weight || 10,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteIndicator(id: number): Promise<void> {
  const { error } = await supabase
    .from('indicators')
    .delete()
    .eq('id', id);

  if (error) throw error;
}


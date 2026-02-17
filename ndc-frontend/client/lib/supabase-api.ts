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
  sector?: 'water' | 'waste' | string | null;
  weight_percentage?: number | null;
  created_at?: string;
  updated_at?: string;
}

/** Maps thematic area name from DB to route path and display name for menu/homepage. */
const THEMATIC_NAME_TO_ROUTE: { path: string; displayName: string }[] = [
  { path: '/governance', displayName: 'Governance' },
  { path: '/mrv', displayName: 'MRV' },
  { path: '/mitigation', displayName: 'Mitigation' },
  { path: '/adaptation', displayName: 'Adaptation' },
  { path: '/finance-technology-transfer', displayName: 'Finance & Technology Transfer' },
];

function thematicNameToRoute(name: string): { path: string; displayName: string } | null {
  const n = name.toLowerCase();
  if (n.includes('governance')) return THEMATIC_NAME_TO_ROUTE[0];
  if (n.includes('mrv') || n === 'mrv') return THEMATIC_NAME_TO_ROUTE[1];
  if (n.includes('mitigation')) return THEMATIC_NAME_TO_ROUTE[2];
  if (n.includes('adaptation')) return THEMATIC_NAME_TO_ROUTE[3];
  if (n.includes('finance') || n.includes('climate finance')) return THEMATIC_NAME_TO_ROUTE[4];
  return null;
}

/** Map thematic area name from DB to county_performance score column key. */
export function thematicAreaNameToScoreKey(name: string): 'governance' | 'mrv' | 'mitigation' | 'adaptation' | 'finance' | null {
  const n = name.toLowerCase();
  if (n.includes('governance')) return 'governance';
  if (n.includes('mrv') || n === 'mrv') return 'mrv';
  if (n.includes('mitigation')) return 'mitigation';
  if (n.includes('adaptation')) return 'adaptation';
  if (n.includes('finance') || n.includes('climate finance')) return 'finance';
  return null;
}

/** Ordered score keys for consistent column order. */
const SCORE_KEY_ORDER: ('governance' | 'mrv' | 'mitigation' | 'adaptation' | 'finance')[] = ['governance', 'mrv', 'mitigation', 'adaptation', 'finance'];

/** Short labels for table column headers (no wrapping). */
const SCORE_KEY_SHORT_LABELS: Record<string, string> = {
  governance: 'Governance',
  mrv: 'MRV',
  mitigation: 'Mitigation',
  adaptation: 'Adaptation',
  finance: 'Finance',
};

/** Build table column config from thematic areas for a sector (water/waste). Uses short labels so columns fit. */
export function getThematicColumnsForSector(areas: ThematicArea[], sector: 'water' | 'waste'): { key: string; label: string }[] {
  const forSector = areas.filter((a) => (a.sector || '').toLowerCase() === sector);
  const seen = new Set<string>();
  const result: { key: string; label: string }[] = [];
  for (const key of SCORE_KEY_ORDER) {
    const area = forSector.find((a) => thematicAreaNameToScoreKey(a.name) === key);
    if (area && !seen.has(key)) {
      seen.add(key);
      result.push({ key, label: SCORE_KEY_SHORT_LABELS[key] ?? key.charAt(0).toUpperCase() + key.slice(1) });
    }
  }
  if (result.length === 0) {
    return SCORE_KEY_ORDER.map((key) => ({
      key,
      label: SCORE_KEY_SHORT_LABELS[key] ?? key.charAt(0).toUpperCase() + key.slice(1),
    }));
  }
  return result;
}

/** Labels for metric cards / score display: use thematic area name from DB when available. Always returns all 5 pillars. */
export function getThematicScoreLabelsForSector(areas: ThematicArea[], sector: 'water' | 'waste'): { key: string; label: string }[] {
  const forSector = areas.filter((a) => (a.sector || '').toLowerCase() === sector);
  const seen = new Set<string>();
  const result: { key: string; label: string }[] = [];
  for (const key of SCORE_KEY_ORDER) {
    const area = forSector.find((a) => thematicAreaNameToScoreKey(a.name) === key);
    if (area && !seen.has(key)) {
      seen.add(key);
      result.push({ key, label: area.name || SCORE_KEY_SHORT_LABELS[key] || key });
    } else {
      result.push({ key, label: SCORE_KEY_SHORT_LABELS[key] ?? key.charAt(0).toUpperCase() + key.slice(1) });
    }
  }
  return result;
}

/**
 * Build metric card rows from DB thematic areas only (no hardcoded labels).
 * Returns one row per thematic area that maps to a pillar, ordered by governance → mrv → mitigation → adaptation → finance.
 */
export function getThematicScoreRowsFromDb(
  areas: ThematicArea[],
  pillars: Record<string, string>
): { name: string; score: string }[] {
  const byKey = new Map<string, { name: string; score: string }>();
  for (const area of areas) {
    const key = thematicAreaNameToScoreKey(area.name);
    if (key != null && !byKey.has(key)) {
      byKey.set(key, { name: area.name, score: pillars[key] ?? '0.0' });
    }
  }
  const result: { name: string; score: string }[] = [];
  for (const key of SCORE_KEY_ORDER) {
    const row = byKey.get(key);
    if (row) result.push(row);
  }
  return result;
}

/** URL-safe slug from thematic area name + sector (e.g. "Flood Risk Management" + "water" -> "flood-risk-management-water"). */
export function thematicAreaSlug(area: { name: string; sector?: string | null }): string {
  const base = area.name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  const sector = (area.sector || "general").toLowerCase();
  return base ? `${base}-${sector}` : sector;
}

/** Find thematic area from list by slug (from thematicAreaSlug). */
export function findThematicAreaBySlug(
  areas: ThematicArea[],
  slug: string
): ThematicArea | undefined {
  return areas.find((a) => thematicAreaSlug(a) === slug);
}

/** Convert thematic areas from API to menu items: all areas from DB, each links to dynamic page /thematic/:slug (name-based). */
export function thematicAreasToMenuItems(areas: { id: number; name: string; sector?: string | null }[]): { name: string; path: string; sector?: string | null }[] {
  return areas.map((area) => ({
    name: area.name,
    path: `/thematic/${thematicAreaSlug(area)}`,
    sector: area.sector ?? null,
  }));
}

export async function listThematicAreas(opts?: { sector?: 'water' | 'waste' }): Promise<ThematicArea[]> {
  let q = supabase.from('thematic_areas').select('*');
  if (opts?.sector) {
    q = q.eq('sector', opts.sector);
  }
  const { data, error } = await q.order('name');

  if (error) throw error;
  return data || [];
}

/** Retrieve thematic areas from the database for each sector (water and waste). */
export async function listThematicAreasBySector(): Promise<{ water: ThematicArea[]; waste: ThematicArea[] }> {
  const [water, waste] = await Promise.all([
    listThematicAreas({ sector: 'water' }),
    listThematicAreas({ sector: 'waste' }),
  ]);
  return { water, waste };
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

export async function createThematicArea(payload: {
  name: string;
  description?: string | null;
  sector: 'water' | 'waste';
  weight_percentage: number;
}): Promise<ThematicArea> {
  const { data, error } = await supabase
    .from('thematic_areas')
    .insert({
      name: payload.name,
      description: payload.description ?? null,
      sector: payload.sector,
      weight_percentage: payload.weight_percentage,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateThematicArea(
  id: number,
  payload: {
    name?: string;
    description?: string | null;
    sector?: 'water' | 'waste';
    weight_percentage?: number;
  }
): Promise<ThematicArea> {
  const update: Record<string, unknown> = {};
  if (payload.name !== undefined) update.name = payload.name;
  if (payload.description !== undefined) update.description = payload.description ?? null;
  if (payload.sector !== undefined) update.sector = payload.sector;
  if (payload.weight_percentage !== undefined) update.weight_percentage = payload.weight_percentage;

  const { data, error } = await supabase
    .from('thematic_areas')
    .update(update)
    .eq('id', id)
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

export async function deletePublication(id: number): Promise<void> {
  const publication = await getPublication(id);
  if (!publication) throw new Error('Publication not found');

  if (publication.storage_path) {
    const { error: storageError } = await supabase.storage
      .from('publications')
      .remove([publication.storage_path]);
    if (storageError) {
      // Log but continue; delete row so record is not orphaned
      console.warn('Publication delete: could not remove storage file', storageError);
    }
  }

  const { error } = await supabase.from('publications').delete().eq('id', id);
  if (error) throw error;
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
    waterPillars: {
      governance: Number(water.governance ?? 0).toFixed(1),
      mrv: Number(water.mrv ?? 0).toFixed(1),
      mitigation: Number(water.mitigation ?? 0).toFixed(1),
      adaptation: Number(water.adaptation ?? 0).toFixed(1),
      finance: Number(water.finance ?? 0).toFixed(1),
    },
    wastePillars: {
      governance: Number(waste.governance ?? 0).toFixed(1),
      mrv: Number(waste.mrv ?? 0).toFixed(1),
      mitigation: Number(waste.mitigation ?? 0).toFixed(1),
      adaptation: Number(waste.adaptation ?? 0).toFixed(1),
      finance: Number(waste.finance ?? 0).toFixed(1),
    },
    waterIndicators: water.indicators_json || [],
    wasteIndicators: waste.indicators_json || [],
  };
}

/** Fetch all county performance rows for a year, with indicators_json and county name. */
export async function getAllCountyIndicatorData(year: number): Promise<
  { county_name: string; sector: string; indicators_json: Record<string, { score?: number | string; response?: string; comment?: string }> }[]
> {
  const { data, error } = await supabase
    .from('county_performance')
    .select('sector, indicators_json, counties(name)')
    .eq('year', year);

  if (error) throw error;
  return (data || []).map((row: any) => ({
    county_name: row.counties?.name || 'Unknown',
    sector: row.sector,
    indicators_json: row.indicators_json || {},
  }));
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
  thematic_area_id: number;
  /** Thematic area name (from join); kept for display/backward compat */
  thematic_area?: string;
  title: string;
  indicator_text: string;
  weight: number;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export async function getIndicator(id: number): Promise<Indicator | null> {
  const { data, error } = await supabase
    .from('indicators')
    .select('*, thematic_areas(name)')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return mapIndicatorRow(data);
}

function mapIndicatorRow(row: any): Indicator {
  const thematic_area =
    (row.thematic_areas as { name?: string } | null)?.name ?? null;
  const { thematic_areas, ...rest } = row;
  return { ...rest, thematic_area: thematic_area ?? undefined };
}

export async function listIndicators(): Promise<Indicator[]> {
  const { data, error } = await supabase
    .from('indicators')
    .select('*, thematic_areas(name)')
    .order('sector')
    .order('thematic_area_id')
    .order('id');

  if (error) throw error;
  return (data || []).map(mapIndicatorRow);
}

/** Fetch indicators that belong to a specific thematic area (by ID). */
export async function listIndicatorsByThematicArea(thematicAreaId: number): Promise<Indicator[]> {
  const { data, error } = await supabase
    .from('indicators')
    .select('*, thematic_areas(name)')
    .eq('thematic_area_id', thematicAreaId)
    .order('title');

  if (error) throw error;
  return (data || []).map(mapIndicatorRow);
}

export async function createIndicator(payload: {
  sector: 'water' | 'waste';
  thematic_area_id: number;
  title: string;
  indicator_text: string;
  weight?: number;
  description?: string | null;
}): Promise<Indicator> {
  const { data, error } = await supabase
    .from('indicators')
    .insert({
      sector: payload.sector,
      thematic_area_id: payload.thematic_area_id,
      title: payload.title.trim(),
      indicator_text: payload.indicator_text.trim(),
      weight: payload.weight ?? 10,
      description: payload.description ?? null,
    })
    .select('*, thematic_areas(name)')
    .single();

  if (error) throw error;
  return mapIndicatorRow(data);
}

export async function updateIndicator(
  id: number,
  payload: {
    sector?: 'water' | 'waste';
    thematic_area_id?: number;
    title?: string;
    indicator_text?: string;
    weight?: number;
    description?: string | null;
  }
): Promise<Indicator> {
  const update: Record<string, unknown> = {};
  if (payload.sector !== undefined) update.sector = payload.sector;
  if (payload.thematic_area_id !== undefined) update.thematic_area_id = payload.thematic_area_id;
  if (payload.title !== undefined) update.title = payload.title.trim();
  if (payload.indicator_text !== undefined) update.indicator_text = payload.indicator_text;
  if (payload.weight !== undefined) update.weight = payload.weight;
  if (payload.description !== undefined) update.description = payload.description ?? null;

  const { data, error } = await supabase
    .from('indicators')
    .update(update)
    .eq('id', id)
    .select('*, thematic_areas(name)')
    .single();

  if (error) throw error;
  return mapIndicatorRow(data);
}

export async function deleteIndicator(id: number): Promise<void> {
  const { error } = await supabase
    .from('indicators')
    .delete()
    .eq('id', id);

  if (error) throw error;
}


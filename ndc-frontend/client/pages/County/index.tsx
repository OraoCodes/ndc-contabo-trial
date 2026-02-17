// client/pages/County/index.tsx
"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { IndicatorSection } from "@/components/indicator-section"
import { KenyaInteractiveMap } from "@/components/KenyaInteractiveMap"
import { Loader2 } from "lucide-react"
import {
  listCounties,
  getCountyPerformance,
  listIndicators,
  listThematicAreasBySector,
  type Indicator,
  type ThematicArea,
} from "@/lib/supabase-api"
import { supabase } from "@/lib/supabase"

const YEAR_OPTIONS = Array.from({ length: 11 }, (_, i) => 2025 + i) // 2025 to 2035

type IndicatorRow = { no: number; indicator: string; description: string; score: number }

/** Build grouped indicators from DB definitions + performance JSON, ordered by thematic areas. */
function buildSectorIndicators(
  rawJson: Record<string, { response?: string; comment?: string; score?: string | number }> | null,
  indicatorDefinitions: Indicator[],
  thematicAreasForSector: ThematicArea[],
  sector: "water" | "waste"
): Record<string, IndicatorRow[]> {
  const raw = rawJson && typeof rawJson === "object" && !Array.isArray(rawJson)
    ? rawJson as Record<string, { response?: string; comment?: string; score?: string | number }>
    : {}
  const bySector = indicatorDefinitions.filter((i) => (i.sector || "").toLowerCase() === sector)
  const result: Record<string, IndicatorRow[]> = {}

  // Order: thematic area names from DB for this sector
  const areaNamesInOrder = thematicAreasForSector.map((a) => a.name).filter(Boolean)

  for (const areaName of areaNamesInOrder) {
    const areaIndicators = bySector
      .filter((i) => (i.thematic_area || "").trim() === (areaName || "").trim())
      .sort((a, b) => (a.id ?? 0) - (b.id ?? 0))

    if (areaIndicators.length === 0) continue

    const rows: IndicatorRow[] = areaIndicators.map((ind, i) => {
      const saved = raw[String(ind.id)]
      const scoreVal =
        saved?.score !== undefined && saved?.score !== null && saved?.score !== ""
          ? Number(saved.score)
          : 0
      const description =
        saved?.comment ?? (saved?.response && String(saved.response).trim() ? String(saved.response) : (0 < scoreVal ? "Data recorded" : "Data not yet entered."))
      return ({
        no: i + 1,
        indicator: (ind.title || ind.indicator_text || "") as string,
        description,
        score: Number.isFinite(scoreVal) ? scoreVal : 0,
      })
    })
    result[areaName] = rows
  }

  // Any indicators whose thematic_area is not in thematic_areas table (e.g. legacy names)
  const usedNames = new Set(areaNamesInOrder)
  const otherIndicators = bySector.filter((i) => !usedNames.has(i.thematic_area || ""))
  if (otherIndicators.length > 0) {
    const byOtherArea = new Map<string, Indicator[]>()
    for (const ind of otherIndicators) {
      const name = ind.thematic_area || "Other"
      if (!byOtherArea.has(name)) byOtherArea.set(name, [])
      byOtherArea.get(name)!.push(ind)
    }
    byOtherArea.forEach((inds, name) => {
      const sorted = inds.sort((a, b) => (a.id ?? 0) - (b.id ?? 0))
      result[name] = sorted.map((ind, i) => {
        const saved = raw[String(ind.id)]
        const scoreVal =
          saved?.score !== undefined && saved?.score !== null && saved?.score !== ""
            ? Number(saved.score)
            : 0
        const description =
          saved?.comment ?? (saved?.response && String(saved.response).trim() ? String(saved.response) : (0 < scoreVal ? "Data recorded" : "Data not yet entered."))
        return ({
          no: i + 1,
          indicator: (ind.title || ind.indicator_text || "") as string,
          description,
          score: Number.isFinite(scoreVal) ? scoreVal : 0,
        })
      })
    })
  }

  return result
}

/** Compute thematic area scores from indicators_json + indicator definitions.
 *  Score per thematic area = (sum of actual indicator scores) / (sum of max indicator weights) * 100.
 */
function computeThematicScoreRows(
  thematicAreas: ThematicArea[],
  indicatorDefs: Indicator[],
  indicatorsJson: Record<string, { score?: string | number }> | null,
  sector: "water" | "waste"
): { name: string; score: string }[] {
  const json = indicatorsJson && typeof indicatorsJson === "object" && !Array.isArray(indicatorsJson)
    ? indicatorsJson : {}
  const sectorIndicators = indicatorDefs.filter((i) => (i.sector || "").toLowerCase() === sector)

  return thematicAreas.map((area) => {
    const areaInds = sectorIndicators.filter(
      (i) => i.thematic_area_id === area.id || (i.thematic_area || "").trim() === (area.name || "").trim()
    )
    let actualSum = 0
    let maxSum = 0
    for (const ind of areaInds) {
      const entry = json[String(ind.id)]
      const actual = entry?.score != null && entry.score !== "" ? Number(entry.score) : 0
      actualSum += Number.isFinite(actual) ? actual : 0
      maxSum += ind.weight || 0
    }
    const pct = maxSum > 0 ? Math.round((actualSum / maxSum) * 100) : 0
    return { name: area.name, score: String(pct) }
  })
}

/** Ordered thematic area names for a sector (for consistent section order). */
function getThematicAreaOrder(waterOrWaste: Record<string, IndicatorRow[]>, thematicAreasForSector: ThematicArea[]): string[] {
  const fromOrder = thematicAreasForSector.map((a) => a.name).filter((n) => n && waterOrWaste[n]?.length)
  const fromData = Object.keys(waterOrWaste).filter((k) => !fromOrder.includes(k))
  return [...fromOrder, ...fromData]
}

export default function CountyPage() {
  const { countyName = "" } = useParams<{ countyName: string }>()
  const [data, setData] = useState<{
    name: string
    overallScore: string
    waterScore: string
    wasteScore: string
    indicators: Record<string, string>
    water: Record<string, IndicatorRow[]>
    waste: Record<string, IndicatorRow[]>
    waterScoreRows: { name: string; score: string }[]
    wasteScoreRows: { name: string; score: string }[]
    waterOrder: string[]
    wasteOrder: string[]
    hasWaterIndicatorData: boolean
    hasWasteIndicatorData: boolean
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nationalRank, setNationalRank] = useState<number | null>(null)
  const [selectedYear, setSelectedYear] = useState<number>(2025)

  useEffect(() => {
    const loadCounty = async () => {
      if (!countyName) return

      const urlName = decodeURIComponent(countyName).replace(/-/g, " ").trim()

      try {
        setLoading(true)
        setError(null)

        const [counties, thematicAreasBySector, indicators] = await Promise.all([
          listCounties(),
          listThematicAreasBySector(),
          listIndicators(),
        ])

        const county = counties.find((c: any) => c.name.toLowerCase() === urlName.toLowerCase())
        if (!county) {
          setError(`County "${urlName}" not found in database`)
          setLoading(false)
          return
        }

        const performance = await getCountyPerformance(county.name, selectedYear)
        if (!performance) {
          setError("No performance data for this county and year")
          setLoading(false)
          return
        }

        const waterJson = performance.waterIndicators && typeof performance.waterIndicators === "object" && !Array.isArray(performance.waterIndicators)
          ? performance.waterIndicators
          : {}
        const wasteJson = performance.wasteIndicators && typeof performance.wasteIndicators === "object" && !Array.isArray(performance.wasteIndicators)
          ? performance.wasteIndicators
          : {}

        const thematicAreasWater = thematicAreasBySector?.water ?? []
        const thematicAreasWaste = thematicAreasBySector?.waste ?? []

        const water = buildSectorIndicators(waterJson, indicators || [], thematicAreasWater, "water")
        const waste = buildSectorIndicators(wasteJson, indicators || [], thematicAreasWaste, "waste")

        const hasWaterIndicatorData = Object.keys(waterJson).length > 0
        const hasWasteIndicatorData = Object.keys(wasteJson).length > 0

        const waterScoreRows = computeThematicScoreRows(thematicAreasWater, indicators || [], waterJson, "water")
        const wasteScoreRows = computeThematicScoreRows(thematicAreasWaste, indicators || [], wasteJson, "waste")

        const waterOrder = getThematicAreaOrder(water, thematicAreasWater)
        const wasteOrder = getThematicAreaOrder(waste, thematicAreasWaste)

        const { data: allPerformance, error: rankError } = await supabase
          .from("county_performance")
          .select("county_id, sector, overall_score, counties(name)")
          .eq("year", selectedYear)

        let rank: number | null = null
        if (!rankError && allPerformance?.length) {
          const countyScores = new Map<number, { name: string; overallScore: number }>()
          allPerformance.forEach((p: any) => {
            const id = p.county_id
            const name = p.counties?.name || "Unknown"
            const overallScore = p.overall_score || 0
            if (!countyScores.has(id)) countyScores.set(id, { name, overallScore })
          })
          const ranked = Array.from(countyScores.values())
            .sort((a, b) => b.overallScore - a.overallScore)
            .map((c, i) => ({ ...c, rank: i + 1 }))
          const current = ranked.find((c) => c.name.toLowerCase() === county.name.toLowerCase())
          if (current) rank = (current as any).rank
        }
        setNationalRank(rank)

        setData({
          name: performance.county || county.name,
          overallScore: Number(performance.overallScore ?? 0).toFixed(1),
          waterScore: Number(performance.waterScore ?? 0).toFixed(1),
          wasteScore: Number(performance.wasteScore ?? 0).toFixed(1),
          indicators: {
            governance: performance.indicators?.governance ?? "0.0",
            mrv: performance.indicators?.mrv ?? "0.0",
            mitigation: performance.indicators?.mitigation ?? "0.0",
            adaptation: performance.indicators?.adaptation ?? "0.0",
            finance: performance.indicators?.finance ?? "0.0",
          },
          water,
          waste,
          waterScoreRows,
          wasteScoreRows,
          waterOrder,
          wasteOrder,
          hasWaterIndicatorData: !!hasWaterIndicatorData,
          hasWasteIndicatorData: !!hasWasteIndicatorData,
        })
      } catch (err: any) {
        console.error("Load failed:", err)
        setError(err?.message || "Failed to load county data")
      } finally {
        setLoading(false)
      }
    }

    loadCounty()
  }, [countyName, selectedYear])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-xl text-gray-700">Loading county data...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-center px-4">
        <div>
          <h1 className="text-4xl font-bold text-red-600 mb-4">County Not Found</h1>
          <p className="text-lg text-gray-700 max-w-md">{error || "No data available yet."}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage="county" />

      <div
        className="bg-cover bg-center h-64 relative flex items-center justify-center text-center px-6"
        style={{ backgroundImage: "url(/background.png)" }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 text-white">
          <h1 className="text-5xl md:text-6xl font-bold">{data.name}</h1>
          <p className="text-xl mt-4 opacity-90">Water & Waste Management NDC Performance Index</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <span className="text-gray-600 font-medium">View data by year:</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
          >
            {YEAR_OPTIONS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {nationalRank != null && (
          <div className="mb-6 text-sm text-gray-600">
            National rank (overall): <strong>#{nationalRank}</strong>
          </div>
        )}

        {/* Map (left) + Metric cards (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 items-start">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">County location</h2>
            <div className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm min-h-[320px]">
              <KenyaInteractiveMap
                year={selectedYear}
                highlightedCounty={data.name}
              />
            </div>
          </section>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 border">
              <div className="flex items-center gap-5 mb-6">
                <img src="/Blur.png" alt="Water" className="w-16 h-16" />
                <div>
                  <h3 className="text-2xl font-bold">Water Sector</h3>
                  <div className="text-5xl font-bold text-blue-700">{data.waterScore}/100</div>
                </div>
              </div>
              <div className="w-full bg-white/70 rounded-full h-4">
                <div className="bg-blue-600 h-full rounded-full transition-all duration-1000" style={{ width: `${data.waterScore}%` }} />
              </div>
              {data.waterScoreRows.length > 0 && (
                <div className="mt-6 space-y-3 text-sm">
                  {data.waterScoreRows.map((row) => (
                    <div key={row.name} className="flex justify-between font-medium">
                      <span>{row.name}</span>
                      <span>{row.score}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 border">
              <div className="flex items-center gap-5 mb-6">
                <img src="/Blur.png" alt="Waste" className="w-16 h-16" />
                <div>
                  <h3 className="text-2xl font-bold">Waste Management</h3>
                  <div className="text-5xl font-bold text-green-700">{data.wasteScore}/100</div>
                </div>
              </div>
              <div className="w-full bg-white/70 rounded-full h-4">
                <div className="bg-green-600 h-full rounded-full transition-all duration-1000" style={{ width: `${data.wasteScore}%` }} />
              </div>
              {data.wasteScoreRows.length > 0 && (
                <div className="mt-6 space-y-3 text-sm">
                  {data.wasteScoreRows.map((row) => (
                    <div key={row.name} className="flex justify-between font-medium">
                      <span>{row.name}</span>
                      <span>{row.score}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-20 space-y-20">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-10">Water Management Indicators</h2>
            {data.waterOrder.length === 0 ? (
              <p className="text-gray-600">No water indicators defined yet.</p>
            ) : (
              data.waterOrder.map((areaName, idx) => (
                <IndicatorSection
                  key={areaName}
                  title={areaName}
                  indicators={data.water[areaName] || []}
                  defaultOpen={idx === 0}
                />
              ))
            )}
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-10">Waste Management Indicators</h2>
            {data.wasteOrder.length === 0 ? (
              <p className="text-gray-600">No waste indicators defined yet.</p>
            ) : (
              data.wasteOrder.map((areaName, idx) => (
                <IndicatorSection
                  key={areaName}
                  title={areaName}
                  indicators={data.waste[areaName] || []}
                  defaultOpen={idx === 0}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

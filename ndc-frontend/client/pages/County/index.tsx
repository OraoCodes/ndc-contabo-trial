// client/pages/County/index.tsx
"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { IndicatorSection } from "@/components/indicator-section"
import { KenyaInteractiveMap } from "@/components/KenyaInteractiveMap"
import { Loader2 } from "lucide-react"
import { listCounties, getCountyPerformance, listIndicators } from "@/lib/supabase-api"
import { supabase } from "@/lib/supabase"

// ──────────────────────────────────────────────────────────────
// ALL 62 OFFICIAL INDICATORS (EXACT TEXT FROM YOUR DOCUMENT)
// ──────────────────────────────────────────────────────────────
const WATER_INDICATORS = {
  governance: [
    "Water sector policy aligned with NDCs or county climate action plan exists",
    "Climate change coordination unit or committee established",
    "% of water department staff trained in climate-related planning",
    "Climate targets included in county performance contracts",
    "Climate goals integrated into County Integrated Development Plan (CIDP)",
    "Stakeholder participation mechanism established (public forums, workshops)",
  ],
  mrv: [
    "MRV system for water sector NDC tracking in place",
    "Frequency of data updates for water indicators",
    "% of water-related indicators with available data",
    "Water sector emission inventory completed",
    "County submits water data to national MRV system",
    "Verification mechanism for water data in place",
  ],
  mitigation: [
    "GHG emission reduction target for water sector exists",
    "Annual GHG reduction achieved in water sector (%)",
    "Renewable energy share in water supply/pumping",
    "Water efficiency or conservation programs implemented",
    "Leakage reduction or non-revenue water targets met",
    "Climate-smart water infrastructure projects active",
  ],
  adaptation: [
    "Climate risk and vulnerability assessment for water conducted",
    "% population with access to climate-resilient water infrastructure",
    "Drought early warning system operational",
    "Flood response protocols for water systems in place",
    "Ecosystem restoration (watersheds, wetlands) supported",
    "Number of water storage/reservoirs for drought resilience",
  ],
  finance: [
    "Dedicated climate budget line for water sector exists",
    "% of county budget allocated to climate-resilient water projects",
    "Amount of climate finance mobilized for water (KES)",
    "Access to international climate funds (GCF, AF, etc.)",
    "Private sector participation in water resilience projects",
    "Budget absorption rate for water-related climate funds",
  ],
} as const

const WASTE_INDICATORS = {
  governance: [
    "Waste management policy aligned with NDCs or county climate plan exists",
    "Waste collection and disposal by-laws enforced",
    "Climate change coordination includes waste sector",
    "Climate targets in performance contracts include waste",
    "Waste goals integrated into CIDP",
    "Public participation in waste planning established",
  ],
  mrv: [
    "MRV system for waste sector NDC tracking in place",
    "Waste generation and treatment data updated regularly",
    "% of waste indicators with available data",
    "Waste sector GHG emission inventory completed",
    "County submits waste data to national MRV system",
    "Third-party verification of waste data in place",
  ],
  mitigation: [
    "Methane reduction or GHG reduction target for waste sector exists",
    "Waste diverted from landfill through recycling/composting (%)",
    "Landfill gas capture or biogas project active",
    "Circular economy initiatives launched (e.g., reuse, upcycling)",
    "Composting or organic waste treatment facilities operational",
    "Waste-to-energy or anaerobic digestion project active",
  ],
  adaptation: [
    "Climate risk assessment includes waste infrastructure",
    "Flood-resistant waste facilities or transfer stations built",
    "Contingency plans for waste service during disasters",
    "Community-led waste resilience programs supported",
    "Illegal dumping hotspots reduced due to climate planning",
  ],
  finance: [
    "Dedicated climate budget line for waste management exists",
    "% of county budget allocated to climate-smart waste projects",
    "Revenue from waste services used for climate projects",
    "Climate finance accessed for waste (donors, PPPs, GCF)",
    "Private sector investment in waste infrastructure",
    "Cost recovery mechanism from waste services implemented",
  ],
} as const

export default function CountyPage() {
  const { countyName = "" } = useParams<{ countyName: string }>()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nationalRank, setNationalRank] = useState<number | null>(null)
  const [activeSector, setActiveSector] = useState<"water" | "waste">("water")

  // Map flat indicator array → official grouped structure with real scores
  const mapIndicators = (rawIndicators: any, officialGroups: typeof WATER_INDICATORS | typeof WASTE_INDICATORS, indicatorDefinitions: any[] = []) => {
    // Handle both array and object formats
    let indicatorsArray: any[] = [];
    if (Array.isArray(rawIndicators)) {
      indicatorsArray = rawIndicators;
    } else if (rawIndicators && typeof rawIndicators === 'object') {
      // Convert object format { indicatorId: { response, comment, score } } to array
      // Match indicator IDs with actual indicator definitions
      indicatorsArray = Object.entries(rawIndicators).map(([id, data]: [string, any]) => {
        const indicatorDef = indicatorDefinitions.find(ind => ind.id.toString() === id);
        return {
          id,
          indicator: indicatorDef?.indicator_text || data.indicator || id,
          description: data.comment || data.description || "",
          score: data.score || 0,
          response: data.response || ""
        };
      });
    }
    
    const scoreMap = new Map(indicatorsArray.map(i => [i.indicator?.toLowerCase() || String(i.id || "").toLowerCase(), i]))

    const buildCategory = (officialList: readonly string[]) => {
      return officialList.map((officialText, i) => {
        // Find best match by substring (very reliable)
        const match = Array.from(scoreMap.entries()).find(([key]) =>
          key.includes(officialText.toLowerCase().slice(0, 30)) ||
          officialText.toLowerCase().includes(key.slice(0, 30))
        )

        const realItem = match ? match[1] : null

        return {
          no: i + 1,
          indicator: officialText,
          description: realItem ? (realItem.description || realItem.comment || "Data recorded") : "Data not yet entered.",
          score: realItem ? Math.round(Number(realItem.score || 0)) : 0,
        }
      })
    }

    return {
      governance: buildCategory(officialGroups.governance),
      mrv: buildCategory(officialGroups.mrv),
      mitigation: buildCategory(officialGroups.mitigation),
      adaptation: buildCategory(officialGroups.adaptation),
      finance: buildCategory(officialGroups.finance),
    }
  }

  useEffect(() => {
    const loadCounty = async () => {
      if (!countyName) return

      const urlName = decodeURIComponent(countyName).replace(/-/g, " ").trim()

      try {
        setLoading(true)
        setError(null)

        // 1. Validate county exists
        const counties = await listCounties()
        const county = counties.find((c: any) => c.name.toLowerCase() === urlName.toLowerCase())
        if (!county) throw new Error(`County "${urlName}" not found in database`)

        // 2. Fetch indicator definitions and performance data
        const year = 2025
        const [indicators, perf] = await Promise.all([
          listIndicators(),
          getCountyPerformance(county.name, year)
        ])

        // 3. Calculate national rank based on overall_score
        // Fetch all county performance data for the year
        const { data: allPerformance, error: rankError } = await supabase
          .from('county_performance')
          .select(`
            county_id,
            sector,
            overall_score,
            counties(name)
          `)
          .eq('year', year)

        if (!rankError && allPerformance) {
          // Get unique counties with their overall_score (both water and waste should have same overall_score)
          const countyScores = new Map<number, { name: string; overallScore: number }>()
          
          allPerformance.forEach((p: any) => {
            const countyId = p.county_id
            const countyName = p.counties?.name || 'Unknown'
            const overallScore = p.overall_score || 0
            
            // Use the first overall_score we encounter (both sectors should have the same)
            if (!countyScores.has(countyId)) {
              countyScores.set(countyId, { name: countyName, overallScore })
            }
          })

          // Sort counties by overall_score descending and assign ranks
          const rankedCounties = Array.from(countyScores.values())
            .sort((a, b) => b.overallScore - a.overallScore)
            .map((c, index) => ({
              ...c,
              rank: index + 1
            }))

          // Find the rank of the current county
          const currentCountyRank = rankedCounties.find(c => 
            c.name.toLowerCase() === county.name.toLowerCase()
          )
          
          if (currentCountyRank) {
            setNationalRank(currentCountyRank.rank)
          } else {
            console.log('County not found in rankings:', county.name)
            console.log('Available counties:', rankedCounties.map(c => c.name))
          }
        } else if (rankError) {
          console.error('Error fetching rank data:', rankError)
        }

        // 4. Transform flat arrays → grouped with real scores
        // Handle both array and object formats from indicators_json
        const waterIndicators = Array.isArray(perf.waterIndicators) 
          ? perf.waterIndicators 
          : (perf.waterIndicators && typeof perf.waterIndicators === 'object' ? perf.waterIndicators : []);
        const wasteIndicators = Array.isArray(perf.wasteIndicators) 
          ? perf.wasteIndicators 
          : (perf.wasteIndicators && typeof perf.wasteIndicators === 'object' ? perf.wasteIndicators : []);
        
        const water = mapIndicators(waterIndicators, WATER_INDICATORS, indicators.filter(i => i.sector === 'water'))
        const waste = mapIndicators(wasteIndicators, WASTE_INDICATORS, indicators.filter(i => i.sector === 'waste'))

        setData({
          name: perf.county || county.name,
          overallScore: Number(perf.overallScore || 0).toFixed(1),
          waterScore: Number(perf.waterScore || 0).toFixed(1),
          wasteScore: Number(perf.wasteScore || 0).toFixed(1),
          indicators: {
            governance: perf.indicators?.governance || "0.0",
            mrv: perf.indicators?.mrv || "0.0",
            mitigation: perf.indicators?.mitigation || "0.0",
            adaptation: perf.indicators?.adaptation || "0.0",
            finance: perf.indicators?.finance || "0.0",
          },
          water,
          waste,
        })
      } catch (err: any) {
        console.error("Load failed:", err)
        setError(err.message || "Failed to load county data")
      } finally {
        setLoading(false)
      }
    }

    loadCounty()
  }, [countyName])

  // Loading & Error States
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

  // MAIN PAGE — YOUR BEAUTIFUL UI (unchanged)
  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage="county" />

      {/* Hero */}
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

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        {/* Score Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-5">
            <div className="relative sticky top-24">
              {/* Sector Toggle - Top Right */}
              <div className="absolute top-0 right-0 z-10 flex gap-2">
                <button
                  onClick={() => setActiveSector("water")}
                  className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                    activeSector === "water"
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  Water
                </button>
                <button
                  onClick={() => setActiveSector("waste")}
                  className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                    activeSector === "waste"
                      ? "bg-green-600 text-white shadow-md"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  Waste
                </button>
              </div>
              
              {/* Map without background */}
              <KenyaInteractiveMap
                sector={activeSector}
                year={2025}
                highlightedCounty={data.name}
              />
            </div>
          </div>

          <div className="lg:col-span-7 space-y-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border p-10 text-center">
                <div className="text-6xl font-bold text-gray-900">{data.overallScore}</div>
                <p className="text-gray-600 mt-3 text-lg">Overall Score /100</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border p-10 text-center">
                <div className="text-6xl font-bold text-gray-900">
                  {nationalRank !== null ? `#${nationalRank}` : "—"}
                </div>
                <p className="text-gray-600 mt-3 text-lg">National Rank</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Water Card */}
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
                <div className="mt-6 space-y-3 text-sm">
                  {["Governance", "MRV", "Mitigation", "Adaptation", "Finance"].map((label, i) => {
                    const key = ["governance", "mrv", "mitigation", "adaptation", "finance"][i]
                    return (
                      <div key={label} className="flex justify-between font-medium">
                        <span>{label}</span>
                        <span>{data.indicators[key]}/100</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Waste Card */}
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
                <div className="mt-6 space-y-3 text-sm">
                  {["Governance", "MRV", "Mitigation", "Adaptation", "Finance"].map((label, i) => {
                    const key = ["governance", "mrv", "mitigation", "adaptation", "finance"][i]
                    return (
                      <div key={label} className="flex justify-between font-medium">
                        <span>{label}</span>
                        <span>{data.indicators[key]}/100</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Indicators */}
        <div className="mt-20 space-y-20">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-10">Water Management Indicators</h2>
            <IndicatorSection title="Governance" indicators={data.water.governance} defaultOpen={true} />
            <IndicatorSection title="MRV" indicators={data.water.mrv} />
            <IndicatorSection title="Mitigation" indicators={data.water.mitigation} />
            <IndicatorSection title="Adaptation & Resilience" indicators={data.water.adaptation} />
            <IndicatorSection title="Finance & Technology Transfer" indicators={data.water.finance} />
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-10">Waste Management Indicators</h2>
            <IndicatorSection title="Governance" indicators={data.waste.governance} />
            <IndicatorSection title="MRV" indicators={data.waste.mrv} defaultOpen={true} />
            <IndicatorSection title="Mitigation" indicators={data.waste.mitigation} />
            <IndicatorSection title="Adaptation & Resilience" indicators={data.waste.adaptation} />
            <IndicatorSection title="Finance & Technology Transfer" indicators={data.waste.finance} />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

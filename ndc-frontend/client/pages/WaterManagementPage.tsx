// client/pages/WaterManagementPage.jsx
"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HeroBanner } from "@/components/hero-banner"
import { KenyaInteractiveMap } from "@/components/KenyaInteractiveMap"
import { CountyWaterTable } from "@/components/county-water-table"
import { RegionalAnalysisChart } from "@/components/regional-analysis-chart"
import { Loader2 } from "lucide-react"
import { getCountySummaryPerformance, listThematicAreas, getThematicColumnsForSector, type CountySummaryPerformance } from "@/lib/supabase-api"

interface RankedCounty extends CountySummaryPerformance {
  rank: number
  county: string
  indexScore: number
  performance: string
}

export default function WaterManagement() {
  const [waterData, setWaterData] = useState<RankedCounty[]>([])
  const [thematicColumns, setThematicColumns] = useState<{ key: string; label: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listThematicAreas()
      .then((areas) => setThematicColumns(getThematicColumnsForSector(areas, "water")))
      .catch(() => setThematicColumns([]))
  }, [])

  useEffect(() => {
    const fetchWaterScores = async () => {
      try {
        setLoading(true)
        setError(null)

        // Try current year first, then fallback to previous years
        const currentYear = new Date().getFullYear();
        const yearsToTry = [currentYear, currentYear - 1, 2025, 2024, 2023];
        
        let data: any[] = [];
        for (const year of yearsToTry) {
          if (data.length === 0) {
            try {
              const yearData = await getCountySummaryPerformance("water", year);
              if (yearData && yearData.length > 0) {
                data = yearData;
                console.log(`Found water data for year ${year}:`, data.length, "records");
                break;
              }
            } catch (err) {
              // Continue to next year
              console.log(`No data found for year ${year}`);
            }
          }
        }
        
        console.log("Water data from API:", data)

        const rankedData: RankedCounty[] = data
          .map((item: any, index: number) => {
            const score = Number(item.score || item.sector_score || item.total_score || 0);
            const countyName = item.name || item.county_name || item.county?.name || "Unknown County";
            const mapped = {
              rank: item.rank || index + 1,
              county: countyName,
              governance: Number(item.governance || 0),
              mrv: Number(item.mrv || 0),
              mitigation: Number(item.mitigation || 0),
              adaptation: Number(item.adaptation_resilience || item.adaptation || 0),
              finance: Number(item.finance || 0),
              indexScore: Math.round(score),
              avgScore: Math.round(score), // Use same score for avgScore
              performance: getPerformanceLabel(score) as "Outstanding" | "Satisfactory" | "Good" | "Average" | "Poor",
            };
            return mapped;
          })
          .sort((a, b) => b.indexScore - a.indexScore) // ensure correct rank order
          .map((item, index) => ({ ...item, rank: index + 1 })) // Re-assign ranks after sorting

        console.log("Ranked water data:", rankedData)
        setWaterData(rankedData)
      } catch (err: any) {
        console.error("Failed to load water rankings:", err)
        setError("Could not load county rankings. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchWaterScores()
  }, [])

  const getPerformanceLabel = (score: number): string => {
    if (score >= 80) return "Outstanding"
    if (score >= 70) return "Satisfactory"
    if (score >= 60) return "Good"
    if (score >= 40) return "Average"
    return "Poor"
  }

  return (
    <main>
      <Header currentPage="water" />

      <HeroBanner
        title="Water Management"
        description="This component examines the institutional structures, legal frameworks, policy coherence, and stakeholder engagement mechanisms that underpin climate action. It is weighted at 30%, recognizing its foundational role in enabling effective implementation and coordination across all other components."
      />

      <section className="py-12 md:py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Map */}
            <div className="flex flex-col items-center justify-center bg-white rounded-xl border border-gray-200 overflow-hidden">
              <KenyaInteractiveMap sector="water" />
            </div>

            {/* Regional Analysis */}
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-6">Summary County Rankings - Water Management</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Real-time performance based on submitted indicators
                </p>
              </div>
              <RegionalAnalysisChart title="Regional Analysis" type="water" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-10 text-foreground">
            Index Score per County - Water Sector
          </h2>

          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
              <p className="text-muted-foreground">Loading live county rankings...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-20">
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          )}

          {!loading && !error && waterData.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No water sector data available yet.</p>
            </div>
          )}

          {!loading && !error && waterData.length > 0 && (
            <CountyWaterTable title="Index Score per County" data={waterData} type="detailed" thematicColumns={thematicColumns} />
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}

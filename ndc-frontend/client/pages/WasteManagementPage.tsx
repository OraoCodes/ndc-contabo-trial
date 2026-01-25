// client/pages/WasteManagementPage.jsx
"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HeroBanner } from "@/components/hero-banner"
import { KenyaMap } from "@/components/kenya-map"
import { CountyWasteTable } from "@/components/county-waste-table"
import { RegionalAnalysisChart } from "@/components/regional-analysis-chart"
import { Loader2 } from "lucide-react"
import { getCountySummaryPerformance, type CountySummaryPerformance } from "@/lib/supabase-api"

interface RankedCounty extends CountySummaryPerformance {
  rank: number
  county: string
  indexScore: number
  performance: string
}

export default function WasteManagement() {
  const [wasteData, setWasteData] = useState<RankedCounty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWasteScores = async () => {
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
              const yearData = await getCountySummaryPerformance("waste", year);
              if (yearData && yearData.length > 0) {
                data = yearData;
                console.log(`Found waste data for year ${year}:`, data.length, "records");
                break;
              }
            } catch (err) {
              // Continue to next year
              console.log(`No data found for year ${year}`);
            }
          }
        }

        const rankedData: RankedCounty[] = data
          .map((item: any, index: number) => {
            const score = Number(item.score || item.sector_score || item.total_score || 0);
            return {
              rank: item.rank || index + 1,
              county: item.name || item.county_name || item.county?.name || "Unknown County",
              governance: Number(item.governance || 0),
              mrv: Number(item.mrv || 0),
              mitigation: Number(item.mitigation || 0),
              adaptation: Number(item.adaptation_resilience || item.adaptation || 0),
              finance: Number(item.finance || 0),
              indexScore: Math.round(score),
              avgScore: Math.round(score), // Use same score for avgScore
              performance: getPerformanceLabel(score) as "Outstanding" | "Satisfactory" | "Good" | "Average" | "Poor",
            };
          })
          .sort((a, b) => b.indexScore - a.indexScore) // ensure correct ranking
          .map((item, index) => ({ ...item, rank: index + 1 })) // Re-assign ranks after sorting

        setWasteData(rankedData)
      } catch (err: any) {
        console.error("Failed to load waste rankings:", err)
        setError("Could not load waste management rankings. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchWasteScores()
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
      <Header currentPage="waste" />

      <HeroBanner
        title="Waste Management"
        description="This component examines the institutional structures, legal frameworks, policy coherence, and stakeholder engagement mechanisms that underpin climate action. It is weighted at 30%, recognizing its foundational role in enabling effective implementation and coordination across all other components."
      />

      <section className="py-12 md:py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Map */}
            <div className="flex flex-col items-center justify-center">
              <img src="/image 9.svg" alt="Background" />
            </div>

            {/* Regional Analysis */}
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-6">Summary County Rankings - Waste Management</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Real-time performance based on submitted indicators
                </p>
              </div>
              <RegionalAnalysisChart title="Regional Analysis" type="waste" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-10 text-foreground">
            Index Score per County - Waste Sector
          </h2>

          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-green-600 mb-4" />
              <p className="text-muted-foreground">Loading live waste rankings...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-20">
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          )}

          {!loading && !error && wasteData.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No waste sector data available yet.</p>
            </div>
          )}

          {!loading && !error && wasteData.length > 0 && (
            <CountyWasteTable title="Index Score per County" data={wasteData} type="detailed" />
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}

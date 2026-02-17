// client/pages/WasteManagementPage.tsx
"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HeroBanner } from "@/components/hero-banner"
import { KenyaInteractiveMap } from "@/components/KenyaInteractiveMap"
import { CountyWasteTable } from "@/components/county-waste-table"
import { RegionalAnalysisChart } from "@/components/regional-analysis-chart"
import { Loader2 } from "lucide-react"
import { getCountyRankingsForSector } from "@/lib/supabase-api"

export default function WasteManagement() {
  const [wasteData, setWasteData] = useState<Record<string, any>[]>([])
  const [thematicColumns, setThematicColumns] = useState<{ key: string; label: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState(2025)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const yearsToTry = [selectedYear, selectedYear - 1, 2025, 2024, 2023]
        let result: { columns: { key: string; label: string }[]; rows: Record<string, any>[] } | null = null

        for (const year of yearsToTry) {
          try {
            const r = await getCountyRankingsForSector("waste", year)
            if (r.rows.length > 0) {
              result = r
              break
            }
          } catch {
            continue
          }
        }

        if (result) {
          setThematicColumns(result.columns)
          setWasteData(result.rows)
        } else {
          setThematicColumns([])
          setWasteData([])
        }
      } catch (err: any) {
        console.error("Failed to load waste rankings:", err)
        setError("Could not load waste management rankings. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedYear])

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
            <div className="flex flex-col items-center justify-center bg-white rounded-xl border border-gray-200 overflow-hidden">
              <KenyaInteractiveMap sector="waste" />
            </div>
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
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold text-foreground">
              Index Score per County - Waste Sector
            </h2>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-900 bg-white text-sm"
            >
              {[2025, 2024, 2023].map((y) => (
                <option key={y} value={y}>Year {y}</option>
              ))}
            </select>
          </div>

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
            <CountyWasteTable title="Index Score per County" data={wasteData} type="detailed" thematicColumns={thematicColumns} />
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}

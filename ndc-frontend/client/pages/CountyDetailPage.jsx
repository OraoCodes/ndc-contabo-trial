"use client"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Loader2, ChevronDown, ChevronUp } from "lucide-react"
import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { supabase } from "@/lib/supabase"

// THIS IS THE ONLY INDICATOR SECTION YOU NEED — IT SHOWS SCORES 100%
function IndicatorSection({ title, indicators }: { title: string; indicators: any[] }) {
  const [open, setOpen] = useState(title === "Governance" || title === "MRV")

  if (!indicators || indicators.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-300 mb-8 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-8 py-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white flex items-center justify-between hover:from-blue-700 hover:to-blue-800 transition"
      >
        <h3 className="text-2xl font-bold">{title}</h3>
        {open ? <ChevronUp className="h-8 w-8" /> : <ChevronDown className="h-8 w-8" />}
      </button>

      {open && (
        <div className="p-6">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-6 py-4 font-bold text-gray-700">No.</th>
                <th className="px-6 py-4 font-bold text-gray-700">Indicator</th>
                <th className="px-6 py-4 font-bold text-gray-700">Status</th>
                <th className="px-6 py-4 text-center font-bold text-gray-700">Score</th>
              </tr>
            </thead>
            <tbody>
              {indicators.map((item) => (
                <tr key={item.no} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-5 font-medium text-gray-600">{item.no}</td>
                  <td className="px-6 py-5 font-medium text-gray-900 max-w-md">{item.indicator}</td>
                  <td className="px-6 py-5 text-sm text-gray-600">
                    {item.description || "Data not yet entered."}
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span
                      className={`inline-block px-8 py-4 rounded-full text-2xl font-bold text-white shadow-lg ${
                        item.score >= 8
                          ? "bg-green-600"
                          : item.score >= 6
                          ? "bg-emerald-600"
                          : item.score >= 4
                          ? "bg-yellow-600"
                          : item.score > 0
                          ? "bg-orange-600"
                          : "bg-red-600"
                      }`}
                    >
                      {item.score.toFixed(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function CountyDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [year, setYear] = useState("2025")
  const [nationalRank, setNationalRank] = useState<number | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return
      setLoading(true)
      try {
        // Use Supabase directly instead of Express API
        const { getCountyPerformance } = await import("@/lib/supabase-api");
        const raw = await getCountyPerformance(slug, parseInt(year))

        console.log("RAW FROM SERVER:", raw) // ← YOU SEE THIS

        // Calculate national rank based on overall_score
        const { data: allPerformance, error: rankError } = await supabase
          .from('county_performance')
          .select(`
            county_id,
            sector,
            overall_score,
            counties(name)
          `)
          .eq('year', parseInt(year))

        if (!rankError && allPerformance) {
          // Get unique counties with their overall_score
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
            c.name.toLowerCase() === raw.county?.toLowerCase()
          )
          
          if (currentCountyRank) {
            setNationalRank(currentCountyRank.rank)
          }
        }

        // THIS FORCES REACT TO RE-RENDER — KEY LINE
        const newData = {
          county: raw.county,
          overallScore: parseFloat(raw.overallScore || "0"),
          waterScore: parseFloat(raw.waterScore || "0"),
          wasteScore: parseFloat(raw.wasteScore || "0"),
          indicators: {
            governance: parseFloat(raw.indicators?.governance || "0"),
            mrv: parseFloat(raw.indicators?.mrv || "0"),
            mitigation: parseFloat(raw.indicators?.mitigation || "0"),
            adaptation: parseFloat(raw.indicators?.adaptation || "0"),
            finance: parseFloat(raw.indicators?.finance || "0"),
          },
          waterIndicators: (raw.waterIndicators || []).map((i: any, idx: number) => ({
            no: idx + 1,
            indicator: i.indicator || "Unknown",
            description: i.description || "Data not yet entered.",
            score: parseFloat(i.score || "0"),
          })),
          wasteIndicators: (raw.wasteIndicators || []).map((i: any, idx: number) => ({
            no: idx + 1,
            indicator: i.indicator || "Unknown",
            description: i.description || "Data not yet entered.",
            score: parseFloat(i.score || "0"),
          })),
        }

        console.log("PARSED DATA (WITH SCORES):", newData) // ← CHECK THIS
        setData(newData) // ← THIS TRIGGERS RENDER
      } catch (err) {
        console.error(err)
        setData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [slug, year])

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-16 w-16" /></div>
  if (!data) return <div className="min-h-screen flex items-center justify-center text-4xl text-red-600">No data</div>

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      {/* HERO */}
      <div className="bg-gradient-to-br from-blue-900 to-black text-white py-32 text-center">
        <h1 className="text-8xl font-black">{data.county}</h1>
        <p className="text-4xl mt-4">NDC Performance {year}</p>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">

        {/* YEAR */}
        <div className="flex justify-end mb-12">
          <select value={year} onChange={(e) => setYear(e.target.value)} className="px-10 py-5 text-2xl rounded-xl border-4 border-blue-600">
            <option>2025</option>
            <option>2024</option>
            <option>2023</option>
          </select>
        </div>

        {/* SCORES */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20 text-center">
          <div className="bg-gradient-to-br from-purple-700 to-blue-900 text-white p-20 rounded-3xl shadow-2xl">
            <div className="text-9xl font-black">{data.overallScore.toFixed(1)}</div>
            <p className="text-5xl mt-6">Overall /100</p>
          </div>
          <div className="bg-white border-8 border-blue-600 p-20 rounded-3xl shadow-2xl">
            <div className="text-8xl font-black text-blue-700">{data.waterScore.toFixed(1)}</div>
            <p className="text-4xl text-gray-700">Water</p>
          </div>
          <div className="bg-white border-8 border-green-600 p-20 rounded-3xl shadow-2xl">
            <div className="text-8xl font-black text-green-700">{data.wasteScore.toFixed(1)}</div>
            <p className="text-4xl text-gray-700">Waste</p>
          </div>
          <div className="bg-gradient-to-br from-orange-600 to-red-700 text-white p-20 rounded-3xl shadow-2xl">
            <div className="text-9xl font-black">{nationalRank !== null ? `#${nationalRank}` : "—"}</div>
            <p className="text-5xl mt-6">National Rank</p>
          </div>
        </div>

        {/* WASTE INDICATORS — WILL SHOW YOUR SCORES 5.0, 6.0, 3.0, 4.7, etc */}
        <div className="mb-20">
          <h2 className="text-6xl font-black text-green-700 text-center mb-16">Waste Management Indicators</h2>
          
          <IndicatorSection title="Governance" indicators={data.wasteIndicators.slice(0, 6)} />
          <IndicatorSection title="MRV" indicators={data.wasteIndicators.slice(6, 12)} defaultOpen />
          <IndicatorSection title="Mitigation" indicators={data.wasteIndicators.slice(12, 18)} />
          <IndicatorSection title="Adaptation & Resilience" indicators={data.wasteIndicators.slice(18, 23)} />
          <IndicatorSection title="Finance & Technology Transfer" indicators={data.wasteIndicators.slice(23)} />
        </div>

        {/* WATER INDICATORS */}
        <div>
          <h2 className="text-6xl font-black text-blue-700 text-center mb-16">Water Management Indicators</h2>
          
          <IndicatorSection title="Governance" indicators={data.waterIndicators.slice(0, 6)} defaultOpen />
          <IndicatorSection title="MRV" indicators={data.waterIndicators.slice(6, 12)} />
          <IndicatorSection title="Mitigation" indicators={data.waterIndicators.slice(12, 18)} />
          <IndicatorSection title="Adaptation & Resilience" indicators={data.waterIndicators.slice(18, 23)} />
          <IndicatorSection title="Finance & Technology Transfer" indicators={data.waterIndicators.slice(23)} />
        </div>

      </div>
      <Footer />
    </div>
  )
}

"use client"
import { useState, useEffect } from "react"
import { Loader2, Plus, Trash2, ArrowLeft } from "lucide-react"
import { MainLayout } from "@/components/MainLayout"

interface Indicator {
  id: number
  sector: "water" | "waste"
  thematic_area: string // This is your pillar name
  indicator_text: string
  weight?: number
  scoring_method?: string // Not in DB, kept for UI compatibility
}


const PILLARS = [
  "Governance",
  "MRV",
  "Mitigation",
  "Adaptation & Resilience",
  "Finance & Resource Mobilization"
] as const

export default function IndicatorManagementPage() {
  const [indicators, setIndicators] = useState<Indicator[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  const [newIndicator, setNewIndicator] = useState({
    sector: "waste" as "water" | "waste",
    thematicArea: "Governance",
    indicator: "",
    scoring_method: "Yes/No"
  })

  useEffect(() => {
    fetch("/api/indicators")
      .then(r => r.json())
      .then(data => {
        console.log("Fetched indicators:", data) // ← You will see your 63 items here
        setIndicators(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setIndicators([])
        setLoading(false)
      })
  }, [])

  const handleAdd = async () => {
    if (!newIndicator.indicator.trim()) return setMessage("Enter indicator text")

    setSaving(true)
    try {
      const { createIndicator } = await import("@/lib/supabase-api");
      const added = await createIndicator(mapIndicatorForSave(newIndicator));
      setIndicators(prev => [...prev, added as any]);
      setNewIndicator({ sector: "waste", thematicArea: "Governance", indicator: "", scoring_method: "Yes/No" });
      setMessage("Indicator added!");
    } catch (err: any) {
      setMessage(err?.message || "Failed");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(""), 3000);
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Delete permanently?")) return;
    try {
      const { deleteIndicator } = await import("@/lib/supabase-api");
      await deleteIndicator(id);
      setIndicators(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      console.error("Failed to delete indicator:", err);
      alert("Failed to delete indicator. Please try again.");
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
          <Loader2 className="w-16 h-16 animate-spin text-blue-600" />
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="max-w-7xl mx-auto px-6 py-10">

          {/* Header */}
          <div className="mb-10">
            
            <h1 className="text-5xl font-black text-gray-800">Manage Indicators</h1>
            <p className="text-xl text-gray-600 mt-2">Add, edit, or remove indicators used in the NDC Index</p>
          </div>

          {message && (
            <div className={`mb-6 p-5 rounded-xl text-white font-bold text-center ${message.includes("added") ? "bg-green-600" : "bg-red-600"}`}>
              {message}
            </div>
          )}

          {/* Add New Indicator */}
          <div className="bg-white rounded-3xl shadow-2xl p-10 mb-12 border-4 border-gray-200">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3 text-green-700">
              <Plus className="w-10 h-10" /> Add New Indicator
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium mb-2">Sector</label>
                <select
                  value={newIndicator.sector}
                  onChange={e => setNewIndicator(p => ({ ...p, sector: e.target.value as any }))}
                  className="w-full px-5 py-4 border-2 rounded-xl focus:border-blue-600 text-lg"
                >
                  <option value="waste">Waste</option>
                  <option value="water">Water</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Pillar</label>
                <select
                  value={newIndicator.thematicArea}
                  onChange={e => setNewIndicator(p => ({ ...p, thematicArea: e.target.value }))}
                  className="w-full px-5 py-4 border-2 rounded-xl focus:border-blue-600 text-lg"
                >
                  {PILLARS.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Scoring Method</label>
                <select
                  value={newIndicator.scoring_method}
                  onChange={e => setNewIndicator(p => ({ ...p, scoring_method: e.target.value }))}
                  className="w-full px-5 py-4 border-2 rounded-xl focus:border-blue-600 text-lg"
                >
                  <option>Yes/No</option>
                  <option>Percentage (%)</option>
                  <option>Number</option>
                  <option>KES (Amount)</option>
                  <option>Hectares</option>
                  <option>Count</option>
                  <option>Text</option>
                </select>
              </div>
            </div>

            <textarea
              placeholder="e.g. County waste management policy adopted and gazetted"
              value={newIndicator.indicator}
              onChange={e => setNewIndicator(p => ({ ...p, indicator: e.target.value }))}
              rows={3}
              className="w-full px-6 py-4 border-2 rounded-xl focus:border-blue-600 text-lg resize-none mb-8"
            />

            <button
              onClick={handleAdd}
              disabled={saving}
              className="flex items-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-10 py-5 rounded-2xl font-bold text-xl shadow-xl transition hover:scale-105 disabled:opacity-70"
            >
              {saving ? <Loader2 className="w-8 h-8 animate-spin" /> : <Plus className="w-8 h-8" />}
              Add Indicator
            </button>
          </div>

          {/* ALL INDICATORS - NOW SHOWING YOUR 63+ ITEMS */}
          <h2 className="text-4xl font-black text-gray-800 mb-10">
            All Indicators ({indicators.length})
          </h2>

          {/* WATER SECTOR */}
          <div className="mb-12">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-3xl font-black py-6 px-10 rounded-t-3xl shadow-xl">
              WATER SECTOR
            </div>
            <div className="bg-white rounded-b-3xl shadow-2xl border-4 border-blue-200 p-10">
              {PILLARS.map(pillar => {
                const items = indicators.filter(i => i.sector === "water" && i.thematic_area === pillar)
                if (items.length === 0) return null
                return (
                  <div key={pillar} className="mb-12 last:mb-0">
                    <h3 className="text-2xl font-bold text-blue-700 mb-6 pb-3 border-b-4 border-blue-300 inline-block">
                      {pillar}
                    </h3>
                    <div className="grid gap-4">
                      {items.map(ind => (
                        <div key={ind.id} className="flex items-center justify-between bg-blue-50 p-6 rounded-2xl border-2 border-blue-200 hover:border-blue-500 transition">
                          <div>
                            <p className="font-semibold text-lg text-gray-900">{ind.indicator_text}</p>
                            <p className="text-sm text-blue-600 font-medium">Scoring: {ind.scoring_method || "Yes/No"}</p>
                          </div>
                          <button
                            onClick={() => handleDelete(ind.id)}
                            className="p-3 bg-red-100 hover:bg-red-600 text-red-600 hover:text-white rounded-xl transition"
                          >
                            <Trash2 className="w-6 h-6" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* WASTE SECTOR */}
          <div>
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white text-3xl font-black py-6 px-10 rounded-t-3xl shadow-xl">
              WASTE SECTOR
            </div>
            <div className="bg-white rounded-b-3xl shadow-2xl border-4 border-green-200 p-10">
              {PILLARS.map(pillar => {
                const items = indicators.filter(i => i.sector === "waste" && i.thematic_area === pillar)
                if (items.length === 0) return null
                return (
                  <div key={pillar} className="mb-12 last:mb-0">
                    <h3 className="text-2xl font-bold text-green-700 mb-6 pb-3 border-b-4 border-green-300 inline-block">
                      {pillar}
                    </h3>
                    <div className="grid gap-4">
                      {items.map(ind => (
                        <div key={ind.id} className="flex items-center justify-between bg-green-50 p-6 rounded-2xl border-2 border-green-200 hover:border-green-500 transition">
                          <div>
                            <p className="font-semibold text-lg text-gray-900">{ind.indicator_text}</p>
                            <p className="text-sm text-green-600 font-medium">Scoring: {ind.scoring_method || "Yes/No"}</p>
                          </div>
                          <button
                            onClick={() => handleDelete(ind.id)}
                            className="p-3 bg-red-100 hover:bg-red-600 text-red-600 hover:text-white rounded-xl transition"
                          >
                            <Trash2 className="w-6 h-6" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  )
}

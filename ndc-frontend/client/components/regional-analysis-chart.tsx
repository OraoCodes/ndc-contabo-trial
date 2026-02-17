// client/components/regional-analysis-chart.tsx
"use client"

import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { getCountyRankingsForSector } from "@/lib/supabase-api"

interface RegionalAnalysisChartProps {
  title?: string
  type: "water" | "waste"
}

export function RegionalAnalysisChart({ title = "Regional Analysis", type }: RegionalAnalysisChartProps) {
  const [chartData, setChartData] = useState<{ name: string; value: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAverages = async () => {
      try {
        setLoading(true)

        const yearsToTry = [2025, 2024, 2023]
        let columns: { key: string; label: string }[] = []
        let rows: Record<string, any>[] = []

        for (const year of yearsToTry) {
          try {
            const result = await getCountyRankingsForSector(type, year)
            if (result.rows.length > 0) {
              columns = result.columns
              rows = result.rows
              break
            }
          } catch {
            continue
          }
        }

        if (rows.length === 0 || columns.length === 0) {
          setChartData([])
          return
        }

        const averages = columns.map((col) => {
          const total = rows.reduce((sum, row) => sum + (Number(row[col.key]) || 0), 0)
          return {
            name: col.label,
            value: Math.round(total / rows.length),
          }
        })

        setChartData(averages)
      } catch (err) {
        console.error("Failed to load regional analysis data:", err)
        setChartData([])
      } finally {
        setLoading(false)
      }
    }

    fetchAverages()
  }, [type])

  const barColor = type === "water" ? "#3b82f6" : "#10b981"

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading national averages...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (chartData.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No data available yet</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              domain={[0, 100]}
              ticks={[0, 20, 40, 60, 80, 100]}
              label={{ value: "Average Score (%)", angle: -90, position: "insideLeft" }}
            />
            <Tooltip
              formatter={(value: number) => `${value}%`}
              contentStyle={{ backgroundColor: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: "8px" }}
            />
            <Bar
              dataKey="value"
              fill={barColor}
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

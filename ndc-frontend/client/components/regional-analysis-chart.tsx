// client/components/regional-analysis-chart.tsx
"use client"

import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { getCountySummaryPerformance } from "@/lib/supabase-api"

interface RegionalAnalysisChartProps {
  title?: string
  type: "water" | "waste"
}

export function RegionalAnalysisChart({ title = "Regional Analysis", type }: RegionalAnalysisChartProps) {
  const [chartData, setChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAverages = async () => {
      try {
        setLoading(true)
        
        // Try current year first, then fallback to previous years
        const currentYear = new Date().getFullYear();
        const yearsToTry = [currentYear, currentYear - 1, 2025, 2024, 2023];
        
        let summary: any[] = [];
        for (const year of yearsToTry) {
          if (summary.length === 0) {
            try {
              const yearData = await getCountySummaryPerformance(type, year);
              if (yearData && yearData.length > 0) {
                summary = yearData;
                console.log(`RegionalAnalysisChart: Found ${type} data for year ${year}:`, summary.length, "records");
                break;
              }
            } catch (err) {
              // Continue to next year
              console.log(`RegionalAnalysisChart: No data found for year ${year}`);
            }
          }
        }

        if (!summary || summary.length === 0) {
          setChartData([])
          return
        }

        const totals = summary.reduce((acc: any, county: any) => {
          acc.governance += Number(county.governance || 0)
          acc.mrv += Number(county.mrv || 0)
          acc.mitigation += Number(county.mitigation || 0)
          acc.adaptation += Number(county.adaptation_resilience || county.adaptation || 0)
          acc.finance += Number(county.finance || 0)
          return acc
        }, {
          governance: 0,
          mrv: 0,
          mitigation: 0,
          adaptation: 0,
          finance: 0
        })

        const countyCount = summary.length

        const averages = [
          { name: "Governance", value: Math.round(totals.governance / countyCount) },
          { name: "MRV", value: Math.round(totals.mrv / countyCount) },
          { name: "Mitigation", value: Math.round(totals.mitigation / countyCount) },
          { name: "Adaptation", value: Math.round(totals.adaptation / countyCount) },
          { name: "Finance & Tech", value: Math.round(totals.finance / countyCount) },
        ]

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

  const barColor = type === "water" ? "#3b82f6" : "#10b981" // blue for water, green for waste

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

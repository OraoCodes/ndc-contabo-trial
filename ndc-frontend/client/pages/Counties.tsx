import { MainLayout } from "@/components/MainLayout";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { listCounties, listThematicAreas } from "@/lib/supabase-api";

const waterData = [
  { rank: 1, county: "Nairobi", wasteMgt: 11, avgScore: 21 },
  { rank: 2, county: "Mombasa", wasteMgt: 11, avgScore: 21 },
  { rank: 3, county: "Nairobi", wasteMgt: 11, avgScore: 21 },
  { rank: 4, county: "Mombasa", wasteMgt: 11, avgScore: 21 },
  { rank: 5, county: "Nairobi", wasteMgt: 11, avgScore: 21 },
  { rank: 6, county: "Mombasa", wasteMgt: 11, avgScore: 21 },
];

const wasteData = [
  { rank: 1, county: "Nairobi", wasteMgt: 11, avgScore: 21 },
  { rank: 2, county: "Mombasa", wasteMgt: 11, avgScore: 21 },
  { rank: 3, county: "Nairobi", wasteMgt: 11, avgScore: 21 },
  { rank: 4, county: "Mombasa", wasteMgt: 11, avgScore: 21 },
  { rank: 5, county: "Nairobi", wasteMgt: 11, avgScore: 21 },
  { rank: 6, county: "Mombasa", wasteMgt: 11, avgScore: 21 },
];

const chartData = [
  { name: "Governza nce", value: 65 },
  { name: "MKV", value: 35 },
  { name: "Migot ck", value: 45 },
  { name: "Adapot ck", value: 55 },
  { name: "Finance & Tech", value: 25 },
];

const colors = ["#3b82f6", "#fcd34d", "#a855f7", "#22c55e", "#06b6d4"];

const ChartSection = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="bg-white rounded-lg p-6 border border-border">
    <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
    <p className="text-xs text-muted-foreground mb-6">{subtitle}</p>
    <div className="mb-4">
      <p className="text-xs font-medium text-foreground mb-4">Regional Analysis</p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value) => [value, "Score"]} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const RankingTable = ({ title, data }: { title: string; data: Array<any> }) => (
  <div className="bg-white rounded-lg p-6 border border-border">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Year</span>
        <button className="flex items-center gap-1 px-3 py-1 bg-background text-foreground text-xs rounded border border-border hover:bg-background/80">
          2025
          <ChevronDown size={14} />
        </button>
      </div>
    </div>

    <div className="mb-4 text-xs text-muted-foreground">County Rankings</div>

    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 px-0 text-xs font-semibold text-foreground">Rank</th>
            <th className="text-left py-2 px-0 text-xs font-semibold text-foreground">County</th>
            <th className="text-left py-2 px-0 text-xs font-semibold text-foreground">Population</th>
            <th className="text-left py-2 px-0 text-xs font-semibold text-foreground">Thematic Area</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={`${row.rank}-${row.county}`} className="border-b border-border hover:bg-background/30">
              <td className="py-3 px-0 text-foreground">{row.rank}</td>
              <td className="py-3 px-0 text-foreground underline cursor-pointer hover:text-primary">
                {row.county}
              </td>
              <td className="py-3 px-0 text-foreground">{row.population ?? "—"}</td>
              <td className="py-3 px-0 text-foreground">{row.thematic ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default function Counties() {
  const { data: counties } = useQuery({ queryKey: ["counties"], queryFn: listCounties });
  const { data: thematicAreas } = useQuery({ queryKey: ["thematicAreas"], queryFn: listThematicAreas });

  const rows = (counties ?? []).map((c: any, idx: number) => ({
    rank: idx + 1,
    county: c.name,
    population: c.population,
    thematic: thematicAreas?.find((t: any) => t.id === c.thematic_area_id)?.name ?? "—",
  }));

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">Overall Ranking</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <RankingTable title="County Rankings" data={rows} />
            <RankingTable title="County Rankings (Duplicate)" data={rows} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartSection
              title="Summary County Rankings - Water Sector"
              subtitle="Complete performance and indicators"
            />
            <ChartSection
              title="Summary County Rankings - Waste Management"
              subtitle="Complete performance and indicators"
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

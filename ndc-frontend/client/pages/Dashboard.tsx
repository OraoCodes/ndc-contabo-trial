import { MainLayout } from "@/components/MainLayout";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { 
  listCounties, 
  listThematicAreas, 
  listPublications, 
  getDashboardStats,
  downloadPublication,
  type Publication 
} from "@/lib/supabase-api";
import { useAuth } from "@/context/AuthContext";

export default function Index() {
  const { user } = useAuth();
  
  // Fetch data using Supabase directly
  const { data: counties } = useQuery({ 
    queryKey: ["counties"], 
    queryFn: listCounties 
  });
  
  const { data: thematicAreas } = useQuery({ 
    queryKey: ["thematicAreas"], 
    queryFn: listThematicAreas 
  });
  
  const { data: publications } = useQuery({ 
    queryKey: ["publications"], 
    queryFn: listPublications 
  });

  // Fetch dashboard stats (real performance data)
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => getDashboardStats(2025),
  });

  const totalCounties = counties ? counties.length : "—";
  const totalThematic = thematicAreas ? thematicAreas.length : "—";
  
  // Real performance stats from Supabase
  const avgWaterScore = stats ? `${Math.round(stats.avgWaterScore)}%` : "—";
  const overallAvgScore = stats ? `${Math.round(stats.overallAvgScore)}%` : "—";
  
  // Chart data: Sector comparison
  const chartData = stats ? [
    { name: "Water", score: Math.round(stats.avgWaterScore) },
    { name: "Waste", score: Math.round(stats.avgWasteScore) },
  ] : [];

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Welcome{user ? `, ${user.fullName}` : ''} to NDC Dashboard
          </h2>
          <p className="text-muted-foreground">Track water and waste management performance across Kenya</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-6 border border-border">
              <p className="text-xs text-muted-foreground mb-2">Total Counties</p>
              <p className="text-3xl font-bold text-foreground">{totalCounties}</p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-border">
              <p className="text-xs text-muted-foreground mb-2">Thematic Areas</p>
              <p className="text-3xl font-bold text-primary">{totalThematic}</p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-border">
              <p className="text-xs text-muted-foreground mb-2">Avg Water Score</p>
              <p className="text-3xl font-bold text-primary">
                {statsLoading ? "..." : avgWaterScore}
              </p>
              {stats && stats.countiesWithData > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.countiesWithData} counties
                </p>
              )}
            </div>
            <div className="bg-white rounded-lg p-6 border border-border">
              <p className="text-xs text-muted-foreground mb-2">Overall Avg Score</p>
              <p className="text-3xl font-bold text-foreground">
                {statsLoading ? "..." : overallAvgScore}
              </p>
              {stats && stats.topCounty && (
                <p className="text-xs text-muted-foreground mt-1">
                  Top: {stats.topCounty.name}
                </p>
              )}
            </div>
          </div>

          {/* Overview Chart */}
          <div className="bg-white rounded-lg p-6 border border-border">
            <h3 className="text-sm font-semibold text-foreground mb-6">
              Sector Performance Comparison
            </h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${value}%`, "Average Score"]} />
                  <Bar dataKey="score" fill="#4cd9c0" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
                {statsLoading ? "Loading performance data..." : "No performance data available yet"}
              </div>
            )}
          </div>
        </div>

        {/* Navigation Cards */}
        <div>
          <p className="text-sm font-semibold text-foreground mb-4">Quick Access</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a href="/counties" className="bg-white rounded-lg p-6 border border-border hover:border-primary hover:bg-background/50 transition-colors cursor-pointer">
              <h3 className="font-semibold text-foreground mb-2">County Rankings</h3>
              <p className="text-xs text-muted-foreground">View water and waste management rankings by county</p>
            </a>
            <a href="/thematic-areas" className="bg-white rounded-lg p-6 border border-border hover:border-primary hover:bg-background/50 transition-colors cursor-pointer">
              <h3 className="font-semibold text-foreground mb-2">Thematic Areas</h3>
              <p className="text-xs text-muted-foreground">Explore performance across different thematic areas</p>
            </a>
            <a href="/indicators" className="bg-white rounded-lg p-6 border border-border hover:border-primary hover:bg-background/50 transition-colors cursor-pointer">
              <h3 className="font-semibold text-foreground mb-2">Indicators</h3>
              <p className="text-xs text-muted-foreground">Review detailed performance indicators and metrics</p>
            </a>
          </div>
        </div>
        {/* Recent Publications */}
        <div>
          <p className="text-sm font-semibold text-foreground mb-4">Recent Publications</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(publications ?? []).slice(0, 6).map((p: any) => (
              <div key={p.id} className="bg-white rounded-lg p-4 border border-border flex flex-col justify-between">
                <div>
                  <h4 className="font-semibold text-foreground mb-1 truncate">{p.title}</h4>
                  <p className="text-xs text-muted-foreground mb-2">{p.filename} • {p.date ? new Date(p.date).toLocaleDateString() : "—"}</p>
                  <p className="text-sm text-foreground/90 line-clamp-2">{p.summary}</p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <button
                    onClick={async () => {
                      try {
                        const blob = await downloadPublication(p.id);
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = p.filename ?? `publication-${p.id}`;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        URL.revokeObjectURL(url);
                      } catch (err) {
                        console.error(err);
                        alert('Failed to download publication. Please try again.');
                      }
                    }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded bg-background text-foreground text-sm border border-border hover:bg-background/80"
                  >
                    Download
                  </button>
                  <span className="text-xs text-muted-foreground">PDF</span>
                </div>
              </div>
            ))}
            {(publications ?? []).length === 0 && (
              <div className="col-span-full text-sm text-muted-foreground">No publications yet. Upload one from the Publications page.</div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

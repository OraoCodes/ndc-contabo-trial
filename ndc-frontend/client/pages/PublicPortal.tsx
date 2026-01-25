import { InteractiveMap } from "@/components/InteractiveMap";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { ChevronDown } from "lucide-react";

const chartData = [
  { name: "Governza nce", value: 65, fill: "#3b82f6" },
  { name: "MKV", value: 35, fill: "#fcd34d" },
  { name: "Migot ck", value: 45, fill: "#a855f7" },
  { name: "Adapot ck", value: 55, fill: "#22c55e" },
  { name: "Finance & Tech", value: 25, fill: "#06b6d4" },
];

const countyRankingData = [
  { rank: 1, county: "Nairobi", score: 92, level: "excellent" },
  { rank: 2, county: "Nyeri", score: 88, level: "excellent" },
  { rank: 3, county: "Naivasha", score: 82, level: "good" },
  { rank: 4, county: "Mombasa", score: 85, level: "good" },
  { rank: 5, county: "Kisumu", score: 78, level: "good" },
  { rank: 6, county: "Kericho", score: 75, level: "fair" },
  { rank: 7, county: "Nakuru", score: 72, level: "fair" },
  { rank: 8, county: "Machakos", score: 70, level: "fair" },
  { rank: 9, county: "Kisii", score: 68, level: "fair" },
  { rank: 10, county: "Meru", score: 58, level: "poor" },
];

const getPerformanceColor = (level: string) => {
  const colors: Record<string, string> = {
    excellent: "#22c55e",
    good: "#4cd9c0",
    fair: "#fcd34d",
    poor: "#ef4444",
  };
  return colors[level] || "#cbd5e1";
};

const getPerformanceBgColor = (level: string) => {
  const colors: Record<string, string> = {
    excellent: "#dcfce7",
    good: "#ccf7f3",
    fair: "#fef3c7",
    poor: "#fee2e2",
  };
  return colors[level] || "#f1f5f9";
};

export default function PublicPortal() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sidebar to-sidebar-primary flex items-center justify-center flex-shrink-0">
              <div className="w-6 h-6 bg-white rounded-full" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-foreground">
                NDC Tracking Dashboard
              </h1>
              <p className="text-xs text-muted-foreground">Public Portal</p>
            </div>
          </div>
          <a
            href="/counties"
            className="px-4 py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
          >
            Full Dashboard
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Section */}
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Water Management
          </h2>
          <p className="text-muted-foreground mb-6">
            Tracking NDC progress on water and waste management across Kenya
          </p>
        </div>

        {/* Interactive Map Section */}
        <InteractiveMap />

        {/* Water Management Chart */}
        <div className="bg-white rounded-lg p-6 border border-border">
          <h3 className="text-sm font-semibold text-foreground mb-1">
            Summary County Rankings - Water Management
          </h3>
          <p className="text-xs text-muted-foreground mb-6">
            Complete performance analysis and indicators
          </p>
          <p className="text-xs font-medium text-foreground mb-4">
            Regional Analysis
          </p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => [value, "Score"]} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* County Ranking Table */}
        <div className="bg-white rounded-lg p-6 border border-border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Indicators County Ranking
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Water management performance by county
              </p>
            </div>
            <button className="flex items-center gap-1 px-3 py-1 bg-background text-foreground text-xs rounded border border-border hover:bg-background/80">
              Year
              <ChevronDown size={14} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground text-xs">
                    Rank
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground text-xs">
                    County
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground text-xs">
                    Score
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground text-xs">
                    Performance
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground text-xs">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {countyRankingData.map((row) => (
                  <tr
                    key={`${row.rank}-${row.county}`}
                    className="border-b border-border hover:bg-background/50 transition-colors"
                  >
                    <td className="py-4 px-4 text-foreground font-medium">
                      {row.rank}
                    </td>
                    <td className="py-4 px-4 text-foreground font-medium">
                      {row.county}
                    </td>
                    <td className="py-4 px-4 text-foreground font-bold">
                      {row.score}%
                    </td>
                    <td className="py-4 px-4">
                      <div
                        className="inline-block px-3 py-1 rounded text-xs font-medium"
                        style={{
                          backgroundColor: getPerformanceBgColor(row.level),
                          color: getPerformanceColor(row.level),
                        }}
                      >
                        {row.level.charAt(0).toUpperCase() + row.level.slice(1)}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div
                        className="inline-flex items-center justify-center w-6 h-6 rounded-full"
                        style={{ backgroundColor: getPerformanceColor(row.level) }}
                      >
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-sidebar text-sidebar-foreground mt-16 border-t border-sidebar-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4">About</h4>
              <p className="text-sm text-sidebar-foreground/80">
                NDC tracking tool for water and waste management in Kenya
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-sidebar-foreground/80 hover:text-sidebar-foreground">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sidebar-foreground/80 hover:text-sidebar-foreground">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-sidebar-foreground/80 hover:text-sidebar-foreground">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sidebar-foreground/80 hover:text-sidebar-foreground">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-sidebar-border pt-4 text-center text-sm text-sidebar-foreground/60">
            <p>&copy; 2024 NDC Tracking Tool. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

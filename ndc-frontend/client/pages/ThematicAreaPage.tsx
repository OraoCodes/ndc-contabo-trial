import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { HeroBanner } from "@/components/hero-banner";
import { KenyaInteractiveMap } from "@/components/KenyaInteractiveMap";
import {
  listThematicAreas,
  findThematicAreaBySlug,
  listIndicatorsByThematicArea,
  getAllCountyIndicatorData,
  type ThematicArea,
  type Indicator,
} from "@/lib/supabase-api";

const YEAR_OPTIONS = Array.from({ length: 11 }, (_, i) => 2025 + i);

export default function ThematicAreaPage() {
  const { slug } = useParams<{ slug: string }>();
  const [selectedYear, setSelectedYear] = useState(2025);

  const { data: areas = [], isLoading, isError, error } = useQuery({
    queryKey: ["thematicAreas"],
    queryFn: listThematicAreas,
  });

  const area = slug ? findThematicAreaBySlug(areas, slug) : undefined;

  const sector = area?.sector?.toLowerCase() as "water" | "waste" | undefined;
  const sectorFilter = sector === "water" || sector === "waste" ? sector : "water";

  // Indicators for the current thematic area
  const { data: indicators = [], isLoading: indicatorsLoading } = useQuery<Indicator[]>({
    queryKey: ["indicatorsByThematicArea", area?.id],
    queryFn: () => listIndicatorsByThematicArea(area!.id),
    enabled: !!area,
  });

  // Find sibling thematic area (same name, opposite sector) for the other column
  const siblingArea = area
    ? areas.find((a) => a.name === area.name && a.sector !== area.sector)
    : undefined;

  const { data: siblingIndicators = [] } = useQuery<Indicator[]>({
    queryKey: ["indicatorsByThematicArea", siblingArea?.id],
    queryFn: () => listIndicatorsByThematicArea(siblingArea!.id),
    enabled: !!siblingArea,
  });

  // All county performance rows with indicators_json
  const { data: allCountyData = [] } = useQuery({
    queryKey: ["allCountyIndicatorData", selectedYear],
    queryFn: () => getAllCountyIndicatorData(selectedYear),
    enabled: !!area,
  });

  // Compute per-county scores from indicators_json
  const countyRankings = (() => {
    if (!area) return [];

    // Current area's indicators (one sector)
    const currentInds = indicators;
    const currentSector = sectorFilter;
    // Sibling area's indicators (opposite sector)
    const otherInds = siblingIndicators;
    const otherSector = currentSector === "water" ? "waste" : "water";

    // Helper: compute score as (sum of actual) / (sum of max) * 100
    function computeScore(
      indicatorDefs: Indicator[],
      json: Record<string, { score?: number | string }>,
    ): number {
      if (indicatorDefs.length === 0) return 0;
      let actualSum = 0;
      let maxSum = 0;
      for (const ind of indicatorDefs) {
        const entry = json[String(ind.id)];
        const actual = entry?.score != null && entry.score !== "" ? Number(entry.score) : 0;
        actualSum += Number.isFinite(actual) ? actual : 0;
        maxSum += ind.weight || 0;
      }
      return maxSum > 0 ? Math.round((actualSum / maxSum) * 100) : 0;
    }

    // Group county data by county name
    const byCounty = new Map<string, { water: Record<string, any>; waste: Record<string, any> }>();
    for (const row of allCountyData) {
      const name = row.county_name;
      if (!byCounty.has(name)) byCounty.set(name, { water: {}, waste: {} });
      const entry = byCounty.get(name)!;
      if (row.sector === "water") entry.water = row.indicators_json || {};
      if (row.sector === "waste") entry.waste = row.indicators_json || {};
    }

    const results: { name: string; water: number; waste: number; avg: number }[] = [];
    for (const [name, data] of byCounty) {
      const waterScore = currentSector === "water"
        ? computeScore(currentInds, data.water)
        : computeScore(otherInds, data.water);
      const wasteScore = currentSector === "waste"
        ? computeScore(currentInds, data.waste)
        : computeScore(otherInds, data.waste);

      const nonZero = [waterScore, wasteScore].filter((v) => v > 0);
      const avg = nonZero.length > 0 ? Math.round(nonZero.reduce((a, b) => a + b, 0) / nonZero.length) : 0;
      results.push({ name, water: waterScore, waste: wasteScore, avg });
    }

    return results
      .filter((r) => r.water > 0 || r.waste > 0)
      .sort((a, b) => b.avg - a.avg);
  })();

  if (!slug) {
    return (
      <main>
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center text-muted-foreground">
          <p>Invalid thematic area.</p>
          <Link to="/" className="text-primary underline mt-4 inline-block">Back to home</Link>
        </div>
        <Footer />
      </main>
    );
  }

  if (isLoading) {
    return (
      <main>
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center text-muted-foreground">Loading…</div>
        <Footer />
      </main>
    );
  }

  if (!area) {
    return (
      <main>
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center text-muted-foreground">
          <p>Thematic area not found.</p>
          <Link to="/" className="text-primary underline mt-4 inline-block">Back to home</Link>
        </div>
        <Footer />
      </main>
    );
  }

  if (isError) {
    return (
      <main>
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center text-destructive">
          <p>{(error as Error)?.message ?? "Failed to load thematic area."}</p>
          <Link to="/" className="text-primary underline mt-4 inline-block">Back to home</Link>
        </div>
        <Footer />
      </main>
    );
  }

  const description =
    (area as ThematicArea).description?.trim() ||
    "Thematic area under the NDC tracking framework.";

  return (
    <main>
      <Header />
      <HeroBanner title={area.name} description={description} />

      <section className="py-12 md:py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <span className="text-gray-600 font-medium">View data by year:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
            >
              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Map */}
            <div className="flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden">
              <KenyaInteractiveMap sector={sectorFilter} year={selectedYear} />
            </div>

            {/* Title + Indicator list */}
            <div>
              <h2 className="text-2xl font-bold mb-4">County Performance: {area.name}</h2>

              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-5">
                <dt className="text-muted-foreground">Sector</dt>
                <dd className="font-medium capitalize">{area.sector || "—"}</dd>
                <dt className="text-muted-foreground">Weight</dt>
                <dd className="font-medium">{area.weight_percentage != null ? `${area.weight_percentage}%` : "—"}</dd>
              </dl>

              <h3 className="text-base font-semibold text-muted-foreground mb-3">
                Indicators ({indicatorsLoading ? "..." : indicators.length})
              </h3>

              {indicatorsLoading ? (
                <p className="text-sm text-muted-foreground">Loading indicators...</p>
              ) : indicators.length === 0 ? (
                <p className="text-sm text-muted-foreground">No indicators defined for this thematic area yet.</p>
              ) : (
                <ul className="list-disc list-inside space-y-1.5 text-sm text-gray-700">
                  {indicators.map((ind) => (
                    <li key={ind.id}>{ind.title || ind.indicator_text}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* County Rankings */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <h2 className="text-2xl font-bold mb-6">County Rankings</h2>

          {countyRankings.length === 0 ? (
            <p className="text-sm text-muted-foreground">No county performance data yet for this thematic area.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-semibold">Rank</th>
                    <th className="px-4 py-3 text-left font-semibold">County</th>
                    <th className="px-4 py-3 text-right font-semibold">Water</th>
                    <th className="px-4 py-3 text-right font-semibold">Waste Mgt</th>
                    <th className="px-4 py-3 text-right font-semibold">Avg Score</th>
                    <th className="px-4 py-3 text-right font-semibold">Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {countyRankings.map((row, idx) => {
                    const perfLabel =
                      row.avg >= 90 ? "Outstanding" :
                      row.avg >= 75 ? "Satisfactory" :
                      row.avg >= 60 ? "Good" :
                      "Needs Improvement";
                    const perfColor =
                      row.avg >= 90 ? "bg-green-100 text-green-800" :
                      row.avg >= 75 ? "bg-teal-100 text-teal-800" :
                      row.avg >= 60 ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800";
                    return (
                      <tr key={row.name} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">{idx + 1}</td>
                        <td className="px-4 py-3">
                          <Link
                            to={`/county/${row.name.toLowerCase().replace(/\s+/g, "-")}`}
                            className="text-primary hover:underline font-medium"
                          >
                            {row.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-right font-medium">{row.water}</td>
                        <td className="px-4 py-3 text-right font-medium">{row.waste}</td>
                        <td className="px-4 py-3 text-right font-bold">{row.avg}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${perfColor}`}>
                            {perfLabel}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}

import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { HeroBanner } from "@/components/hero-banner";
import { KenyaInteractiveMap } from "@/components/KenyaInteractiveMap";
import {
  listThematicAreas,
  getCountySummaryPerformance,
  thematicAreaNameToScoreKey,
  findThematicAreaBySlug,
  type ThematicArea,
} from "@/lib/supabase-api";

const currentYear = new Date().getFullYear();

function formatSector(sector: string | null | undefined): string {
  if (!sector) return "—";
  const s = sector.toLowerCase();
  return s === "water" ? "Water" : s === "waste" ? "Waste" : sector;
}

export default function ThematicAreaPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: areas = [], isLoading, isError, error } = useQuery({
    queryKey: ["thematicAreas"],
    queryFn: listThematicAreas,
  });

  const area = slug ? findThematicAreaBySlug(areas, slug) : undefined;

  const scoreKey = area ? thematicAreaNameToScoreKey(area.name) : null;
  const sector = area?.sector?.toLowerCase() as "water" | "waste" | undefined;
  const sectorFilter = sector === "water" || sector === "waste" ? sector : "water";

  const { data: countyData = [] } = useQuery({
    queryKey: ["countySummaryForThematic", sectorFilter, currentYear],
    queryFn: () => getCountySummaryPerformance(sectorFilter, currentYear),
    enabled: !!scoreKey && !!area,
  });

  const rowsWithPillar = scoreKey
    ? countyData
        .map((row: Record<string, unknown>) => ({
          name: row.name || row.county_name || "Unknown",
          score: Number(row[scoreKey] ?? 0),
          sectorScore: Number(row.sector_score ?? 0),
        }))
        .filter((r) => r.score > 0 || r.sectorScore > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 20)
    : [];

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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Map */}
            <div className="flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden">
              <KenyaInteractiveMap sector={sectorFilter} year={currentYear} />
            </div>

            {/* Meta + optional rankings */}
            <div>
              <div className="mb-6">
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <dt className="text-muted-foreground">Sector</dt>
                  <dd className="font-medium capitalize">{formatSector(area.sector)}</dd>
                  {area.weight_percentage != null && (
                    <>
                      <dt className="text-muted-foreground">Weight</dt>
                      <dd className="font-medium">{area.weight_percentage}%</dd>
                    </>
                  )}
                </dl>
                {description && (
                  <p className="text-muted-foreground mt-4 text-sm">{description}</p>
                )}
              </div>

              {scoreKey && rowsWithPillar.length > 0 && (
                <>
                  <h2 className="text-xl font-bold mb-4">County rankings ({scoreKey})</h2>
                  <div className="overflow-x-auto rounded-lg border border-border bg-white">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/50">
                          <th className="px-3 py-2 text-left font-semibold">Rank</th>
                          <th className="px-3 py-2 text-left font-semibold">County</th>
                          <th className="px-3 py-2 text-right font-semibold">Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rowsWithPillar.map((row, idx) => (
                          <tr key={row.name} className="border-b border-border hover:bg-muted/30">
                            <td className="px-3 py-2">{idx + 1}</td>
                            <td className="px-3 py-2">
                              <Link
                                to={`/county/${String(row.name).toLowerCase().replace(/\s+/g, "-")}`}
                                className="text-primary hover:underline"
                              >
                                {row.name}
                              </Link>
                            </td>
                            <td className="px-3 py-2 text-right font-medium">{row.score}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {scoreKey && rowsWithPillar.length === 0 && (
                <p className="text-sm text-muted-foreground">No county data yet for this thematic area.</p>
              )}

              {!scoreKey && (
                <p className="text-sm text-muted-foreground">
                  View county-level data from the <Link to="/" className="text-primary underline">County Performance</Link> overview or <Link to="/counties" className="text-primary underline">Counties</Link>.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

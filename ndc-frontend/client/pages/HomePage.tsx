"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HeroBanner } from "@/components/hero-banner"
import { KenyaInteractiveMap } from "@/components/KenyaInteractiveMap"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Link, useNavigate } from "react-router-dom"
import { listThematicAreas, listPublications, getCountySummaryPerformance, thematicAreasToMenuItems, type ThematicArea, type CountySummaryPerformance } from "@/lib/supabase-api"

// Publication interface matching database schema
interface Publication {
    id: number;
    title: string;
    date: string | null;
    summary: string | null;
    filename: string;
    storage_path?: string;
    file_size?: number | null;
    mime_type?: string | null;
    created_at?: string;
    updated_at?: string;
}

// 

// Local type for table display (with rank + performance)
interface RankedCounty extends CountySummaryPerformance {
    rank: number
}


export default function Home() {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState("water")
    const [thematicAreas, setThematicAreas] = useState<ThematicArea[]>([])
    const [publications, setPublications] = useState<Publication[]>([])
    const [waterSummaryData, setWaterSummaryData] = useState<CountySummaryPerformance[]>([])
    const [wasteSummaryData, setWasteSummaryData] = useState<CountySummaryPerformance[]>([])
    const [dataYear, setDataYear] = useState<number>(2025)

    const [loadingThematicAreas, setLoadingThematicAreas] = useState(true)
    const [loadingPublications, setLoadingPublications] = useState(true)
    const [loadingSummaryData, setLoadingSummaryData] = useState(true)

    const [errorThematicAreas, setErrorThematicAreas] = useState<string | null>(null)
    const [errorPublications, setErrorPublications] = useState<string | null>(null)
    const [errorSummaryData, setErrorSummaryData] = useState<string | null>(null)

    useEffect(() => {
        const fetchThematicAreas = async () => {
            try {
                const data = await listThematicAreas();
                setThematicAreas(data);
            } catch (error: unknown) {
                setErrorThematicAreas((error as Error)?.message ?? "Failed to fetch thematic areas");
            } finally {
                setLoadingThematicAreas(false);
            }
        };
        const fetchPublications = async () => {
            try {
                const data = await listPublications();
                setPublications(data);
            } catch (error: unknown) {
                setErrorPublications((error as Error)?.message ?? "Failed to fetch publications");
            } finally {
                setLoadingPublications(false);
            }
        };
        const fetchSummaryData = async () => {
            try {
                const currentYear = new Date().getFullYear();
                const yearsToTry = [currentYear, currentYear - 1, currentYear - 2, 2024, 2023, 2022];
                let waterData: CountySummaryPerformance[] = [];
                let wasteData: CountySummaryPerformance[] = [];
                for (const year of yearsToTry) {
                    if (waterData.length === 0 || wasteData.length === 0) {
                        try {
                            const [water, waste] = await Promise.all([
                                getCountySummaryPerformance("water", year).catch(() => []),
                                getCountySummaryPerformance("waste", year).catch(() => [])
                            ]);
                            if (water.length > 0 && waterData.length === 0) {
                                waterData = water;
                                setDataYear(year);
                            }
                            if (waste.length > 0 && wasteData.length === 0) {
                                wasteData = waste;
                                if (waterData.length === 0) setDataYear(year);
                            }
                        } catch {
                            // continue
                        }
                    }
                }
                setWaterSummaryData(waterData);
                setWasteSummaryData(wasteData);
            } catch (error: unknown) {
                setErrorSummaryData((error as Error)?.message ?? "Unable to load performance data.");
            } finally {
                setLoadingSummaryData(false);
            }
        };
        fetchThematicAreas();
        fetchPublications();
        fetchSummaryData();
    }, []);

    const rawData = activeTab === "water" ? waterSummaryData : wasteSummaryData;
    const safeData = Array.isArray(rawData) ? rawData : [];

    const rankedData: RankedCounty[] = safeData
        .map((item: any) => ({
            name: item.name || item.county || "Unknown",
            score: Number(item.score ?? item.indexScore ?? 0),
            performance: item.performance || "Poor"
        }))
        .filter((item): item is { name: string; score: number } => 
            typeof item.name === "string" && item.score > 0
        )
        .sort((a, b) => b.score - a.score)
        .map((item, index) => ({
            ...item,
            rank: index + 1
        }));

    const getPerformanceBadge = (score: number) => {
        if (score >= 90) return { text: "Outstanding", color: "bg-green-600" }
        if (score >= 75) return { text: "Satisfactory", color: "bg-emerald-600" }
        if (score >= 60) return { text: "Good", color: "bg-yellow-500 text-black" }
        return { text: "Needs Improvement", color: "bg-orange-500 text-black" }
    }

    //     const getCountyName = (item: CountySummaryPerformance) => {
    //     return item.name || item.county || item.county_name || "Unknown County"
    //   }

    //   const getCountySlug = (item: CountySummaryPerformance) => {
    //     const name = getCountyName(item)
    //     return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
    //   }

    return (
        <main>
            <Header currentPage="home" />

            <HeroBanner
                title="NDC tracking tool for water and waste management in Kenya"
                description="Track Kenya county performance in climate action across water and waste sectors"
            />

            <section className="py-12 md:py-16 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <h2 className="text-3xl font-bold mb-8">County Performance Overview</h2>
                    
                    {/* Tab Controls */}
                    <div className="flex gap-3 mb-8">
                        <button
                            onClick={() => setActiveTab("water")}
                            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-colors ${activeTab === "water"
                                ? "bg-slate-900 text-white"
                                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                                }`}
                        >
                            Water Management
                        </button>
                        <button
                            onClick={() => setActiveTab("waste")}
                            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-colors ${activeTab === "waste"
                                ? "bg-slate-900 text-white"
                                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                                }`}
                        >
                            Waste Management
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Interactive Map */}
                        <div>
                            <KenyaInteractiveMap
                                sector={activeTab as "water" | "waste"}
                                year={dataYear}
                                onCountyClick={(countyName) => {
                                    const slug = countyName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
                                    navigate(`/county/${slug}`)
                                }}
                            />
                        </div>

                        {/* Table Section */}
                        <div>
                            <h3 className="text-2xl font-bold mb-6">Summary Index Score</h3>
                            {loadingSummaryData ? (
                            <div className="text-center py-8">Loading summary data...</div>
                        ) : errorSummaryData ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    {errorSummaryData}
                                </div>
                            ) : safeData.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No performance data available for {activeTab === "water" ? "Water" : "Waste"} sector yet.
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-slate-50 border-b">
                                                <tr>
                                                    <th className="px-6 py-4 text-left font-semibold">Rank</th>
                                                    <th className="px-6 py-4 text-left font-semibold">County</th>
                                                    <th className="px-6 py-4 text-center font-semibold">Index Score</th>
                                                    <th className="px-6 py-4 text-center font-semibold">Performance</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {rankedData
                                                    .filter((row): row is RankedCounty => !!row?.name)
                                                    .map((row) => {
                                                        const perf = getPerformanceBadge(row.score)
                                                        const slug = row.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
                                                        return (
                                                            <tr key={row.name} className="border-b hover:bg-slate-50 transition">
                                                                <td className="px-6 py-4 font-semibold">#{row.rank}</td>
                                                                <td className="px-6 py-4">
                                                                    <Link
                                                                        to={`/county/${slug}`}
                                                                        className="text-blue-600 hover:underline font-medium"
                                                                    >
                                                                        {row.name}
                                                                    </Link>
                                                                </td>
                                                                <td className="px-6 py-4 text-center font-bold">
                                                                    {row.score.toFixed(1)}
                                                                </td>
                                                                <td className="px-6 py-4 text-center">
                                                                    <Badge className={`rounded-full px-4 py-1.5 font-medium ${perf.color}`}>
                                                                        {perf.text}
                                                                    </Badge>
                                                                </td>
                                                            </tr>
                                                        )
                                                    })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        
                            <div className="mt-6">
                                <Link
                                    to={activeTab === "water" ? "/water-management" : "/waste-management"}
                                >
                                    <Button variant="link" className="text-blue-600 hover:text-blue-800 font-semibold">
                                        View More →
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Thematic Areas & Publications */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 md:px-6 grid md:grid-cols-2 gap-16">
                    {/* Thematic Areas */}
                    <div>
                        <h2 className="text-4xl font-bold mb-10">Thematic Areas</h2>
                        {loadingThematicAreas ? (
                            <div>Loading thematic areas...</div>
                        ) : errorThematicAreas ? (
                            <div className="text-red-500">{errorThematicAreas}</div>
                        ) : (
                            <div className="space-y-6">
                                {thematicAreasToMenuItems(thematicAreas).map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className="block group"
                                    >
                                        <div className="flex items-center justify-between px-8 py-6 bg-white border border-gray-200 rounded-2xl 
                                          hover:border-gray-300 hover:shadow-lg transition-all duration-300 
                                          cursor-pointer"
                                        >
                                            <div className="pr-4 min-w-0">
                                                <span className="text-lg font-medium text-gray-800 block">
                                                    {item.name}
                                                </span>
                                                {item.sector && (
                                                    <span className="text-xs text-gray-400 font-normal mt-0.5 block capitalize">
                                                        {item.sector}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-2xl text-gray-400 group-hover:text-blue-600 
                                             group-hover:translate-x-3 transition-all duration-300 flex-shrink-0">
                                                →
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Publications */}
                    <div>
                        <h2 className="text-4xl font-bold mb-10">Publications</h2>
                        {loadingPublications ? (
                            <div>Loading publications...</div>
                        ) : errorPublications ? (
                            <div className="text-red-500">{errorPublications}</div>
                        ) : publications.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <p className="text-lg">No publications available yet.</p>
                                <p className="text-sm mt-2">Check back later for updates.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                                {publications.slice(0, 3).map((publication) => (
                                    <div
                                        key={publication.id}
                                        className="bg-white rounded-xl shadow-md border border-gray-100 p-4 flex flex-col"
                                    >

                                        {/* Title */}
                                        <h3 className="text-gray-900 font-semibold text-base leading-snug mb-2">
                                            {publication.title}
                                        </h3>

                                        {/* Date */}
                                        {publication.date && (
                                            <p className="text-gray-500 text-sm mb-4">
                                                {new Date(publication.date).toLocaleDateString(undefined, {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric",
                                                })}
                                            </p>
                                        )}

                                        {/* CTA */}
                                        <Link
                                            to={`/publications/${publication.id}`}
                                            className="mt-auto text-blue-600 font-medium text-sm flex items-center gap-1"
                                        >
                                            Read Report →
                                        </Link>
                                    </div>
                                ))}
                            </div>

                        )}
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    )
}


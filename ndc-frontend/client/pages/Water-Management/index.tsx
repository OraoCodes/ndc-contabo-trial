import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { IndicatorSection } from "@/components/indicator-section"
import { KenyaInteractiveMap } from "@/components/KenyaInteractiveMap"

// Indicator type that matches what IndicatorSection expects
interface IndicatorItem {
    no: number
    indicator: string
    description: string
    score: number
}

// Your real indicators from admin panel
const WATER_INDICATORS = {
    governance: [
        "Water sector policy aligned with NDCs or county climate action plan exists",
        "Climate change coordination unit or committee established",
        "% of water department staff trained in climate-related planning",
        "Climate targets included in county performance contracts",
        "Climate goals integrated into County Integrated Development Plan (CIDP)",
        "Stakeholder participation mechanism established (public forums, workshops)",
    ],
    mrv: [
        "MRV system for water sector NDC tracking in place",
        "Frequency of data updates for water indicators",
        "% of water-related indicators with available data",
        "Water sector emission inventory completed",
        "County submits water data to national MRV system",
        "Verification mechanism for water data in place",
    ],
    mitigation: [
        "GHG emission reduction target for water sector exists",
        "Annual GHG reduction achieved in water sector (%)",
        "Renewable energy share in water supply/pumping",
        "Water efficiency or conservation programs implemented",
        "Leakage reduction or non-revenue water targets met",
        "Climate-smart water infrastructure projects active",
    ],
    adaptation: [
        "Climate risk and vulnerability assessment for water conducted",
        "% population with access to climate-resilient water infrastructure",
        "Drought early warning system operational",
        "Flood response protocols for water systems in place",
        "Ecosystem restoration (watersheds, wetlands) supported",
        "Number of water storage/reservoirs for drought resilience",
    ],
    finance: [
        "Dedicated climate budget line for water sector exists",
        "% of county budget allocated to climate-resilient water projects",
        "Amount of climate finance mobilized for water (KES)",
        "Access to international climate funds (GCF, AF, etc.)",
        "Private sector participation in water resilience projects",
        "Budget absorption rate for water-related climate funds",
    ],
}

// const WASTE_INDICATORS = [
//     "County waste management policy adopted",
//     "Waste collection by-laws enforced",
//     "Waste sector GHG emissions tracked",
//     "Landfill gas capture project active",
//     "Circular economy initiatives launched",
//     "Waste revenue used for climate projects",
// ]

export default function CountyWaterPage() {
    const { countyName = "" } = useParams<{ countyName: string }>()
    const [year, setYear] = useState("2025")
    const [data, setData] = useState<{
        name: string
        description: string
        overallRank: number | string
        overallScore: string
        waterScore: string
        // wasteScore: 
        indicators: Record<string, string>
        water: Record<string, IndicatorItem[]>
        // wasteIndicators: IndicatorItem[]
    } | null>(null)
    const [loading, setLoading] = useState(true)

    // Safely format indicators with number and fallback
    const buildIndicators = (apiData: any[] = [], fallback: string[]) => {
        return apiData.length > 0
            ? apiData.map((item: any, i: number) => ({
                no: i + 1,
                indicator: item.indicator || fallback[i] || "Unknown indicator",
                description: item.description || "No description available.",
                score: Number(item.score || 0),
            }))
            : fallback.map((ind, i) => ({
                no: i + 1,
                indicator: ind,
                description: "Data not yet entered.",
                score: 0,
            }))
    }

    useEffect(() => {
        async function fetchData() {
            try {
                // Use Supabase directly
                const { getCountyPerformance } = await import("@/lib/supabase-api");
                const raw = await getCountyPerformance(countyName, parseInt(year));
                const json = {
                    waterScore: raw.waterScore || "0",
                    wasteScore: raw.wasteScore || "0",
                    overallScore: raw.overallScore || "0",
                    indicators: raw.indicators || {},
                };

                const waterScore = Number(json.waterScore || 0).toFixed(1)
                // const wasteScore = Number(json.wasteScore || 0).toFixed(1)
                const overallScore = Number(json.overallScore || 0).toFixed(1)

                setData({
                    name: json.county || countyName,
                    description:
                        "This component examines the institutional structures, legal frameworks, policy coherence, and stakeholder engagement mechanisms that underpin climate action. It is weighted at 30%, recognizing its foundational role in enabling effective implementation and coordination across all other components.",
                    overallRank: json.rank || 1,
                    overallScore,
                    waterScore,
                    // wasteScore,
                    indicators: {
                        governance: Number(json.indicators?.governance || 0).toFixed(1),
                        mrv: Number(json.indicators?.mrv || 0).toFixed(1),
                        mitigation: Number(json.indicators?.mitigation || 0).toFixed(1),
                        adaptation: Number(json.indicators?.adaptation || 0).toFixed(1),
                        finance: Number(json.indicators?.finance || 0).toFixed(1),
                    },
                    water: {
                        governance: buildIndicators(json.waterIndicators?.governance, WATER_INDICATORS.governance),
                        mrv: buildIndicators(json.waterIndicators?.mrv, WATER_INDICATORS.mrv),
                        mitigation: buildIndicators(json.waterIndicators?.mitigation, WATER_INDICATORS.mitigation),
                        adaptation: buildIndicators(json.waterIndicators?.adaptation, WATER_INDICATORS.adaptation),
                        finance: buildIndicators(json.waterIndicators?.finance, WATER_INDICATORS.finance),
                    },
                    // wasteIndicators: buildIndicators(json.wasteIndicators, WASTE_INDICATORS),
                })
            } catch (err) {
                console.error(err)
                // Fallback when API fails
                const emptySection = (arr: string[]) =>
                    arr.map((ind, i) => ({
                        no: i + 1,
                        indicator: ind,
                        description: "Data not yet entered.",
                        score: 0,
                    }))

                setData({
                    name: countyName,
                    description: "Performance data temporarily unavailable.",
                    overallRank: "-",
                    overallScore: "N/A",
                    waterScore: "N/A",
                    // wasteScore: "N/A",
                    indicators: { governance: "0", mrv: "0", mitigation: "0", adaptation: "0", finance: "0" },
                    water: {
                        governance: emptySection(WATER_INDICATORS.governance),
                        mrv: emptySection(WATER_INDICATORS.mrv),
                        mitigation: emptySection(WATER_INDICATORS.mitigation),
                        adaptation: emptySection(WATER_INDICATORS.adaptation),
                        finance: emptySection(WATER_INDICATORS.finance),
                    },
                    // wasteIndicators: WASTE_INDICATORS.map((ind, i) => ({
                    //     no: i + 1,
                    //     indicator: ind,
                    //     description: "Data not yet entered.",
                    //     score: 0,
                    // })),
                })
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [countyName, year])

    if (loading || !data) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-xl text-gray-600">Loading {countyName} performance data...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            {/* Hero Banner - IDENTICAL */}
            <div
                className="bg-cover bg-center h-48 relative"
                style={{ backgroundImage: "url(/background.png)" }}
            >
                <div className="absolute inset-0 bg-black/50"></div>
                <div className="absolute inset-0 flex flex-col justify-center px-8">
                    <h1 className="text-4xl font-bold text-white mb-3">Water Management ({data.name})</h1>
                    <p className="text-white text-sm max-w-2xl">{data.description}</p>
                </div>
            </div>

            {/* Year Selector & Content - IDENTICAL */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
                <div className="flex justify-end mb-10">
                    <select
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                    >
                        <option>2025</option>
                        <option>2024</option>
                        <option>2023</option>
                    </select>
                </div>

                {/* Score Cards Grid - IDENTICAL */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                    {/* LEFT: Map */}
                    <div className="lg:col-span-5">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden sticky top-24">
                            <KenyaInteractiveMap
                                sector="water"
                                year={parseInt(year)}
                                highlightedCounty={countyName ? decodeURIComponent(countyName).replace(/-/g, " ") : undefined}
                            />
                        </div>
                    </div>

                    {/* RIGHT: Scores */}
                    <div className="lg:col-span-7 space-y-8">
                        {/* Overall Score + Ranking */}
                        <div className="grid grid-cols-2 gap-6">
                            <div>

                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
                                    <div className="flex items-start gap-5">
                                        <img src="/Blur.png" alt="Waste" className="w-14 h-14 flex-shrink-0" />
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-1">Water Management</h3>
                                            <div className="text-4xl font-bold text-gray-900 mb-1">{data.waterScore}/100</div>
                                            <p className="text-xs text-gray-500 mb-4">{Math.round(Number(data.waterScore))}% of possible score</p>
                                            <div className="w-full bg-gray-200 rounded-full h-3">
                                                <div className="bg-green-600 h-full rounded-full transition-all duration-700" style={{ width: `${data.waterScore}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-5xl font-bold text-gray-900">{data.overallRank}</div>
                                    <p className="text-gray-600 mt-3 text-base font-medium">Overall County Ranking</p>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">

                                <div className="mt-6  border-gray-200">
                                    <h4 className="font-semibold text-gray-900 mb-4 text-sm">Indicators Overview</h4>
                                    <div className="space-y-3 text-sm">
                                        {["Governance", "MRV", "Mitigation", "Adaptation", "Finance & Technology Transfer"].map((label, i) => {
                                            const keys = ["governance", "mrv", "mitigation", "adaptation", "finance"]
                                            return (
                                                <div key={label} className="flex justify-between">
                                                    <span className="text-gray-600">{label}</span>
                                                    <span className="font-bold text-gray-900">{data.indicators[keys[i] as keyof typeof data.indicators]}/100</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Water & Waste Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Water */}
                            {/* <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                                <div className="flex items-start gap-5">
                                    <img src="/Blur.png" alt="Water" className="w-14 h-14 flex-shrink-0" />
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-1">Water Sector</h3>
                                        <div className="text-4xl font-bold text-gray-900 mb-1">{data.waterScore}/100</div>
                                        <p className="text-xs text-gray-500 mb-4">{Math.round(Number(data.waterScore))}% of possible score</p>
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div className="bg-green-600 h-full rounded-full transition-all duration-700" style={{ width: `${data.waterScore}%` }} />
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <h4 className="font-semibold text-gray-900 mb-4 text-sm">Indicators Overview</h4>
                                    <div className="space-y-3 text-sm">
                                        {["Governance", "MRV", "Mitigation", "Adaptation", "Finance & Technology Transfer"].map((label, i) => {
                                            const keys = ["governance", "mrv", "mitigation", "adaptation", "finance"]
                                            return (
                                                <div key={label} className="flex justify-between">
                                                    <span className="text-gray-600">{label}</span>
                                                    <span className="font-bold text-gray-900">{data.indicators[keys[i] as keyof typeof data.indicators]}/100</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div> */}

                            {/* Waste */}

                        </div>
                    </div>
                </div>

                {/* Indicators Overview - IDENTICAL */}
                {/* <div className="bg-white rounded-lg border border-gray-200 p-6 mb-12">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Indicators Overview</h2>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {Object.entries(data.indicators).map(([key, value]) => (
                            <div key={key} className="bg-gray-50 p-4 rounded-lg text-center">
                                <div className="text-2xl font-bold text-gray-900">{value}</div>
                                <p className="text-gray-600 text-xs mt-2 capitalize">
                                    {key.replace(/([A-Z])/g, " $1")}
                                </p>
                            </div>
                        ))}
                    </div>
                </div> */}

                {/* Water Management Indicators - IDENTICAL */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Water Management Indicators</h2>
                    <IndicatorSection title="Governance" indicators={data.water.governance} defaultOpen={true} />
                    <IndicatorSection
                        title="Measurement, Reporting, and Verification(MRV)"
                        indicators={data.water.mrv}
                    />
                    <IndicatorSection title="Mitigation" indicators={data.water.mitigation} />
                    <IndicatorSection title="Adaptation" indicators={data.water.adaptation} />
                    <IndicatorSection title="Finance & Technology Transfer" indicators={data.water.finance} />
                </div>

                {/* Waste Management Indicators - IDENTICAL */}
                {/* <div className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Waste Management Indicators</h2>
                    <IndicatorSection title="Governance" indicators={data.wasteIndicators} />
                    <IndicatorSection
                        title="Measurement, Reporting, and Verification(MRV)"
                        indicators={data.wasteIndicators}
                        defaultOpen={true}
                    />
                    <IndicatorSection title="Mitigation" indicators={data.wasteIndicators} />
                    <IndicatorSection title="Adaptation" indicators={data.wasteIndicators} />
                    <IndicatorSection title="Finance & Technology Transfer" indicators={data.wasteIndicators} />
                </div> */}
            </div>

            <Footer />
        </div>
    )
}
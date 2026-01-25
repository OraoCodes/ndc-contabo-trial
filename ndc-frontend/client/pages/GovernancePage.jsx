"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HeroBanner } from "@/components/hero-banner"
import { KenyaMap } from "@/components/kenya-map"

const governanceData = [
    { rank: 1, county: "Nairobi", water: 15, wasteMgt: 11, avgScore: 21, performance: "Outstanding" },
    { rank: 2, county: "Mombasa", water: 15, wasteMgt: 11, avgScore: 21, performance: "Outstanding" },
    { rank: 3, county: "Nairobi", water: 15, wasteMgt: 11, avgScore: 21, performance: "Satisfactory" },
    { rank: 4, county: "Mombasa", water: 15, wasteMgt: 11, avgScore: 21, performance: "Satisfactory" },
    { rank: 5, county: "Nairobi", water: 15, wasteMgt: 11, avgScore: 21, performance: "Good" },
    { rank: 6, county: "Mombasa", water: 15, wasteMgt: 11, avgScore: 21, performance: "Good" },
    { rank: 7, county: "Nairobi", water: 15, wasteMgt: 11, avgScore: 21, performance: "Average" },
]


const performanceColors = {
    Outstanding: "bg-green-500",
    Satisfactory: "bg-emerald-600",
    Good: "bg-yellow-400 text-black",
    Average: "bg-orange-500",
    Poor: "bg-red-500",
}

// Mobile card view
const CardView = ({ data }) => (
    <div className="md:hidden space-y-4">
        {data.map((row, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">{row.rank}. {row.county}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${performanceColors[row.performance]}`}>
                        {row.performance}
                    </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Water:</span> <span>{row.water}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Waste Mgt:</span> <span>{row.wasteMgt}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Avg Score:</span> <span className="font-semibold">{row.avgScore}</span></div>
                </div>
            </div>
        ))}
    </div>
)

export default function Governance() {
    return (
        <main>
            <Header currentPage="governance" />

            <HeroBanner
                title="Governance"
                description="Assesses legal frameworks, institutional capacity, coordination mechanisms, and policy alignment with climate goals. Shows if systems are in place to deliver climate action."
            />

            <section className="py-12 md:py-16 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Map */}
                        <div className="flex flex-col items-center justify-center">
                            <img src="/image 9.svg" alt="Background" />
                        </div>

                        
                          

                             {/* Content */}
                        <div>
                            <h2 className="text-2xl font-bold mb-6">County Rankings</h2>
                            <p className="text-sm text-muted-foreground mb-6">Complete performance and indicators</p>

                            
                            {/* Mobile Card View */}
                            <CardView data={governanceData} />
                            <div className="hidden overflow-x-auto md:block bg-white rounded-lg border border-border p-4">
                                <div className="">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-border">
                                                <th className="px-3 py-2 text-left font-semibold">Rank</th>
                                                <th className="px-3 py-2 text-left font-semibold">County</th>
                                                <th className="px-3 py-2 text-center font-semibold">Water</th>
                                                <th className="px-3 py-2 text-center font-semibold">Waste Mgt</th>
                                                <th className="px-3 py-2 text-center font-semibold">Avg Score</th>
                                                <th className="px-3 py-2 text-center font-semibold">Performance</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {governanceData.slice(0, 4).map((row, idx) => (
                                                <tr key={idx} className="border-b border-border hover:bg-slate-50">
                                                    <td className="px-3 py-2">{row.rank}</td>
                                                    <td className="px-3 py-2">
                                                        <a href="#" className="underline text-primary">
                                                            {row.county}
                                                        </a>
                                                    </td>
                                                    <td className="px-3 py-2 text-center">{row.water}</td>
                                                    <td className="px-3 py-2 text-center">{row.wasteMgt}</td>
                                                    <td className="px-3 py-2 text-center font-semibold">{row.avgScore}</td>
                                                    <td className="px-3 py-2 text-center">
                                                        <span
                                                            className={`inline-block px-2 py-1 rounded-full text-xs font-semibold text-white ${row.performance === "Outstanding" ? "bg-green-500" : "bg-emerald-600"
                                                                }`}
                                                        >
                                                            {row.performance}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    )
}

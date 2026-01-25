// 1. MRVPage.jsx
"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HeroBanner } from "@/components/hero-banner"

const mrvData = [
    { rank: 1, county: "Nairobi", water: 18, wasteMgt: 16, avgScore: 34, performance: "Outstanding" },
    { rank: 2, county: "Mombasa", water: 17, wasteMgt: 15, avgScore: 32, performance: "Outstanding" },
    { rank: 3, county: "Kisumu", water: 15, wasteMgt: 14, avgScore: 29, performance: "Satisfactory" },
    { rank: 4, county: "Nakuru", water: 14, wasteMgt: 13, avgScore: 27, performance: "Satisfactory" },
]

const performanceColors = {
    Outstanding: "bg-green-600",
    Satisfactory: "bg-emerald-600",
    Good: "bg-yellow-400 text-black",
    Average: "bg-orange-500",
    Poor: "bg-red-500",
}

// Mobile card view
const CardView = ({ data }) => (
    <div className="md:hidden space-y-4">
        {data.map((row) => (
            <div key={row.rank} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
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
export default function MRV() {
    return (
        <main>
            <Header currentPage="mrv" />

            <HeroBanner
                title="Measurement, Reporting and Verification (MRV)"
                description="Measures data availability, quality, tracking systems, and reporting mechanisms to ensure transparency and compliance with the Paris Agreement."
            />

            <section className="py-12 md:py-16 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div className="flex items-center justify-center">
                            <img src="/image 9.svg" alt="MRV Visualization" className="w-full max-w-md" />
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold mb-6">County Rankings</h2>
                            <p className="text-sm text-muted-foreground mb-6">Complete performance and indicators</p>
                                                        {/* Mobile Card View */}
                            <CardView data={mrvData} />


                            <div className="hidden overflow-x-auto md:block bg-white rounded-lg border border-border overflow-hidden">
                                <div className="">
                                    <table className="w-full text-sm">
                                        <thead className="bg-slate-50">
                                            <tr className="border-b">
                                                <th className="px-4 py-3 text-left font-semibold">Rank</th>
                                                <th className="px-4 py-3 text-left font-semibold">County</th>
                                                <th className="px-4 py-3 text-center font-semibold">Water</th>
                                                <th className="px-4 py-3 text-center font-semibold">Waste Mgt</th>
                                                <th className="px-4 py-3 text-center font-semibold">Avg Score</th>
                                                <th className="px-4 py-3 text-center font-semibold">Performance</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {mrvData.map((row) => (
                                                <tr key={row.rank} className="border-b hover:bg-slate-50">
                                                    <td className="px-4 py-3 font-medium">{row.rank}</td>
                                                    <td className="px-4 py-3">
                                                        <a href="#" className="text-primary hover:underline font-medium">{row.county}</a>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">{row.water}</td>
                                                    <td className="px-4 py-3 text-center">{row.wasteMgt}</td>
                                                    <td className="px-4 py-3 text-center font-bold">{row.avgScore}</td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white ${row.performance === "Outstanding" ? "bg-green-600" :
                                                                row.performance === "Satisfactory" ? "bg-emerald-600" :
                                                                    "bg-yellow-500 text-black"
                                                            }`}>
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

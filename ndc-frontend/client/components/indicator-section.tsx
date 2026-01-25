"use client"

import { ChevronDown, CheckCircle } from "lucide-react"
import { useState } from "react"

interface Indicator {
    no: number
    indicator: string
    description: string
    score: number
}

interface IndicatorSectionProps {
    title: string
    indicators: Indicator[]
    defaultOpen?: boolean
}

export function IndicatorSection({ title, indicators, defaultOpen = false }: IndicatorSectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen)

    return (
        <div className="border border-gray-300 rounded-lg mb-4 overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors font-medium text-lg"
            >
                <span className="text-gray-900">{title}</span>
                <ChevronDown className={`w-6 h-6 text-gray-600 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
                <div className="border-t border-gray-300 bg-gray-50">
                    <div className="p-6">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b-2 border-gray-300">
                                    <th className="text-left py-4 px-3 font-semibold text-gray-900">No.</th>
                                    <th className="text-left py-4 px-3 font-semibold text-gray-900">Indicator</th>
                                    <th className="text-left py-4 px-3 font-semibold text-gray-900">Description</th>
                                    <th className="text-right py-4 px-3 font-semibold text-gray-900">Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {indicators.map((indicator) => (
                                    <tr
                                        key={indicator.no}
                                        className="border-b border-gray-200 hover:bg-white transition-colors"
                                    >
                                        <td className="py-5 px-3 text-gray-700 font-medium">{indicator.no}</td>
                                        <td className="py-5 px-3 text-gray-900 font-medium max-w-md">
                                            {indicator.indicator}
                                        </td>
                                        <td className="py-5 px-3 text-gray-600 text-sm max-w-lg">
                                            {indicator.description}
                                        </td>
                                        <td className="py-5 px-3">
                                            <div className="flex items-center justify-end gap-3">
                                                {/* Score Number */}
                                                <span className={`font-bold text-2xl ${indicator.score > 0 ? "text-green-600" : "text-red-500"}`}>
                                                    {indicator.score > 0 ? indicator.score.toFixed(1) : "—"}
                                                </span>


                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}


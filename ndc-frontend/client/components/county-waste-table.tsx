"use client"

import { Badge } from "@/components/ui/badge"
import { Link } from "react-router-dom"

export type ThematicColumn = { key: string; label: string }

interface CountyRankingsTableProps {
    title: string
    data: Record<string, any>[]
    type?: "basic" | "detailed"
    thematicColumns?: ThematicColumn[]
}

const performanceColors: Record<string, string> = {
    Outstanding: "bg-green-600 text-white",
    Satisfactory: "bg-emerald-600 text-white",
    Good: "bg-yellow-400 text-black",
    Average: "bg-orange-500 text-white",
    Poor: "bg-red-500 text-white",
}

const DetailedCardView = ({ data, pillarColumns }: { data: Record<string, any>[]; pillarColumns: ThematicColumn[] }) => (
    <div className="md:hidden space-y-4">
        {data.map((row, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="text-lg font-semibold text-blue-700">
                        {row.rank}. {row.county}
                    </h4>
                    <Badge className={`${performanceColors[row.performance] || ''} rounded-full px-3 text-sm`}>
                        {row.performance}
                    </Badge>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div className="flex justify-between border-b border-gray-100 py-1">
                        <span className="text-gray-500">Index Score:</span>
                        <span className="font-bold text-gray-800">{row.indexScore ?? 'N/A'}%</span>
                    </div>
                    {pillarColumns.map((col) => (
                        <div key={col.key} className="flex justify-between border-b border-gray-100 py-1">
                            <span className="text-gray-500">{col.label}:</span>
                            <span className="text-gray-700">{row[col.key] ?? 'N/A'}%</span>
                        </div>
                    ))}
                </div>
            </div>
        ))}
    </div>
);

export function CountyWasteTable({
    title,
    data,
    type = "basic",
    thematicColumns = [],
}: CountyRankingsTableProps) {
    const detailedMode = type === "detailed";
    const pillarColumns = thematicColumns;

    const tableHeaders = [
        { key: 'rank', label: 'Rank', align: 'left' as const },
        { key: 'county', label: 'County', align: 'left' as const },
        ...pillarColumns.map((col) => ({ key: col.key, label: col.label, align: 'center' as const })),
        { key: 'indexScore', label: 'Index Score', align: 'center' as const, isBold: true },
        { key: 'performance', label: 'Performance', align: 'center' as const },
    ];

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-4 md:p-6">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <div>
                    <h3 className="font-bold text-xl text-gray-900">{title}</h3>
                    <p className="text-sm text-gray-500">County performance across thematic areas</p>
                </div>
            </div>

            {detailedMode && <DetailedCardView data={data} pillarColumns={pillarColumns} />}

            <div className={`overflow-x-auto ${detailedMode ? 'hidden md:block' : 'block'}`}>
                <table className="min-w-full text-sm border-collapse">
                    <thead>
                        <tr className="border-b border-border bg-gray-50/50">
                            {tableHeaders.map(header => (
                                <th
                                    key={header.key}
                                    className={`px-3 py-3 text-${header.align} font-semibold text-gray-600 align-middle whitespace-nowrap`}
                                >
                                    {header.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={tableHeaders.length} className="px-4 py-8 text-center text-gray-500">
                                    No data available
                                </td>
                            </tr>
                        ) : (
                            data.map((row, idx) => (
                                <tr
                                    key={idx}
                                    className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors"
                                >
                                    {tableHeaders.map(header => {
                                        const value = row[header.key];
                                        return (
                                            <td
                                                key={header.key}
                                                className={`px-3 py-3 text-${header.align} ${header.isBold ? 'font-bold' : ''} text-gray-800 align-middle whitespace-nowrap`}
                                            >
                                                {header.key === 'county' ? (
                                                    <Link to={`/county/${String(row.county).toLowerCase().replace(/\s+/g, '-')}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                                                        {row.county}
                                                    </Link>
                                                ) : header.key === 'performance' ? (
                                                    <div className="flex justify-center">
                                                        <Badge className={`${performanceColors[row.performance] || ''} rounded-full px-3 py-1`}>
                                                            {row.performance}
                                                        </Badge>
                                                    </div>
                                                ) : header.key === 'indexScore' ? (
                                                    `${value ?? 0}%`
                                                ) : header.key === 'rank' ? (
                                                    String(value)
                                                ) : (
                                                    `${value ?? 0}%`
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
"use client"

import { Badge } from "@/components/ui/badge"
import { Link } from "react-router-dom"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CountyData {
    rank: number
    county: string
    water?: number
    // wasteMgt?: number
    avgScore: number
    performance: "Outstanding" | "Satisfactory" | "Good" | "Average" | "Poor"
    governance?: number
    mrv?: number
    mitigation?: number
    adaptation?: number
    finance?: number
    indexScore?: number
}

/** Column config from thematic areas (name + score key). When provided, table uses these for pillar columns. */
export type ThematicColumn = { key: string; label: string }

interface CountyRankingsTableProps {
    title: string
    data: CountyData[]
    showDetailedColumns?: boolean
    type?: "basic" | "detailed"
    /** When provided, pillar columns (Gov, MRV, etc.) use these labels and keys from thematic areas. */
    thematicColumns?: ThematicColumn[]
}

const performanceColors = {
    Outstanding: "bg-green-600 text-white",
    Satisfactory: "bg-emerald-600 text-white",
    Good: "bg-yellow-400 text-black",
    Average: "bg-orange-500 text-white",
    Poor: "bg-red-500 text-white",
}

// Default pillar columns when thematic areas are not provided
const DEFAULT_PILLAR_COLUMNS: ThematicColumn[] = [
    { key: 'governance', label: 'Gov' },
    { key: 'mrv', label: 'MRV' },
    { key: 'mitigation', label: 'Mit' },
    { key: 'adaptation', label: 'Ada' },
    { key: 'finance', label: 'Fin/Tech' },
];

// Helper function to render a card view for detailed data on mobile
const DetailedCardView = ({ data, pillarColumns }: { data: CountyData[]; pillarColumns: ThematicColumn[] }) => {
    return (
        <div className="md:hidden space-y-4">
            {data.map((row, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="text-lg font-semibold text-blue-700">
                            {row.rank}. {row.county}
                        </h4>
                        <Badge className={`${performanceColors[row.performance]} rounded-full px-3 text-sm`}>
                            {row.performance}
                        </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <DataItem label="Index Score" value={row.indexScore} isBold={true} />
                        <DataItem label="Average Score" value={row.avgScore} isBold={true} />
                        {pillarColumns.map((col) => (
                            <DataItem key={col.key} label={col.label} value={row[col.key as keyof CountyData] as number} />
                        ))}
                        {row.water !== undefined && <DataItem label="Water Score" value={row.water} />}
                    </div>
                </div>
            ))}
        </div>
    );
};

// Helper component for card view items
const DataItem = ({ label, value, isBold = false }: { label: string, value?: number, isBold?: boolean }) => (
    <div className="flex justify-between border-b border-gray-100 last:border-b-0 py-1">
        <span className="text-gray-500">{label}:</span>
        <span className={isBold ? "font-bold text-gray-800" : "text-gray-700"}>
            {value !== undefined && value !== null ? value : "N/A"}
        </span>
    </div>
);


export function CountyWaterTable({
    title,
    data,
    showDetailedColumns = false,
    type = "basic",
    thematicColumns,
}: CountyRankingsTableProps) {
    const detailedMode = type === "detailed";
    const pillarColumns = thematicColumns?.length ? thematicColumns : DEFAULT_PILLAR_COLUMNS;

    const tableHeaders = [
        { key: 'rank', label: 'Rank', align: 'left', mobile: true, alwaysShow: true },
        { key: 'county', label: 'County', align: 'left', mobile: true, alwaysShow: true },
        ...(detailedMode ? [
            ...pillarColumns.map((col) => ({ key: col.key, label: col.label, align: 'center' as const })),
            { key: 'indexScore', label: 'Index Score', align: 'center' as const, isBold: true, mobile: true },
        ] : [
            { key: 'water', label: 'Water', align: 'center' as const },
            { key: 'wasteMgt', label: 'Waste Mgt', align: 'center' as const },
            { key: 'avgScore', label: 'Avg Score', align: 'center' as const, isBold: true },
        ]),
        { key: 'performance', label: 'Performance', align: 'center' as const, alwaysShow: true },
    ];


    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-4 md:p-6">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <div>
                    <h3 className="font-bold text-xl text-foreground text-gray-900">{title}</h3>
                    <p className="text-sm text-muted-foreground text-gray-500">Complete performance and indicators</p>
                </div>
                <Select defaultValue="2025">
                    <SelectTrigger className="w-32">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="2025">Year 2025</SelectItem>
                        <SelectItem value="2024">Year 2024</SelectItem>
                        <SelectItem value="2023">Year 2023</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* 1. Mobile Card View (Only for Detailed Data) */}
            {detailedMode && <DetailedCardView data={data} pillarColumns={pillarColumns} />}

            {/* 2. Desktop Table View (Show on medium screens and up) */}
            {/* The overflow-x-auto is the key to responsive table scrolling */}
            <div className={`overflow-x-auto ${detailedMode ? 'hidden md:block' : 'block'}`}>
                <table className="min-w-full text-sm border-collapse table-fixed">
                    <thead>
                        <tr className="border-b border-border bg-gray-50/50">
                            {tableHeaders.map(header => (
                                <th
                                    key={header.key}
                                    className={`px-2 py-3 text-${header.align} font-semibold text-gray-600 align-middle ${
                                        ['governance', 'mrv', 'mitigation', 'adaptation', 'finance'].includes(header.key) ? 'whitespace-nowrap min-w-[6.5rem]' : 'break-words'
                                    }`}
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
                                        const value = row[header.key as keyof CountyData];

                                        return (
                                            <td
                                                key={header.key}
                                                className={`px-2 py-3 text-${header.align} ${header.isBold ? 'font-bold' : ''} text-gray-800 align-middle ${
                                                    ['governance', 'mrv', 'mitigation', 'adaptation', 'finance'].includes(header.key) ? 'whitespace-nowrap min-w-[6.5rem]' : 'break-words'
                                                }`}
                                            >
                                                {header.key === 'county' ? (
                                                    <Link to={`/county/${row.county.toLowerCase().replace(/\s+/g, '-')}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                                                        {row.county}
                                                    </Link>
                                                ) : header.key === 'performance' ? (
                                                    <div className="flex justify-center">
                                                        <Badge className={`${performanceColors[row.performance]} rounded-full px-3 py-1`}>
                                                            {row.performance}
                                                        </Badge>
                                                    </div>
                                                ) : (
                                                    value !== undefined && value !== null ? String(value) : "N/A"
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
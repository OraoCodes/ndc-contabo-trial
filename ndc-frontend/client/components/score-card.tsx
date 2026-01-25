export function ScoreCard({ label, score, total = 100 }: { label: string; score: number; total?: number }) {
    return (
        <div className="flex flex-col items-center p-4 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-baseline gap-1 mb-2">
                <span className="text-lg">💧</span>
                <span className="text-2xl font-bold text-gray-900">{score}</span>
                <span className="text-gray-500">/{total}</span>
            </div>
            <p className="text-sm text-gray-600 text-center">{label}</p>
        </div>
    )
}

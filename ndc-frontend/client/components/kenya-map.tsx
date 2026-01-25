"use client"

export function KenyaMap() {
    return (
        <div className="flex flex-col items-center">
            <svg viewBox="0 0 500 600" className="w-full h-auto" style={{ maxWidth: "300px" }}>
                {/* Kenya map outline - simplified version */}
                <path
                    d="M 150 100 L 180 90 L 200 95 L 210 80 L 230 85 L 240 70 L 250 75 L 260 65 L 270 70 L 280 60 L 290 75 L 300 70 L 310 85 L 320 80 L 330 100 L 340 95 L 350 110 L 360 105 L 365 130 L 370 150 L 375 180 L 380 220 L 375 250 L 370 280 L 365 310 L 360 340 L 355 360 L 340 375 L 320 380 L 300 385 L 280 390 L 260 385 L 240 390 L 220 388 L 200 390 L 180 385 L 160 390 L 140 385 L 120 380 L 110 360 L 100 330 L 95 300 L 90 270 L 88 240 L 87 210 L 88 180 L 90 150 L 95 120 L 100 100 L 120 95 L 140 98 Z"
                    fill="#5ba583"
                    stroke="#4a9470"
                    strokeWidth="1"
                />



                {/* County borders - simplified */}
                <g stroke="#7fbfa3" strokeWidth="0.5" fill="none" opacity="0.5">
                    <path d="M 200 150 Q 220 160 240 150" />
                    <path d="M 180 200 Q 200 210 220 200" />
                    <path d="M 220 240 Q 240 250 260 240" />
                    <path d="M 160 280 Q 180 290 200 280" />
                    <path d="M 240 300 Q 260 310 280 300" />
                </g>
            </svg>

            {/* Scale legend */}
            <div className="mt-6 flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                        <div className="h-3 w-3" style={{ backgroundColor: "#dc2626" }}></div>
                        <div className="h-3 w-3" style={{ backgroundColor: "#f97316" }}></div>
                        <div className="h-3 w-3" style={{ backgroundColor: "#a6d9d1" }}></div>
                        <div className="h-3 w-3" style={{ backgroundColor: "#5ba583" }}></div>
                        <div className="h-3 w-3" style={{ backgroundColor: "#1a5d4d" }}></div>
                    </div>
                    <span className="text-muted-foreground">Less Developed → Well Developed</span>
                </div>
            </div>
        </div>
    )
}

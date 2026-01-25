import { useState } from "react";

interface CountyPerformance {
  name: string;
  score: number;
  level: "excellent" | "good" | "fair" | "poor";
}

const countyPerformance: Record<string, CountyPerformance> = {
  nairobi: { name: "Nairobi", score: 92, level: "excellent" },
  mombasa: { name: "Mombasa", score: 85, level: "good" },
  kisumu: { name: "Kisumu", score: 78, level: "good" },
  nakuru: { name: "Nakuru", score: 72, level: "fair" },
  eldoret: { name: "Eldoret", score: 65, level: "fair" },
  meru: { name: "Meru", score: 58, level: "poor" },
  nyeri: { name: "Nyeri", score: 88, level: "good" },
  kericho: { name: "Kericho", score: 75, level: "fair" },
  machakos: { name: "Machakos", score: 70, level: "fair" },
  kisii: { name: "Kisii", score: 68, level: "fair" },
  naivasha: { name: "Naivasha", score: 82, level: "good" },
  lamu: { name: "Lamu", score: 55, level: "poor" },
};

const getColorByLevel = (level: string) => {
  const colors: Record<string, string> = {
    excellent: "#22c55e",
    good: "#4cd9c0",
    fair: "#fcd34d",
    poor: "#ef4444",
  };
  return colors[level] || "#cbd5e1";
};

interface MapRegionProps {
  name: string;
  d: string;
  county: string;
  performance: CountyPerformance;
  isHovered: boolean;
  onHover: (county: string | null) => void;
}

const MapRegion = ({
  name,
  d,
  county,
  performance,
  isHovered,
  onHover,
}: MapRegionProps) => (
  <path
    d={d}
    fill={getColorByLevel(performance.level)}
    stroke="white"
    strokeWidth="0.5"
    opacity={isHovered ? 1 : 0.8}
    className="cursor-pointer hover:opacity-100 transition-opacity"
    onMouseEnter={() => onHover(county)}
    onMouseLeave={() => onHover(null)}
  />
);

export function InteractiveMap() {
  const [hoveredCounty, setHoveredCounty] = useState<string | null>(null);
  const hoveredPerformance = hoveredCounty
    ? countyPerformance[hoveredCounty.toLowerCase()]
    : null;

  return (
    <div className="bg-white rounded-lg p-6 border border-border">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Water Management - County Distribution
          </h3>
          <div className="bg-background rounded-lg p-4">
            <svg viewBox="0 0 400 500" className="w-full h-auto">
              {/* Simplified Kenya map regions as paths */}
              <MapRegion
                name="Nairobi"
                county="nairobi"
                d="M 200 280 L 210 280 L 215 295 L 200 298 Z"
                performance={countyPerformance.nairobi}
                isHovered={hoveredCounty === "nairobi"}
                onHover={setHoveredCounty}
              />
              <MapRegion
                name="Mombasa"
                county="mombasa"
                d="M 280 320 L 295 320 L 298 340 L 280 342 Z"
                performance={countyPerformance.mombasa}
                isHovered={hoveredCounty === "mombasa"}
                onHover={setHoveredCounty}
              />
              <MapRegion
                name="Kisumu"
                county="kisumu"
                d="M 120 240 L 150 240 L 152 270 L 120 268 Z"
                performance={countyPerformance.kisumu}
                isHovered={hoveredCounty === "kisumu"}
                onHover={setHoveredCounty}
              />
              <MapRegion
                name="Nakuru"
                county="nakuru"
                d="M 170 220 L 200 220 L 202 250 L 170 248 Z"
                performance={countyPerformance.nakuru}
                isHovered={hoveredCounty === "nakuru"}
                onHover={setHoveredCounty}
              />
              <MapRegion
                name="Meru"
                county="meru"
                d="M 250 160 L 280 160 L 282 200 L 250 198 Z"
                performance={countyPerformance.meru}
                isHovered={hoveredCounty === "meru"}
                onHover={setHoveredCounty}
              />
              <MapRegion
                name="Nyeri"
                county="nyeri"
                d="M 200 200 L 230 200 L 232 230 L 200 228 Z"
                performance={countyPerformance.nyeri}
                isHovered={hoveredCounty === "nyeri"}
                onHover={setHoveredCounty}
              />
              <MapRegion
                name="Kericho"
                county="kericho"
                d="M 140 260 L 170 260 L 172 290 L 140 288 Z"
                performance={countyPerformance.kericho}
                isHovered={hoveredCounty === "kericho"}
                onHover={setHoveredCounty}
              />
              <MapRegion
                name="Machakos"
                county="machakos"
                d="M 230 300 L 260 300 L 262 330 L 230 328 Z"
                performance={countyPerformance.machakos}
                isHovered={hoveredCounty === "machakos"}
                onHover={setHoveredCounty}
              />
              <MapRegion
                name="Kisii"
                county="kisii"
                d="M 150 280 L 180 280 L 182 310 L 150 308 Z"
                performance={countyPerformance.kisii}
                isHovered={hoveredCounty === "kisii"}
                onHover={setHoveredCounty}
              />
              <MapRegion
                name="Naivasha"
                county="naivasha"
                d="M 180 250 L 210 250 L 212 280 L 180 278 Z"
                performance={countyPerformance.naivasha}
                isHovered={hoveredCounty === "naivasha"}
                onHover={setHoveredCounty}
              />
              <MapRegion
                name="Lamu"
                county="lamu"
                d="M 300 280 L 320 280 L 322 310 L 300 308 Z"
                performance={countyPerformance.lamu}
                isHovered={hoveredCounty === "lamu"}
                onHover={setHoveredCounty}
              />

              {/* Kenya outline - simplified */}
              <rect
                x="100"
                y="150"
                width="240"
                height="220"
                fill="none"
                stroke="#94a3b8"
                strokeWidth="1"
              />
            </svg>
          </div>

          {/* Legend */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: "#22c55e" }} />
              <span className="text-xs text-foreground">Excellent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: "#4cd9c0" }} />
              <span className="text-xs text-foreground">Good</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: "#fcd34d" }} />
              <span className="text-xs text-foreground">Fair</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: "#ef4444" }} />
              <span className="text-xs text-foreground">Poor</span>
            </div>
          </div>
        </div>

        {/* County Details */}
        <div className="bg-background rounded-lg p-4">
          <h4 className="text-sm font-semibold text-foreground mb-4">
            County Details
          </h4>
          {hoveredPerformance ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">County</p>
                <p className="text-lg font-semibold text-foreground">
                  {hoveredPerformance.name}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Performance</p>
                <p className="text-3xl font-bold" style={{ color: getColorByLevel(hoveredPerformance.level) }}>
                  {hoveredPerformance.score}%
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Status</p>
                <p className="text-sm font-medium text-foreground capitalize">
                  {hoveredPerformance.level}
                </p>
              </div>
              <p className="text-xs text-muted-foreground pt-2">
                Hover over regions to see details
              </p>
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center">
              <p className="text-xs text-muted-foreground text-center">
                Hover over a region on the map to see county details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

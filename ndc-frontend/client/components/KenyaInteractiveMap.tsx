import { useState, useEffect } from "react";
import { getCountySummaryPerformance, type CountySummaryPerformance } from "@/lib/supabase-api";

// GeoJSON data URL - we'll fetch this from the external source
const GEOJSON_URL = "https://raw.githubusercontent.com/abugasavio/ke.counties/master/counties.geojson";

interface CountyFeature {
  type: string;
  properties: {
    COUNTY: string;
    OBJECTID: number;
  };
  geometry: {
    type: string;
    coordinates: number[][][];
  };
}

interface GeoJSONData {
  type: string;
  features: CountyFeature[];
}

interface KenyaInteractiveMapProps {
  sector?: "water" | "waste";
  year?: number;
  onCountyClick?: (countyName: string) => void;
  highlightedCounty?: string; // Name of county to highlight
}

export function KenyaInteractiveMap({
  sector = "water",
  year,
  onCountyClick,
  highlightedCounty,
}: KenyaInteractiveMapProps) {
  const [geoData, setGeoData] = useState<GeoJSONData | null>(null);
  const [performanceData, setPerformanceData] = useState<Record<string, CountySummaryPerformance>>({});
  const [hoveredCounty, setHoveredCounty] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch GeoJSON data
  useEffect(() => {
    fetch(GEOJSON_URL)
      .then((res) => res.json())
      .then((data) => {
        console.log("GeoJSON loaded:", data.features?.length, "counties");
        console.log("Sample county names from GeoJSON:", data.features?.slice(0, 5).map((f: CountyFeature) => f.properties.COUNTY));
        setGeoData(data);
      })
      .catch((err) => {
        console.error("Failed to load map data:", err);
        setError("Failed to load map data");
      });
  }, []);

  // Fetch performance data from Supabase
  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        // If no year provided, try fallback years
        const yearsToTry = year ? [year] : [new Date().getFullYear(), 2025, 2024, 2023];
        let data: any[] = [];
        
        for (const tryYear of yearsToTry) {
          try {
            data = await getCountySummaryPerformance(sector, tryYear);
            if (data.length > 0) {
              console.log(`Performance data loaded for year ${tryYear}:`, data.length, "counties");
              break;
            }
          } catch (err) {
            continue;
          }
        }
        
        console.log("County names from Supabase:", data.map(d => d.name || d.county_name));
        
        const perfMap: Record<string, CountySummaryPerformance> = {};
        data.forEach((item) => {
          const countyName = item.name || item.county_name;
          if (countyName) {
            // Store with normalized key
            const normalizedName = countyName.toLowerCase().trim();
            perfMap[normalizedName] = item;
          }
        });
        
        console.log("Performance map keys:", Object.keys(perfMap));
        setPerformanceData(perfMap);
      } catch (err: any) {
        console.error("Failed to load performance data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
  }, [sector, year]);

  // Get color based on performance score
  const getCountyColor = (countyName: string): string => {
    const normalizedName = countyName.toLowerCase().trim();
    const perf = performanceData[normalizedName];
    
    if (!perf) {
      // Try to find with partial match
      const partialMatch = Object.keys(performanceData).find(key => 
        key.includes(normalizedName) || normalizedName.includes(key)
      );
      
      if (partialMatch) {
        const score = performanceData[partialMatch].score || 0;
        if (score >= 90) return "#22c55e"; // Green - Outstanding
        if (score >= 75) return "#4cd9c0"; // Teal - Satisfactory
        if (score >= 60) return "#fcd34d"; // Yellow - Good
        return "#ef4444"; // Red - Needs Improvement
      }
      
      return "#cbd5e1"; // Gray for no data
    }
    
    const score = perf.score || 0;
    if (score >= 90) return "#22c55e"; // Green - Outstanding
    if (score >= 75) return "#4cd9c0"; // Teal - Satisfactory
    if (score >= 60) return "#fcd34d"; // Yellow - Good
    return "#ef4444"; // Red - Needs Improvement
  };

  // Get performance level text
  const getPerformanceLevel = (score: number): string => {
    if (score >= 90) return "Outstanding";
    if (score >= 75) return "Satisfactory";
    if (score >= 60) return "Good";
    return "Needs Improvement";
  };

  // Calculate SVG viewBox from GeoJSON bounds
  const getViewBox = (): string => {
    // Default Kenya bounds (approximate)
    const defaultViewBox = "33.5 -5 8.5 10";
    
    if (!geoData || !geoData.features || geoData.features.length === 0) {
      return defaultViewBox;
    }
    
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    
    try {
      geoData.features.forEach((feature) => {
        if (feature.geometry && feature.geometry.coordinates) {
          feature.geometry.coordinates.forEach((polygon) => {
            polygon.forEach(([x, y]) => {
              if (typeof x === "number" && typeof y === "number" && !isNaN(x) && !isNaN(y)) {
                minX = Math.min(minX, x);
                maxX = Math.max(maxX, x);
                minY = Math.min(minY, y);
                maxY = Math.max(maxY, y);
              }
            });
          });
        }
      });
      
      // Check if we got valid bounds
      if (!isFinite(minX) || !isFinite(maxX) || !isFinite(minY) || !isFinite(maxY)) {
        return defaultViewBox;
      }
      
      const width = maxX - minX;
      const height = maxY - minY;
      
      if (width <= 0 || height <= 0) {
        return defaultViewBox;
      }
      
      const padding = 0.1; // 10% padding
      
      return `${minX - width * padding} ${minY - height * padding} ${width * (1 + 2 * padding)} ${height * (1 + 2 * padding)}`;
    } catch (err) {
      console.error("Error calculating viewBox:", err);
      return defaultViewBox;
    }
  };

  // Convert GeoJSON coordinates to SVG path
  const coordinatesToPath = (coordinates: number[][][]): string => {
    if (!coordinates || !Array.isArray(coordinates)) {
      return "";
    }
    
    try {
      return coordinates
        .map((polygon) => {
          if (!Array.isArray(polygon)) return "";
          
          const points = polygon
            .filter(([x, y]) => typeof x === "number" && typeof y === "number" && !isNaN(x) && !isNaN(y))
            .map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x},${y}`)
            .join(" ");
          return points ? points + " Z" : "";
        })
        .filter(Boolean)
        .join(" ");
    } catch (err) {
      console.error("Error converting coordinates to path:", err);
      return "";
    }
  };

  const handleCountyClick = (countyName: string) => {
    if (onCountyClick) {
      onCountyClick(countyName);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGPathElement>) => {
    setTooltipPosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseEnter = (countyName: string, e: React.MouseEvent<SVGPathElement>) => {
    setHoveredCounty(countyName);
    setTooltipPosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    setHoveredCounty(null);
    setTooltipPosition(null);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 text-red-500">
        {error}
      </div>
    );
  }

  if (loading || !geoData) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

  const hoveredPerformance = hoveredCounty
    ? performanceData[hoveredCounty.toLowerCase()]
    : null;

  return (
    <div className="relative">
      <svg
        viewBox={getViewBox()}
        className="w-full h-auto"
        style={{ maxHeight: "500px", transform: "scaleY(-1)" }}
      >
        {geoData.features.map((feature) => {
          const countyName = feature.properties.COUNTY;
          const isHovered = hoveredCounty === countyName;
          const fillColor = getCountyColor(countyName);
          
          // Check if this county is highlighted
          const isHighlighted = highlightedCounty 
            ? countyName.toLowerCase() === highlightedCounty.toLowerCase()
            : false;
          
          // Dim non-highlighted counties when a county is highlighted
          const opacity = highlightedCounty 
            ? (isHighlighted ? 1 : 0.3)
            : 1;
          
          const strokeWidth = isHighlighted ? "0.03" : "0.01";
          const strokeColor = isHighlighted ? "#000000" : "#ffffff";

            return (
              <path
                key={feature.properties.OBJECTID}
                d={coordinatesToPath(feature.geometry.coordinates)}
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                opacity={opacity}
                className="cursor-pointer transition-all duration-200"
                style={{
                  filter: isHovered ? "brightness(0.7)" : "none",
                }}
                onMouseEnter={(e) => handleMouseEnter(countyName, e)}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleCountyClick(countyName)}
              />
            );
        })}
      </svg>

      {/* Tooltip */}
      {hoveredCounty && tooltipPosition && (
        <div
          className="fixed z-50 bg-slate-900 text-white px-3 py-2 rounded-lg shadow-lg pointer-events-none"
          style={{
            left: `${tooltipPosition.x + 10}px`,
            top: `${tooltipPosition.y - 40}px`,
            transform: "translateY(-100%)",
          }}
        >
          <div className="text-sm font-semibold">{hoveredCounty}</div>
          {hoveredPerformance && (
            <div className="text-xs opacity-90">
              Score: {hoveredPerformance.score.toFixed(1)} | Rank: #{hoveredPerformance.rank}
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: "#22c55e" }} />
          <span className="text-xs">Outstanding (90+)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: "#4cd9c0" }} />
          <span className="text-xs">Satisfactory (75-89)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: "#fcd34d" }} />
          <span className="text-xs">Good (60-74)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: "#ef4444" }} />
          <span className="text-xs">Needs Improvement (&lt;60)</span>
        </div>
      </div>
    </div>
  );
}

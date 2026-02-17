import { MainLayout } from "@/components/MainLayout";
import { Save, Edit, Trash2, ChevronDown, ChevronUp, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { 
  getCounty, 
  createCounty, 
  updateCounty, 
  deleteCounty,
  saveCountyPerformance, 
  getCountyPerformanceByCountyId,
  listIndicators,
  listThematicAreas,
  thematicAreaNameToScoreKey
} from "@/lib/supabase-api";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { CountySelector } from "@/components/CountySelector";
import { KENYA_COUNTIES, isValidCounty } from "@/lib/kenya-counties";

export default function CountyData() {
  const yearOptions = Array.from({ length: 11 }, (_, i) => 2025 + i); // 2025 to 2035
  const [county, setCounty] = useState("");
  const [year, setYear] = useState("2025");
  const [waterData, setWaterData] = useState({}); // { indicatorId: { response: "", comment: "" } }
  const [wasteData, setWasteData] = useState({}); // { indicatorId: { response: "", comment: "" } }
  const [lastEdited, setLastEdited] = useState(null);
  const [expandedSections, setExpandedSections] = useState({}); // { "water-Governance": true, "waste-MRV": false, ... }

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const editingId = location.state?.countyId;

  // Fetch indicators from database
  const { data: indicators = [], isLoading: indicatorsLoading } = useQuery({
    queryKey: ["indicators"],
    queryFn: () => listIndicators(),
  });

  // Fetch thematic areas to get weight percentages
  const { data: thematicAreas = [] } = useQuery({
    queryKey: ["thematicAreas"],
    queryFn: () => listThematicAreas(),
  });

  const { data: existingCounty } = useQuery({
    queryKey: ["county", editingId],
    queryFn: () => editingId ? getCounty(editingId) : Promise.resolve(null),
    enabled: !!editingId,
  });

  // Load saved performance data when editing or when year changes
  useEffect(() => {
    const loadPerformanceData = async () => {
      // Wait for indicators to load before processing
      if (!indicators || indicators.length === 0) {
        return;
      }

      if (!editingId || !year) {
        if (!editingId) {
          // Initialize empty data for all indicators when creating new county
          const initializeEmptyData = (sectorType) => {
            const emptyData = {};
            const sectorIndicators = indicators.filter(ind => ind.sector === sectorType);
            sectorIndicators.forEach(ind => {
              emptyData[ind.id.toString()] = {
                response: "",
                comment: "",
                score: ""
              };
            });
            return emptyData;
          };
          setWaterData(initializeEmptyData("water"));
          setWasteData(initializeEmptyData("waste"));
          setLastEdited(null);
        }
        return;
      }

      try {
        // Load both water and waste data
        const [waterPerformance, wastePerformance] = await Promise.all([
          getCountyPerformanceByCountyId(editingId, Number(year), "water").catch(() => null),
          getCountyPerformanceByCountyId(editingId, Number(year), "waste").catch(() => null)
        ]);

        const formatIndicatorData = (performance, sectorType) => {
          const formattedData = {};
          
          // Initialize all indicators for this sector with empty data
          const sectorIndicators = indicators.filter(ind => ind.sector === sectorType);
          sectorIndicators.forEach(ind => {
            const indicatorId = ind.id.toString();
            formattedData[indicatorId] = {
              response: "",
              comment: "",
              score: ""
            };
          });
          
          // Override with saved data if it exists
          if (performance && performance.indicators_json) {
            const savedData = performance.indicators_json;
            Object.keys(savedData).forEach(key => {
              const value = savedData[key];
              if (typeof value === 'object' && value !== null && (value.response !== undefined || value.comment !== undefined || value.score !== undefined)) {
                formattedData[key] = {
                  response: value.response || "",
                  comment: value.comment || "",
                  score: value.score !== undefined ? value.score : ""
                };
              } else {
                formattedData[key] = {
                  response: value || "",
                  comment: "",
                  score: ""
                };
              }
            });
          }
          
          return formattedData;
        };

        setWaterData(formatIndicatorData(waterPerformance, "water"));
        setWasteData(formatIndicatorData(wastePerformance, "waste"));
        
        // Use the most recent update time
        const waterTime = waterPerformance?.updated_at || waterPerformance?.created_at;
        const wasteTime = wastePerformance?.updated_at || wastePerformance?.created_at;
        if (waterTime || wasteTime) {
          const times = [waterTime, wasteTime].filter(Boolean).map(t => new Date(t));
          setLastEdited(new Date(Math.max(...times)).toISOString());
        } else {
          setLastEdited(null);
        }
      } catch (err) {
        console.error("Error loading performance data:", err);
        setWaterData({});
        setWasteData({});
        setLastEdited(null);
      }
    };

    loadPerformanceData();
  }, [editingId, year, indicators]);

  useEffect(() => {
    if (existingCounty) {
      setCounty(existingCounty.name || "");
    }
  }, [existingCounty]);

  // Group indicators by sector and thematic area
  const groupedIndicators = (sectorType) => {
    const grouped = {};
    
    indicators
      .filter(ind => ind.sector === sectorType)
      .forEach(ind => {
        const thematicArea = ind.thematic_area || "Other";
        if (!grouped[thematicArea]) {
          grouped[thematicArea] = [];
        }
        grouped[thematicArea].push(ind);
      });
    
    return grouped;
  };

  // Calculate score for a single indicator based on response or use saved score
  const calculateIndicatorScore = (indicator, response, savedScore) => {
    // If there's a saved score, use it (editable score takes precedence)
    if (savedScore !== undefined && savedScore !== null && savedScore !== "") {
      const scoreValue = parseFloat(savedScore);
      if (!isNaN(scoreValue)) {
        return Math.max(0, Math.min(scoreValue, indicator.weight || 10)); // Clamp between 0 and max weight
      }
    }
    
    // Otherwise, calculate from response
    if (!response || response === "") return 0;
    
    // For now, use weight as max score and calculate based on response type
    // This is a simplified calculation - adjust based on your scoring logic
    const maxScore = indicator.weight || 10;
    
    // If response is a number (percentage or count), calculate proportional score
    if (!isNaN(parseFloat(response))) {
      const numValue = parseFloat(response);
      // For percentages, divide by 10 to get score out of 10
      if (response.includes('%')) {
        return Math.min((numValue / 10) * (maxScore / 10), maxScore);
      }
      // For other numbers, use a scaling factor
      return Math.min((numValue / 100) * maxScore, maxScore);
    }
    
    // For yes/no responses
    if (response.toLowerCase() === "yes" || response.toLowerCase() === "y") {
      return maxScore;
    }
    if (response.toLowerCase() === "no" || response.toLowerCase() === "n") {
      return 0;
    }
    
    return 0;
  };

  // Get thematic area weight from database
  const getThematicAreaWeight = (sectorType, thematicAreaName) => {
    const area = thematicAreas.find(
      ta => ta.sector === sectorType && ta.name === thematicAreaName
    );
    return area?.weight_percentage || 0;
  };

  // Calculate thematic area score (0-100 scale) - MRV formula: (score/max score)*100
  // Scores are calculated from indicator scores, not directly editable
  const calculateThematicAreaScore = (thematicAreaIndicators, dataSource, thematicAreaName, sectorType) => {
    let totalScore = 0;
    let maxScore = 0;
    
    // Calculate scores for each indicator
    thematicAreaIndicators.forEach(ind => {
      const indicatorId = ind.id.toString();
      const data = dataSource[indicatorId] || { response: "", comment: "", score: "" };
      const score = calculateIndicatorScore(ind, data.response, data.score);
      totalScore += score;
      maxScore += (ind.weight || 10);
    });
    
    // MRV formula: (score/max score)*100
    const normalizedScore = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
    
    // Get weight percentage from database
    const weightPercentage = getThematicAreaWeight(sectorType, thematicAreaName);
    
    // Calculate weighted score (for NDC formula)
    const weightedScore = (normalizedScore * weightPercentage) / 100;
    
    return { 
      score: Math.round(normalizedScore), 
      maxScore: Math.round(maxScore), // Return actual sum of indicator weights (e.g., 3×5=15)
      weightedScore: weightedScore,
      weightPercentage: weightPercentage
    };
  };

  // Update indicator response, comment, or score (score is clamped to 0..indicator max)
  const updateIndicatorData = (indicatorId, field, value, sectorType) => {
    if (field === "score" && value !== "" && value !== null && value !== undefined) {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        const ind = indicators.find((i) => i.id.toString() === indicatorId);
        const maxScore = ind?.weight ?? 10;
        const clamped = Math.max(0, Math.min(num, maxScore));
        value = String(clamped);
      }
    }
    if (sectorType === "water") {
      setWaterData(prev => ({
        ...prev,
        [indicatorId]: {
          ...(prev[indicatorId] || { response: "", comment: "", score: "" }),
          [field]: value
        }
      }));
    } else {
      setWasteData(prev => ({
        ...prev,
        [indicatorId]: {
          ...(prev[indicatorId] || { response: "", comment: "", score: "" }),
          [field]: value
        }
      }));
    }
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!county || !year) {
        throw new Error("County name and year are required");
      }

      if (!county.trim()) {
        throw new Error("Please enter a county name");
      }

      // Validate that the county name is a valid Kenya county
      if (!isValidCounty(county.trim())) {
        throw new Error("Please select a valid county from the list of 47 Kenya counties");
      }

      let countyId = editingId;
      
      // Create or update county
      if (!editingId) {
        try {
          const res = await createCounty({ 
            name: county.trim()
          });
        countyId = res.id;
        } catch (err) {
          const error = err || {};
          if (error?.code === '23505' || error?.message?.includes('duplicate') || error?.message?.includes('unique')) {
            const { listCounties } = await import("@/lib/supabase-api");
            const counties = await listCounties();
            const existing = counties.find(c => c.name.toLowerCase() === county.trim().toLowerCase());
            if (existing) {
              countyId = existing.id;
            } else {
              throw new Error("County name already exists. Please use a different name or edit the existing county.");
            }
          } else {
            throw err;
          }
        }
      } else {
        await updateCounty(editingId, { 
          name: county.trim()
        });
      }

      // Save both water and waste performance data
      const saveSectorData = async (sectorType, dataSource) => {
        const sectorIndicators = indicators.filter(ind => ind.sector === sectorType);
        const grouped = groupedIndicators(sectorType);
        let sectorIndex = 0;
        const thematicAreaScores = {};

        // Calculate scores for each thematic area using NDC formula
        // Index = (Governance × 30%) + (MRV × 20%) + (Mitigation × 20%) + (Adaptation × 15%) + (Finance × 15%)
        // Weights are stored in thematic_areas table and should match the About page methodology
        Object.keys(grouped).forEach(thematicArea => {
          const areaIndicators = grouped[thematicArea];
          const { score, maxScore, weightedScore, weightPercentage } = calculateThematicAreaScore(
            areaIndicators, 
            dataSource, 
            thematicArea,
            sectorType
          );
          thematicAreaScores[thematicArea] = { 
            score, 
            maxScore: maxScore,
            weightedScore,
            weightPercentage
          };
          
          // Sum weighted scores for sector index (NDC formula)
          sectorIndex += weightedScore;
        });

        // Prepare indicators JSON with new format (response, comment, and score); clamp score to indicator max
        const indicatorsJson = {};
        sectorIndicators.forEach(ind => {
          const indicatorId = ind.id.toString();
          const data = dataSource[indicatorId] || { response: "", comment: "", score: "" };
          const maxScore = ind.weight ?? 10;
          let scoreVal = data.score !== undefined && data.score !== null && data.score !== "" ? data.score : "";
          if (scoreVal !== "") {
            const num = parseFloat(scoreVal);
            if (!isNaN(num)) scoreVal = Math.max(0, Math.min(num, maxScore));
          }
          indicatorsJson[indicatorId] = {
            response: data.response || "",
            comment: data.comment || "",
            score: scoreVal
          };
        });

        // Map thematic area scores to pillar columns (dynamic: any DB thematic name → pillar key)
        const pillarKeys = ["governance", "mrv", "mitigation", "adaptation", "finance"];
        const pillarScores = { governance: [], mrv: [], mitigation: [], adaptation: [], finance: [] };
        Object.keys(thematicAreaScores).forEach((thematicArea) => {
          const key = thematicAreaNameToScoreKey(thematicArea);
          if (key && pillarScores[key]) pillarScores[key].push(thematicAreaScores[thematicArea].score);
        });
        const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
        const governance = avg(pillarScores.governance);
        const mrv = avg(pillarScores.mrv);
        const mitigation = avg(pillarScores.mitigation);
        const adaptation = avg(pillarScores.adaptation);
        const finance = avg(pillarScores.finance);

      await saveCountyPerformance(
        countyId,
        Number(year),
          sectorType,
          {
            overall_score: sectorIndex,
            sector_score: sectorIndex,
            governance,
            mrv,
            mitigation,
            adaptation,
            finance,
          indicators_json: indicatorsJson,
        }
      );
        
        return sectorIndex;
      };

      try {
        // Save water and waste data, get their sector scores
        const [waterSectorScore, wasteSectorScore] = await Promise.all([
          saveSectorData("water", waterData),
          saveSectorData("waste", wasteData)
        ]);
        
        // Calculate overall index: (Water × 50%) + (Waste × 50%)
        const overallIndex = (waterSectorScore * 0.5) + (wasteSectorScore * 0.5);
        
        // Update both records with overall index
        const waterPerf = await getCountyPerformanceByCountyId(countyId, Number(year), "water");
        const wastePerf = await getCountyPerformanceByCountyId(countyId, Number(year), "waste");
        
        if (waterPerf) {
          await saveCountyPerformance(countyId, Number(year), "water", {
            overall_score: overallIndex,
            sector_score: waterPerf.sector_score,
            governance: waterPerf.governance,
            mrv: waterPerf.mrv,
            mitigation: waterPerf.mitigation,
            adaptation: waterPerf.adaptation,
            finance: waterPerf.finance,
            indicators_json: waterPerf.indicators_json
          });
        }
        if (wastePerf) {
          await saveCountyPerformance(countyId, Number(year), "waste", {
            overall_score: overallIndex,
            sector_score: wastePerf.sector_score,
            governance: wastePerf.governance,
            mrv: wastePerf.mrv,
            mitigation: wastePerf.mitigation,
            adaptation: wastePerf.adaptation,
            finance: wastePerf.finance,
            indicators_json: wastePerf.indicators_json
          });
        }
      } catch (err) {
        console.error("Error saving county performance:", err);
        const errorMessage = err?.message || err?.toString() || 'Unknown error';
        throw new Error(`Failed to save performance data: ${errorMessage}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["counties"] });
      queryClient.invalidateQueries({ queryKey: ["county"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast({ 
        title: "Success", 
        description: `County data saved successfully!` 
      });
    },
    onError: (err) => {
      console.error("Save mutation error:", err);
      const errorMessage = err?.message || err?.toString() || "Failed to save data. Please try again.";
      toast({ 
        title: "Error", 
        description: errorMessage,
        variant: "destructive"
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!editingId) {
        throw new Error("No county to delete");
      }
      await deleteCounty(editingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["counties"] });
      toast({ 
        title: "Deleted", 
        description: "County deleted successfully." 
      });
      navigate("/counties-list");
    },
    onError: (err) => {
      toast({ 
        title: "Error", 
        description: err?.message || "Failed to delete county.",
        variant: "destructive"
      });
    },
  });

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Toggle section expand/collapse
  const toggleSection = (sector, thematicArea) => {
    const key = `${sector}-${thematicArea}`;
    setExpandedSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Check if section is expanded (default to false - collapsed)
  const isSectionExpanded = (sector, thematicArea) => {
    const key = `${sector}-${thematicArea}`;
    return expandedSections[key] === true; // Default to collapsed
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 py-4 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">County Data</h1>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
            {lastEdited && (
              <span className="text-xs sm:text-sm text-muted-foreground">
                Last edited {formatDate(lastEdited)}
              </span>
            )}
            {editingId && (
              <div className="flex gap-2">
                <button
                  onClick={() => navigate("/county-data", { state: { countyId: editingId } })}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                >
                  <Edit size={16} />
                  <span className="hidden sm:inline">Edit</span>
                </button>
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this county?")) {
                      deleteMutation.mutate();
                    }
                  }}
                  disabled={deleteMutation.isPending}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm"
                >
                  <Trash2 size={16} />
                  <span className="hidden sm:inline">{deleteMutation.isPending ? "Deleting..." : "Delete"}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* County and Year Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 sm:mb-2">County</label>
            <CountySelector
              value={county}
              onChange={setCounty}
              disabled={!!editingId}
              className="w-full h-auto text-sm sm:text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 sm:mb-2">Year</label>
            <select 
              value={year} 
              onChange={(e) => setYear(e.target.value)} 
              className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {yearOptions.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Score limits info */}
        <Alert className="border-primary/40 bg-primary/5 text-foreground">
          <Info className="h-4 w-4 text-primary" />
          <AlertTitle className="text-primary font-medium">Score limits</AlertTitle>
          <AlertDescription>
            Each indicator has a maximum score. Enter a value between 0 and that maximum; values outside this range will be adjusted automatically.
          </AlertDescription>
        </Alert>

        {/* Methodology info */}
        <Alert className="border-muted-foreground/30 bg-muted/40 text-foreground">
          <Info className="h-4 w-4 text-muted-foreground" />
          <AlertTitle className="text-primary font-semibold italic">How the County Sector Index Score is Calculated</AlertTitle>
          <AlertDescription className="mt-2 space-y-4 text-sm">
            <p>The index score for each sector at the county level is calculated in two main steps:</p>

            <div>
              <p className="font-semibold">Step 1: Calculate the Thematic Area Score</p>
              <p className="mt-1">Each sector is made up of several thematic areas, and each thematic area contains a set of indicators.</p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
                <li>The scores of all indicators under a specific thematic area are first added together.</li>
                <li>This total is then converted into a percentage (%) to produce the <strong>thematic area score</strong>.</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold">Step 2: Calculate the Overall Sector Score</p>
              <p className="mt-1">Each thematic area contributes differently to the overall sector performance, based on its assigned weight.</p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
                <li>The thematic area score is multiplied by its respective weight (%) to get a <strong>weighted thematic score</strong>.</li>
                <li>All weighted thematic scores within the sector are then added together.</li>
              </ul>
            </div>

            <p>The final result is the <strong>overall sector index score for the county</strong>, expressed as a percentage.</p>
          </AlertDescription>
        </Alert>

        {/* Water Management Section */}
        <div className="space-y-3 sm:space-y-4">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">Water Management</h2>
          {Object.keys(groupedIndicators("water")).map(thematicArea => {
            const areaIndicators = groupedIndicators("water")[thematicArea];
            const { score, maxScore } = calculateThematicAreaScore(areaIndicators, waterData, thematicArea, "water");
            const isExpanded = isSectionExpanded("water", thematicArea);

          return (
              <div key={thematicArea} className="border border-border rounded-lg overflow-hidden bg-white shadow-sm">
                <button
                  onClick={() => toggleSection("water", thematicArea)}
                  className="w-full bg-gray-100 px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 border-b border-border hover:bg-gray-200 transition-colors"
                >
                  <span className="font-semibold text-sm sm:text-base text-foreground text-left break-words hyphens-auto pr-2">{thematicArea}</span>
                  <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="flex gap-2 sm:gap-3 lg:gap-4 text-xs sm:text-sm">
                      <span className="text-foreground whitespace-nowrap">Score: {score}%</span>
                      <span className="text-muted-foreground whitespace-nowrap">Max: {maxScore}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-foreground flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-foreground flex-shrink-0" />
                    )}
                  </div>
                </button>
                {isExpanded && (
                  <div className="overflow-x-auto transition-all duration-300 ease-in-out -mx-3 sm:mx-0">
                    <table className="w-full min-w-[640px]">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                          <th className="px-2 sm:px-3 lg:px-4 py-2 text-left text-xs font-semibold text-foreground border-b uppercase tracking-wider">Indicator</th>
                          <th className="px-2 sm:px-3 lg:px-4 py-2 text-left text-xs font-semibold text-foreground border-b uppercase tracking-wider">Response</th>
                          <th className="px-2 sm:px-3 lg:px-4 py-2 text-left text-xs font-semibold text-foreground border-b uppercase tracking-wider">Comment</th>
                          <th className="px-2 sm:px-3 lg:px-4 py-2 text-left text-xs font-semibold text-foreground border-b uppercase tracking-wider">Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {areaIndicators.map(ind => {
                          const indicatorId = ind.id.toString();
                          const data = waterData[indicatorId] || { response: "", comment: "", score: "" };
                          const score = calculateIndicatorScore(ind, data.response, data.score);
                          
                          return (
                            <tr key={ind.id} className="border-b border-border hover:bg-gray-50 transition-colors">
                              <td className="px-2 sm:px-3 lg:px-4 py-2 text-xs sm:text-sm text-foreground max-w-[150px] sm:max-w-[250px] lg:max-w-[350px]">
                                <div className="truncate" title={ind.indicator_text}>
                                  {ind.indicator_text}
                                </div>
                              </td>
                              <td className="px-2 sm:px-3 lg:px-4 py-2">
                                <input
                                  type="text"
                                  value={data.response}
                                  onChange={(e) => updateIndicatorData(indicatorId, "response", e.target.value, "water")}
                                  className="w-full min-w-[100px] px-2 py-1.5 border border-input rounded focus:outline-none focus:ring-1 focus:ring-primary text-xs sm:text-sm"
                                  placeholder="Response"
                                />
                              </td>
                              <td className="px-2 sm:px-3 lg:px-4 py-2">
                                <input
                                  type="text"
                                  value={data.comment}
                                  onChange={(e) => updateIndicatorData(indicatorId, "comment", e.target.value, "water")}
                                  className="w-full min-w-[120px] px-2 py-1.5 border border-input rounded focus:outline-none focus:ring-1 focus:ring-primary text-xs sm:text-sm"
                                  placeholder="Comment"
                                />
                              </td>
                              <td className="px-2 sm:px-3 lg:px-4 py-2">
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    min={0}
                                    max={ind.weight ?? 10}
                                    step="0.1"
                                    value={data.score !== undefined && data.score !== null && data.score !== "" ? data.score : Math.round(score)}
                                    onChange={(e) => updateIndicatorData(indicatorId, "score", e.target.value, "water")}
                                    className="w-14 sm:w-16 px-1.5 py-1.5 border border-input rounded text-center text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                  />
                                  <span className="text-xs text-muted-foreground whitespace-nowrap">/ {ind.weight ?? 10}</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                      </div>
                    )}
              </div>
            );
          })}
        </div>

        {/* Waste Management Section */}
        <div className="space-y-3 sm:space-y-4">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">Waste Management</h2>
          {Object.keys(groupedIndicators("waste")).map(thematicArea => {
            const areaIndicators = groupedIndicators("waste")[thematicArea];
            const { score, maxScore } = calculateThematicAreaScore(areaIndicators, wasteData, thematicArea, "waste");
            const isExpanded = isSectionExpanded("waste", thematicArea);
            
            return (
              <div key={thematicArea} className="border border-border rounded-lg overflow-hidden bg-white shadow-sm">
                <button
                  onClick={() => toggleSection("waste", thematicArea)}
                  className="w-full bg-gray-100 px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 border-b border-border hover:bg-gray-200 transition-colors"
                >
                  <span className="font-semibold text-sm sm:text-base text-foreground text-left break-words hyphens-auto pr-2">{thematicArea}</span>
                  <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="flex gap-2 sm:gap-3 lg:gap-4 text-xs sm:text-sm">
                      <span className="text-foreground whitespace-nowrap">Score: {score}%</span>
                      <span className="text-muted-foreground whitespace-nowrap">Max: {maxScore}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-foreground flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-foreground flex-shrink-0" />
                    )}
                  </div>
                </button>
                {isExpanded && (
                  <div className="overflow-x-auto transition-all duration-300 ease-in-out -mx-3 sm:mx-0">
                    <table className="w-full min-w-[640px]">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                          <th className="px-2 sm:px-3 lg:px-4 py-2 text-left text-xs font-semibold text-foreground border-b uppercase tracking-wider">Indicator</th>
                          <th className="px-2 sm:px-3 lg:px-4 py-2 text-left text-xs font-semibold text-foreground border-b uppercase tracking-wider">Response</th>
                          <th className="px-2 sm:px-3 lg:px-4 py-2 text-left text-xs font-semibold text-foreground border-b uppercase tracking-wider">Comment</th>
                          <th className="px-2 sm:px-3 lg:px-4 py-2 text-left text-xs font-semibold text-foreground border-b uppercase tracking-wider">Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {areaIndicators.map(ind => {
                          const indicatorId = ind.id.toString();
                          const data = wasteData[indicatorId] || { response: "", comment: "", score: "" };
                          const score = calculateIndicatorScore(ind, data.response, data.score);
                          
                          return (
                            <tr key={ind.id} className="border-b border-border hover:bg-gray-50 transition-colors">
                              <td className="px-2 sm:px-3 lg:px-4 py-2 text-xs sm:text-sm text-foreground max-w-[150px] sm:max-w-[250px] lg:max-w-[350px]">
                                <div className="truncate" title={ind.indicator_text}>
                                  {ind.indicator_text}
                                </div>
                              </td>
                              <td className="px-2 sm:px-3 lg:px-4 py-2">
                                <input
                                  type="text"
                                  value={data.response}
                                  onChange={(e) => updateIndicatorData(indicatorId, "response", e.target.value, "waste")}
                                  className="w-full min-w-[100px] px-2 py-1.5 border border-input rounded focus:outline-none focus:ring-1 focus:ring-primary text-xs sm:text-sm"
                                  placeholder="Response"
                                />
                              </td>
                              <td className="px-2 sm:px-3 lg:px-4 py-2">
                                <input
                                  type="text"
                                  value={data.comment}
                                  onChange={(e) => updateIndicatorData(indicatorId, "comment", e.target.value, "waste")}
                                  className="w-full min-w-[120px] px-2 py-1.5 border border-input rounded focus:outline-none focus:ring-1 focus:ring-primary text-xs sm:text-sm"
                                  placeholder="Comment"
                                />
                              </td>
                              <td className="px-2 sm:px-3 lg:px-4 py-2">
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    min={0}
                                    max={ind.weight ?? 10}
                                    step="0.1"
                                    value={data.score !== undefined && data.score !== null && data.score !== "" ? data.score : Math.round(score)}
                                    onChange={(e) => updateIndicatorData(indicatorId, "score", e.target.value, "waste")}
                                    className="w-14 sm:w-16 px-1.5 py-1.5 border border-input rounded text-center text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                  />
                                  <span className="text-xs text-muted-foreground whitespace-nowrap">/ {ind.weight ?? 10}</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
            </div>
          );
        })}
        </div>

        {/* Save Button */}
        <div className="flex justify-center pt-4 sm:pt-6">
          <button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || !county || !year || indicatorsLoading}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-blue-600 text-white text-base sm:text-lg rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-lg hover:shadow-xl"
          >
            <Save size={18} className="sm:w-5 sm:h-5" />
            {saveMutation.isPending ? "Saving..." : "Save County Data"}
          </button>
        </div>
      </div>
    </MainLayout>
  );
}

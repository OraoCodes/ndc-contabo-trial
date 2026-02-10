import { MainLayout } from "@/components/MainLayout";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createIndicator,
  listThematicAreas,
  type ThematicArea,
} from "@/lib/supabase-api";
import { useToast } from "@/hooks/use-toast";

type Sector = "water" | "waste";

export default function AddIndicator() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [sector, setSector] = useState<Sector | "">("");
  const [thematicAreaId, setThematicAreaId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [indicatorText, setIndicatorText] = useState("");
  const [maxScore, setMaxScore] = useState<string>("");
  const [sectorError, setSectorError] = useState("");
  const [thematicError, setThematicError] = useState("");
  const [titleError, setTitleError] = useState("");
  const [textError, setTextError] = useState("");
  const [scoreError, setScoreError] = useState("");

  const { data: areas } = useQuery<ThematicArea[]>({
    queryKey: ["thematicAreas"],
    queryFn: listThematicAreas,
  });

  const currentSector = sector === "water" || sector === "waste" ? sector : null;
  const thematicOptions: ThematicArea[] = currentSector && areas
    ? areas.filter(
        (a) => (a.sector || "").toLowerCase() === currentSector
      )
    : [];

  const mutation = useMutation({
    mutationFn: (payload: {
      sector: Sector;
      thematic_area_id: number;
      title: string;
      indicator_text: string;
      weight: number;
    }) => createIndicator(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["indicators"] });
      toast({
        title: "Success",
        description: "Indicator added successfully.",
      });
      navigate("/indicators");
    },
    onError: (err: unknown) => {
      toast({
        title: "Error",
        description: (err as Error)?.message ?? "Failed to add indicator",
        variant: "destructive",
      });
    },
  });

  const validate = (): boolean => {
    let ok = true;
    setSectorError("");
    setThematicError("");
    setTitleError("");
    setTextError("");
    setScoreError("");

    if (!currentSector) {
      setSectorError("Please select a sector.");
      ok = false;
    }

    const areaId = thematicAreaId ? Number(thematicAreaId) : NaN;
    if (!thematicAreaId || Number.isNaN(areaId)) {
      setThematicError("Please select a thematic area.");
      ok = false;
    }

    if (!title.trim()) {
      setTitleError("Please enter a title for the indicator.");
      ok = false;
    }

    if (!indicatorText.trim()) {
      setTextError("Please describe the indicator.");
      ok = false;
    }

    const w = Number(maxScore);
    if (maxScore === "" || Number.isNaN(w)) {
      setScoreError("Please enter a maximum score.");
      ok = false;
    } else if (w <= 0) {
      setScoreError("Maximum score must be greater than 0.");
      ok = false;
    }

    return ok;
  };

  const handleSubmit = () => {
    if (!validate() || !currentSector) return;
    const areaId = Number(thematicAreaId);
    if (Number.isNaN(areaId)) return;
    const weight = Number(maxScore);
    mutation.mutate({
      sector: currentSector,
      thematic_area_id: areaId,
      title: title.trim(),
      indicator_text: indicatorText.trim(),
      weight,
    });
  };

  return (
    <MainLayout>
      <div className="max-w-lg">
        <h2 className="text-2xl font-bold text-foreground mb-6">
          Add New Indicator
        </h2>

        <div className="bg-card rounded-lg p-6 border border-border space-y-6">
          {/* Sector */}
          <div>
            <Label htmlFor="sector">
              Sector <span className="text-destructive">*</span>
            </Label>
            <div className="relative mt-1.5">
              <select
                id="sector"
                value={sector}
                onChange={(e) => {
                  const v = e.target.value;
                  setSector(v === "water" || v === "waste" ? v : "");
                  setThematicAreaId("");
                  setThematicError("");
                }}
                className="w-full px-4 py-2 pr-10 bg-background border border-input rounded-md text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="">Select sector</option>
                <option value="water">Water</option>
                <option value="waste">Waste</option>
              </select>
              <ChevronDown
                size={18}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
            </div>
            {sectorError && (
              <p className="mt-1.5 text-sm text-destructive">{sectorError}</p>
            )}
          </div>

          {/* Thematic area */}
          <div>
            <Label htmlFor="thematic">
              Thematic area <span className="text-destructive">*</span>
            </Label>
            <div className="relative mt-1.5">
              <select
                id="thematic"
                value={thematicAreaId}
                onChange={(e) => {
                  setThematicAreaId(e.target.value);
                  setThematicError("");
                }}
                disabled={!currentSector || thematicOptions.length === 0}
                className="w-full px-4 py-2 pr-10 bg-background border border-input rounded-md text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50"
              >
                <option value="">
                  {!currentSector
                    ? "Select sector first"
                    : thematicOptions.length === 0
                      ? "No thematic areas for this sector"
                      : "Select thematic area"}
                </option>
                {thematicOptions.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={18}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
            </div>
            {thematicError && (
              <p className="mt-1.5 text-sm text-destructive">{thematicError}</p>
            )}
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title">
              Title / Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setTitleError("");
              }}
              placeholder="e.g. County climate-resilient water policy"
              className="mt-1.5"
            />
            {titleError && (
              <p className="mt-1.5 text-sm text-destructive">{titleError}</p>
            )}
          </div>

          {/* Describe the indicator */}
          <div>
            <Label htmlFor="indicator-text">
              Describe the indicator <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="indicator-text"
              value={indicatorText}
              onChange={(e) => {
                setIndicatorText(e.target.value);
                setTextError("");
              }}
              placeholder="e.g. County has a documented policy or plan that aligns with NDC targets for water management"
              className="mt-1.5 min-h-[100px]"
              rows={4}
            />
            {textError && (
              <p className="mt-1.5 text-sm text-destructive">{textError}</p>
            )}
          </div>

          {/* Maximum score */}
          <div>
            <Label htmlFor="max-score">
              Maximum score <span className="text-destructive">*</span>
            </Label>
            <Input
              id="max-score"
              type="number"
              min={0.5}
              step={0.5}
              value={maxScore}
              onChange={(e) => {
                setMaxScore(e.target.value);
                setScoreError("");
              }}
              placeholder="e.g. 10"
              className="mt-1.5"
            />
            {scoreError && (
              <p className="mt-1.5 text-sm text-destructive">{scoreError}</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSubmit}
              disabled={mutation.isPending}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mutation.isPending ? "Saving..." : "Submit"}
            </button>
            <button
              onClick={() => navigate("/indicators")}
              className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors font-medium text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

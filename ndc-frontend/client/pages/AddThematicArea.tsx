import { MainLayout } from "@/components/MainLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createThematicArea, listThematicAreas, type ThematicArea } from "@/lib/supabase-api";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

type Sector = "water" | "waste";

function sectorTotal(areas: ThematicArea[] | undefined, sector: Sector): number {
  if (!areas) return 0;
  return areas
    .filter((a) => (a.sector || "").toLowerCase() === sector)
    .reduce((s, a) => s + (a.weight_percentage ?? 0), 0);
}

export default function AddThematicArea() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [sector, setSector] = useState<Sector | "">("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [weight, setWeight] = useState<string>("");
  const [nameError, setNameError] = useState("");
  const [weightError, setWeightError] = useState("");
  const [sectorError, setSectorError] = useState("");

  const { data: areas } = useQuery<ThematicArea[]>({
    queryKey: ["thematicAreas"],
    queryFn: listThematicAreas,
  });

  const currentSector = sector === "water" || sector === "waste" ? sector : null;
  const usedTotal = currentSector ? sectorTotal(areas, currentSector) : 0;
  const remaining = currentSector ? Math.max(0, 100 - usedTotal) : null;
  const remainingNum = remaining ?? 0;
  const canAddWeight = remainingNum > 0;

  const mutation = useMutation({
    mutationFn: (payload: {
      name: string;
      description?: string | null;
      sector: Sector;
      weight_percentage: number;
    }) => createThematicArea(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["thematicAreas"] });
      toast({ title: "Success", description: "Thematic area created successfully." });
      navigate("/thematic-areas");
    },
    onError: (err: unknown) => {
      toast({
        title: "Error",
        description: (err as Error)?.message ?? "Failed to create thematic area",
        variant: "destructive",
      });
    },
  });

  const validate = (): boolean => {
    let ok = true;
    setNameError("");
    setWeightError("");
    setSectorError("");

    if (!currentSector) {
      setSectorError("Please select a sector.");
      ok = false;
    }

    if (!name.trim()) {
      setNameError("Please enter a name.");
      ok = false;
    }

    const w = Number(weight);
    if (weight === "" || Number.isNaN(w)) {
      setWeightError("Please enter a weight.");
      ok = false;
    } else if (w <= 0) {
      setWeightError("Weight must be greater than 0.");
      ok = false;
    } else if (!canAddWeight || w > remainingNum) {
      const sectorLabel = currentSector === "water" ? "Water" : "Waste";
      setWeightError(
        `Weight must be at most ${remainingNum}% (${remainingNum}% remaining for ${sectorLabel}).`
      );
      ok = false;
    }

    return ok;
  };

  const handleSave = () => {
    if (!validate()) return;
    const w = Number(weight);
    mutation.mutate({
      name: name.trim(),
      description: description.trim() || null,
      sector: currentSector!,
      weight_percentage: w,
    });
  };

  const sectorLabel = currentSector === "water" ? "Water" : currentSector === "waste" ? "Waste" : null;

  return (
    <MainLayout>
      <div className="max-w-lg">
        <h2 className="text-2xl font-bold text-foreground mb-6">
          Add New Thematic Area
        </h2>

        <div className="bg-white rounded-lg p-6 border border-border space-y-6">
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
                  setWeightError("");
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

          {/* Remaining weight */}
          {currentSector && (
            <div
              className={
                canAddWeight
                  ? "rounded-lg bg-muted/50 px-4 py-3 text-sm"
                  : "rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive"
              }
            >
              {canAddWeight ? (
                <span>
                  Available weight for <strong>{sectorLabel}</strong>:{" "}
                  <strong>{remainingNum}%</strong>
                  {remainingNum < 100 && (
                    <span className="text-muted-foreground">
                      {" "}(current total: {usedTotal}%)
                    </span>
                  )}
                </span>
              ) : (
                <span>
                  This sector already has 100% allocated. Edit or delete an
                  existing thematic area to free weight.
                </span>
              )}
            </div>
          )}

          {/* Name */}
          <div>
            <Label htmlFor="name">
              Thematic area name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameError("");
              }}
              placeholder="e.g. Governance & Policy Framework"
              className="mt-1.5"
            />
            {nameError && (
              <p className="mt-1.5 text-sm text-destructive">{nameError}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this thematic area"
              className="mt-1.5 min-h-[80px]"
              rows={3}
            />
          </div>

          {/* Weight */}
          <div>
            <Label htmlFor="weight">
              Weight (%) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="weight"
              type="number"
              min={0.5}
              max={canAddWeight ? remainingNum : 100}
              step={0.5}
              value={weight}
              onChange={(e) => {
                setWeight(e.target.value);
                setWeightError("");
              }}
              placeholder={canAddWeight ? `Max ${remainingNum}%` : "—"}
              disabled={!canAddWeight}
              className="mt-1.5"
            />
            {canAddWeight && (
              <p className="mt-1 text-xs text-muted-foreground">
                Enter a value between 0.5 and {remainingNum} (remaining for{" "}
                {sectorLabel}).
              </p>
            )}
            {weightError && (
              <p className="mt-1.5 text-sm text-destructive">{weightError}</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={mutation.isPending || !canAddWeight}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mutation.isPending ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => navigate("/thematic-areas")}
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

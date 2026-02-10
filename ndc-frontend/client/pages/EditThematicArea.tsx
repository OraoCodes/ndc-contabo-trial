import { MainLayout } from "@/components/MainLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getThematicArea,
  updateThematicArea,
  listThematicAreas,
  type ThematicArea,
} from "@/lib/supabase-api";
import { useToast } from "@/hooks/use-toast";

type Sector = "water" | "waste";

function othersSumInSector(
  areas: ThematicArea[] | undefined,
  sector: Sector,
  excludeId: number
): number {
  if (!areas) return 0;
  return areas
    .filter(
      (a) =>
        (a.sector || "").toLowerCase() === sector &&
        a.id !== excludeId
    )
    .reduce((s, a) => s + (a.weight_percentage ?? 0), 0);
}

export default function EditThematicArea() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sector, setSector] = useState<Sector | "">("");
  const [weight, setWeight] = useState<string>("");
  const [nameError, setNameError] = useState("");
  const [weightError, setWeightError] = useState("");

  const numericId = id != null && !isNaN(Number(id)) ? Number(id) : null;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["thematicArea", id],
    queryFn: () => getThematicArea(Number(id!)),
    enabled: !!numericId,
  });

  const { data: areas } = useQuery<ThematicArea[]>({
    queryKey: ["thematicAreas"],
    queryFn: listThematicAreas,
  });

  useEffect(() => {
    if (data) {
      setName(data.name ?? "");
      setDescription(data.description ?? "");
      const s = (data.sector || "").toLowerCase();
      setSector(s === "water" || s === "waste" ? s : "");
      setWeight(
        data.weight_percentage != null
          ? String(data.weight_percentage)
          : ""
      );
    }
  }, [data]);

  const currentSector: Sector | null =
    sector === "water" || sector === "waste" ? sector : null;
  const othersTotal =
    currentSector && numericId != null
      ? othersSumInSector(areas, currentSector, numericId)
      : 0;
  const remaining = 100 - othersTotal;
  const canAssignWeight = remaining > 0;

  const updateMutation = useMutation({
    mutationFn: (payload: {
      name?: string;
      description?: string | null;
      sector?: Sector;
      weight_percentage?: number;
    }) => updateThematicArea(numericId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["thematicAreas"] });
      queryClient.invalidateQueries({ queryKey: ["thematicArea", id] });
      toast({ title: "Success", description: "Thematic area updated." });
      navigate("/thematic-areas");
    },
    onError: (err: unknown) => {
      toast({
        title: "Error",
        description: (err as Error)?.message ?? "Failed to update thematic area",
        variant: "destructive",
      });
    },
  });

  const validate = (): boolean => {
    let ok = true;
    setNameError("");
    setWeightError("");

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
    } else if (!canAssignWeight || w > remaining) {
      const sectorLabel = currentSector === "water" ? "Water" : "Waste";
      setWeightError(
        `Weight must be at most ${remaining}% (${remaining}% available for this area in ${sectorLabel}).`
      );
      ok = false;
    }

    return ok;
  };

  const handleSave = () => {
    if (!validate()) return;
    const w = Number(weight);
    updateMutation.mutate({
      name: name.trim(),
      description: description.trim() || null,
      sector: currentSector ?? undefined,
      weight_percentage: w,
    });
  };

  const sectorLabel =
    currentSector === "water"
      ? "Water"
      : currentSector === "waste"
        ? "Waste"
        : null;

  if (isLoading || (numericId != null && !data && !isError)) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[200px] text-muted-foreground">
          Loading...
        </div>
      </MainLayout>
    );
  }

  if (isError || !data) {
    return (
      <MainLayout>
        <div className="space-y-4">
          <p className="text-destructive">
            {isError ? (error as Error)?.message : "Thematic area not found."}
          </p>
          <button
            onClick={() => navigate("/thematic-areas")}
            className="text-primary underline"
          >
            Back to Thematic Areas
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-lg">
        <h2 className="text-2xl font-bold text-foreground mb-6">
          Edit Thematic Area
        </h2>

        <div className="bg-white rounded-lg p-6 border border-border space-y-6">
          {/* Available weight for this area */}
          {currentSector && (
            <div className="rounded-lg bg-muted/50 px-4 py-3 text-sm">
              <span>
                Available weight for this area (
                <strong>{sectorLabel}</strong>):{" "}
                <strong>{remaining}%</strong>
                <span className="text-muted-foreground">
                  {" "}(other areas in this sector: {othersTotal}%)
                </span>
              </span>
            </div>
          )}

          {/* Sector */}
          <div>
            <Label htmlFor="sector">Sector</Label>
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
          </div>

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
              max={remaining}
              step={0.5}
              value={weight}
              onChange={(e) => {
                setWeight(e.target.value);
                setWeightError("");
              }}
              placeholder={`Max ${remaining}%`}
              className="mt-1.5"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Enter a value between 0.5 and {remaining} (available for this
              area).
            </p>
            {weightError && (
              <p className="mt-1.5 text-sm text-destructive">{weightError}</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={updateMutation.isPending || !currentSector}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateMutation.isPending ? "Saving..." : "Save"}
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

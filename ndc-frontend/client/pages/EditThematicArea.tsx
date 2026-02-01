// EditThematicArea.tsx
import { MainLayout } from "@/components/MainLayout";
import { ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getThematicArea, updateThematicArea } from "@/lib/supabase-api";
import { useToast } from "@/hooks/use-toast";

export default function EditThematicArea() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [sector, setSector] = useState("");
  const [thematicArea, setThematicArea] = useState("");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["thematicArea", id],
    queryFn: () => getThematicArea(Number(id!)),
    enabled: !!id && !isNaN(Number(id)),
  });

  useEffect(() => {
    if (data) {
      setThematicArea(data.name ?? "");
      setSector(data.description ?? "");
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: (payload: { name: string; description: string }) =>
      updateThematicArea(Number(id!), payload),
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

  const handleSave = () => {
    if (!thematicArea.trim()) {
      toast({ title: "Missing name", description: "Please enter the thematic area name", variant: "destructive" });
      return;
    }
    updateMutation.mutate({
      name: thematicArea.trim(),
      description: sector,
    });
  };

  if (isLoading || !data) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[200px] text-muted-foreground">
          {isLoading ? "Loading..." : "Thematic area not found."}
        </div>
      </MainLayout>
    );
  }

  if (isError) {
    return (
      <MainLayout>
        <div className="text-destructive">Error: {(error as Error)?.message}</div>
        <button onClick={() => navigate("/thematic-areas")} className="mt-4 text-primary underline">
          Back to Thematic Areas
        </button>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-md">
        <h2 className="text-2xl font-bold text-foreground mb-6">
          Edit Thematic Area
        </h2>

        <div className="bg-white rounded-lg p-6 border border-border space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Sector
            </label>
            <div className="relative">
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full px-4 py-2 pr-10 bg-white border border-input rounded-lg text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select sector</option>
                <option value="Water">Water</option>
                <option value="Waste">Waste</option>
              </select>
              <ChevronDown
                size={18}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Thematic Area Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={thematicArea}
              onChange={(e) => setThematicArea(e.target.value)}
              placeholder="e.g. Flood Risk Management"
              className="w-full px-4 py-2 border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium text-sm disabled:opacity-50"
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

// AddThematicArea.tsx
import { MainLayout } from "@/components/MainLayout";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createThematicArea } from "@/lib/supabase-api";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export default function AddThematicArea() {
  const [sector, setSector] = useState("");
  const [thematicArea, setThematicArea] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: (payload: { name: string; description: string }) =>
      createThematicArea(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["thematicAreas"] });
      toast({ title: "Success", description: "Thematic area created successfully." });
      setSector("");
      setThematicArea("");
      navigate("/thematic-areas"); // much better UX
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description:
          err?.response?.data?.error || err?.message || "Failed to create thematic area",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!sector) {
      toast({ title: "Missing sector", description: "Please select a sector", variant: "destructive" });
      return;
    }
    if (!thematicArea.trim()) {
      toast({ title: "Missing name", description: "Please enter the thematic area name", variant: "destructive" });
      return;
    }

    // THIS IS THE FIX → swap the fields + trim + send null instead of empty string
    mutation.mutate({
      name: thematicArea.trim(),
      description: sector, // sector is actually the "category" here
    });
  };

  return (
    <MainLayout>
      <div className="max-w-md">
        <h2 className="text-2xl font-bold text-foreground mb-6">
          Add New Thematic Area
        </h2>

        <div className="bg-white rounded-lg p-6 border border-border space-y-6">
          {/* Sector Dropdown */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Sector <span className="text-destructive">*</span>
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
                {/* add more as needed */}
              </select>
              <ChevronDown
                size={18}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
            </div>
          </div>

          {/* Thematic Area Name */}
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
              disabled={mutation.isPending}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium text-sm disabled:opacity-50"
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

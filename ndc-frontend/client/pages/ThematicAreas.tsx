import { MainLayout } from "@/components/MainLayout";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listThematicAreas, deleteThematicArea, type ThematicArea } from "@/lib/supabase-api";
import { useToast } from "@/hooks/use-toast";

export default function ThematicAreas() {
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useQuery<ThematicArea[]>({
    queryKey: ["thematicAreas"],
    queryFn: listThematicAreas,
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteThematicArea(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["thematicAreas"] });
      toast({ title: "Deleted", description: "Thematic area deleted." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err?.message ?? "Failed to delete" });
    },
  });

  const waterTotal = data
    ? data.filter((a) => (a.sector || "").toLowerCase() === "water").reduce((s, a) => s + (a.weight_percentage ?? 0), 0)
    : 0;
  const wasteTotal = data
    ? data.filter((a) => (a.sector || "").toLowerCase() === "waste").reduce((s, a) => s + (a.weight_percentage ?? 0), 0)
    : 0;
  const formatSector = (s: string | null | undefined) =>
    s ? (s.toLowerCase() === "water" ? "Water" : s.toLowerCase() === "waste" ? "Waste" : s) : "—";

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Thematic Areas</h2>
          </div>
          <button
            onClick={() => navigate("/thematic-areas/add")}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium text-sm"
          >
            <Plus size={18} />
            Add New
          </button>
        </div>

        {/* Per-sector weight summary */}
        {data && data.length > 0 && (
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span>Water total: <strong className="text-foreground">{waterTotal}%</strong></span>
            <span>Waste total: <strong className="text-foreground">{wasteTotal}%</strong></span>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-background border-b border-border">
                  <th className="text-left py-4 px-6 font-semibold text-foreground text-xs uppercase tracking-wider">Name</th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground text-xs uppercase tracking-wider">Sector</th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground text-xs uppercase tracking-wider">Weight</th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground text-xs uppercase tracking-wider">Description</th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={5} className="py-6 px-6 text-center text-muted-foreground">Loading...</td>
                  </tr>
                )}
                {isError && (
                  <tr>
                    <td colSpan={5} className="py-6 px-6 text-center text-destructive">Error: {(error as Error)?.message}</td>
                  </tr>
                )}
                {data?.map((row) => (
                  <tr key={row.id} className="border-b border-border hover:bg-background/50 transition-colors">
                    <td className="py-4 px-6 text-foreground text-sm font-medium">{row.name}</td>
                    <td className="py-4 px-6 text-foreground text-sm">{formatSector(row.sector)}</td>
                    <td className="py-4 px-6 text-foreground text-sm">{row.weight_percentage != null ? `${row.weight_percentage}%` : "—"}</td>
                    <td className="py-4 px-6 text-foreground text-sm max-w-xs truncate" title={row.description ?? undefined}>{row.description ?? "—"}</td>
                    <td className="py-4 px-6 text-sm">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => navigate(`/thematic-areas/edit/${row.id}`)}
                          title="Edit"
                          className="p-2 text-primary hover:text-primary/80 hover:bg-primary/10 rounded-lg transition-colors"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete thematic area "${row.name}"?`)) {
                              deleteMutation.mutate(row.id);
                            }
                          }}
                          title="Delete"
                          className="p-2 text-destructive hover:text-destructive/80 hover:bg-destructive/10 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {data && data.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 px-6 text-center text-muted-foreground">No thematic areas found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

import { MainLayout } from "@/components/MainLayout";
import { Plus } from "lucide-react";
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

        {/* Table */}
        <div className="bg-white rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-background border-b border-border">
                  <th className="text-left py-4 px-6 font-semibold text-foreground text-xs uppercase tracking-wider">Name</th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground text-xs uppercase tracking-wider">Description</th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground text-xs uppercase tracking-wider">Operation</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={3} className="py-6 px-6 text-center text-muted-foreground">Loading...</td>
                  </tr>
                )}
                {isError && (
                  <tr>
                    <td colSpan={3} className="py-6 px-6 text-center text-destructive">Error: {(error as Error)?.message}</td>
                  </tr>
                )}
                {data?.map((row) => (
                  <tr key={row.id} className="border-b border-border hover:bg-background/50 transition-colors">
                    <td className="py-4 px-6 text-foreground text-sm font-medium">{row.name}</td>
                    <td className="py-4 px-6 text-foreground text-sm">{row.description ?? '-'}</td>
                    <td className="py-4 px-6 text-sm">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => toast({ title: "Not implemented", description: "Edit feature not implemented yet." })}
                          className="text-primary hover:text-primary/80 transition-colors font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete thematic area "${row.name}"?`)) {
                              deleteMutation.mutate(row.id);
                            }
                          }}
                          className="text-destructive hover:text-destructive/80 transition-colors font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {data && data.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-6 px-6 text-center text-muted-foreground">No thematic areas found.</td>
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

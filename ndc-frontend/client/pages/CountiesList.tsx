import { MainLayout } from "@/components/MainLayout";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listCounties, deleteCounty, type County } from "@/lib/supabase-api";
import { useToast } from "@/hooks/use-toast";

export default function CountiesList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery<County[]>({
    queryKey: ["counties"],
    queryFn: listCounties,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCounty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["counties"] });
      toast({ title: "Success", description: "County deleted successfully." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err?.message ?? "Failed to delete county" });
    },
  });

  return (
    <MainLayout>
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-3xl font-bold text-foreground">Counties</h2>
          <button
            onClick={() => navigate("/county-data")}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-all font-medium shadow-lg"
          >
            <Plus size={20} />
            Add New County
          </button>
        </div>

        {/* Responsive Table / Card View */}
        <div className="bg-white rounded-2xl shadow-lg border border-border overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="text-left py-5 px-6 font-semibold text-foreground text-sm uppercase tracking-wider">County</th>
                  <th className="text-left py-5 px-6 font-semibold text-foreground text-sm uppercase tracking-wider">Population</th>
                  <th className="text-left py-5 px-6 font-semibold text-foreground text-sm uppercase tracking-wider">Total Score</th>
                  <th className="text-left py-5 px-6 font-semibold text-foreground text-sm uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-muted-foreground">Loading counties...</td>
                  </tr>
                )}
                {isError && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-destructive">Error: {(error as Error)?.message}</td>
                  </tr>
                )}
                {data?.map((county) => (
                  <tr key={county.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="py-5 px-6 font-medium text-foreground">{county.name}</td>
                    <td className="py-5 px-6 text-foreground">{county.population?.toLocaleString() || "-"}</td>
                    <td className="py-5 px-6 text-foreground">{county.thematic_area_id ?? "-"}</td>
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => navigate("/county-data", { state: { countyId: county.id } })}
                          title="Edit"
                          className="p-2 text-primary hover:text-primary/80 hover:bg-primary/10 rounded-lg transition-colors"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete "${county.name}" permanently?`)) {
                              deleteMutation.mutate(Number(county.id));
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
                {data?.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-muted-foreground">No counties found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="block md:hidden">
            {isLoading && (
              <div className="p-8 text-center text-muted-foreground">Loading counties...</div>
            )}
            {isError && (
              <div className="p-8 text-center text-destructive">Error loading counties</div>
            )}
            {data?.map((county) => (
              <div
                key={county.id}
                className="border-b border-border last:border-0 p-6 hover:bg-muted/20 transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg text-foreground">{county.name}</h3>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => navigate("/county-data", { state: { countyId: county.id } })}
                      title="Edit"
                      className="p-2 text-primary hover:text-primary/80 hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Delete "${county.name}"?`)) {
                          deleteMutation.mutate(Number(county.id));
                        }
                      }}
                      title="Delete"
                      className="p-2 text-destructive hover:text-destructive/80 hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Population:</span>
                    <p className="font-medium">{county.population?.toLocaleString() || "-"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Score:</span>
                    <p className="font-medium">{county.thematic_area_id ?? "-"}</p>
                  </div>
                </div>
              </div>
            ))}
            {data?.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">No counties found.</div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

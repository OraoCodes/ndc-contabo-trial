"use client";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Plus, Trash2, Pencil } from "lucide-react";
import { MainLayout } from "@/components/MainLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listIndicators,
  deleteIndicator,
  type Indicator,
} from "@/lib/supabase-api";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export default function IndicatorManagementPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [deleteTarget, setDeleteTarget] = useState<Indicator | null>(null);

  const { data: indicators = [], isLoading } = useQuery({
    queryKey: ["indicators"],
    queryFn: listIndicators,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteIndicator(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["indicators"] });
      setDeleteTarget(null);
      toast({ title: "Deleted", description: "Indicator deleted." });
    },
    onError: (err: unknown) => {
      toast({
        title: "Error",
        description: (err as Error)?.message ?? "Failed to delete indicator",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-[40vh] flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-muted-foreground" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Indicators</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Add, edit, or remove indicators used in the NDC Index
            </p>
          </div>
          <Button asChild className="shrink-0 w-fit">
            <Link to="/indicators/add" className="inline-flex items-center gap-2 w-fit">
              <Plus size={16} />
              Add indicator
            </Link>
          </Button>
        </div>

        {indicators.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center rounded-lg border border-dashed">
            No indicators available.
          </p>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-foreground">
                    Title
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-foreground">
                    Description
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-foreground">
                    Thematic area
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-foreground">
                    Sector
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-foreground w-32">
                    Max score
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-foreground w-28">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {indicators.map((ind) => (
                  <tr
                    key={ind.id}
                    className="border-t border-border hover:bg-muted/30"
                  >
                    <td className="px-4 py-3 text-foreground max-w-[200px]">
                      <span className="line-clamp-2 font-medium">
                        {ind.title}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-foreground max-w-md">
                      <span className="line-clamp-2" title={ind.indicator_text}>
                        {ind.indicator_text}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {ind.thematic_area ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-foreground capitalize">
                      {ind.sector}
                    </td>
                    <td className="px-4 py-3 text-right text-foreground">
                      {ind.weight}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            navigate(`/indicators/edit/${ind.id}`)
                          }
                          className="text-foreground"
                        >
                          <Pencil size={14} />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTarget(ind)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 size={14} />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete indicator?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this indicator? This action cannot
              be undone.
              {deleteTarget && (
                <span className="mt-2 block text-foreground font-medium">
                  {deleteTarget.title}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const id = deleteTarget?.id;
                if (id != null) deleteMutation.mutate(id);
                setDeleteTarget(null);
              }}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}

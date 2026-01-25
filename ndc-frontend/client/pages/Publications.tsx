import { MainLayout } from "@/components/MainLayout";
import { Download, Upload } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listPublications, downloadPublication, createPublication } from "@/lib/supabase-api";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";

// Set worker (important!)
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function Publications() {
    const qc = useQueryClient();
    const { data: publications, isLoading } = useQuery({
        queryKey: ["publications"],
        queryFn: listPublications,
    });

    const [uploading, setUploading] = useState(false);

    const uploadMutation = useMutation({
        mutationFn: async (payload: { title: string; filename: string; date?: string; summary?: string; contentBase64: string }) => {
            // Upload file to Supabase Storage
            const filePath = `publications/${Date.now()}_${payload.filename}`;
            const fileBlob = Uint8Array.from(atob(payload.contentBase64), c => c.charCodeAt(0));
            
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('publications')
                .upload(filePath, fileBlob, {
                    contentType: 'application/pdf',
                    upsert: false
                });

            if (uploadError) throw uploadError;

            // Create publication record in database
            const { data: pubData, error: dbError } = await supabase
                .from('publications')
                .insert({
                    title: payload.title,
                    filename: payload.filename,
                    date: payload.date || new Date().toISOString().split('T')[0],
                    summary: payload.summary || null,
                    storage_path: filePath,
                    file_size: fileBlob.length,
                    mime_type: 'application/pdf'
                })
                .select()
                .single();

            if (dbError) throw dbError;
            return pubData;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["publications"] });
        },
    });

    const generateThumbnail = async (file: File): Promise<string | null> => {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const page = await pdf.getPage(1);

            const scale = 1.5;
            const viewport = page.getViewport({ scale });

            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d")!;
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({
                canvasContext: context,
                viewport: viewport,
                canvas: canvas, // ← THIS WAS MISSING!
            }).promise;
            return canvas.toDataURL("image/jpeg", 0.8).split(",")[1]; // base64 without prefix
        } catch (err) {
            console.warn("Could not generate thumbnail:", err);
            return null;
        }
    };

    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !file.type.includes("pdf")) {
            alert("Please upload a PDF file");
            return;
        }

        setUploading(true);

        try {
            const reader = new FileReader();
            reader.onload = async () => {
                const contentBase64 = (reader.result as string).split(",")[1];
                const thumbnailBase64 = await generateThumbnail(file);

                const payload = {
                    title: file.name.replace(/\.pdf$/i, ""),
                    filename: file.name,
                    contentBase64,
                    summary: "Uploaded publication",
                    date: new Date().toISOString().split('T')[0],
                };

                await uploadMutation.mutateAsync(payload);
            };
            reader.readAsDataURL(file);
        } catch (err) {
            alert("Upload failed");
        } finally {
            setUploading(false);
            e.target.value = "";
        }
    };

    const onDownload = async (id: number, filename?: string) => {
        try {
            const blob = await downloadPublication(id);
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename ?? `publication-${id}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
            alert('Failed to download publication. Please try again.');
        }
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Publications</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Research, reports and briefs about water & waste management.
                        </p>
                    </div>

                    <label className="inline-flex items-center gap-2 px-4 py-2 rounded bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 cursor-pointer">
                        {uploading ? "Uploading..." : "Upload PDF"}
                        <Upload size={16} />
                        <input
                            type="file"
                            accept="application/pdf"
                            className="hidden"
                            onChange={onFileChange}
                            disabled={uploading}
                        />
                    </label>
                </div>

                {isLoading ? (
                    <p className="text-sm text-muted-foreground">Loading publications...</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(publications ?? []).map((p: any) => (
                            <div
                                key={p.id}
                                className="bg-card rounded-lg border border-border overflow-hidden shadow-sm hover:shadow transition-shadow"
                            >
                                {p.thumbnailBase64 ? (
                                    <img
                                        src={`data:image/jpeg;base64,${p.thumbnailBase64}`}
                                        alt={p.title}
                                        className="w-full h-48 object-cover"
                                    />
                                ) : (
                                    <div className="bg-muted w-full h-48 flex items-center justify-center">
                                        <span className="text-4xl">PDF</span>
                                    </div>
                                )}

                                <div className="p-4">
                                    <h3 className="font-semibold text-foreground line-clamp-2">{p.title}</h3>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {new Date(p.date).toLocaleDateString()}
                                    </p>
                                    <p className="text-sm text-foreground/80 mt-2 line-clamp-2">{p.summary}</p>

                                    <div className="mt-4 flex items-center justify-between">
                                        <button
                                            onClick={() => onDownload(p.id, p.filename)}
                                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-background text-foreground text-sm border border-border hover:bg-accent"
                                        >
                                            <Download size={14} />
                                            Download
                                        </button>
                                        <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                                            {p.filename}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
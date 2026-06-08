"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { MediaAsset } from "@/types/database";
import { Upload, Search, Trash2, Loader2, ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const sourceLabels = { upload: "Upload", generated: "Gerada", unsplash: "Unsplash" };

export function MediaLibrary({ assets }: { assets: MediaAsset[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState<MediaAsset["source"] | "all">("all");

  const filtered = assets.filter((a) => {
    if (filter !== "all" && a.source !== filter) return false;
    if (search && !a.filename.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    for (const file of acceptedFiles) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch("/api/media/upload", { method: "POST", body: formData });
        if (!res.ok) throw new Error("Upload falhou");
        toast.success(`${file.name} enviado!`);
      } catch {
        toast.error(`Erro ao enviar ${file.name}`);
      }
    }
    setUploading(false);
    router.refresh();
  }, [router]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    maxSize: 10 * 1024 * 1024,
  });

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
        }`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Enviando...</span>
          </div>
        ) : (
          <>
            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm font-medium">
              {isDragActive ? "Solte aqui" : "Arraste imagens ou clique para selecionar"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WEBP até 10MB</p>
          </>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {(["all", "upload", "generated", "unsplash"] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "Todos" : sourceLabels[f]}
            </Button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-sm">Nenhuma imagem encontrada</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filtered.map((asset) => (
            <div key={asset.id} className="group relative aspect-square rounded-lg overflow-hidden bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={asset.cdn_url}
                alt={asset.filename}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                <Badge variant="secondary" className="text-[10px] self-start">
                  {sourceLabels[asset.source]}
                </Badge>
                <p className="text-white text-[10px] truncate">
                  {format(new Date(asset.created_at), "dd/MM/yy", { locale: ptBR })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

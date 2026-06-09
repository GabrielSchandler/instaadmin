"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createScheduledPost } from "../actions";
import type { MediaAsset, InstagramAccount } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  X,
  ChevronUp,
  ChevronDown,
  Plus,
  ImageIcon,
  Loader2,
  CalendarClock,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function NewPostForm({
  assets,
  accounts,
}: {
  assets: MediaAsset[];
  accounts: InstagramAccount[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<MediaAsset[]>([]);
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [scheduledAt, setScheduledAt] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const minDate = new Date(Date.now() + 60_000).toISOString().slice(0, 16);
  const willSchedule = !!(accountId && scheduledAt);

  function toggleImage(asset: MediaAsset) {
    setSelected((prev) => {
      if (prev.find((a) => a.id === asset.id)) {
        return prev.filter((a) => a.id !== asset.id);
      }
      if (prev.length >= 10) {
        toast.warning("Máximo de 10 imagens por carrossel");
        return prev;
      }
      return [...prev, asset];
    });
  }

  function moveUp(i: number) {
    if (i === 0) return;
    setSelected((prev) => {
      const arr = [...prev];
      [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
      return arr;
    });
  }

  function moveDown(i: number) {
    setSelected((prev) => {
      if (i === prev.length - 1) return prev;
      const arr = [...prev];
      [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
      return arr;
    });
  }

  function addTag(e?: React.KeyboardEvent) {
    if (e && e.key !== "Enter" && e.key !== ",") return;
    e?.preventDefault();
    const tag = tagInput.replace(/^#/, "").replace(/\s+/g, "").trim();
    if (tag && !hashtags.includes(tag)) setHashtags((p) => [...p, tag]);
    setTagInput("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) { setFormError("Título é obrigatório"); return; }
    if (selected.length < 2) { setFormError("Selecione pelo menos 2 imagens"); return; }

    const fd = new FormData();
    fd.append("title", title);
    fd.append("caption", caption);
    fd.append("hashtags", JSON.stringify(hashtags));
    fd.append("imageUrls", JSON.stringify(selected.map((a) => a.cdn_url)));
    fd.append("instagram_account_id", accountId);
    fd.append(
      "scheduled_at",
      scheduledAt ? new Date(scheduledAt).toISOString() : ""
    );

    startTransition(async () => {
      const result = await createScheduledPost(fd);
      if (result?.error) {
        setFormError(result.error);
        toast.error(result.error);
      } else if (result?.postId) {
        toast.success(willSchedule ? "Post agendado!" : "Rascunho salvo!");
        router.push(`/posts/${result.postId}`);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {formError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {formError}
        </div>
      )}

      {/* ── Image picker ─────────────────────────────────── */}
      <div className="space-y-3">
        <div>
          <Label className="text-base font-semibold">Imagens do carrossel</Label>
          <p className="text-sm text-muted-foreground mt-0.5">
            Selecione 2–10 imagens da biblioteca. Passe o mouse sobre as selecionadas para reordenar.
          </p>
        </div>

        {/* Selected strip */}
        {selected.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {selected.map((img, i) => (
              <div key={img.id} className="relative flex-shrink-0 w-20 group">
                <div className="aspect-square rounded-lg overflow-hidden border-2 border-primary">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.cdn_url} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {i + 1}
                </div>
                <div className="absolute top-1 right-1 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => moveUp(i)}
                    disabled={i === 0}
                    className="bg-black/70 text-white rounded p-0.5 disabled:opacity-30"
                  >
                    <ChevronUp className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveDown(i)}
                    disabled={i === selected.length - 1}
                    className="bg-black/70 text-white rounded p-0.5 disabled:opacity-30"
                  >
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => toggleImage(img)}
                  className="absolute bottom-1 right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Library grid */}
        {assets.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
              <ImageIcon className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm font-medium">Nenhuma imagem na biblioteca</p>
              <p className="text-xs text-muted-foreground mt-1">
                Faça upload em{" "}
                <a href="/media" className="underline text-primary">
                  Mídia
                </a>{" "}
                primeiro.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="border rounded-lg p-3 max-h-64 overflow-y-auto">
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {assets.map((asset) => {
                const pos = selected.findIndex((a) => a.id === asset.id);
                const isSelected = pos !== -1;
                return (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => toggleImage(asset)}
                    className={cn(
                      "relative aspect-square rounded-md overflow-hidden border-2 transition-all focus:outline-none",
                      isSelected
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-transparent hover:border-primary/40"
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={asset.cdn_url} alt={asset.filename} className="w-full h-full object-cover" />
                    {isSelected && (
                      <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                        <span className="bg-primary text-primary-foreground text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                          {pos + 1}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          {selected.length}/10 selecionadas
          {selected.length === 1 && " · Selecione pelo menos 2 para publicar"}
        </p>
      </div>

      {/* ── Title ────────────────────────────────────────── */}
      <div className="space-y-2">
        <Label htmlFor="title">
          Título <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: 5 dicas de marketing digital"
        />
      </div>

      {/* ── Caption ──────────────────────────────────────── */}
      <div className="space-y-2">
        <Label htmlFor="caption">Legenda</Label>
        <Textarea
          id="caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Escreva a legenda do post..."
          rows={4}
        />
      </div>

      {/* ── Hashtags ─────────────────────────────────────── */}
      <div className="space-y-2">
        <Label>Hashtags</Label>
        <div className="flex gap-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={addTag}
            placeholder="marketing (Enter para adicionar)"
          />
          <Button type="button" variant="outline" size="icon" onClick={() => addTag()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {hashtags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="cursor-pointer gap-1"
                onClick={() => setHashtags((p) => p.filter((t) => t !== tag))}
              >
                #{tag}
                <X className="h-3 w-3" />
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* ── Schedule ─────────────────────────────────────── */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Agendamento</Label>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="account">Conta do Instagram</Label>
            {accounts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                <a href="/instagram" className="underline text-primary">
                  Conecte uma conta
                </a>{" "}
                para agendar publicações.
              </p>
            ) : (
              <Select value={accountId} onValueChange={(v) => setAccountId(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      @{acc.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="scheduled_at">Data e hora</Label>
            <Input
              id="scheduled_at"
              type="datetime-local"
              value={scheduledAt}
              min={minDate}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
          </div>
        </div>
        <p className={cn("text-xs", willSchedule ? "text-green-600 dark:text-green-400" : "text-muted-foreground")}>
          {willSchedule
            ? "O post será publicado automaticamente na data e hora selecionadas."
            : "Sem conta ou data preenchidos, o post será salvo como rascunho."}
        </p>
      </div>

      {/* ── Actions ──────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/posts")}
          disabled={isPending}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending || selected.length < 2}>
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : willSchedule ? (
            <>
              <CalendarClock className="h-4 w-4 mr-2" />
              Agendar publicação
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Salvar rascunho
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

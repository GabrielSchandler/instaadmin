"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import type { CarouselPost, CarouselSlide } from "@/types/database";
import { Sparkles, Loader2, Image as ImageIcon, Hash } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Props {
  post: CarouselPost;
  slides: CarouselSlide[];
}

const statusLabels: Record<string, string> = {
  draft: "Rascunho", pending: "Pendente", scheduled: "Agendado",
  published: "Publicado", failed: "Falhou", cancelled: "Cancelado",
};
const statusVariants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  draft: "secondary", pending: "outline", scheduled: "default",
  published: "default", failed: "destructive", cancelled: "secondary",
};

export function PostDetail({ post, slides }: Props) {
  const router = useRouter();
  const [rendering, setRendering] = useState(false);
  const [renderedSlides, setRenderedSlides] = useState<Record<string, string>>(
    Object.fromEntries(slides.filter((s) => s.image_url).map((s) => [s.id, s.image_url!]))
  );

  async function renderAllSlides() {
    setRendering(true);
    toast.info("Renderizando slides...");

    for (const slide of slides) {
      if (renderedSlides[slide.id]) continue;
      try {
        const res = await fetch("/api/render/slide", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slide_id: slide.id, post_id: post.id }),
        });
        const json = await res.json();
        if (res.ok) {
          setRenderedSlides((prev) => ({ ...prev, [slide.id]: json.data.image_url }));
        }
      } catch {
        toast.error(`Erro ao renderizar slide ${slide.position}`);
      }
    }

    setRendering(false);
    toast.success("Slides renderizados!");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold">{post.title}</h1>
            <Badge variant={statusVariants[post.status]}>
              {statusLabels[post.status]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Criado em {format(new Date(post.created_at), "dd 'de' MMMM yyyy", { locale: ptBR })}
          </p>
        </div>
        <Button onClick={renderAllSlides} disabled={rendering}>
          {rendering ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
          {rendering ? "Renderizando..." : "Gerar Imagens"}
        </Button>
      </div>

      <Tabs defaultValue="slides">
        <TabsList>
          <TabsTrigger value="slides">
            <ImageIcon className="h-4 w-4 mr-2" /> Slides ({slides.length})
          </TabsTrigger>
          <TabsTrigger value="caption">
            <Hash className="h-4 w-4 mr-2" /> Legenda
          </TabsTrigger>
        </TabsList>

        <TabsContent value="slides" className="mt-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {slides.map((slide) => (
              <Card key={slide.id} className="overflow-hidden">
                <div className="aspect-square bg-muted relative">
                  {renderedSlides[slide.id] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={renderedSlides[slide.id]}
                      alt={`Slide ${slide.position}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                      <ImageIcon className="h-8 w-8 opacity-30" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                    {slide.position}
                  </div>
                </div>
                <CardContent className="p-3">
                  <p className="text-xs font-medium truncate">{slide.headline ?? "—"}</p>
                  <p className="text-xs text-muted-foreground capitalize">{slide.slide_type}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="caption" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Legenda</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{post.caption}</p>
              <Separator />
              <div className="flex flex-wrap gap-1">
                {post.hashtags?.map((tag) => (
                  <span key={tag} className="text-xs text-primary">#{tag}</span>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { CarouselPost, CarouselSlide } from "@/types/database";
import { Image as ImageIcon, Hash, CalendarClock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Props {
  post: CarouselPost;
  slides: CarouselSlide[];
}

const statusLabels: Record<string, string> = {
  draft: "Rascunho",
  pending: "Pendente",
  scheduled: "Agendado",
  published: "Publicado",
  failed: "Falhou",
  cancelled: "Cancelado",
};
const statusVariants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  draft: "secondary",
  pending: "outline",
  scheduled: "default",
  published: "default",
  failed: "destructive",
  cancelled: "secondary",
};

export function PostDetail({ post, slides }: Props) {
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
          {post.scheduled_at && (
            <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
              <CalendarClock className="h-3.5 w-3.5" />
              Publicação agendada para{" "}
              {format(new Date(post.scheduled_at), "dd 'de' MMMM yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
          )}
        </div>
      </div>

      <Tabs defaultValue="slides">
        <TabsList>
          <TabsTrigger value="slides">
            <ImageIcon className="h-4 w-4 mr-2" />
            Slides ({slides.length})
          </TabsTrigger>
          <TabsTrigger value="caption">
            <Hash className="h-4 w-4 mr-2" />
            Legenda
          </TabsTrigger>
        </TabsList>

        <TabsContent value="slides" className="mt-4">
          {slides.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
              <ImageIcon className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-sm">Nenhuma imagem neste post.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {slides.map((slide) => (
                <Card key={slide.id} className="overflow-hidden">
                  <div className="aspect-square bg-muted relative">
                    {slide.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={slide.image_url}
                        alt={`Slide ${slide.position}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <ImageIcon className="h-8 w-8 opacity-30" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                      {slide.position}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="caption" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Legenda</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {post.caption ? (
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{post.caption}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">Sem legenda.</p>
              )}
              {post.hashtags?.length > 0 && (
                <>
                  <Separator />
                  <div className="flex flex-wrap gap-1">
                    {post.hashtags.map((tag) => (
                      <span key={tag} className="text-xs text-primary">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

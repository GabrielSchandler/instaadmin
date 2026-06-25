"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Download,
  Copy,
  Check,
  Images,
  Clapperboard,
  Inbox,
} from "lucide-react";

export interface Entrega {
  slug: string;
  titulo: string;
  data: string;
  legenda: string;
  slides: string[];
  story?: string | null;
}

async function baixarArquivo(url: string, nome: string) {
  // Busca como blob pra forçar o "salvar" em vez de abrir (importante no celular)
  const res = await fetch(url);
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objectUrl);
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function EntregaCard({ entrega }: { entrega: Entrega }) {
  const [copiado, setCopiado] = useState(false);
  const [baixandoTodos, setBaixandoTodos] = useState(false);

  async function copiarLegenda() {
    try {
      await navigator.clipboard.writeText(entrega.legenda);
    } catch {
      // fallback pra navegadores sem clipboard API
      const ta = document.createElement("textarea");
      ta.value = entrega.legenda;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  async function baixarTodos() {
    setBaixandoTodos(true);
    for (let i = 0; i < entrega.slides.length; i++) {
      const nome = `${entrega.slug}-slide-${String(i + 1).padStart(2, "0")}.png`;
      await baixarArquivo(entrega.slides[i], nome);
      await delay(400); // espaça pra o celular não bloquear downloads em sequência
    }
    setBaixandoTodos(false);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base leading-snug">{entrega.titulo}</CardTitle>
          <Badge variant="secondary" className="shrink-0">
            {entrega.data}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Slides */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
            <Images className="h-3.5 w-3.5" />
            Slides ({entrega.slides.length})
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {entrega.slides.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() =>
                  baixarArquivo(
                    src,
                    `${entrega.slug}-slide-${String(i + 1).padStart(2, "0")}.png`
                  )
                }
                className="group relative aspect-[4/5] rounded-md overflow-hidden border border-border bg-muted"
                title={`Baixar slide ${i + 1}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Slide ${i + 1}`}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {i + 1}
                </span>
                <span className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors">
                  <Download className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Story */}
        {entrega.story && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
              <Clapperboard className="h-3.5 w-3.5" />
              Story
            </p>
            <button
              type="button"
              onClick={() =>
                baixarArquivo(entrega.story!, `${entrega.slug}-story.png`)
              }
              className="group relative w-24 aspect-[9/16] rounded-md overflow-hidden border border-border bg-muted"
              title="Baixar story"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={entrega.story}
                alt="Story"
                className="w-full h-full object-cover"
              />
              <span className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors">
                <Download className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </span>
            </button>
          </div>
        )}

        {/* Ações */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={baixarTodos} disabled={baixandoTodos} size="sm">
            <Download className="h-4 w-4 mr-1.5" />
            {baixandoTodos ? "Baixando..." : "Baixar todos os slides"}
          </Button>
          {entrega.story && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                baixarArquivo(entrega.story!, `${entrega.slug}-story.png`)
              }
            >
              <Clapperboard className="h-4 w-4 mr-1.5" />
              Baixar story
            </Button>
          )}
        </div>

        <Separator />

        {/* Legenda */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground">Legenda</p>
            <Button variant="ghost" size="sm" onClick={copiarLegenda}>
              {copiado ? (
                <>
                  <Check className="h-4 w-4 mr-1.5 text-green-600" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1.5" />
                  Copiar legenda
                </>
              )}
            </Button>
          </div>
          <textarea
            readOnly
            value={entrega.legenda}
            rows={8}
            onFocus={(e) => e.currentTarget.select()}
            className="w-full resize-y rounded-md border border-border bg-muted/40 p-3 text-sm leading-relaxed font-mono"
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function EntregasList({ entregas }: { entregas: Entrega[] }) {
  if (entregas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
        <Inbox className="h-12 w-12 mb-3 opacity-30" />
        <p className="text-sm">Nenhuma entrega ainda.</p>
        <p className="text-xs mt-1">
          Os carrosséis gerados aparecem aqui prontos para baixar.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {entregas.map((entrega) => (
        <EntregaCard key={entrega.slug} entrega={entrega} />
      ))}
    </div>
  );
}

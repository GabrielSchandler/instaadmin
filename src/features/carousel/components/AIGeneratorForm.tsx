"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, CheckCircle2 } from "lucide-react";

const schema = z.object({
  topic: z.string().min(5, "Descreva o tema com pelo menos 5 caracteres"),
  tone: z.enum(["professional", "casual", "motivational", "educational", "humorous"]),
  slide_count: z.number().min(4).max(10),
});

type FormData = z.infer<typeof schema>;

const toneLabels = {
  professional: "Profissional",
  casual: "Casual",
  motivational: "Motivacional",
  educational: "Educacional",
  humorous: "Humorístico",
};

const steps = [
  "Analisando tema...",
  "Gerando conteúdo...",
  "Selecionando template...",
  "Organizando slides...",
  "Finalizando...",
];

export function AIGeneratorForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { tone: "professional", slide_count: 7 },
  });

  async function onSubmit(data: FormData) {
    setLoading(true);
    setStep(0);

    // Simulate step progression
    const stepInterval = setInterval(() => {
      setStep((s) => Math.min(s + 1, steps.length - 1));
    }, 800);

    try {
      const res = await fetch("/api/ai/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      clearInterval(stepInterval);

      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Erro ao gerar conteúdo");

      setDone(true);
      toast.success("Carrossel gerado com sucesso!");

      setTimeout(() => router.push(`/posts/${json.data.post_id}`), 1000);
    } catch (err) {
      clearInterval(stepInterval);
      toast.error(err instanceof Error ? err.message : "Erro inesperado");
      setLoading(false);
    }
  }

  if (done) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center gap-4">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
          <h3 className="font-semibold text-lg">Carrossel gerado!</h3>
          <p className="text-muted-foreground text-sm">Redirecionando para o editor...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="topic">Tema do carrossel *</Label>
            <Textarea
              id="topic"
              rows={4}
              placeholder="Ex: 5 hábitos matinais que mudaram minha produtividade como empreendedor..."
              {...register("topic")}
            />
            {errors.topic && <p className="text-sm text-destructive">{errors.topic.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tom do conteúdo</Label>
              <Select
                defaultValue="professional"
                onValueChange={(v) => setValue("tone", v as FormData["tone"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(toneLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Número de slides</Label>
              <Select
                defaultValue="7"
                onValueChange={(v) => setValue("slide_count", Number(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <SelectItem key={n} value={String(n)}>{n} slides</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground animate-pulse">{steps[step]}</p>
            </div>
          ) : (
            <Button type="submit" className="w-full" size="lg">
              <Sparkles className="h-4 w-4 mr-2" />
              Gerar Carrossel com IA
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

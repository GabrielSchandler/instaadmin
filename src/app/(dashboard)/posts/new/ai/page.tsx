import { AIGeneratorForm } from "@/features/carousel/components/AIGeneratorForm";

export default function NewAIPostPage() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Gerar Carrossel com IA</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Descreva o tema e a IA criará o conteúdo completo automaticamente.
        </p>
      </div>
      <AIGeneratorForm />
    </div>
  );
}

import entregas from "@/data/entregas.json";
import {
  EntregasList,
  type Entrega,
} from "@/features/entregas/components/EntregasList";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { sair } from "./login/actions";

export default function HomePage() {
  const lista = entregas as Entrega[];

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Entregas</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {lista.length}{" "}
            {lista.length === 1 ? "carrossel pronto" : "carrosséis prontos"} para
            baixar e postar
          </p>
        </div>
        <form action={sair}>
          <Button variant="ghost" size="sm" type="submit">
            <LogOut className="h-4 w-4 mr-1.5" />
            Sair
          </Button>
        </form>
      </div>

      <EntregasList entregas={lista} />
    </div>
  );
}

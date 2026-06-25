import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import entregas from "@/data/entregas.json";
import { EntregasList, type Entrega } from "@/features/entregas/components/EntregasList";

export const metadata = { title: "Entregas" };

export default async function EntregasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const lista = entregas as Entrega[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Entregas</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {lista.length}{" "}
          {lista.length === 1 ? "carrossel pronto" : "carrosséis prontos"} para
          baixar e postar
        </p>
      </div>
      <EntregasList entregas={lista} />
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { GenerationLog } from "@/types/database";

const operationLabels: Record<string, string> = {
  content: "Geração de conteúdo",
  template_select: "Seleção de template",
  render: "Renderização",
  publish: "Publicação",
};

export default async function LogsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: logs } = await supabase
    .from("generation_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100) as { data: GenerationLog[] | null };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Logs</h1>
        <p className="text-muted-foreground text-sm mt-1">Histórico de operações do sistema</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {!logs?.length ? (
              <div className="py-12 text-center text-muted-foreground text-sm">
                Nenhum log registrado ainda.
              </div>
            ) : logs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-4 hover:bg-muted/30">
                <div className="flex items-center gap-4">
                  <Badge variant={log.status === "success" ? "default" : "destructive"} className="text-xs">
                    {log.status === "success" ? "✓" : "✗"}
                  </Badge>
                  <div>
                    <p className="text-sm font-medium">{operationLabels[log.operation] ?? log.operation}</p>
                    <p className="text-xs text-muted-foreground">
                      {log.model && `Modelo: ${log.model} · `}
                      {log.prompt_tokens != null && `${log.prompt_tokens + (log.completion_tokens ?? 0)} tokens · `}
                      {log.duration_ms != null && `${log.duration_ms}ms`}
                    </p>
                    {log.error && (
                      <p className="text-xs text-destructive mt-0.5">{log.error}</p>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(log.created_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

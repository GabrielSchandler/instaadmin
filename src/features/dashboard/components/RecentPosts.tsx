import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { CarouselPost } from "@/types/database";

const statusColors: Record<string, string> = {
  draft:     "secondary",
  pending:   "outline",
  scheduled: "default",
  published: "default",
  failed:    "destructive",
  cancelled: "secondary",
};

const statusLabels: Record<string, string> = {
  draft:     "Rascunho",
  pending:   "Pendente",
  scheduled: "Agendado",
  published: "Publicado",
  failed:    "Falhou",
  cancelled: "Cancelado",
};

export async function RecentPosts({ userId }: { userId: string }) {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("carousel_posts")
    .select("id, title, status, created_at, template_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(5) as {
      data: Pick<CarouselPost, "id" | "title" | "status" | "created_at" | "template_id">[] | null
    };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Posts Recentes</CardTitle>
        <Link href="/posts" className="text-sm text-primary hover:underline">
          Ver todos
        </Link>
      </CardHeader>
      <CardContent>
        {!posts?.length ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Nenhum post criado ainda.{" "}
            <Link href="/posts/new/ai" className="text-primary hover:underline">
              Criar primeiro post
            </Link>
          </p>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/posts/${post.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{post.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {format(new Date(post.created_at), "dd MMM yyyy", { locale: ptBR })}
                  </p>
                </div>
                <Badge variant={statusColors[post.status] as "default" | "secondary" | "outline" | "destructive"}>
                  {statusLabels[post.status] ?? post.status}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

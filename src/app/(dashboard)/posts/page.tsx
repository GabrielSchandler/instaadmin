import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Images } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { CarouselPost } from "@/types/database";

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

export default async function PostsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: posts } = await supabase
    .from("carousel_posts")
    .select("id, title, status, created_at, scheduled_at, hashtags")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false }) as {
    data:
      | Pick<CarouselPost, "id" | "title" | "status" | "created_at" | "scheduled_at" | "hashtags">[]
      | null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Posts</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {posts?.length ?? 0} posts criados
          </p>
        </div>
        <Link href="/posts/new" className={cn(buttonVariants())}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Post
        </Link>
      </div>

      {!posts?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Images className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg">Nenhum post ainda</h3>
            <p className="text-muted-foreground text-sm mt-2 mb-6">
              Faça upload das suas imagens na biblioteca de mídia e crie o primeiro carrossel.
            </p>
            <Link href="/posts/new" className={cn(buttonVariants())}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Novo Post
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.id} href={`/posts/${post.id}`}>
              <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-sm leading-tight line-clamp-2">
                      {post.title}
                    </h3>
                    <Badge
                      variant={statusVariants[post.status]}
                      className="flex-shrink-0 text-xs"
                    >
                      {statusLabels[post.status] ?? post.status}
                    </Badge>
                  </div>
                  {post.hashtags?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {post.hashtags.slice(0, 3).map((tag: string) => (
                        <span key={tag} className="text-xs text-muted-foreground">
                          #{tag}
                        </span>
                      ))}
                      {post.hashtags.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{post.hashtags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {post.status === "scheduled" && post.scheduled_at
                      ? `Agendado para ${format(new Date(post.scheduled_at), "dd MMM yyyy 'às' HH:mm", { locale: ptBR })}`
                      : format(new Date(post.created_at), "dd MMM yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MediaLibrary } from "@/features/media/components/MediaLibrary";
import type { MediaAsset } from "@/types/database";

export default async function MediaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: assets } = await supabase
    .from("media_assets")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false }) as { data: MediaAsset[] | null };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Biblioteca de Mídia</h1>
        <p className="text-muted-foreground text-sm mt-1">{assets?.length ?? 0} arquivos</p>
      </div>
      <MediaLibrary assets={assets ?? []} />
    </div>
  );
}

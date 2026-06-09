import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { NewPostForm } from "@/features/carousel/components/NewPostForm";
import type { MediaAsset, InstagramAccount } from "@/types/database";

export default async function NewPostPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const assetsResult = await supabase
    .from("media_assets")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false }) as { data: MediaAsset[] | null };

  const accountsResult = await supabase
    .from("instagram_accounts")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("created_at") as { data: InstagramAccount[] | null };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Novo Post</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Selecione as imagens da biblioteca, configure a legenda e agende a publicação automática.
        </p>
      </div>
      <NewPostForm
        assets={assetsResult.data ?? []}
        accounts={accountsResult.data ?? []}
      />
    </div>
  );
}

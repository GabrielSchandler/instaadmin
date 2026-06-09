"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createScheduledPost(
  formData: FormData
): Promise<{ error?: string; postId?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const title = (formData.get("title") as string)?.trim();
  const caption = (formData.get("caption") as string)?.trim() ?? "";
  const hashtagsRaw = formData.get("hashtags") as string;
  const imageUrlsRaw = formData.get("imageUrls") as string;
  const instagramAccountId = (formData.get("instagram_account_id") as string)?.trim();
  const scheduledAt = (formData.get("scheduled_at") as string)?.trim();

  if (!title) return { error: "Título é obrigatório" };

  let imageUrls: string[] = [];
  let hashtags: string[] = [];
  try {
    imageUrls = JSON.parse(imageUrlsRaw || "[]");
    hashtags = JSON.parse(hashtagsRaw || "[]");
  } catch {
    return { error: "Dados inválidos" };
  }

  if (imageUrls.length < 2) return { error: "Selecione pelo menos 2 imagens" };
  if (imageUrls.length > 10) return { error: "Máximo de 10 imagens por carrossel" };

  const isScheduled = !!(instagramAccountId && scheduledAt);

  const { data: post, error: postError } = await supabase
    .from("carousel_posts")
    .insert({
      user_id: user.id,
      title,
      caption,
      hashtags,
      status: isScheduled ? "scheduled" : "draft",
      scheduled_at: scheduledAt || null,
    })
    .select("id")
    .single();

  if (postError || !post) return { error: "Erro ao criar post" };

  const slides = imageUrls.map((url, index) => ({
    post_id: post.id,
    position: index + 1,
    slide_type: "content" as const,
    image_url: url,
  }));

  const { error: slidesError } = await supabase
    .from("carousel_slides")
    .insert(slides);

  if (slidesError) return { error: "Erro ao salvar slides" };

  if (isScheduled) {
    await supabase.from("scheduled_posts").insert({
      post_id: post.id,
      instagram_account_id: instagramAccountId,
      scheduled_at: scheduledAt,
      status: "pending",
    });
  }

  revalidatePath("/posts");
  revalidatePath("/calendar");
  return { postId: post.id };
}

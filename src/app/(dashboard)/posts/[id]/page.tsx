import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { PostDetail } from "@/features/carousel/components/PostDetail";

interface Props { params: Promise<{ id: string }> }

export default async function PostDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: post } = await supabase
    .from("carousel_posts")
    .select("*, carousel_slides(*)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!post) notFound();

  const slides = (post.carousel_slides as { position: number }[]).sort(
    (a, b) => a.position - b.position
  );

  return <PostDetail post={post} slides={slides} />;
}

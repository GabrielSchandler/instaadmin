import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { PostDetail } from "@/features/carousel/components/PostDetail";
import type { CarouselPost, CarouselSlide } from "@/types/database";

interface Props { params: Promise<{ id: string }> }

type PostWithSlides = CarouselPost & { carousel_slides: CarouselSlide[] };

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
    .single() as { data: PostWithSlides | null };

  if (!post) notFound();

  const slides = [...post.carousel_slides].sort((a, b) => a.position - b.position);

  return <PostDetail post={post} slides={slides} />;
}

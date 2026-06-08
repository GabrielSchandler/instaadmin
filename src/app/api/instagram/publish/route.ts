import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  uploadMediaContainer,
  createCarouselContainer,
  publishCarousel,
} from "@/features/instagram/services/graph-api";
import { logger } from "@/lib/logger";
import { z } from "zod";

const schema = z.object({
  post_id: z.string().uuid(),
  instagram_account_id: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Validation error" }, { status: 400 });

    const { post_id, instagram_account_id } = parsed.data;

    // Get post with slides
    const { data: post } = await supabase
      .from("carousel_posts")
      .select("*, carousel_slides(*)")
      .eq("id", post_id)
      .eq("user_id", user.id)
      .single();

    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    // Get IG account
    const { data: igAccount } = await supabase
      .from("instagram_accounts")
      .select("*")
      .eq("id", instagram_account_id)
      .eq("user_id", user.id)
      .single();

    if (!igAccount) return NextResponse.json({ error: "Instagram account not found" }, { status: 404 });

    const slides = (post.carousel_slides as { position: number; image_url: string | null }[])
      .sort((a, b) => a.position - b.position)
      .filter((s) => s.image_url);

    if (slides.length < 2) {
      return NextResponse.json({ error: "Need at least 2 rendered slides to publish" }, { status: 400 });
    }

    // Upload each image as container
    const containerIds: string[] = [];
    for (const slide of slides) {
      const containerId = await uploadMediaContainer(
        igAccount.ig_user_id,
        igAccount.access_token,
        slide.image_url!
      );
      containerIds.push(containerId);
    }

    // Create carousel container
    const caption = [post.caption, "", ...(post.hashtags ?? []).map((h: string) => `#${h}`)].join("\n");
    const carouselId = await createCarouselContainer(
      igAccount.ig_user_id,
      igAccount.access_token,
      containerIds,
      caption
    );

    // Publish
    const result = await publishCarousel(igAccount.ig_user_id, igAccount.access_token, carouselId);

    // Update post
    await supabase
      .from("carousel_posts")
      .update({
        status: "published",
        ig_media_id: result.id,
        ig_permalink: result.permalink,
        published_at: new Date().toISOString(),
      })
      .eq("id", post_id);

    // Log
    await supabase.from("generation_logs").insert({
      user_id: user.id,
      post_id,
      operation: "publish",
      status: "success",
    });

    return NextResponse.json({ data: { ig_media_id: result.id, ig_permalink: result.permalink } });
  } catch (err) {
    logger.error("Publish failed", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

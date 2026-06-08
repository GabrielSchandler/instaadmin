import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import {
  uploadMediaContainer,
  createCarouselContainer,
  publishCarousel,
} from "@/features/instagram/services/graph-api";
import { logger } from "@/lib/logger";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createAdminClient();
  const now = new Date().toISOString();

  // Get due scheduled posts
  const { data: due } = await supabase
    .from("scheduled_posts")
    .select("*, carousel_posts(*, carousel_slides(*)), instagram_accounts(*)")
    .eq("status", "pending")
    .lte("scheduled_at", now)
    .lt("attempts", 3);

  if (!due?.length) {
    return NextResponse.json({ message: "No posts due", processed: 0 });
  }

  let processed = 0;
  let failed = 0;

  for (const schedule of due) {
    const post = schedule.carousel_posts as typeof schedule.carousel_posts & { carousel_slides: { position: number; image_url: string | null }[] };
    const igAccount = schedule.instagram_accounts as typeof schedule.instagram_accounts & { ig_user_id: string; access_token: string };

    await supabase
      .from("scheduled_posts")
      .update({ status: "processing", last_attempt_at: now, attempts: (schedule.attempts ?? 0) + 1 })
      .eq("id", schedule.id);

    try {
      const slides = (post.carousel_slides ?? [])
        .sort((a, b) => a.position - b.position)
        .filter((s) => s.image_url);

      if (slides.length < 2) throw new Error("Not enough rendered slides");

      const containerIds: string[] = [];
      for (const slide of slides) {
        const id = await uploadMediaContainer(igAccount.ig_user_id, igAccount.access_token, slide.image_url!);
        containerIds.push(id);
      }

      const caption = [(post.caption ?? ""), "", ...(post.hashtags ?? []).map((h: string) => `#${h}`)].join("\n");
      const carouselId = await createCarouselContainer(igAccount.ig_user_id, igAccount.access_token, containerIds, caption);
      const result = await publishCarousel(igAccount.ig_user_id, igAccount.access_token, carouselId);

      await Promise.all([
        supabase.from("scheduled_posts").update({ status: "done" }).eq("id", schedule.id),
        supabase.from("carousel_posts").update({
          status: "published",
          ig_media_id: result.id,
          ig_permalink: result.permalink,
          published_at: now,
        }).eq("id", post.id),
        supabase.from("generation_logs").insert({
          user_id: post.user_id,
          post_id: post.id,
          operation: "publish",
          status: "success",
        }),
      ]);

      processed++;
      logger.info("Scheduled post published", { post_id: post.id });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      logger.error("Scheduled publish failed", { post_id: post.id, err });

      await supabase.from("scheduled_posts").update({
        status: (schedule.attempts ?? 0) + 1 >= 3 ? "failed" : "pending",
        error_message: errorMsg,
      }).eq("id", schedule.id);

      await supabase.from("carousel_posts").update({ status: "failed" }).eq("id", post.id);
      failed++;
    }
  }

  return NextResponse.json({ message: "Done", processed, failed });
}

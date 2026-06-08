import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateCarouselContent } from "@/features/carousel/services/content-generator";
import { checkRateLimit } from "@/lib/rate-limiter";
import { logger } from "@/lib/logger";
import { z } from "zod";

const schema = z.object({
  topic: z.string().min(3).max(200),
  tone: z.enum(["professional", "casual", "motivational", "educational", "humorous"]).default("professional"),
  slide_count: z.number().int().min(4).max(10).default(7),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const rateLimit = checkRateLimit(`ai:${user.id}`, 10, 60_000);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { topic, tone, slide_count } = parsed.data;
    const startTime = Date.now();

    const carousel = await generateCarouselContent(topic, tone, slide_count);

    // Save post as draft
    const { data: post, error: postError } = await supabase
      .from("carousel_posts")
      .insert({
        user_id: user.id,
        title: carousel.title,
        caption: carousel.caption,
        hashtags: carousel.hashtags,
        template_id: carousel.template_id,
        status: "draft",
        generation_prompt: topic,
        ai_metadata: carousel.ai_metadata,
      })
      .select()
      .single();

    if (postError) throw postError;

    // Save slides
    const slidesData = carousel.slides.map((s) => ({
      post_id: post.id,
      position: s.position,
      slide_type: s.slide_type,
      headline: s.headline,
      subheadline: s.subheadline,
      body: s.body,
      cta_text: s.cta_text,
    }));

    const { error: slidesError } = await supabase.from("carousel_slides").insert(slidesData);
    if (slidesError) throw slidesError;

    // Log generation
    await supabase.from("generation_logs").insert({
      user_id: user.id,
      post_id: post.id,
      operation: "content",
      model: carousel.ai_metadata.model,
      prompt_tokens: carousel.ai_metadata.prompt_tokens,
      completion_tokens: carousel.ai_metadata.completion_tokens,
      duration_ms: Date.now() - startTime,
      status: "success",
    });

    return NextResponse.json({ data: { post_id: post.id, ...carousel } });
  } catch (err) {
    logger.error("Content generation failed", err);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}

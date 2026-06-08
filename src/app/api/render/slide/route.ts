import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { renderSlideToBuffer } from "@/features/carousel/services/slide-renderer";
import { getTemplate } from "@/features/templates/registry";
import { logger } from "@/lib/logger";
import { z } from "zod";

const schema = z.object({
  slide_id: z.string().uuid(),
  post_id: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Validation error" }, { status: 400 });

    const { slide_id, post_id } = parsed.data;

    // Get post + slide
    const { data: post } = await supabase
      .from("carousel_posts")
      .select("template_id")
      .eq("id", post_id)
      .eq("user_id", user.id)
      .single();

    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    const { data: slide } = await supabase
      .from("carousel_slides")
      .select("*")
      .eq("id", slide_id)
      .eq("post_id", post_id)
      .single();

    if (!slide) return NextResponse.json({ error: "Slide not found" }, { status: 404 });

    const { count: totalSlides } = await supabase
      .from("carousel_slides")
      .select("id", { count: "exact", head: true })
      .eq("post_id", post_id);

    const template = getTemplate(post.template_id ?? "premium-black");
    const pngBuffer = await renderSlideToBuffer(slide, template, totalSlides ?? 7);

    // Upload to Supabase Storage
    const path = `generated/${user.id}/${post_id}/${slide.position}.png`;
    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(path, pngBuffer, { contentType: "image/png", upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(path);

    // Update slide with image URL
    await supabase
      .from("carousel_slides")
      .update({ image_url: publicUrl, rendered_at: new Date().toISOString() })
      .eq("id", slide_id);

    // Save as media asset
    await supabase.from("media_assets").upsert({
      user_id: user.id,
      filename: `${post_id}-slide-${slide.position}.png`,
      original_url: publicUrl,
      cdn_url: publicUrl,
      mime_type: "image/png",
      size_bytes: pngBuffer.length,
      width: 1080,
      height: 1080,
      source: "generated",
    });

    return NextResponse.json({ data: { image_url: publicUrl } });
  } catch (err) {
    logger.error("Render API failed", err);
    return NextResponse.json({ error: "Render failed" }, { status: 500 });
  }
}

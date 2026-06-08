import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import sharp from "sharp";
import { logger } from "@/lib/logger";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Only JPG, PNG, WEBP allowed" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Process with Sharp: normalize to 1080x1080, optimize
    const image = sharp(buffer);
    const metadata = await image.metadata();

    const processed = await image
      .resize(1080, 1080, { fit: "cover", position: "center" })
      .png({ quality: 90 })
      .toBuffer();

    const now = new Date();
    const datePath = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")}`;
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const path = `uploads/${user.id}/${datePath}/${filename}`;

    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(path, processed, { contentType: "image/png", upsert: false });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(path);

    const { data: asset } = await supabase
      .from("media_assets")
      .insert({
        user_id: user.id,
        filename,
        original_url: publicUrl,
        cdn_url: publicUrl,
        mime_type: "image/png",
        size_bytes: processed.length,
        width: metadata.width ?? 1080,
        height: metadata.height ?? 1080,
        source: "upload",
      })
      .select()
      .single();

    return NextResponse.json({ data: asset });
  } catch (err) {
    logger.error("Upload failed", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

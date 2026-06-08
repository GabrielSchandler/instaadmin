import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { exchangeCodeForToken, buildOAuthUrl } from "@/features/instagram/services/graph-api";
import { logger } from "@/lib/logger";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL("/instagram?error=access_denied", req.url));
  }

  // First call — redirect to IG OAuth
  if (!code) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.redirect(new URL("/login", req.url));

    const oauthUrl = buildOAuthUrl(user.id);
    return NextResponse.redirect(oauthUrl);
  }

  // Callback with code
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== state) {
      return NextResponse.redirect(new URL("/instagram?error=invalid_state", req.url));
    }

    const { access_token, user_id } = await exchangeCodeForToken(code);

    // Get IG username
    const profileRes = await fetch(
      `https://graph.instagram.com/v21.0/${user_id}?fields=username&access_token=${access_token}`
    );
    const profile = await profileRes.json();

    await supabase.from("instagram_accounts").upsert({
      user_id: user.id,
      ig_user_id: user_id,
      username: profile.username ?? user_id,
      access_token,
      is_active: true,
    }, { onConflict: "ig_user_id" });

    return NextResponse.redirect(new URL("/instagram?success=connected", req.url));
  } catch (err) {
    logger.error("Instagram auth failed", err);
    return NextResponse.redirect(new URL("/instagram?error=auth_failed", req.url));
  }
}

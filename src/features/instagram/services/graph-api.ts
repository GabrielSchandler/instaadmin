import { logger } from "@/lib/logger";

const IG_API_BASE = "https://graph.instagram.com/v21.0";

export interface IGMediaContainer {
  id: string;
}

export interface IGPublishResult {
  id: string;
  permalink?: string;
}

export async function uploadMediaContainer(
  igUserId: string,
  accessToken: string,
  imageUrl: string,
  isCarouselItem = true
): Promise<string> {
  const url = `${IG_API_BASE}/${igUserId}/media`;
  const params = new URLSearchParams({
    image_url: imageUrl,
    is_carousel_item: String(isCarouselItem),
    access_token: accessToken,
  });

  const res = await fetch(`${url}?${params}`, { method: "POST" });
  const json = await res.json();

  if (!res.ok || json.error) {
    logger.error("IG upload container failed", json);
    throw new Error(json.error?.message ?? "Failed to upload media container");
  }

  return json.id;
}

export async function createCarouselContainer(
  igUserId: string,
  accessToken: string,
  containerIds: string[],
  caption: string
): Promise<string> {
  const url = `${IG_API_BASE}/${igUserId}/media`;
  const params = new URLSearchParams({
    media_type: "CAROUSEL",
    children: containerIds.join(","),
    caption,
    access_token: accessToken,
  });

  const res = await fetch(`${url}?${params}`, { method: "POST" });
  const json = await res.json();

  if (!res.ok || json.error) {
    logger.error("IG carousel container failed", json);
    throw new Error(json.error?.message ?? "Failed to create carousel container");
  }

  return json.id;
}

export async function publishCarousel(
  igUserId: string,
  accessToken: string,
  carouselId: string
): Promise<IGPublishResult> {
  const url = `${IG_API_BASE}/${igUserId}/media_publish`;
  const params = new URLSearchParams({
    creation_id: carouselId,
    access_token: accessToken,
  });

  const res = await fetch(`${url}?${params}`, { method: "POST" });
  const json = await res.json();

  if (!res.ok || json.error) {
    logger.error("IG publish failed", json);
    throw new Error(json.error?.message ?? "Failed to publish carousel");
  }

  // Get permalink
  const mediaRes = await fetch(
    `${IG_API_BASE}/${json.id}?fields=permalink&access_token=${accessToken}`
  );
  const mediaJson = await mediaRes.json();

  return { id: json.id, permalink: mediaJson.permalink };
}

export function buildOAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.INSTAGRAM_APP_ID!,
    redirect_uri: process.env.INSTAGRAM_REDIRECT_URI!,
    scope: "instagram_business_basic,instagram_business_content_publish",
    response_type: "code",
    state,
  });
  return `https://www.instagram.com/oauth/authorize?${params}`;
}

export async function exchangeCodeForToken(code: string): Promise<{
  access_token: string;
  user_id: string;
}> {
  const params = new URLSearchParams({
    client_id: process.env.INSTAGRAM_APP_ID!,
    client_secret: process.env.INSTAGRAM_APP_SECRET!,
    grant_type: "authorization_code",
    redirect_uri: process.env.INSTAGRAM_REDIRECT_URI!,
    code,
  });

  const res = await fetch("https://api.instagram.com/oauth/access_token", {
    method: "POST",
    body: params,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error_message ?? json.error?.message ?? "Token exchange failed");

  // Exchange short-lived token for long-lived token (valid 60 days)
  const longLivedRes = await fetch(
    `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${process.env.INSTAGRAM_APP_SECRET}&access_token=${json.access_token}`
  );
  const longLived = await longLivedRes.json();

  const finalToken = longLived.access_token ?? json.access_token;
  return { access_token: finalToken, user_id: String(json.user_id) };
}

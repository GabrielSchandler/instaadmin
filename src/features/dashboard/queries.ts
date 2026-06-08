import { createClient } from "@/lib/supabase/server";
import type { KPIData, ChartDataPoint } from "@/types/global";

export async function getDashboardKPIs(userId: string): Promise<KPIData> {
  const supabase = await createClient();

  const [generated, published, scheduled, pending, images] = await Promise.all([
    supabase.from("carousel_posts").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("carousel_posts").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "published"),
    supabase.from("carousel_posts").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "scheduled"),
    supabase.from("carousel_posts").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "pending"),
    supabase.from("media_assets").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("source", "generated"),
  ]);

  const generatedCount = generated.count ?? 0;
  const publishedCount = published.count ?? 0;

  return {
    generated: generatedCount,
    published: publishedCount,
    scheduled: scheduled.count ?? 0,
    pending: pending.count ?? 0,
    approvalRate: generatedCount > 0 ? Math.round((publishedCount / generatedCount) * 100) : 0,
    imagesGenerated: images.count ?? 0,
  };
}

export async function getPublicationsChart(userId: string): Promise<ChartDataPoint[]> {
  const supabase = await createClient();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data } = await supabase
    .from("carousel_posts")
    .select("created_at")
    .eq("user_id", userId)
    .gte("created_at", thirtyDaysAgo.toISOString())
    .order("created_at");

  const grouped: Record<string, number> = {};
  (data ?? []).forEach(({ created_at }) => {
    const date = created_at.slice(0, 10);
    grouped[date] = (grouped[date] ?? 0) + 1;
  });

  return Object.entries(grouped).map(([date, value]) => ({ date, value }));
}

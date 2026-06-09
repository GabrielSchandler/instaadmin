import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDashboardKPIs, getPublicationsChart } from "@/features/dashboard/queries";
import { KPICards } from "@/features/dashboard/components/KPICards";
import { PublicationsChart } from "@/features/dashboard/components/Charts";
import { RecentPosts } from "@/features/dashboard/components/RecentPosts";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [kpis, chartData] = await Promise.all([
    getDashboardKPIs(user.id),
    getPublicationsChart(user.id),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Visão geral da sua conta</p>
      </div>

      <KPICards data={kpis} />
      <PublicationsChart data={chartData} />
      <RecentPosts userId={user.id} />
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CalendarView } from "@/features/scheduler/components/CalendarView";

export default async function CalendarPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: scheduled } = await supabase
    .from("carousel_posts")
    .select("id, title, status, scheduled_at")
    .eq("user_id", user.id)
    .not("scheduled_at", "is", null)
    .order("scheduled_at");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Calendário</h1>
        <p className="text-muted-foreground text-sm mt-1">Visualize e gerencie seus agendamentos</p>
      </div>
      <CalendarView events={scheduled ?? []} />
    </div>
  );
}

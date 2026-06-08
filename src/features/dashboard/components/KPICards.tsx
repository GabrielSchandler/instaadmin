import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { KPIData } from "@/types/global";
import { Images, Send, CalendarDays, Clock, TrendingUp, Layers } from "lucide-react";

const kpis = (data: KPIData) => [
  { label: "Posts Gerados",      value: data.generated,        icon: Layers,       color: "text-blue-500" },
  { label: "Publicados",         value: data.published,        icon: Send,         color: "text-green-500" },
  { label: "Agendados",          value: data.scheduled,        icon: CalendarDays, color: "text-yellow-500" },
  { label: "Pendentes",          value: data.pending,          icon: Clock,        color: "text-orange-500" },
  { label: "Taxa de Aprovação",  value: `${data.approvalRate}%`, icon: TrendingUp,   color: "text-purple-500" },
  { label: "Imagens Geradas",    value: data.imagesGenerated,  icon: Images,       color: "text-pink-500" },
];

export function KPICards({ data }: { data: KPIData }) {
  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
      {kpis(data).map(({ label, value, icon: Icon, color }) => (
        <Card key={label}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
            <Icon className={`h-4 w-4 ${color}`} />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

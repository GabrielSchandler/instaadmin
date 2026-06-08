"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChartDataPoint } from "@/types/global";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PublicationsChartProps {
  data: ChartDataPoint[];
}

export function PublicationsChart({ data }: PublicationsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Publicações nos últimos 30 dias</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="date"
              tickFormatter={(v) => format(parseISO(v), "dd/MM", { locale: ptBR })}
              className="text-xs fill-muted-foreground"
            />
            <YAxis allowDecimals={false} className="text-xs fill-muted-foreground" />
            <Tooltip
              labelFormatter={(v) => format(parseISO(v as string), "dd 'de' MMMM", { locale: ptBR })}
              formatter={(v) => [v, "Posts"]}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              fill="url(#gradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

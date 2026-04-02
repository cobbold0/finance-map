"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";

export function TrendChart({
  data,
  title,
}: {
  title: string;
  data: Array<{ label: string; income: number; expense: number }>;
}) {
  return (
    <Card>
      <CardContent className="space-y-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#0b0b0d",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "16px",
                }}
              />
              <Bar dataKey="income" fill="#3b82f6" radius={[10, 10, 0, 0]} />
              <Bar dataKey="expense" fill="#f97316" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function DistributionChart({
  data,
  title,
}: {
  title: string;
  data: Array<{ label: string; value: number }>;
}) {
  return (
    <Card>
      <CardContent className="space-y-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="label"
                innerRadius={60}
                outerRadius={96}
                paddingAngle={4}
                fill="#3b82f6"
              />
              <Tooltip
                contentStyle={{
                  background: "#0b0b0d",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "16px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

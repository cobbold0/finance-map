import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCompactCurrency } from "@/domain/finance";
import { CurrencyCode } from "@/domain/models";

export function MetricCard({
  title,
  value,
  currency = "GHS",
  trend,
}: {
  title: string;
  value: number;
  currency?: CurrencyCode;
  trend?: "up" | "down";
}) {
  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{title}</p>
          {trend ? (
            trend === "up" ? (
              <ArrowUpRight className="h-4 w-4 text-emerald-400" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-rose-400" />
            )
          ) : null}
        </div>
        <p className="text-2xl font-semibold tracking-tight">
          {formatCompactCurrency(value, currency)}
        </p>
      </CardContent>
    </Card>
  );
}

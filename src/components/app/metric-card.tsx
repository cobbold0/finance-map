import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCompactCurrency } from "@/domain/finance";
import { CurrencyCode } from "@/domain/models";

export function MetricCard({
  title,
  value,
  currency = "GHS",
  trend,
  detail,
  format = "currency",
}: {
  title: string;
  value: number;
  currency?: CurrencyCode;
  trend?: "up" | "down";
  detail?: string;
  format?: "currency" | "percent" | "number";
}) {
  const formattedValue =
    format === "percent"
      ? new Intl.NumberFormat("en-US", {
          maximumFractionDigits: value >= 10 ? 0 : 1,
        }).format(value) + "%"
      : format === "number"
        ? new Intl.NumberFormat("en-US", {
            maximumFractionDigits: 0,
          }).format(value)
        : formatCompactCurrency(value, currency);

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
        <div className="space-y-1">
          <p className="text-2xl font-semibold tracking-tight">{formattedValue}</p>
          {detail ? <p className="text-xs text-muted-foreground">{detail}</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}

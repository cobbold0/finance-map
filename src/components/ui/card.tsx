import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/10 bg-white/[0.04] shadow-[0_24px_80px_rgba(0,0,0,0.32)] backdrop-blur-xl",
        className,
      )}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("p-5 md:p-6", className)} {...props} />;
}

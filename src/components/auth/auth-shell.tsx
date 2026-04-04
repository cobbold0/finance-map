import { ShieldCheck, Sparkles, Smartphone, Wallet } from "lucide-react";
import { LogoMark } from "@/components/app/logo-mark";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const trustPoints = [
  "No bank sync required",
  "Private by default",
  "Built for mobile",
] as const;

const benefits = [
  {
    title: "Know your position fast",
    description: "See balances, budget posture, and progress without hunting through screens.",
    icon: Wallet,
  },
  {
    title: "Catch drift early",
    description: "Spot overspending and reminder-worthy moments before they compound.",
    icon: Sparkles,
  },
  {
    title: "Stay consistent on mobile",
    description: "Record income, expenses, and transfers in a flow that feels quick on your phone.",
    icon: Smartphone,
  },
] as const;

export function AuthShell({
  title,
  description,
  children,
  footer,
  mode = "full",
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  mode?: "full" | "compact" | "onboarding";
}) {
  const isCompact = mode === "compact";
  const isOnboarding = mode === "onboarding";

  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-4 py-8 text-foreground md:px-6 md:py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(14,165,233,0.12),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_36%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/10" />
      <div
        className={cn(
          "relative mx-auto min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-8",
          isCompact
            ? "flex justify-center"
            : isOnboarding
              ? "grid lg:grid-cols-[0.68fr_1.12fr]"
              : "grid lg:grid-cols-[1.05fr_0.95fr]",
        )}
      >
        {!isCompact ? (
          isOnboarding ? (
            <section className="space-y-8 lg:pr-4">
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <LogoMark />
                  <div>
                    <p className="font-semibold">Finance Map</p>
                    <p className="text-sm text-muted-foreground">Setup that stays out of your way</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <h1 className="max-w-xl text-3xl font-semibold tracking-tight md:text-4xl">
                    {title}
                  </h1>
                  <p className="max-w-lg text-sm leading-7 text-muted-foreground md:text-base">
                    {description}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  "Takes about 2 minutes",
                  "You can change these choices later",
                  "Start simple and add more structure over time",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-muted-foreground"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </section>
          ) : (
            <section className="space-y-8">
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <LogoMark />
                  <div>
                    <p className="font-semibold">Finance Map</p>
                    <p className="text-sm text-muted-foreground">Personal finance, without the chaos</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
                    {title}
                  </h1>
                  <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                    {description}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {trustPoints.map((point) => (
                    <span
                      key={point}
                      className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-muted-foreground"
                    >
                      {point}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                {benefits.map((benefit) => {
                  const Icon = benefit.icon;

                  return (
                    <Card key={benefit.title} className="bg-white/[0.035]">
                      <CardContent className="space-y-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="space-y-1.5">
                          <p className="font-medium">{benefit.title}</p>
                          <p className="text-sm leading-6 text-muted-foreground">
                            {benefit.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <ProductPreview />
            </section>
          )
        ) : null}

        <section
          className={cn(
            isCompact ? "w-full max-w-md" : isOnboarding ? "lg:justify-self-end" : "lg:justify-self-end",
          )}
        >
          <Card
            className={cn(
              "w-full overflow-hidden border-white/12 bg-[#090b10]/90",
              isCompact ? "mx-auto max-w-md" : isOnboarding ? "max-w-2xl" : "max-w-xl",
            )}
          >
            <CardContent className={cn("space-y-6 p-6 md:p-7", isOnboarding && "p-6 md:p-8")}>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  {isCompact ? (
                    <div className="flex items-center gap-3">
                      <LogoMark />
                      <p className="font-semibold">Finance Map</p>
                    </div>
                  ) : null}
                  <div className="space-y-1">
                    <h1 className={cn("text-2xl font-semibold tracking-tight", isOnboarding && "text-3xl")}>
                      {title}
                    </h1>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {description}
                    </p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Secure session
                </div>
              </div>
              {children}
              {footer ? <div className="border-t border-white/10 pt-4 text-sm">{footer}</div> : null}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}

export function MarketingHighlights() {
  return (
    <>
      <div className="flex flex-wrap gap-2">
        {trustPoints.map((point) => (
          <span
            key={point}
            className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-muted-foreground"
          >
            {point}
          </span>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {benefits.map((benefit) => {
          const Icon = benefit.icon;

          return (
            <Card key={benefit.title} className="bg-white/[0.035]">
              <CardContent className="space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="space-y-1.5">
                  <p className="font-medium">{benefit.title}</p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {benefit.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}

export function ProductPreview({ className }: { className?: string }) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-[1.15fr_0.85fr]", className)}>
      <Card className="overflow-hidden border-white/10 bg-[#07090d]">
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Snapshot</p>
              <p className="text-2xl font-semibold tracking-tight">GHS 48,320</p>
            </div>
            <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
              On track
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["Income", "12.4k"],
              ["Spent", "7.1k"],
              ["Saved", "42%"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/8 bg-white/[0.04] p-3">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
                <p className="mt-2 text-lg font-semibold">{value}</p>
              </div>
            ))}
          </div>
          <div className="space-y-3 rounded-3xl border border-white/8 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between text-sm">
              <span>April budget</span>
              <span className="text-amber-300">82% used</span>
            </div>
            <div className="h-2 rounded-full bg-white/8">
              <div className="h-full w-[82%] rounded-full bg-[linear-gradient(90deg,#38bdf8,#22c55e,#f59e0b)]" />
            </div>
            <div className="grid gap-2">
              {[
                ["Groceries", "GHS 1,200", "Near limit"],
                ["Transport", "GHS 860", "Stable"],
                ["Emergency fund", "GHS 5,400", "Growing"],
              ].map(([label, value, status]) => (
                <div key={label} className="flex items-center justify-between rounded-2xl bg-black/20 px-3 py-2.5 text-sm">
                  <div>
                    <p className="font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">{status}</p>
                  </div>
                  <p className="font-medium">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <Card className="border-white/10 bg-[#080a0f]">
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Recent activity</p>
            {[
              ["Salary", "+GHS 8,500"],
              ["Rent", "-GHS 2,200"],
              ["Goal deposit", "+GHS 600"],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-2xl bg-white/[0.03] px-3 py-2.5 text-sm">
                <span>{label}</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(14,165,233,0.14),rgba(8,10,15,0.92))]">
          <CardContent className="space-y-3">
            <p className="text-sm text-sky-100/80">Why it feels better</p>
            <p className="text-xl font-semibold tracking-tight">
              A focused home for daily money decisions, not a spreadsheet in disguise.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

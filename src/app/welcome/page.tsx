import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { redirectIfAuthenticated } from "@/data/auth";
import { LogoMark } from "@/components/app/logo-mark";
import { MarketingHighlights, ProductPreview } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Finance Map | Personal Finance System",
};

export default async function WelcomePage() {
  await redirectIfAuthenticated();

  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-4 py-8 text-foreground md:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(14,165,233,0.12),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_36%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/10" />
      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center">
        <div className="grid w-full gap-10">
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <LogoMark />
                <div>
                  <p className="font-semibold">Finance Map</p>
                  <p className="text-sm text-muted-foreground">Personal finance</p>
                </div>
              </div>
              <div className="space-y-5">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/80">
                  Personal finance system
                </p>
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
                  See where your money is going before it slips away.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                  Track balances, catch overspending early, and grow savings goals
                  from one calm workspace that feels great on mobile.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/auth/sign-up">
                    Create account and start
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/auth/sign-in">Sign in</Link>
                </Button>
              </div>
            </div>
            <div className="lg:pt-6">
              <ProductPreview />
            </div>
          </div>
          <div className="space-y-6">
            <div className="max-w-3xl space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary/80">
                Why it works
              </p>
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                A focused home for daily money decisions, not a spreadsheet in disguise.
              </h2>
            </div>
            <MarketingHighlights />
          </div>
        </div>
      </div>
    </main>
  );
}

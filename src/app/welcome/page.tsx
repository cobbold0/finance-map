import Link from "next/link";
import { ArrowRight, ShieldCheck, Smartphone } from "lucide-react";
import { redirectIfAuthenticated } from "@/data/auth";
import { LogoMark } from "@/components/app/logo-mark";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function WelcomePage() {
  await redirectIfAuthenticated();

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground md:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center">
        <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <LogoMark />
              <div>
                <p className="font-semibold">Finance Map</p>
                <p className="text-sm text-muted-foreground">Personal finance</p>
              </div>
            </div>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
                Track your money across wallets, budgets, goals, and reports.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                Keep balances, spending, goals, and reminders in one place with
                a clean experience built for everyday use.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/auth/sign-up">
                  Create account
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/auth/sign-in">Sign in</Link>
              </Button>
            </div>
          </div>
          <div className="grid gap-4">
            <Card>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Smartphone className="h-4 w-4 text-primary" />
                  Easy to use on mobile
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  Reach key actions quickly on your phone, with a layout that
                  also works well on tablet and desktop.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Clear financial records
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  Review transactions, budgets, goals, reminders, and bank
                  details in a single organized workspace.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}

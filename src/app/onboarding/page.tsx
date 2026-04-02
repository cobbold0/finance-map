import { requireUserProfile } from "@/data/auth";
import { OnboardingForm } from "@/features/auth/onboarding-form";
import { Card, CardContent } from "@/components/ui/card";

export default async function OnboardingPage() {
  const profile = await requireUserProfile();

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-2xl">
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">
              Onboarding
            </p>
            <h1 className="text-3xl font-semibold">Set up your finance home.</h1>
            <p className="text-sm leading-6 text-muted-foreground">
              Choose your base currency, create your first wallet, and enable
              reminders that help you stay consistent.
            </p>
          </div>
          <OnboardingForm defaultName={profile.fullName} />
        </CardContent>
      </Card>
    </main>
  );
}

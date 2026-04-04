import type { Metadata } from "next";
import { requireUserProfile } from "@/data/auth";
import { OnboardingForm } from "@/features/auth/onboarding-form";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = {
  title: "Onboarding | Finance Map",
};

export default async function OnboardingPage() {
  const profile = await requireUserProfile();

  return (
    <AuthShell
      eyebrow="Onboarding"
      title="Set up your finance home with a little guidance."
      description="We will start with the essentials: your identity, your first wallet, and the reminders that keep you consistent."
      mode="onboarding"
    >
      <OnboardingForm defaultName={profile.fullName} />
    </AuthShell>
  );
}

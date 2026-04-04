import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireAuthenticatedUserProfile } from "@/data/auth";
import { OnboardingForm } from "@/features/auth/onboarding-form";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = {
  title: "Onboarding",
  description: "Set up your account.",
};

export default async function OnboardingPage() {
  const profile = await requireAuthenticatedUserProfile();

  if (profile.onboardingCompleted) {
    redirect("/");
  }

  return (
    <AuthShell
      title="Onboarding"
      description="Set up your profile and first wallet."
      mode="onboarding"
    >
      <OnboardingForm defaultName={profile.fullName} />
    </AuthShell>
  );
}

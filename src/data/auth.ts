import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/data/finance-repository";

export async function requireAuthenticatedUserProfile() {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect("/welcome");
  }

  return profile;
}

export async function requireOnboardedUserProfile() {
  const profile = await requireAuthenticatedUserProfile();

  if (!profile.onboardingCompleted) {
    redirect("/onboarding");
  }

  return profile;
}

export async function redirectIfAuthenticated() {
  const profile = await getCurrentUserProfile();

  if (profile) {
    redirect(profile.onboardingCompleted ? "/" : "/onboarding");
  }
}

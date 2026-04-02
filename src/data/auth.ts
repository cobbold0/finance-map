import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/data/finance-repository";

export async function requireUserProfile() {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect("/welcome");
  }

  return profile;
}

export async function redirectIfAuthenticated() {
  const profile = await getCurrentUserProfile();

  if (profile) {
    redirect("/");
  }
}

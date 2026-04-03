"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  onboardingSchema,
  signInSchema,
  signUpSchema,
} from "@/features/auth/schemas";

export async function signInAction(values: unknown) {
  const payload = signInSchema.safeParse(values);

  if (!payload.success) {
    return { error: payload.error.issues[0]?.message ?? "Invalid credentials." };
  }

  const supabase = await createClient();

  if (!supabase) {
    return { error: "Supabase is not configured." };
  }

  const { error } = await supabase.auth.signInWithPassword(payload.data);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function signUpAction(values: unknown) {
  const payload = signUpSchema.safeParse(values);

  if (!payload.success) {
    return { error: payload.error.issues[0]?.message ?? "Invalid details." };
  }

  const supabase = await createClient();

  if (!supabase) {
    return { error: "Supabase is not configured." };
  }

  const { data, error } = await supabase.auth.signUp({
    email: payload.data.email,
    password: payload.data.password,
    options: {
      data: {
        full_name: payload.data.fullName,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user) {
    await supabase.from("profiles").upsert({
      id: data.user.id,
      email: payload.data.email,
      full_name: payload.data.fullName,
      currency: "GHS",
      theme_preference: "dark",
    });
  }

  return { success: true };
}

export async function signOutAction() {
  const supabase = await createClient();

  if (!supabase) {
    redirect("/welcome");
  }

  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/welcome");
}

export async function completeOnboardingAction(values: unknown) {
  const payload = onboardingSchema.safeParse(values);

  if (!payload.success) {
    return { error: payload.error.issues[0]?.message ?? "Invalid details." };
  }

  const supabase = await createClient();

  if (!supabase) {
    return { error: "Supabase is not configured." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Please sign in again." };
  }

  await supabase.from("profiles").upsert({
    id: user.id,
    email: user.email,
    full_name: payload.data.fullName,
    currency: payload.data.baseCurrency,
    theme_preference: "dark",
  });

  await supabase.from("settings").upsert({
    user_id: user.id,
    salary_date: payload.data.salaryDate,
  });

  await supabase.from("notification_preferences").upsert({
    user_id: user.id,
    salary_reminder: true,
    bonus_reminder: true,
    milestone_reminder: true,
    monthly_review_reminder: true,
    budget_warning: true,
    reconciliation_reminder: true,
    push_enabled: payload.data.browserEnabled,
    email_enabled: false,
  });

  await supabase.from("wallets").insert({
    user_id: user.id,
    name: payload.data.defaultWalletName,
    currency: payload.data.baseCurrency,
    icon: "wallet",
    color: "#3B82F6",
  });

  revalidatePath("/", "layout");
  return { success: true };
}

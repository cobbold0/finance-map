"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  onboardingSchema,
  signInSchema,
  signUpSchema,
} from "@/features/auth/schemas";

export type AuthFormState = {
  error?: string | null;
  fieldErrors?: Partial<Record<"fullName" | "email" | "password", string>>;
};

async function upsertProfileWithOnboardingState(
  supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>,
  values: {
    id: string;
    email: string | null | undefined;
    fullName: string;
    currency: string;
    onboardingCompleted: boolean;
  },
) {
  return await supabase.from("profiles").upsert({
    id: values.id,
    email: values.email ?? "",
    full_name: values.fullName,
    currency: values.currency,
    theme_preference: "dark" as const,
    onboarding_completed: values.onboardingCompleted,
  });
}

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

export async function signInFormAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const payload = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!payload.success) {
    return {
      error: payload.error.issues[0]?.message ?? "Invalid credentials.",
      fieldErrors: Object.fromEntries(
        payload.error.issues.map((issue) => [String(issue.path[0]), issue.message]),
      ),
    };
  }

  const supabase = await createClient();

  if (!supabase) {
    return { error: "Supabase is not configured.", fieldErrors: {} };
  }

  const { error } = await supabase.auth.signInWithPassword(payload.data);

  if (error) {
    return { error: error.message, fieldErrors: {} };
  }

  revalidatePath("/", "layout");
  redirect("/");
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
    await upsertProfileWithOnboardingState(supabase, {
      id: data.user.id,
      email: payload.data.email,
      fullName: payload.data.fullName,
      currency: "GHS",
      onboardingCompleted: false,
    });
  }

  return { success: true };
}

export async function signUpFormAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const payload = signUpSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!payload.success) {
    return {
      error: payload.error.issues[0]?.message ?? "Invalid details.",
      fieldErrors: Object.fromEntries(
        payload.error.issues.map((issue) => [String(issue.path[0]), issue.message]),
      ),
    };
  }

  const supabase = await createClient();

  if (!supabase) {
    return { error: "Supabase is not configured.", fieldErrors: {} };
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
    return { error: error.message, fieldErrors: {} };
  }

  if (data.user) {
    await upsertProfileWithOnboardingState(supabase, {
      id: data.user.id,
      email: payload.data.email,
      fullName: payload.data.fullName,
      currency: "GHS",
      onboardingCompleted: false,
    });
  }

  redirect("/onboarding");
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

  const { error } = await supabase.rpc("complete_onboarding", {
    full_name_input: payload.data.fullName,
    base_currency_input: payload.data.baseCurrency,
    default_wallet_name_input: payload.data.defaultWalletName,
    salary_date_input: payload.data.salaryDate,
    budget_warning_threshold_input: payload.data.budgetWarningThreshold,
    browser_enabled_input: payload.data.browserEnabled,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

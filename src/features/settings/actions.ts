"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  bankAccountSchema,
  preferencesSchema,
} from "@/features/settings/schemas";

export async function savePreferencesAction(values: unknown) {
  const payload = preferencesSchema.safeParse(values);

  if (!payload.success) {
    return { error: payload.error.issues[0]?.message ?? "Invalid preferences." };
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
    salary_reminder: payload.data.salaryReminder,
    bonus_reminder: true,
    milestone_reminder: true,
    monthly_review_reminder: payload.data.monthlyReviewReminder,
    budget_warning: payload.data.budgetWarningReminder,
    reconciliation_reminder: payload.data.reconciliationReminder,
    push_enabled: payload.data.browserEnabled,
    email_enabled: false,
  });

  revalidatePath("/settings");
  revalidatePath("/notifications");
  revalidatePath("/");
  return { success: true };
}

export async function saveBankAccountAction(values: unknown, bankAccountId?: string) {
  const payload = bankAccountSchema.safeParse(values);

  if (!payload.success) {
    return { error: payload.error.issues[0]?.message ?? "Invalid bank details." };
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

  const record = {
    user_id: user.id,
    label: payload.data.label,
    account_name: payload.data.accountName,
    account_number: payload.data.accountNumber,
    bank_name: payload.data.bankName,
    branch: payload.data.branch || null,
    swift_code: payload.data.swiftCode || null,
    mobile_money_provider: payload.data.mobileMoneyProvider || null,
    mobile_money_number: payload.data.mobileMoneyNumber || null,
    notes: payload.data.notes || null,
    is_primary: payload.data.isPrimary,
  };

  const query = bankAccountId
    ? supabase
        .from("bank_account_details")
        .update(record)
        .eq("id", bankAccountId)
        .eq("user_id", user.id)
    : supabase.from("bank_account_details").insert(record);

  const { error } = await query;

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/settings/bank-accounts");
  return { success: true };
}

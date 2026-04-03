"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  bankAccountSchema,
  budgetCategorySchema,
  financialRecordSchema,
  notificationPreferencesSchema,
  profileSettingsSchema,
} from "@/features/settings/schemas";

export async function saveProfileSettingsAction(values: unknown) {
  const payload = profileSettingsSchema.safeParse(values);

  if (!payload.success) {
    return { error: payload.error.issues[0]?.message ?? "Invalid profile settings." };
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

  revalidatePath("/settings");
  revalidatePath("/settings/profile");
  revalidatePath("/");
  return { success: true };
}

export async function saveNotificationPreferencesAction(values: unknown) {
  const payload = notificationPreferencesSchema.safeParse(values);

  if (!payload.success) {
    return {
      error:
        payload.error.issues[0]?.message ?? "Invalid notification preferences.",
    };
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

  await supabase.from("notification_preferences").upsert({
    user_id: user.id,
    salary_reminder: payload.data.salaryReminder,
    bonus_reminder: payload.data.bonusReminder,
    milestone_reminder: payload.data.milestoneReminder,
    monthly_review_reminder: payload.data.monthlyReviewReminder,
    budget_warning: payload.data.budgetWarningReminder,
    reconciliation_reminder: payload.data.reconciliationReminder,
    push_enabled: payload.data.browserEnabled,
    email_enabled: false,
  });

  revalidatePath("/settings");
  revalidatePath("/settings/preferences");
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

export async function saveBudgetCategoryAction(
  values: unknown,
  categoryId?: string,
) {
  const payload = budgetCategorySchema.safeParse(values);

  if (!payload.success) {
    return {
      error:
        payload.error.issues[0]?.message ?? "Invalid budget category.",
    };
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
    name: payload.data.name,
    color: payload.data.color || null,
    icon: payload.data.icon || null,
  };

  const query = categoryId
    ? supabase
        .from("budget_categories")
        .update(record)
        .eq("id", categoryId)
        .eq("user_id", user.id)
    : supabase.from("budget_categories").insert(record);

  const { error } = await query;

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/settings");
  revalidatePath("/settings/budget-categories");
  revalidatePath("/budgets/new");
  return { success: true };
}

export async function deleteBudgetCategoryAction(categoryId: string) {
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

  const { error } = await supabase
    .from("budget_categories")
    .delete()
    .eq("id", categoryId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/settings/budget-categories");
  revalidatePath("/budgets/new");
  revalidatePath("/budgets");
  return { success: true };
}

export async function saveFinancialRecordAction(
  values: unknown,
  recordId?: string,
) {
  const payload = financialRecordSchema.safeParse(values);

  if (!payload.success) {
    return {
      error: payload.error.issues[0]?.message ?? "Invalid financial record.",
    };
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
    record_type: payload.data.type,
    label: payload.data.label,
    provider_name: payload.data.providerName,
    product_name: payload.data.productName || null,
    reference_number: payload.data.referenceNumber || null,
    currency: payload.data.currency,
    monthly_contribution: payload.data.monthlyContribution,
    current_value: payload.data.currentValue,
    coverage_amount: payload.data.coverageAmount,
    start_date: payload.data.startDate || null,
    maturity_date: payload.data.maturityDate || null,
    contact_person: payload.data.contactPerson || null,
    contact_phone: payload.data.contactPhone || null,
    notes: payload.data.notes || null,
  };

  const query = recordId
    ? supabase
        .from("financial_records")
        .update(record)
        .eq("id", recordId)
        .eq("user_id", user.id)
    : supabase.from("financial_records").insert(record);

  const { error } = await query;

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/settings");
  revalidatePath("/settings/financial-records");
  return { success: true };
}

export async function deleteFinancialRecordAction(recordId: string) {
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

  const { error } = await supabase
    .from("financial_records")
    .delete()
    .eq("id", recordId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/settings/financial-records");
  revalidatePath("/settings");
  return { success: true };
}

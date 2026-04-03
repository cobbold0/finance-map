import { z } from "zod";

export const profileSettingsSchema = z.object({
  fullName: z.string().min(2),
  baseCurrency: z.string().min(3),
  salaryDate: z.number().min(1).max(31),
});

export const notificationPreferencesSchema = z.object({
  browserEnabled: z.boolean(),
  salaryReminder: z.boolean(),
  monthlyReviewReminder: z.boolean(),
  budgetWarningReminder: z.boolean(),
  reconciliationReminder: z.boolean(),
  bonusReminder: z.boolean(),
  milestoneReminder: z.boolean(),
});

export const bankAccountSchema = z.object({
  label: z.string().min(2),
  accountName: z.string().min(2),
  accountNumber: z.string().min(4),
  bankName: z.string().min(2),
  branch: z.string().optional(),
  swiftCode: z.string().optional(),
  mobileMoneyProvider: z.string().optional(),
  mobileMoneyNumber: z.string().optional(),
  notes: z.string().optional(),
  isPrimary: z.boolean(),
});

export const budgetCategorySchema = z.object({
  name: z.string().min(2),
  color: z.string().optional(),
  icon: z.string().optional(),
});

export const financialRecordSchema = z.object({
  type: z.enum([
    "pension_tier_1",
    "pension_tier_2",
    "pension_tier_3",
    "investment",
    "insurance",
    "other",
  ]),
  label: z.string().min(2),
  providerName: z.string().min(2),
  productName: z.string().optional(),
  referenceNumber: z.string().optional(),
  currency: z.string().min(3),
  monthlyContribution: z.number().min(0).nullable(),
  currentValue: z.number().min(0).nullable(),
  coverageAmount: z.number().min(0).nullable(),
  startDate: z.string().optional(),
  maturityDate: z.string().optional(),
  contactPerson: z.string().optional(),
  contactPhone: z.string().optional(),
  notes: z.string().optional(),
});

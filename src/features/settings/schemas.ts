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

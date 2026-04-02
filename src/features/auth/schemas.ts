import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const signUpSchema = signInSchema.extend({
  fullName: z.string().min(2),
});

export const onboardingSchema = z.object({
  fullName: z.string().min(2),
  baseCurrency: z.string().min(3),
  defaultWalletName: z.string().min(2),
  salaryDate: z.number().min(1).max(31),
  budgetWarningThreshold: z.number().min(50).max(95),
  browserEnabled: z.boolean(),
});

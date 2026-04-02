import { z } from "zod";

export const walletSchema = z.object({
  name: z.string().min(2),
  type: z.enum([
    "checking",
    "savings",
    "cash",
    "business",
    "emergency_fund",
    "project_wallet",
  ]),
  nativeCurrency: z.string().min(3),
  description: z.string().optional(),
  color: z.string().min(4),
  icon: z.string().min(2),
});

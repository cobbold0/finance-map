import { z } from "zod";

export const transactionSchema = z.object({
  walletId: z.string().min(1),
  destinationWalletId: z.string().optional(),
  type: z.enum(["income", "expense", "transfer", "salary", "bonus", "adjustment"]),
  amount: z.number().positive(),
  category: z.string().optional(),
  notes: z.string().optional(),
  occurredAt: z.string().min(1),
});

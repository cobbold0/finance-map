import { z } from "zod";

export const budgetItemInputSchema = z.object({
  categoryId: z.string().min(1),
  categoryName: z.string().min(1),
  limitAmount: z.number().min(0),
});

export const budgetSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
  totalLimit: z.number().min(0).nullable(),
  items: z.array(budgetItemInputSchema).default([]),
});

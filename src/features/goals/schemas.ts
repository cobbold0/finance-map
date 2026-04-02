import { z } from "zod";

export const goalSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  walletId: z.string().optional(),
  targetAmount: z.number().positive(),
  savedAmount: z.number().min(0),
  targetDate: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]),
  type: z.enum(["generic", "building_project"]),
});

import { z } from "zod";

export const goalMilestoneSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Milestone title is required."),
  targetAmount: z.number().min(0).nullable(),
  dueDate: z.string().optional(),
  isCompleted: z.boolean().default(false),
  notes: z.string().optional(),
});

export const goalPhaseSchema = z.object({
  id: z.string().optional(),
  order: z.number().int().min(1),
  title: z.string().min(1, "Phase title is required."),
  description: z.string().optional(),
  estimatedCost: z.number().min(0).nullable(),
  actualCost: z.number().min(0).nullable(),
  status: z.enum(["planned", "in_progress", "completed"]),
  completionDate: z.string().optional(),
});

export const goalSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  walletId: z.string().optional(),
  targetAmount: z.number().positive(),
  savedAmount: z.number().min(0),
  targetDate: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]),
  type: z.enum(["generic", "building_project"]),
  milestones: z.array(goalMilestoneSchema).default([]),
  phases: z.array(goalPhaseSchema).default([]),
});

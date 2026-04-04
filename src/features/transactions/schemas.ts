import { z } from "zod";

export const transactionDisplayTypeSchema = z.enum([
  "income",
  "expense",
  "transfer",
  "withdrawal",
  "salary",
  "bonus",
  "adjustment",
]);

export const transactionSchema = z
  .object({
    walletId: z.string().min(1, "Select a wallet."),
    destinationWalletId: z.string().optional(),
    displayType: transactionDisplayTypeSchema,
    amount: z.number().positive("Enter an amount greater than zero."),
    categoryId: z.string().optional(),
    notes: z.string().optional(),
    occurredAt: z.string().min(1, "Choose a date."),
  })
  .superRefine((value, ctx) => {
    const destinationWalletId = value.destinationWalletId?.trim() ?? "";
    const categoryId = value.categoryId?.trim() ?? "";

    if (value.displayType === "transfer") {
      if (!destinationWalletId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Choose a destination wallet for transfers.",
          path: ["destinationWalletId"],
        });
      }

      if (destinationWalletId && destinationWalletId === value.walletId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Source and destination wallets must be different.",
          path: ["destinationWalletId"],
        });
      }
    }

    if (value.displayType === "withdrawal" && destinationWalletId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Withdrawals cannot have a destination wallet.",
        path: ["destinationWalletId"],
      });
    }

    if (value.displayType === "expense" && !categoryId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Choose a budget category for this expense.",
        path: ["categoryId"],
      });
    }
  });

import { format } from "date-fns";
import {
  BudgetCategory,
  BudgetWarningState,
  CurrencyCode,
  ExchangeRate,
  Goal,
  Transaction,
  Wallet,
} from "@/domain/models";
import { getCurrency } from "@/domain/currencies";

export function formatCurrency(amount: number, currencyCode: CurrencyCode) {
  const currency = getCurrency(currencyCode);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.code,
    maximumFractionDigits: currency.precision,
  }).format(amount);
}

export function formatCompactCurrency(amount: number, currencyCode: CurrencyCode) {
  const currency = getCurrency(currencyCode);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.code,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
}

export function convertToBaseCurrency(
  amount: number,
  sourceCurrency: CurrencyCode,
  baseCurrency: CurrencyCode,
  rates: ExchangeRate[],
) {
  if (sourceCurrency === baseCurrency) {
    return amount;
  }

  const rate = rates.find(
    (item) =>
      item.baseCurrency === baseCurrency && item.quoteCurrency === sourceCurrency,
  );

  if (!rate || !rate.rate) {
    return amount;
  }

  return amount / rate.rate;
}

export function calculateBudgetState(
  spentAmount: number,
  limitAmount: number,
  warningThreshold = 0.8,
): BudgetWarningState {
  if (limitAmount <= 0) {
    return "healthy";
  }

  const ratio = spentAmount / limitAmount;

  if (ratio >= 1) {
    return "exceeded";
  }

  if (ratio >= warningThreshold) {
    return "watch";
  }

  return "healthy";
}

export function enrichBudgetCategory(category: {
  id: string;
  budgetId: string;
  categoryId: string;
  categoryName: string;
  limitAmount: number;
  spentAmount: number;
}): BudgetCategory {
  return {
    ...category,
    remainingAmount: Math.max(category.limitAmount - category.spentAmount, 0),
    warningState: calculateBudgetState(
      category.spentAmount,
      category.limitAmount,
    ),
  };
}

export function calculateGoalProgress(goal: Goal) {
  if (goal.targetAmount <= 0) {
    return 0;
  }

  return Math.min((goal.savedAmount / goal.targetAmount) * 100, 100);
}

export function getGoalRemaining(goal: Goal) {
  return Math.max(goal.targetAmount - goal.savedAmount, 0);
}

export function aggregateWalletBalance(wallets: Wallet[]) {
  return wallets.reduce((total, wallet) => total + wallet.balance, 0);
}

export function getIncomeVsExpense(transactions: Transaction[]) {
  return transactions.reduce(
    (acc, transaction) => {
      const amount = transaction.convertedAmountBase ?? transaction.amount;

      if (transaction.type === "income" || transaction.type === "salary" || transaction.type === "bonus") {
        acc.income += amount;
      } else if (transaction.type === "expense") {
        acc.expense += amount;
      }

      return acc;
    },
    { income: 0, expense: 0 },
  );
}

export function formatMonthLabel(value: string) {
  return format(new Date(`${value}-01T00:00:00`), "MMMM yyyy");
}

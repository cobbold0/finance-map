import {
  Bell,
  CreditCard,
  Goal,
  Home,
  PieChart,
  Settings,
  Wallet,
} from "lucide-react";

export const mobileTabs = [
  { title: "Home", href: "/", icon: Home },
  { title: "Wallets", href: "/wallets", icon: Wallet },
  { title: "Transactions", href: "/transactions", icon: CreditCard },
  { title: "Goals", href: "/goals", icon: Goal },
  { title: "Reports", href: "/reports", icon: PieChart },
  { title: "Settings", href: "/settings", icon: Settings },
] as const;

export const desktopNav = [
  { title: "Home", href: "/", icon: Home },
  { title: "Wallets", href: "/wallets", icon: Wallet },
  { title: "Transactions", href: "/transactions", icon: CreditCard },
  { title: "Goals", href: "/goals", icon: Goal },
  { title: "Reports", href: "/reports", icon: PieChart },
  { title: "Budgets", href: "/budgets", icon: PieChart },
  { title: "Notifications", href: "/notifications", icon: Bell },
  { title: "Settings", href: "/settings", icon: Settings },
] as const;

export const quickActions = [
  { id: "income", title: "Add income", href: "/transactions/new?type=income" },
  { id: "expense", title: "Add expense", href: "/transactions/new?type=expense" },
  { id: "transfer", title: "Transfer", href: "/transactions/new?type=transfer" },
  { id: "withdrawal", title: "Withdrawal", href: "/transactions/new?type=withdrawal" },
  { id: "goal", title: "Create goal", href: "/goals/new" },
] as const;

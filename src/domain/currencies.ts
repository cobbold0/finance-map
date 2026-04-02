import { Currency, CurrencyCode } from "@/domain/models";

export const CURRENCIES: Currency[] = [
  { code: "USD", symbol: "$", name: "US Dollar", precision: 2 },
  { code: "EUR", symbol: "EUR", name: "Euro", precision: 2 },
  { code: "GBP", symbol: "GBP", name: "British Pound", precision: 2 },
  { code: "GHS", symbol: "GH$", name: "Ghanaian Cedi", precision: 2 },
  { code: "KES", symbol: "KSh", name: "Kenyan Shilling", precision: 2 },
  { code: "NGN", symbol: "NGN", name: "Nigerian Naira", precision: 2 },
  { code: "ZAR", symbol: "R", name: "South African Rand", precision: 2 },
];

export function getCurrency(code: CurrencyCode) {
  return CURRENCIES.find((currency) => currency.code === code) ?? CURRENCIES[3];
}

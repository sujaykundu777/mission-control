import { saveToDB, getFromDB, DB_STORES } from "./indexeddb";

export type Currency = "USD" | "EUR" | "INR";

const DEFAULT_CURRENCY = "INR";

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  INR: "₹",
};

export const CURRENCIES = [
  {
    id: "inr",
    name: "INR",
    symbol: "₹",
  },
  {
    id: "usd",
    name: "USD",
    symbol: "$",
  },
  {
    id: "eur",
    name: "EUR",
    symbol: "€",
  },
];

export const CURRENCY_NAMES: Record<Currency, string> = {
  USD: "US Dollar",
  EUR: "Euro",
  INR: "Indian Rupee",
};

export const CONVERSION_RATES: Record<Currency, number> = {
  USD: 1,
  EUR: 0.92,
  INR: 83.12,
};

export const formatCurrency = (amount: number, currency: Currency = DEFAULT_CURRENCY): string => {
  const symbol = CURRENCY_SYMBOLS[currency];
  const converted = amount * CONVERSION_RATES[currency];
  return `${symbol}${converted.toFixed(2)}`;
};

export const getCurrencyFromStorageAsync = async (): Promise<Currency> => {
  if (typeof window === "undefined") return DEFAULT_CURRENCY;
  try {
    const stored = await getFromDB<{ key: string; value: Currency }>(
      DB_STORES.SETTINGS,
      "currency",
    );
    return stored?.value || DEFAULT_CURRENCY;
  } catch (error) {
    console.error("Failed to load currency from IndexedDB:", error);
    return DEFAULT_CURRENCY;
  }
};

export const setCurrencyInStorageAsync = async (currency: Currency): Promise<void> => {
  if (typeof window === "undefined") return;
  try {
    await saveToDB(DB_STORES.SETTINGS, { key: "currency", value: currency });
  } catch (error) {
    console.error("Failed to save currency to IndexedDB:", error);
  }
};

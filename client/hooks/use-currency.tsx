import { useContext } from "react";
import { CurrencyContext } from "@/lib/context/currency-context";

export function useCurrency() {
  const context = useContext(CurrencyContext);

  if (!context) {
    throw new Error("useCurrency must be within CurrencyProvider");
  }

  return context;
}

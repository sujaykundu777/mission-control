"use client";

import { ReactNode, useState, useEffect } from "react";
import { CurrencyContext } from "@/lib/context/currency-context";
import { Currency, getCurrencyFromStorageAsync, setCurrencyInStorageAsync } from "@/lib/currency";

interface CurrencyProviderProps {
  children: ReactNode;
}

export function CurrencyProvider({ children }: CurrencyProviderProps) {
  const [currency, setCurrencyState] = useState<Currency>("INR");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Load currency from IndexedDB on client side only
    getCurrencyFromStorageAsync()
      .then((loadedCurrency) => {
        setCurrencyState(loadedCurrency);
        setIsHydrated(true);
      })
      .catch(() => {
        setIsHydrated(true);
      });
  }, []);

  const setCurrency = async (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    await setCurrencyInStorageAsync(newCurrency);
  };

  // Prevent rendering until hydrated to avoid mismatches
  if (!isHydrated) {
    return <>{children}</>;
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

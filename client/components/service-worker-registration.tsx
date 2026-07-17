"use client";

import { useEffect } from "react";

/**
 * Registers public/sw.js on mount. Lives at the root layout so it covers
 * both the marketing/auth pages and the authenticated app - installability
 * and asset caching aren't login-gated.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((error) => {
        console.error("Service worker registration failed:", error);
      });
    }
  }, []);

  return null;
}

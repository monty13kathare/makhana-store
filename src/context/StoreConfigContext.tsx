"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { catalog } from "@/lib/api/store";
import type { StoreConfig } from "@/lib/api/types";

/** Used only until `/store/config` answers; online payments stay off until confirmed. */
export const FALLBACK_CONFIG: StoreConfig = {
  storeName: "Makhana Premium",
  supportEmail: "hello@makhana.store",
  supportPhone: "",
  currency: "INR",
  freeShippingOver: 49,
  shippingFee: 5,
  taxRatePercent: 0,
  payments: { provider: "razorpay", enabled: false, keyId: "", methods: ["cod"], timeoutMinutes: 30 },
};

type Value = { config: StoreConfig; loaded: boolean; error: boolean };

const StoreConfigContext = createContext<Value>({ config: FALLBACK_CONFIG, loaded: false, error: false });

/**
 * Storefront configuration (shipping defaults, payment methods, support
 * contacts). The root layout passes a server-fetched copy; if that failed
 * (API down at build time) the browser fetches it.
 */
export function StoreConfigProvider({
  initial,
  children,
}: {
  initial: StoreConfig | null;
  children: ReactNode;
}) {
  const [config, setConfig] = useState<StoreConfig | null>(initial);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // Always confirm in the browser: payment availability must be current.
    catalog
      .config()
      .then((c) => {
        if (!cancelled) {
          setConfig(c);
          setError(false);
        }
      })
      .catch((e: unknown) => {
        console.error("[config] /store/config failed", e);
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <StoreConfigContext.Provider
      value={{ config: config ?? FALLBACK_CONFIG, loaded: config !== null, error }}
    >
      {children}
    </StoreConfigContext.Provider>
  );
}

export function useStoreConfig() {
  return useContext(StoreConfigContext);
}

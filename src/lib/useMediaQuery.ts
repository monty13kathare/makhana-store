"use client";

import { useSyncExternalStore } from "react";

/**
 * Live `matchMedia` result. Returns false during SSR and the first client
 * render, so gate only decorative / progressive features on it.
 */
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}

/** Desktop-class device: wide screen with a real mouse (hover-driven effects). */
export const DESKTOP_POINTER = "(min-width: 1024px) and (hover: hover) and (pointer: fine)";

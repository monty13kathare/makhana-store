"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Marks page <section>s that are off screen with `data-offscreen`; globals.css
 * pauses every CSS animation inside them, so ambient loops (floating seeds,
 * pulses) only cost frames while they can actually be seen.
 */
export default function PauseOffscreen() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          e.target.toggleAttribute("data-offscreen", !e.isIntersecting);
        }
      },
      { rootMargin: "200px 0px" }
    );
    const sections = document.querySelectorAll("main section");
    sections.forEach((s) => io.observe(s));
    return () => {
      io.disconnect();
      sections.forEach((s) => s.removeAttribute("data-offscreen"));
    };
  }, [pathname]);

  return null;
}

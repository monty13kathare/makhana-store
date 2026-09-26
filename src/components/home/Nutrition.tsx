"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Reveal, EASE } from "../motion-primitives";

const facts = [
  { value: 9.7, suffix: "g", label: "Protein per 100g", decimals: 1 },
  { value: 347, suffix: "", label: "Calories per 100g", decimals: 0 },
  { value: 0, suffix: "g", label: "Trans fat", decimals: 0 },
  { value: 14, suffix: "%", label: "Daily fibre", decimals: 0 },
];

/** Counts from 0 to `to` once the number scrolls into view. */
function Counter({
  to,
  decimals = 0,
  suffix = "",
}: {
  to: number;
  decimals?: number;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (to === 0) {
      setN(0);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const dur = 1400;

    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      // easeOutExpo, so the number settles rather than stopping dead
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setN(to * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);

  return (
    <span ref={ref}>
      {n.toFixed(decimals)}
      {suffix}
    </span>
  );
}

export default function Nutrition() {
  return (
    <section className="relative overflow-hidden py-20 lg:py-28">
      <div className="glow-warm pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[860px] -translate-x-1/2 -translate-y-1/2 opacity-50" />

      <div className="container-x relative">
        <Reveal className="max-w-[54ch]">
          <p className="mb-3 text-[11.5px] font-semibold uppercase tracking-[0.22em] text-gold">
            The numbers
          </p>
          <h2 className="text-[28px] font-extrabold leading-[1.14] tracking-[-0.02em] sm:text-[38px]">
            Goodness in{" "}
            <span className="font-display italic text-gold">every bite</span>
          </h2>
          <p className="mt-4 text-[14.5px] leading-relaxed text-muted">
            Lotus seeds are one of the few snacks that are high in protein,
            almost fat free and naturally gluten free. We simply roast them and
            get out of the way.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-[24px] border border-white/10 bg-white/10 lg:grid-cols-4">
          {facts.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: EASE, delay: i * 0.08 }}
              className="bg-ink-soft px-6 py-8"
            >
              <p className="text-[32px] font-extrabold leading-none tracking-tight text-gold sm:text-[40px]">
                <Counter
                  to={f.value}
                  decimals={f.decimals}
                  suffix={f.suffix}
                />
              </p>
              <p className="mt-3 text-[12.5px] leading-snug text-dim">
                {f.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

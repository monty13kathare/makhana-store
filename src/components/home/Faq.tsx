"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Reveal, EASE } from "../motion-primitives";

const faqs = [
  {
    q: "What makes this Makhana premium?",
    a: "We exclusively grade for 6+ Suta (19mm+ jumbo diameter) seeds. Each kernel is hand-inspected, slow dry-roasted to peak crunch without palm oil, and sealed immediately to preserve airy crispness and delicate natural nutrients.",
  },
  {
    q: "How do you ensure crispness and long freshness?",
    a: "Our roasts are nitrogen-flushed and packaged in multi-barrier pouches that lock out oxygen and ambient humidity. Every batch remains ultra-crisp for up to 9 months unopened.",
  },
  {
    q: "Do you ship internationally?",
    a: "Yes! We partner with global express couriers to ship directly to over 20+ countries worldwide with real-time end-to-end tracking.",
  },
  {
    q: "Are your ingredients 100% natural and vegan?",
    a: "All our roasted varieties are completely plant-based (or made with authentic A2 ghee where specified), non-GMO, gluten-free, and crafted with pure gourmet seasonings without artificial preservatives or artificial flavors.",
  },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(null);

  const toggle = (i: number) => {
    setOpen((prev) => (prev === i ? null : i));
  };

  return (
    <section id="faq" className="relative py-16 lg:py-24">
      <div className="container-x relative">
        {/* Section Header */}
        <div className="relative mb-10 flex items-end justify-between">
          <Reveal>
            <p className="text-[13px] font-semibold tracking-wide text-[#8da366]">
              Frequently asked questions
            </p>
            <h2 className="mt-2 text-[32px] font-bold tracking-tight text-white sm:text-[42px]">
              Everything customers want to know
            </h2>
            <p className="mt-3 text-[15px] text-[#8e8e8e]">
              Got questions? We&apos;re here to answer every query.
            </p>
          </Reveal>

          {/* Top-Right Decorative Makhana Visual */}
          <div className="pointer-events-none absolute right-0 -top-8 hidden h-32 w-32 md:block lg:h-40 lg:w-40">
            <Image
              src="/img/hero-platter.jpg"
              alt=""
              fill
              sizes="160px"
              className="rounded-full object-cover opacity-60 blur-[0.5px]"
              aria-hidden
            />
          </div>
        </div>

        {/* 4 Accordion Pill Items */}
        <div className="flex flex-col gap-3">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <motion.div
                key={f.q}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, ease: EASE, delay: i * 0.06 }}
                className={`overflow-hidden rounded-[18px] border transition-all duration-300 ${
                  isOpen
                    ? "border-white/25 bg-[#1a1a1a]"
                    : "border-white/10 bg-[#141414] hover:border-white/20 hover:bg-[#181818]"
                }`}
              >
                <button
                  onClick={() => toggle(i)}
                  aria-expanded={isOpen}
                  className={`group flex w-full items-center justify-between px-6 py-4.5 text-left transition-colors ${
                    isOpen
                      ? "text-amber-400"
                      : "text-white hover:text-amber-400 active:text-amber-300"
                  }`}
                >
                  <span className="text-[15px] font-semibold sm:text-[16px]">
                    {f.q}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition-colors ${
                      isOpen
                        ? "text-amber-400"
                        : "text-white/70 group-hover:text-amber-400"
                    }`}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-white/5 px-6 pt-3 pb-5 text-[14px] leading-relaxed text-[#949494]">
                        {f.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

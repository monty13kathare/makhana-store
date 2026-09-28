"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  SlidersHorizontal,
  ChevronDown,
  Check,
  Flame,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { products } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import { EASE, Reveal } from "@/components/motion-primitives";

const heatFilters = [
  { key: "All", label: "All Products" },
  { key: "None", label: "None (Salt & Raw)" },
  { key: "Mild", label: "Mild (Pepper)" },
  { key: "Medium", label: "Medium (Pudina & Paprika)" },
  { key: "Hot", label: "Hot (Peri Peri)" },
] as const;

const sorts = [
  { key: "popular", label: "Most loved" },
  { key: "low", label: "Price: low to high" },
  { key: "high", label: "Price: high to low" },
] as const;

export default function ShopClient() {
  const [heat, setHeat] = useState<string>("All");
  const [sort, setSort] = useState<(typeof sorts)[number]["key"]>("popular");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(e.target as Node)
      ) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const visible = useMemo(() => {
    const list = products.filter((p) => heat === "All" || p.heat === heat);

    // Sort a copy — never mutate the imported catalogue
    return [...list].sort((a, b) => {
      if (sort === "low") return a.price - b.price;
      if (sort === "high") return b.price - a.price;
      return b.reviews - a.reviews;
    });
  }, [heat, sort]);

  const selectedSortObj = sorts.find((s) => s.key === sort) || sorts[0];

  return (
    <section className="pt-[116px] pb-20 lg:pt-[140px] lg:pb-28">
      <div className="container-x">
        {/* Section Header */}
        <Reveal className="mb-10">
          <div className="flex items-center gap-2">
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-amber-300">
              <Sparkles className="h-3 w-3" />
              The Collection
            </span>
          </div>
          <h1 className="max-w-[18ch] text-[34px] font-extrabold leading-[1.08] tracking-[-0.025em] sm:text-[48px] text-white">
            Every flavour we{" "}
            <span className="font-display italic text-amber-400">roast</span>
          </h1>
          <p className="mt-4 max-w-[54ch] text-[14.5px] leading-relaxed text-[#9a9a9a]">
            Graded 6+ Suta fox nuts, slow-roasted in pure ghee and gourmet herbs.
            Filter by spice profile or sort by customer preference.
          </p>
        </Reveal>

        {/* =========================================================================
            Luxury Filter & Sort Toolbar
           ========================================================================= */}
        <div className="relative z-30 mb-8 flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-white/12 bg-[#141414]/90 p-2.5 sm:px-5 sm:py-3.5 shadow-2xl backdrop-blur-xl">
          {/* Left: Heat Level Filters */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="mr-1.5 hidden sm:flex items-center gap-1.5 text-[11.5px] font-extrabold uppercase tracking-wider text-amber-400">
              <Flame className="h-3.5 w-3.5 text-amber-400" />
              Heat:
            </span>

            {heatFilters.map((h) => {
              const active = heat === h.key;
              return (
                <button
                  key={h.key}
                  onClick={() => setHeat(h.key)}
                  className={`relative rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition-all ${
                    active
                      ? "text-black font-extrabold"
                      : "text-white/70 hover:text-amber-400 hover:bg-white/[0.04] active:text-amber-300"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="heat-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-amber-400 shadow-md shadow-amber-400/30"
                      transition={{ duration: 0.3, ease: EASE }}
                    />
                  )}
                  {h.label}
                </button>
              );
            })}
          </div>

          {/* Right: Custom Luxury Dropdown */}
          <div className="relative z-40" ref={sortDropdownRef}>
            <button
              type="button"
              onClick={() => setIsSortOpen((prev) => !prev)}
              aria-haspopup="listbox"
              aria-expanded={isSortOpen}
              className={`flex items-center gap-2.5 rounded-full border px-4 py-2 text-[13px] font-semibold transition-all shadow-sm ${
                isSortOpen
                  ? "border-amber-400 bg-amber-400/10 text-amber-300 ring-2 ring-amber-400/25"
                  : "border-white/15 bg-white/[0.04] text-white hover:border-amber-400/50 hover:bg-amber-400/10 hover:text-amber-400 active:scale-95"
              }`}
            >
              <span className="text-[12px] font-medium text-white/50">Sort:</span>
              <span className="font-bold text-amber-300">
                {selectedSortObj.label}
              </span>
              <motion.div
                animate={{ rotate: isSortOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-amber-400"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </motion.div>
            </button>

            {/* Custom Theme Dropdown Menu Panel */}
            <AnimatePresence>
              {isSortOpen && (
                <motion.ul
                  initial={{ opacity: 0, y: -6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.96 }}
                  transition={{ duration: 0.18, ease: EASE }}
                  role="listbox"
                  className="absolute right-0 top-full mt-2.5 w-60 overflow-hidden rounded-2xl border border-amber-400/30 bg-[#161616]/98 p-1.5 shadow-[0_24px_60px_rgba(0,0,0,0.95)] backdrop-blur-2xl ring-1 ring-amber-400/20 z-50"
                >
                  <div className="flex items-center justify-between border-b border-white/10 px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider text-amber-400/70 mb-1">
                    <span>Sort by</span>
                    <SlidersHorizontal className="h-3 w-3 text-amber-400/50" />
                  </div>
                  {sorts.map((s) => {
                    const isSelected = sort === s.key;
                    return (
                      <li key={s.key}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => {
                            setSort(s.key);
                            setIsSortOpen(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-[13px] transition-all ${
                            isSelected
                              ? "bg-amber-400/15 font-bold text-amber-300 border border-amber-400/30"
                              : "font-medium text-white/80 hover:bg-white/5 hover:text-amber-400"
                          }`}
                        >
                          <span>{s.label}</span>
                          {isSelected && (
                            <Check className="h-4 w-4 text-amber-400 stroke-[2.5]" />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Counter & Active Filter Badge */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-[12.5px] text-[#8e8e8e]">
          <p>
            Showing <strong className="text-white">{visible.length}</strong> of{" "}
            {products.length} artisanal creations
          </p>
          {heat !== "All" && (
            <button
              onClick={() => setHeat("All")}
              className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[11.5px] font-semibold text-amber-300 transition-colors hover:bg-amber-400/20"
            >
              <RotateCcw className="h-3 w-3" />
              Reset filter
            </button>
          )}
        </div>

        {/* Products Grid */}
        <motion.div
          layout
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-stretch"
        >
          <AnimatePresence mode="popLayout">
            {visible.map((p, i) => (
              <motion.div
                key={p.slug}
                layout
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="h-full flex flex-col"
              >
                <ProductCard product={p} index={i} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty state if heat filter yielded zero */}
        {visible.length === 0 && (
          <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-[#141414] p-8 text-center my-12 shadow-xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/10 text-amber-400">
              <Flame className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-[18px] font-bold text-white">
              No Roasts with {heat} Heat
            </h3>
            <p className="mt-2 text-[13.5px] text-[#909090] leading-relaxed">
              We currently roast in None (Pink Salt), Mild (Truffle Black
              Pepper), and Hot (Peri Peri Roast).
            </p>
            <button
              onClick={() => setHeat("All")}
              className="mt-6 rounded-full bg-white px-6 py-2.5 text-[13px] font-bold text-black transition-all hover:bg-amber-400 hover:text-black active:bg-amber-300 shadow-md"
            >
              View All 3 Flavours
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

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
import type { Heat, Product, ProductSort } from "@/lib/api/types";
import { catalog } from "@/lib/api/store";
import { errorMessage, isAbortError } from "@/lib/api/errors";
import ProductCard from "@/components/ProductCard";
import { EASE, Reveal } from "@/components/motion-primitives";
import { ErrorState } from "@/components/ui/DataState";

const heatFilters: readonly { key: Heat | "All"; label: string; short: string }[] = [
  { key: "All", label: "All Products", short: "All" },
  { key: "None", label: "None (Salt & Raw)", short: "Salt & Raw" },
  { key: "Mild", label: "Mild (Pepper)", short: "Mild" },
  { key: "Medium", label: "Medium (Pudina & Paprika)", short: "Medium" },
  { key: "Hot", label: "Hot (Peri Peri)", short: "Hot" },
];

const sorts: readonly { key: ProductSort; label: string; short: string }[] = [
  { key: "popular", label: "Most loved", short: "Popular" },
  { key: "low", label: "Price: low to high", short: "Price ↑" },
  { key: "high", label: "Price: high to low", short: "Price ↓" },
];

type Listing = { key: string; products: Product[] };

/**
 * `initialProducts` is the server-rendered "all, most loved" listing (null if the
 * API was unreachable). Other filters/sorts are fetched from the API.
 */
export default function ShopClient({ initialProducts }: { initialProducts: Product[] | null }) {
  const [heat, setHeat] = useState<Heat | "All">("All");
  const [sort, setSort] = useState<ProductSort>("popular");
  const [listing, setListing] = useState<Listing | null>(
    initialProducts ? { key: "All|popular", products: initialProducts } : null,
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadNonce, setReloadNonce] = useState(0);
  const totalCount = initialProducts?.length ?? listing?.products.length ?? 0;
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

  // Filtering and ordering come from the API (GET /store/products?heat=&sort=).
  const wantedKey = `${heat}|${sort}`;
  useEffect(() => {
    if (listing?.key === wantedKey && reloadNonce === 0) return;
    const controller = new AbortController();
    catalog
      .products({ heat, sort }, { signal: controller.signal })
      .then((products) => {
        setListing({ key: wantedKey, products });
        setLoadError(null);
      })
      .catch((e: unknown) => {
        if (isAbortError(e)) return;
        console.error("[shop] products failed", e);
        setLoadError(errorMessage(e, "We couldn't load the collection."));
      });
    return () => controller.abort();
    // listing is read only to skip refetching what we already have
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wantedKey, reloadNonce]);

  const isLoading = listing?.key !== wantedKey && !loadError;
  const visible = useMemo(() => listing?.products ?? [], [listing]);

  const selectedSortObj = sorts.find((s) => s.key === sort) || sorts[0];

  // Phones: pin the filter bar under the fixed 68px navbar while scrolling.
  // (CSS `position: sticky` can't be used here: html AND body both set
  // overflow-x:hidden globally, which turns body into a non-scrolling scroll
  // container and disables sticky.) sm+ keeps the original static toolbar.
  const NAV_H = 68;
  const barSentinelRef = useRef<HTMLDivElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const [pinned, setPinned] = useState(false);
  const [barH, setBarH] = useState(0);

  useEffect(() => {
    const sentinel = barSentinelRef.current;
    if (!sentinel) return;
    const mq = window.matchMedia("(max-width: 639.98px)");
    const update = () => {
      const shouldPin =
        mq.matches && sentinel.getBoundingClientRect().top < NAV_H;
      if (shouldPin && barRef.current) setBarH(barRef.current.offsetHeight);
      setPinned(shouldPin);
    };
    const io = new IntersectionObserver(update, {
      rootMargin: `-${NAV_H}px 0px 0px 0px`,
      threshold: [0, 1],
    });
    io.observe(sentinel);
    mq.addEventListener("change", update);
    update();
    return () => {
      io.disconnect();
      mq.removeEventListener("change", update);
    };
  }, []);

  // When filtering/sorting from the pinned bar, bring the top of the list back
  const scrollToListTop = () => {
    const sentinel = barSentinelRef.current;
    if (!pinned || !sentinel) return;
    const y = sentinel.getBoundingClientRect().top + window.scrollY - NAV_H;
    window.scrollTo({ top: y });
  };

  return (
    <section className="pt-[88px] pb-10 sm:pt-[116px] sm:pb-20 lg:pt-[140px] lg:pb-28">
      <div className="container-x">
        {/* Section Header */}
        <Reveal className="mb-3 sm:mb-10">
          <div className="flex items-center gap-2">
            <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.2em] text-amber-300 sm:mb-3 sm:px-3 sm:py-1">
              <Sparkles className="h-3 w-3" />
              The Collection
            </span>
          </div>
          <h1 className="max-w-[18ch] text-[26px] font-extrabold leading-[1.08] tracking-[-0.025em] xs:text-[28px] sm:text-[48px] text-white">
            Every flavour we{" "}
            <span className="font-display italic text-amber-400">roast</span>
          </h1>
          <p className="mt-1.5 max-w-[54ch] text-[13px] leading-relaxed text-[#9a9a9a] sm:mt-4 sm:text-[14.5px]">
            Graded 6+ Suta fox nuts, slow-roasted in pure ghee and gourmet herbs.
            <span className="hidden sm:inline">
              {" "}
              Filter by spice profile or sort by customer preference.
            </span>
          </p>
        </Reveal>

        {/* =========================================================================
            Luxury Filter & Sort Toolbar
           ========================================================================= */}
        {/* Phones: full-bleed strip (pinned under the 68px navbar on scroll) with
            a single swipe row of chips + compact sort. sm+: the original box. */}
        <div ref={barSentinelRef} aria-hidden />
        <div
          className="mb-3 sm:mb-8"
          style={pinned ? { height: barH } : undefined}
        >
        <div
          ref={barRef}
          className={`z-30 flex items-center gap-2 border-y border-white/[0.06] bg-ink/90 py-2.5 pr-4 backdrop-blur-xl sm:relative sm:inset-auto sm:mx-0 sm:flex-wrap sm:justify-between sm:gap-4 sm:rounded-[24px] sm:border sm:border-white/12 sm:bg-[#141414]/90 sm:px-5 sm:py-3.5 sm:shadow-2xl ${
            pinned
              ? "fixed inset-x-0 top-[68px] shadow-[0_10px_24px_rgba(0,0,0,0.55)]"
              : "relative -mx-4"
          }`}
        >
          {/* Left: Heat Level Filters */}
          <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto scroll-pl-4 pl-4 pr-8 scrollbar-none [mask-image:linear-gradient(to_right,#000_88%,transparent)] sm:[mask-image:none] sm:min-w-auto sm:pr-0 sm:flex-initial sm:flex-wrap sm:gap-2 sm:overflow-visible sm:pl-0">
            <span className="mr-1.5 hidden sm:flex items-center gap-1.5 text-[11.5px] font-extrabold uppercase tracking-wider text-amber-400">
              <Flame className="h-3.5 w-3.5 text-amber-400" />
              Heat:
            </span>

            {heatFilters.map((h) => {
              const active = heat === h.key;
              return (
                <button
                  key={h.key}
                  onClick={(e) => {
                    setHeat(h.key);
                    scrollToListTop();
                    const chip = e.currentTarget;
                    const row = chip.parentElement;
                    row?.scrollTo({
                      left: chip.offsetLeft - (row.clientWidth - chip.offsetWidth) / 2,
                      behavior: "smooth",
                    });
                  }}
                  aria-pressed={active}
                  className={`relative h-10 shrink-0 whitespace-nowrap rounded-full border px-4 text-[13px] font-semibold transition-all sm:h-auto sm:border-0 sm:px-3.5 sm:py-1.5 sm:text-[12.5px] ${
                    active
                      ? "border-amber-400 text-black font-extrabold"
                      : "border-white/12 bg-white/[0.04] text-white/75 sm:bg-transparent hover:text-amber-400 sm:hover:bg-white/[0.04] active:text-amber-300"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="heat-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-amber-400 shadow-md shadow-amber-400/30"
                      transition={{ duration: 0.3, ease: EASE }}
                    />
                  )}
                  <span className="sm:hidden">{h.short}</span>
                  <span className="hidden sm:inline">{h.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right: Custom Luxury Dropdown */}
          <div className="relative z-40 shrink-0" ref={sortDropdownRef}>
            <button
              type="button"
              onClick={() => setIsSortOpen((prev) => !prev)}
              aria-haspopup="listbox"
              aria-expanded={isSortOpen}
              aria-label={`Sort: ${selectedSortObj.label}`}
              className={`flex h-10 items-center gap-1.5 rounded-full border px-3 text-[13px] font-semibold transition-all shadow-sm sm:h-auto sm:gap-2.5 sm:px-4 sm:py-2 ${
                isSortOpen
                  ? "border-amber-400 bg-amber-400/10 text-amber-300 ring-2 ring-amber-400/25"
                  : "border-white/15 bg-white/[0.04] text-white hover:border-amber-400/50 hover:bg-amber-400/10 hover:text-amber-400 active:scale-95"
              }`}
            >
              <SlidersHorizontal className="h-4 w-4 text-amber-400 sm:hidden" />
              <span className="hidden text-[12px] font-medium text-white/50 sm:inline">Sort:</span>
              <span className="font-bold text-amber-300">
                <span className="sm:hidden">{selectedSortObj.short}</span>
                <span className="hidden sm:inline">{selectedSortObj.label}</span>
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
                            scrollToListTop();
                            setIsSortOpen(false);
                          }}
                          className={`flex min-h-11 w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-[14px] transition-all sm:min-h-0 sm:text-[13px] ${
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
        </div>

        {/* Counter & Active Filter Badge */}
        <div className="mb-3 flex min-h-10 flex-wrap items-center justify-between gap-3 text-[12px] text-[#8e8e8e] sm:mb-6 sm:min-h-0 sm:text-[12.5px]">
          <p>
            {isLoading ? (
              <span role="status">Updating the collection…</span>
            ) : (
              <>
                Showing <strong className="text-white">{visible.length}</strong> of{" "}
                {totalCount} artisanal creations
              </>
            )}
          </p>
          {heat !== "All" && (
            <button
              onClick={() => setHeat("All")}
              className="inline-flex h-10 items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 text-[12px] sm:h-auto sm:px-3 sm:py-1 sm:text-[11.5px] font-semibold text-amber-300 transition-colors hover:bg-amber-400/20"
            >
              <RotateCcw className="h-3 w-3" />
              Reset filter
            </button>
          )}
        </div>

        {loadError && (
          <ErrorState
            className="mb-6"
            title="The collection didn't load"
            message={loadError}
            onRetry={() => {
              setLoadError(null);
              setReloadNonce((n) => n + 1);
            }}
          />
        )}

        {/* Products Grid */}
        <motion.div
          layout
          aria-busy={isLoading}
          className="grid grid-cols-2 gap-2.5 xs:gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4 items-stretch"
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
        {visible.length === 0 && !isLoading && !loadError && (
          <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-[#141414] p-8 text-center my-12 shadow-xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/10 text-amber-400">
              <Flame className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-[18px] font-bold text-white">
              {heat === "All" ? "No roasts available right now" : `No Roasts with ${heat} Heat`}
            </h3>
            <p className="mt-2 text-[13.5px] text-[#909090] leading-relaxed">
              {heat === "All"
                ? "Fresh batches are on their way. Please check back soon."
                : "Try another heat level, or browse the whole collection."}
            </p>
            <button
              onClick={() => setHeat("All")}
              className="mt-6 rounded-full bg-white px-6 py-2.5 text-[13px] font-bold text-black transition-all hover:bg-amber-400 hover:text-black active:bg-amber-300 shadow-md"
            >
              View All Flavours
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

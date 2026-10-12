"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  Leaf,
  MapPin,
  Minus,
  Plus,
  RotateCcw,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import type { Product, ProductDetail, ShippingEstimate } from "@/lib/api/types";
import { catalog } from "@/lib/api/store";
import { errorMessage } from "@/lib/api/errors";
import { formatDeliveryWindow, formatMoney } from "@/lib/format";
import { baseVariantLabel, percentOff } from "@/lib/product";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useStoreConfig } from "@/context/StoreConfigContext";
import ProductCard from "@/components/ProductCard";
import { EASE, Reveal } from "@/components/motion-primitives";

const VARIANT_GRID: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
};

/** Destinations for the "Deliver to" checker; the API maps them to shipping zones. */
const DELIVERY_COUNTRIES = [
  "United States",
  "Canada",
  "United Kingdom",
  "India",
  "United Arab Emirates",
  "Australia",
  "Germany",
  "France",
  "Singapore",
] as const;

type EstimateState =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "done"; data: ShippingEstimate }
  | { state: "error"; message: string };

const noopSubscribe = () => () => {};
/** True only on the client after hydration, so we can portal into <body>. */
function useIsClient() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
}

export default function ProductClient({
  product,
  related,
}: {
  product: ProductDetail;
  related: Product[];
}) {
  const router = useRouter();
  const { addProduct, qtyOf, openAddedModal } = useCart();
  const { config } = useStoreConfig();

  const { isLiked, toggleLike } = useWishlist();

  const liked = isLiked(product.slug);
  const assurances = [
    { icon: Truck, text: `Free shipping over ${formatMoney(config.freeShippingOver)}` },
    { icon: RotateCcw, text: "7-day easy returns" },
    { icon: ShieldCheck, text: "FSSAI certified kitchen" },
    { icon: Leaf, text: "Recyclable packaging" },
  ];

  // Sizes and their prices come from the API (`variants`); the base size is preselected.
  const variants = product.variants.length
    ? product.variants
    : [{ label: product.weight, price: product.price, mrp: product.mrp, inStock: product.inStock, isBase: true }];
  const [selectedWeight, setSelectedWeight] = useState<string>(
    () => baseVariantLabel(product) ?? variants[0].label,
  );
  const selected = variants.find((v) => v.label === selectedWeight) ?? variants[0];
  const variantInStock = product.inStock && selected.inStock;
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [tab, setTab] = useState<"nutrition" | "ingredients">("nutrition");
  const [active, setActive] = useState(0);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState<string>(DELIVERY_COUNTRIES[0]);
  const [estimate, setEstimate] = useState<EstimateState>({ state: "idle" });
  const isClient = useIsClient();
  const swipeRef = useRef<HTMLDivElement>(null);

  // Phone gallery: derive the visible slide from the snap row's scroll offset.
  const handleSwipeScroll = () => {
    const el = swipeRef.current;
    const first = el?.firstElementChild as HTMLElement | null;
    if (!el || !first) return;
    const idx = Math.round(el.scrollLeft / (first.offsetWidth + 12));
    if (idx !== active) setActive(idx);
  };

  const inCart = qtyOf({ slug: product.slug, variant: selected.label }) > 0;
  const isAdded = inCart || justAdded;

  // Gallery reuses the hero shot plus process imagery as supporting frames.
  const gallery = [
    product.image,
    "/img/roasting-fire.jpg",
    "/img/grading-seeds.jpg",
  ];

  // Each size has its own server price.
  const effectivePrice = selected.price;
  const effectiveMrp = selected.mrp;
  const off = percentOff(effectivePrice, effectiveMrp);

  const checkDelivery = async () => {
    setEstimate({ state: "loading" });
    try {
      const data = await catalog.estimate({
        country,
        zip: zipCode.trim() || undefined,
        subtotal: Math.round(effectivePrice * qty * 100) / 100,
      });
      setEstimate({ state: "done", data });
    } catch (e) {
      setEstimate({ state: "error", message: errorMessage(e, "We couldn't check delivery right now.") });
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg((cur) => (cur === msg ? null : cur)), 2500);
  };

  const handleLikeToggle = () => {
    const isNowLiked = toggleLike(product.slug);
    showToast(
      isNowLiked
        ? `Saved ${product.name} to favourites ❤️`
        : `Removed from favourites`
    );
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => showToast("Product link copied to clipboard! 📋"))
        .catch(() => showToast("Couldn't copy the link"));
    }
  };

  const addSelected = () =>
    addProduct(
      { ...product, price: effectivePrice, mrp: effectiveMrp, weight: selected.label },
      { variant: selected.label, qty },
    );

  const handleAddToCart = () => {
    if (!variantInStock) return;
    addSelected();
    setJustAdded(true);
    openAddedModal({
      ...product,
      name: `${product.name} (${selected.label})`,
      price: effectivePrice,
      mrp: effectiveMrp,
      weight: selected.label,
    });
  };

  const handleBuyNow = () => {
    if (!variantInStock) return;
    addSelected();
    router.push("/checkout");
  };

  return (
    <>
      <section className="pt-[76px] pb-8 sm:pt-[116px] sm:pb-16 lg:pt-[140px] lg:pb-24">
        <div className="container-x">
          {/* Phone: compact back affordance (the bottom dock is hidden here) */}
          <div className="mb-1 flex items-center justify-between md:hidden">
            <Link
              href="/shop"
              className="-ml-2 inline-flex h-11 items-center gap-1 rounded-full pl-1 pr-3 text-[13.5px] font-semibold text-white/80 transition-colors active:bg-white/5 active:text-amber-300"
            >
              <ChevronLeft className="h-5 w-5" />
              Shop
            </Link>
          </div>

          {/* Breadcrumb */}
          <nav className="mb-7 hidden items-center gap-1.5 text-[12.5px] text-dim md:flex">
            <Link
              href="/"
              className="transition-colors hover:text-amber-400 active:text-amber-300"
            >
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link
              href="/shop"
              className="transition-colors hover:text-amber-400 active:text-amber-300"
            >
              Shop
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-white">{product.name}</span>
          </nav>

          <div className="grid gap-5 sm:gap-10 lg:grid-cols-2 lg:gap-14">
            {/* Gallery Column */}
            <div>
              {/* Phone: swipeable snap gallery with dots */}
              <div className="relative md:hidden">
                <div
                  ref={swipeRef}
                  onScroll={handleSwipeScroll}
                  className="swipe-row gap-3"
                  aria-label="Product images"
                >
                  {gallery.map((g, i) => (
                    <div
                      key={g + i}
                      className="relative aspect-square w-full shrink-0 snap-start overflow-hidden rounded-[20px] border border-white/10 bg-ink-soft"
                    >
                      <div className="glow-warm pointer-events-none absolute inset-0 z-10" />
                      <Image
                        src={g}
                        alt={i === 0 ? product.name : ""}
                        fill
                        priority={i === 0}
                        sizes="100vw"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>

                {product.badge && (
                  <span className="pointer-events-none absolute left-3 top-3 z-20 rounded-full border border-amber-400/40 bg-black/75 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-300 backdrop-blur-md shadow-md">
                    {product.badge}
                  </span>
                )}
                <span className="pointer-events-none absolute right-3 top-3 z-20 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold tabular-nums text-white/85 backdrop-blur-md">
                  {active + 1}/{gallery.length}
                </span>

                <div className="mt-3 flex justify-center gap-1.5" aria-hidden>
                  {gallery.map((g, i) => (
                    <span
                      key={g + i}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        active === i ? "w-5 bg-amber-400" : "w-1.5 bg-white/25"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="relative hidden aspect-square overflow-hidden rounded-[24px] border border-white/10 bg-ink-soft md:block">
                <div className="glow-warm pointer-events-none absolute inset-0 z-10" />
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active}
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: EASE }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={gallery[active]}
                      alt={product.name}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </motion.div>
                </AnimatePresence>

                {product.badge && (
                  <span className="absolute left-4 top-4 z-20 rounded-full border border-amber-400/40 bg-black/75 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-300 backdrop-blur-md shadow-md">
                    {product.badge}
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              <div className="mt-3 hidden gap-3 md:flex">
                {gallery.map((g, i) => (
                  <button
                    key={g + i}
                    onClick={() => setActive(i)}
                    aria-label={`View image ${i + 1}`}
                    className={`relative h-20 w-20 overflow-hidden rounded-xl border transition-colors ${
                      active === i
                        ? "border-amber-400 ring-2 ring-amber-400/30"
                        : "border-white/10 hover:border-amber-400/50"
                    }`}
                  >
                    <Image
                      src={g}
                      alt=""
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Detail Column */}
            <Reveal>
              {/* Rating + Like & Share Actions Bar */}
              <div className="mb-2 flex items-center justify-between sm:mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <span className="text-[12.5px] font-bold text-white">
                    {product.rating}
                  </span>
                  <span className="text-[12.5px] text-dim">
                    ({product.reviews} reviews)
                  </span>
                </div>

                {/* Like & Share Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleShare}
                    title="Share product"
                    aria-label="Share product"
                    className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/5 sm:h-10 sm:w-10 text-white/70 transition-all hover:border-amber-400/40 hover:bg-amber-400/10 hover:text-amber-400 active:scale-95"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>

                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={handleLikeToggle}
                    title={liked ? "Remove from wishlist" : "Add to wishlist"}
                    aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
                    className={`group relative grid h-11 w-11 place-items-center rounded-xl border transition-all sm:h-10 sm:w-10 ${
                      liked
                        ? "border-rose-500/50 bg-rose-500/15 text-rose-500 shadow-md shadow-rose-500/20"
                        : "border-white/15 bg-white/5 text-white/70 hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-400 active:scale-95"
                    }`}
                  >
                    <motion.div
                      animate={liked ? { scale: [1, 1.35, 1] } : { scale: 1 }}
                      transition={{ duration: 0.25 }}
                    >
                      <Heart
                        className={`h-5 w-5 transition-colors ${
                          liked
                            ? "fill-rose-500 text-rose-500"
                            : "text-white/80 group-hover:text-rose-400"
                        }`}
                      />
                    </motion.div>
                  </motion.button>
                </div>
              </div>

              {/* Title & Tagline */}
              <h1 className="text-[27px] font-extrabold leading-[1.1] tracking-[-0.025em] xs:text-[30px] sm:text-[42px] text-white">
                {product.name}
              </h1>
              <p className="mt-1.5 text-[14px] font-medium text-amber-400 sm:mt-2 sm:text-[14.5px]">
                {product.tagline}
              </p>

              <p className="mt-3 max-w-[52ch] text-[14px] leading-relaxed text-[#9a9a9a] sm:mt-4 sm:text-[14.5px]">
                {product.description}
              </p>

              {/* Tags / Pills (Luxury Edition, Refined Taste, etc.) */}
              <div className="mt-4 flex flex-wrap gap-2 sm:mt-5">
                {product.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-[11.5px] font-semibold text-white/80"
                  >
                    {t}
                  </span>
                ))}
              </div>

              {/* Subtle Divider (as shown in reference design) */}
              <div className="my-5 h-px w-full bg-white/10 sm:my-6" />

              {/* Price Row (Dynamic based on selected weight) */}
              <div className="flex items-baseline gap-2.5 sm:gap-3">
                <span className="text-[32px] font-extrabold tracking-tight text-white sm:text-[36px]">
                  {formatMoney(effectivePrice)}
                  <span className="text-[20px] font-normal text-white/50">/-</span>
                </span>
                <span className="text-[17px] text-dim line-through">
                  {formatMoney(effectiveMrp)}/-
                </span>
                {off > 0 && (
                  <span className="rounded-full bg-amber-400 px-2.5 py-1 text-[11.5px] font-bold text-black">
                    {off}% off
                  </span>
                )}
                <span className="ml-auto text-[13px] text-muted">
                  Pack size:{" "}
                  <strong className="text-amber-300 font-bold">
                    {selectedWeight}
                  </strong>
                </span>
              </div>

              {/* Weight Selector Feature (50g, 100g, 150g, 200g) */}
              <div className="mt-4 sm:mt-5">
                <div className="mb-2.5 flex items-center justify-between text-[12.5px]">
                  <span className="font-semibold text-white/90">
                    Select Weight:
                  </span>
                  <span
                    role="status"
                    className={`text-[11.5px] font-medium ${
                      !variantInStock ? "text-red-400" : product.lowStock ? "text-amber-300" : "text-emerald-400"
                    }`}
                  >
                    {!variantInStock
                      ? "Out of Stock"
                      : product.lowStock
                        ? "Low Stock · Only a few left"
                        : "In Stock · Roasted in Small Batches"}
                  </span>
                </div>
                <div
                  role="radiogroup"
                  aria-label="Pack size"
                  className={`grid ${VARIANT_GRID[variants.length] ?? "grid-cols-4"} gap-2.5 sm:gap-3`}
                >
                  {variants.map((v) => {
                    const isActive = selected.label === v.label;
                    return (
                      <button
                        key={v.label}
                        type="button"
                        role="radio"
                        aria-checked={isActive}
                        onClick={() => setSelectedWeight(v.label)}
                        title={v.inStock ? `${v.label} · ${formatMoney(v.price)}` : `${v.label} · out of stock`}
                        className={`relative flex min-h-11 items-center justify-center rounded-xl py-3 text-[14px] font-bold transition-all ${
                          isActive
                            ? "bg-white text-black shadow-lg shadow-white/15 ring-2 ring-white/30"
                            : "border border-white/15 bg-white/[0.04] text-white/70 hover:border-white/30 hover:bg-white/[0.08] hover:text-white active:scale-95"
                        } ${v.inStock ? "" : "line-through opacity-50"}`}
                      >
                        {v.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Phone: quantity row (CTAs live in the sticky bottom bar) */}
              <div className="mt-4 flex items-center justify-between md:hidden">
                <span className="text-[12.5px] font-semibold text-white/90">
                  Quantity:
                </span>
                <div className="flex items-center rounded-full border border-white/15 bg-white/[0.03]">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                    disabled={qty <= 1}
                    className="grid h-11 w-11 place-items-center rounded-full text-white transition-colors active:bg-amber-400/15 active:text-amber-300 disabled:text-white/30"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center text-[15px] font-bold tabular-nums text-white">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty((q) => Math.min(99, q + 1))}
                    aria-label="Increase quantity"
                    className="grid h-11 w-11 place-items-center rounded-full text-white transition-colors active:bg-amber-400/15 active:text-amber-300"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Quantity + Add to Bag + Buy Now */}
              <div className="mt-6 hidden flex-wrap items-center gap-3 md:flex">
                {/* Quantity Pill */}
                <div className="flex items-center gap-1 rounded-full border border-white/15 p-1.5">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                    className="grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-amber-400/10 hover:text-amber-400 active:text-amber-300"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-9 text-center font-bold tabular-nums text-white">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty((q) => Math.min(99, q + 1))}
                    aria-label="Increase quantity"
                    className="grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-amber-400/10 hover:text-amber-400 active:text-amber-300"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {/* Add to Bag Button */}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleAddToCart}
                  disabled={!variantInStock}
                  className={`flex-1 disabled:opacity-50 disabled:pointer-events-none rounded-full px-6 py-3.5 text-[14px] font-bold transition-all shadow-md ${
                    isAdded
                      ? "bg-amber-400 text-black ring-2 ring-amber-400/40"
                      : "bg-white text-black hover:bg-amber-400 hover:text-black active:bg-amber-300"
                  }`}
                >
                  <AnimatePresence mode="wait">
                    {isAdded ? (
                      <motion.span
                        key="added"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 20,
                        }}
                        className="flex items-center justify-center gap-1.5"
                      >
                        <Check className="h-4 w-4 stroke-[3]" />
                        Added to Bag
                      </motion.span>
                    ) : (
                      <motion.span
                        key="default"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        {variantInStock ? (
                          <>
                            Add {qty > 1 ? `${qty} ` : ""}to bag ·{" "}
                            {formatMoney(effectivePrice * qty)}
                          </>
                        ) : (
                          "Out of stock"
                        )}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>

                {/* Buy Now Button */}
                <button
                  onClick={handleBuyNow}
                  disabled={!variantInStock}
                  className="disabled:opacity-40 disabled:pointer-events-none rounded-full border border-amber-400/40 bg-amber-400/10 px-6 py-3.5 text-[14px] font-bold text-amber-300 transition-all hover:bg-amber-400 hover:text-black active:scale-95"
                >
                  Buy Now
                </button>
              </div>

              {/* Delivery Estimator Pin Widget */}
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-3 sm:mt-6 sm:p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex shrink-0 items-center gap-2 text-[12.5px] text-white/80">
                    <MapPin className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>Deliver to:</span>
                  </div>
                  <form
                    className="flex min-w-0 items-center gap-1.5"
                    onSubmit={(e) => {
                      e.preventDefault();
                      void checkDelivery();
                    }}
                  >
                    <select
                      aria-label="Country"
                      value={country}
                      onChange={(e) => {
                        setCountry(e.target.value);
                        setEstimate({ state: "idle" });
                      }}
                      className="h-11 w-full min-w-0 max-w-[120px] rounded-lg border border-white/15 bg-black/40 px-2 py-1 text-[16px] text-white outline-none focus:border-amber-400 sm:h-auto sm:w-28 sm:py-1.5 sm:text-[12px]"
                    >
                      {DELIVERY_COUNTRIES.map((c) => (
                        <option key={c} value={c} className="bg-[#161616]">
                          {c}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      autoComplete="postal-code"
                      aria-label="Zip code"
                      maxLength={12}
                      value={zipCode}
                      onChange={(e) => {
                        setZipCode(e.target.value);
                        setEstimate({ state: "idle" });
                      }}
                      placeholder="Zip Code"
                      className="h-11 w-full min-w-0 max-w-[110px] rounded-lg border border-white/15 bg-black/40 px-3 py-1 text-[16px] text-white outline-none focus:border-amber-400 placeholder:text-white/30 sm:h-auto sm:w-24 sm:px-2.5 sm:text-[12px]"
                    />
                    <button
                      type="submit"
                      disabled={estimate.state === "loading"}
                      className="h-11 shrink-0 rounded-lg bg-white/10 px-4 py-1 text-[13px] font-bold sm:h-auto sm:px-3 sm:text-[11.5px] text-white hover:bg-amber-400 hover:text-black transition-colors disabled:opacity-60"
                    >
                      {estimate.state === "loading" ? "…" : "Check"}
                    </button>
                  </form>
                </div>
                <div aria-live="polite">
                  {estimate.state === "done" && (
                    <motion.p
                      initial={{ opacity: 0, y: -2 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mt-2 text-[11.5px] font-medium ${
                        estimate.data.deliverable ? "text-emerald-400" : "text-amber-300"
                      }`}
                    >
                      {estimate.data.deliverable ? "✓ " : ""}
                      {estimate.data.message ??
                        `Delivery ${formatDeliveryWindow(estimate.data.window.from, estimate.data.window.to)}`}
                      {estimate.data.deliverable && (
                        <span className="text-white/60">
                          {" "}
                          · {estimate.data.freeShipping ? "Free shipping" : `Shipping ${formatMoney(estimate.data.fee)}`}
                          {estimate.data.codAvailable ? " · Cash on delivery available" : ""}
                        </span>
                      )}
                    </motion.p>
                  )}
                  {estimate.state === "error" && (
                    <p role="alert" className="mt-2 text-[11.5px] font-medium text-red-400">
                      {estimate.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Assurances */}
              <ul className="mt-5 grid grid-cols-2 gap-x-3 gap-y-2.5 border-t border-white/10 pt-4 sm:mt-7 sm:gap-4 sm:pt-6">
                {assurances.map((a) => (
                  <li
                    key={a.text}
                    className="flex items-center gap-2 text-[12px] leading-tight text-muted sm:gap-2.5 sm:text-[13px] sm:leading-[inherit]"
                  >
                    <a.icon className="h-3.5 w-3.5 shrink-0 text-amber-400 sm:h-4 sm:w-4" />
                    {a.text}
                  </li>
                ))}
              </ul>

              {/* Tabs: Nutrition / Ingredients */}
              <div className="mt-6 overflow-hidden rounded-[18px] border border-white/10 bg-surface sm:mt-8">
                <div className="flex border-b border-white/10">
                  {(["nutrition", "ingredients"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={`relative min-h-12 flex-1 px-5 py-3.5 text-[13px] font-semibold capitalize transition-colors ${
                        tab === t
                          ? "text-amber-400"
                          : "text-dim hover:text-amber-400 active:text-amber-300"
                      }`}
                    >
                      {t}
                      {tab === t && (
                        <motion.span
                          layoutId="tab-underline"
                          className="absolute inset-x-0 bottom-0 h-0.5 bg-amber-400"
                          transition={{ duration: 0.35, ease: EASE }}
                        />
                      )}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={tab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.28, ease: EASE }}
                    className="p-4 sm:p-5"
                  >
                    {tab === "nutrition" ? (
                      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        {product.nutrition.map((n) => (
                          <div key={n.label}>
                            <dt className="text-[11.5px] uppercase tracking-wider text-dim">
                              {n.label}
                            </dt>
                            <dd className="mt-1 text-[19px] font-extrabold text-amber-400">
                              {n.value}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    ) : (
                      <p className="text-[13.5px] leading-relaxed text-muted">
                        {product.ingredients}
                      </p>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Goes Well With (Related Products) */}
      <section className="pb-12 sm:pb-20 lg:pb-28">
        <div className="container-x">
          <Reveal className="mb-4 sm:mb-8">
            <h2 className="text-[21px] font-extrabold tracking-[-0.02em] sm:text-[30px] text-white">
              Goes well with
            </h2>
          </Reveal>
          {/* Phone: horizontal swipe row; sm+: original grid */}
          <div className="swipe-row gap-3 pb-1 sm:mx-0 sm:grid sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
            {related.map((p, i) => (
              <div
                key={p.slug}
                className="flex h-full w-[78%] shrink-0 snap-start flex-col sm:w-auto"
              >
                <ProductCard product={p} index={i} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Phone: sticky purchase bar. Portaled to <body> so its spacer lands
          after the footer and nothing ends up hidden underneath it. */}
      {isClient &&
        createPortal(
          <>
            <div
              aria-hidden
              className="md:hidden"
              style={{ height: "calc(80px + env(safe-area-inset-bottom))" }}
            />
            <div
              className="fixed inset-x-0 bottom-0 z-30 md:hidden"
              style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
            >
              <div className="absolute inset-0 border-t border-white/10 bg-ink/90 backdrop-blur-xl" />
              <div className="relative mx-auto flex h-[72px] max-w-md items-center gap-2.5 px-4">
                <div className="min-w-0 shrink-0 pr-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[19px] font-extrabold leading-none tracking-tight text-white tabular-nums">
                      {formatMoney(effectivePrice * qty)}
                    </span>
                    {off > 0 && (
                      <span className="text-[11px] font-bold text-amber-400">
                        {off}% off
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-[11px] leading-none text-white/55">
                    {selectedWeight} · Qty {qty}
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={handleAddToCart}
                  disabled={!variantInStock}
                  className={`disabled:opacity-50 flex h-12 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full px-3 text-[14px] font-bold transition-colors ${
                    isAdded
                      ? "border border-amber-400/50 bg-amber-400/10 text-amber-300"
                      : "border border-white/20 bg-white/[0.06] text-white active:bg-white/15"
                  }`}
                >
                  {isAdded ? (
                    <Check className="h-4 w-4 shrink-0 stroke-[3]" />
                  ) : (
                    <ShoppingBag className="h-4 w-4 shrink-0" />
                  )}
                  <span className="truncate">
                    {!variantInStock ? "Sold out" : isAdded ? "Added" : "Add to Bag"}
                  </span>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={handleBuyNow}
                  disabled={!variantInStock}
                  className="disabled:opacity-50 flex h-12 min-w-0 flex-1 items-center justify-center rounded-full bg-amber-400 px-3 text-[14px] font-bold text-black shadow-[0_8px_22px_-8px_rgba(229,169,60,0.8)] active:bg-amber-300"
                >
                  <span className="truncate">Buy Now</span>
                </motion.button>
              </div>
            </div>
          </>,
          document.body
        )}

      {/* Floating Interactive Toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            style={{ marginBottom: "env(safe-area-inset-bottom)" }}
            className="fixed inset-x-4 bottom-[88px] z-[100] flex items-center gap-2.5 md:inset-x-auto md:bottom-6 md:right-6 md:!mb-0 rounded-2xl border border-amber-400/40 bg-[#161616]/95 px-4 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-xl"
          >
            <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
            <span className="text-[13px] font-semibold text-white">
              {toastMsg}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

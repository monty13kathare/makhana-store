"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronRight,
  Heart,
  Leaf,
  MapPin,
  Minus,
  Plus,
  RotateCcw,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import { formatUSD, type Product } from "@/lib/products";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import ProductCard from "@/components/ProductCard";
import { EASE, Reveal } from "@/components/motion-primitives";

const WEIGHT_OPTIONS = ["50g", "100g", "150g", "200g"] as const;
type WeightOption = (typeof WEIGHT_OPTIONS)[number];

const WEIGHT_MULTIPLIERS: Record<
  WeightOption,
  { priceRatio: number; mrpRatio: number }
> = {
  "50g": { priceRatio: 0.45, mrpRatio: 0.45 },
  "100g": { priceRatio: 0.68, mrpRatio: 0.68 },
  "150g": { priceRatio: 0.86, mrpRatio: 0.86 },
  "200g": { priceRatio: 1.0, mrpRatio: 1.0 },
};

const assurances = [
  { icon: Truck, text: "Free shipping over $49" },
  { icon: RotateCcw, text: "7-day easy returns" },
  { icon: ShieldCheck, text: "FSSAI certified kitchen" },
  { icon: Leaf, text: "Recyclable packaging" },
];

export default function ProductClient({
  product,
  related,
}: {
  product: Product;
  related: Product[];
}) {
  const router = useRouter();
  const { add, lines, openAddedModal } = useCart();

  const { isLiked, toggleLike } = useWishlist();

  const liked = isLiked(product.slug);
  const [selectedWeight, setSelectedWeight] = useState<WeightOption>("200g");
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [tab, setTab] = useState<"nutrition" | "ingredients">("nutrition");
  const [active, setActive] = useState(0);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [zipCode, setZipCode] = useState("");
  const [zipChecked, setZipChecked] = useState(false);

  const cartItem = lines?.find((l) => l.slug === product.slug);
  const inCart = Boolean(cartItem && cartItem.qty > 0);
  const isAdded = inCart || justAdded;

  // Gallery reuses the hero shot plus process imagery as supporting frames.
  const gallery = [
    product.image,
    "/img/roasting-fire.jpg",
    "/img/grading-seeds.jpg",
  ];

  // Dynamic pricing based on selected weight
  const effectivePrice = Math.max(
    5,
    Math.round(product.price * WEIGHT_MULTIPLIERS[selectedWeight].priceRatio)
  );
  const effectiveMrp = Math.max(
    effectivePrice + 2,
    Math.round(product.mrp * WEIGHT_MULTIPLIERS[selectedWeight].mrpRatio)
  );
  const off = Math.round(((effectiveMrp - effectivePrice) / effectiveMrp) * 100);

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
      navigator.clipboard.writeText(window.location.href);
      showToast("Product link copied to clipboard! 📋");
    }
  };

  const handleAddToCart = () => {
    add(product.slug, qty, false);
    setJustAdded(true);
    openAddedModal({
      ...product,
      name: `${product.name} (${selectedWeight})`,
      price: effectivePrice,
    });
  };

  const handleBuyNow = () => {
    add(product.slug, qty);
    router.push("/checkout");
  };

  return (
    <>
      <section className="pt-[116px] pb-16 lg:pt-[140px] lg:pb-24">
        <div className="container-x">
          {/* Breadcrumb */}
          <nav className="mb-7 flex items-center gap-1.5 text-[12.5px] text-dim">
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

          <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
            {/* Gallery Column */}
            <div>
              <div className="relative aspect-square overflow-hidden rounded-[24px] border border-white/10 bg-ink-soft">
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
              <div className="mt-3 flex gap-3">
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
              <div className="mb-3 flex items-center justify-between">
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
                    className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-white/70 transition-all hover:border-amber-400/40 hover:bg-amber-400/10 hover:text-amber-400 active:scale-95"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>

                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={handleLikeToggle}
                    title={liked ? "Remove from wishlist" : "Add to wishlist"}
                    aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
                    className={`group relative grid h-10 w-10 place-items-center rounded-xl border transition-all ${
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
              <h1 className="text-[32px] font-extrabold leading-[1.1] tracking-[-0.025em] sm:text-[42px] text-white">
                {product.name}
              </h1>
              <p className="mt-2 text-[14.5px] font-medium text-amber-400">
                {product.tagline}
              </p>

              <p className="mt-4 max-w-[52ch] text-[14.5px] leading-relaxed text-[#9a9a9a]">
                {product.description}
              </p>

              {/* Tags / Pills (Luxury Edition, Refined Taste, etc.) */}
              <div className="mt-5 flex flex-wrap gap-2">
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
              <div className="my-6 h-px w-full bg-white/10" />

              {/* Price Row (Dynamic based on selected weight) */}
              <div className="flex items-baseline gap-3">
                <span className="text-[36px] font-extrabold tracking-tight text-white">
                  {formatUSD(effectivePrice)}
                  <span className="text-[20px] font-normal text-white/50">/-</span>
                </span>
                <span className="text-[17px] text-dim line-through">
                  {formatUSD(effectiveMrp)}/-
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
              <div className="mt-5">
                <div className="mb-2.5 flex items-center justify-between text-[12.5px]">
                  <span className="font-semibold text-white/90">
                    Select Weight:
                  </span>
                  <span className="text-[11.5px] text-emerald-400 font-medium">
                    In Stock · Roasted in Small Batches
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
                  {WEIGHT_OPTIONS.map((w) => {
                    const isActive = selectedWeight === w;
                    return (
                      <button
                        key={w}
                        type="button"
                        onClick={() => setSelectedWeight(w)}
                        className={`relative flex items-center justify-center rounded-xl py-3 text-[14px] font-bold transition-all ${
                          isActive
                            ? "bg-white text-black shadow-lg shadow-white/15 ring-2 ring-white/30"
                            : "border border-white/15 bg-white/[0.04] text-white/70 hover:border-white/30 hover:bg-white/[0.08] hover:text-white active:scale-95"
                        }`}
                      >
                        {w}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity + Add to Bag + Buy Now */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
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
                  className={`flex-1 rounded-full px-6 py-3.5 text-[14px] font-bold transition-all shadow-md ${
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
                        Add {qty > 1 ? `${qty} ` : ""}to bag ·{" "}
                        {formatUSD(effectivePrice * qty)}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>

                {/* Buy Now Button */}
                <button
                  onClick={handleBuyNow}
                  className="rounded-full border border-amber-400/40 bg-amber-400/10 px-6 py-3.5 text-[14px] font-bold text-amber-300 transition-all hover:bg-amber-400 hover:text-black active:scale-95"
                >
                  Buy Now
                </button>
              </div>

              {/* Delivery Estimator Pin Widget */}
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-[12.5px] text-white/80">
                    <MapPin className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>Deliver to:</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      maxLength={6}
                      value={zipCode}
                      onChange={(e) => {
                        setZipCode(e.target.value);
                        setZipChecked(false);
                      }}
                      placeholder="Enter Zip Code"
                      className="w-28 rounded-lg border border-white/15 bg-black/40 px-2.5 py-1 text-[12px] text-white outline-none focus:border-amber-400 placeholder:text-white/30"
                    />
                    <button
                      type="button"
                      onClick={() => setZipChecked(true)}
                      className="rounded-lg bg-white/10 px-3 py-1 text-[11.5px] font-bold text-white hover:bg-amber-400 hover:text-black transition-colors"
                    >
                      Check
                    </button>
                  </div>
                </div>
                {zipChecked && (
                  <motion.p
                    initial={{ opacity: 0, y: -2 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-[11.5px] text-emerald-400 font-medium"
                  >
                    ✓ Express delivery available! Order now for delivery in 2–3 business days.
                  </motion.p>
                )}
              </div>

              {/* Assurances */}
              <ul className="mt-7 grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
                {assurances.map((a) => (
                  <li
                    key={a.text}
                    className="flex items-center gap-2.5 text-[13px] text-muted"
                  >
                    <a.icon className="h-4 w-4 shrink-0 text-amber-400" />
                    {a.text}
                  </li>
                ))}
              </ul>

              {/* Tabs: Nutrition / Ingredients */}
              <div className="mt-8 overflow-hidden rounded-[18px] border border-white/10 bg-surface">
                <div className="flex border-b border-white/10">
                  {(["nutrition", "ingredients"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={`relative flex-1 px-5 py-3.5 text-[13px] font-semibold capitalize transition-colors ${
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
                    className="p-5"
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
      <section className="pb-20 lg:pb-28">
        <div className="container-x">
          <Reveal className="mb-8">
            <h2 className="text-[24px] font-extrabold tracking-[-0.02em] sm:text-[30px] text-white">
              Goes well with
            </h2>
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
            {related.map((p, i) => (
              <div key={p.slug} className="h-full flex flex-col">
                <ProductCard product={p} index={i} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Floating Interactive Toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-[100] flex items-center gap-2.5 rounded-2xl border border-amber-400/40 bg-[#161616]/95 px-4 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-xl"
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

"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Heart, Sparkles } from "lucide-react";
import { formatUSD, type Product } from "@/lib/products";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { EASE } from "./motion-primitives";

export default function ProductCard({
  product,
  index = 0,
}: {
  product: Product;
  index?: number;
}) {
  const { add, lines, openAddedModal } = useCart();
  const { requireAuth } = useAuth();
  const { isLiked, toggleLike } = useWishlist();
  const liked = isLiked(product.slug);
  const [justAdded, setJustAdded] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [confetti, setConfetti] = useState<
    Array<{
      id: number;
      x: number;
      y: number;
      size: number;
      color: string;
      rotate: number;
      isDiamond: boolean;
    }>
  >([]);
  const router = useRouter();

  // If this product is currently in the cart or was just added:
  const cartItem = lines?.find((l) => l.slug === product.slug);
  const inCart = Boolean(cartItem && cartItem.qty > 0);
  const isAdded = inCart || justAdded;

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    requireAuth(
      () => {
        add(product.slug, 1, false);
        router.push("/checkout");
      },
      {
        title: "Sign in to Order",
        message: `Please sign in to order ${product.name} and track your delivery.`,
        redirectUrl: "/checkout",
        product: {
          name: product.name,
          image: product.image,
          price: product.price,
        },
      }
    );
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // 1. Generate celebratory confetti blast radiating from button
    const colors = ["#f59e0b", "#fbbf24", "#10b981", "#ffffff", "#f97316", "#eab308"];
    const particles = Array.from({ length: 18 }, (_, i) => {
      const angle = (i / 18) * 360 + (Math.random() * 20 - 10);
      const rad = (angle * Math.PI) / 180;
      const distance = 35 + Math.random() * 45;
      return {
        id: Date.now() + i,
        x: Math.cos(rad) * distance,
        y: Math.sin(rad) * distance,
        size: 3 + Math.random() * 5,
        color: colors[i % colors.length],
        rotate: Math.random() * 360,
        isDiamond: i % 3 === 0,
      };
    });

    setConfetti(particles);
    setCelebrating(true);
    setJustAdded(true);

    // 2. Add to cart & launch celebration modal so user clearly sees the item was added
    setTimeout(() => {
      add(product.slug, 1, false);
      openAddedModal(product);
    }, 280);

    setTimeout(() => {
      setCelebrating(false);
      setConfetti([]);
    }, 1200);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, ease: EASE, delay: (index % 4) * 0.08 }}
      whileHover={{ y: -6 }}
      className="group flex h-full flex-col justify-between overflow-hidden rounded-[20px] border border-white/10 bg-[#161616] p-3.5 transition-all duration-300 hover:border-white/25 hover:shadow-2xl hover:shadow-black/50"
    >
      {/* 1. Image Container with Fixed Equal Aspect Ratio */}
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-[4/3] w-full shrink-0 overflow-hidden rounded-[16px] bg-[#1a1a1a]"
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        {product.badge && (
          <span className="absolute top-2.5 left-2.5 z-10 rounded-full border border-amber-400/40 bg-black/75 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300 backdrop-blur-md shadow-md">
            {product.badge}
          </span>
        )}
        <motion.button
          type="button"
          whileTap={{ scale: 0.8 }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleLike(product.slug);
          }}
          aria-label={liked ? "Unlike product" : "Like product"}
          className={`absolute top-2.5 right-2.5 z-10 grid h-8 w-8 place-items-center rounded-full border backdrop-blur-md transition-all ${
            liked
              ? "border-rose-500/50 bg-black/80 text-rose-500 shadow-md"
              : "border-white/20 bg-black/60 text-white/70 hover:border-rose-400 hover:text-rose-400"
          }`}
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              liked ? "fill-rose-500 text-rose-500" : ""
            }`}
          />
        </motion.button>
      </Link>

      {/* 2. Content Container - flex-1 with uniform spacing */}
      <div className="flex flex-1 flex-col justify-between pt-4">
        <div>
          {/* Title + Price */}
          <div className="flex items-start justify-between gap-3">
            <h3 className="line-clamp-1 text-[15px] font-bold text-white transition-colors hover:text-amber-400 active:text-amber-300">
              <Link href={`/product/${product.slug}`}>{product.name}</Link>
            </h3>
            <span className="shrink-0 rounded-lg bg-white/10 px-2 py-0.5 text-[13px] font-extrabold text-white">
              {formatUSD(product.price)}
            </span>
          </div>

          {/* Short description with uniform 2-line height */}
          <p className="mt-2 line-clamp-2 min-h-[38px] text-[12.5px] leading-relaxed text-[#9a9a9a]">
            {product.description}
          </p>

          {/* Feature Tags with uniform min-height */}
          <div className="mt-4 flex flex-wrap items-center gap-1.5 min-h-[28px]">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-white/70"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* 3. Action Buttons - pinned to bottom line */}
        <div className="mt-5 grid grid-cols-2 gap-2 pt-1">
          <motion.button
            onClick={handleAddToCart}
            animate={celebrating ? { scale: [1, 0.9, 1.14, 0.97, 1] } : undefined}
            transition={{ duration: 0.45, ease: "easeOut" }}
            whileTap={{ scale: 0.94 }}
            className={`relative flex items-center justify-center rounded-full py-2.5 text-center text-[13px] font-semibold transition-all shadow-sm overflow-visible ${
              isAdded
                ? "bg-amber-400 text-black font-bold ring-2 ring-amber-400/40 shadow-[0_0_20px_rgba(245,158,11,0.35)]"
                : "bg-white text-black hover:bg-amber-400 hover:text-black active:bg-amber-300"
            }`}
          >
            {/* Confetti Explosion Burst */}
            <AnimatePresence>
              {celebrating && (
                <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center overflow-visible">
                  {/* Expanding golden shockwave ring */}
                  <motion.span
                    initial={{ scale: 0.8, opacity: 0.9 }}
                    animate={{ scale: 1.8, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="absolute inset-0 rounded-full border-2 border-amber-400 bg-amber-400/25"
                  />

                  {/* Confetti pieces */}
                  {confetti.map((p) => (
                    <motion.span
                      key={p.id}
                      initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
                      animate={{
                        x: p.x,
                        y: p.y,
                        opacity: [1, 1, 0],
                        scale: [1, 1.25, 0.3],
                        rotate: p.rotate,
                      }}
                      transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                      style={{
                        backgroundColor: p.color,
                        width: p.size,
                        height: p.isDiamond ? p.size : p.size * 0.75,
                        borderRadius: p.isDiamond ? "1px" : "999px",
                      }}
                      className="absolute shadow-sm"
                    />
                  ))}
                </div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {isAdded ? (
                <motion.span
                  key="added"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  className="flex items-center gap-1.5"
                >
                  <Check className="h-4 w-4 stroke-[3]" />
                  Added!
                </motion.span>
              ) : (
                <motion.span
                  key="default"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  Add to cart
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          <button
            onClick={handleBuyNow}
            className="rounded-full border border-white/15 bg-white/5 py-2.5 text-center text-[13px] font-semibold text-white transition-all hover:border-amber-400/40 hover:text-amber-400 hover:bg-amber-400/10 active:text-amber-300 active:scale-95"
          >
            Buy Now
          </button>
        </div>
      </div>
    </motion.article>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Heart } from "lucide-react";
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
  const { add, lines } = useCart();
  const { requireAuth } = useAuth();
  const { isLiked, toggleLike } = useWishlist();
  const liked = isLiked(product.slug);
  const [justAdded, setJustAdded] = useState(false);
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
        add(product.slug, 1);
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
    requireAuth(
      () => {
        add(product.slug, 1);
        setJustAdded(true);
      },
      {
        title: "Sign in to Add Items",
        message: `Please log in to add ${product.name} to your bag and sync your cart.`,
        product: {
          name: product.name,
          image: product.image,
          price: product.price,
        },
      }
    );
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, ease: EASE, delay: (index % 3) * 0.1 }}
      whileHover={{ y: -6 }}
      className="group flex h-full flex-col justify-between overflow-hidden rounded-[22px] border border-white/10 bg-[#161616] p-4 transition-all duration-300 hover:border-white/25 hover:shadow-2xl hover:shadow-black/50"
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
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
            <h3 className="line-clamp-1 text-[17px] font-bold text-white transition-colors hover:text-amber-400 active:text-amber-300">
              <Link href={`/product/${product.slug}`}>{product.name}</Link>
            </h3>
            <span className="shrink-0 rounded-lg bg-white/10 px-2.5 py-1 text-[14px] font-extrabold text-white">
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
            whileTap={{ scale: 0.95 }}
            className={`relative flex items-center justify-center rounded-full py-2.5 text-center text-[13px] font-semibold transition-all shadow-sm ${
              isAdded
                ? "bg-amber-400 text-black font-bold ring-2 ring-amber-400/40"
                : "bg-white text-black hover:bg-amber-400 hover:text-black active:bg-amber-300"
            }`}
          >
            <AnimatePresence mode="wait">
              {isAdded ? (
                <motion.span
                  key="added"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  className="flex items-center gap-1.5"
                >
                  <Check className="h-4 w-4 stroke-[3]" />
                  Added
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

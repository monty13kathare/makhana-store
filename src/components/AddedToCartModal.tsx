"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, X, ArrowRight, ShoppingBag, Sparkles, ShieldCheck, Truck } from "lucide-react";
import { useCart, FREE_SHIPPING_OVER } from "@/context/CartContext";
import { formatUSD } from "@/lib/products";
import { EASE } from "./motion-primitives";

export default function AddedToCartModal() {
  const router = useRouter();
  const {
    addedProduct,
    isAddedModalOpen,
    closeAddedModal,
    openCart,
    subtotal,
    count,
  } = useCart();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isAddedModalOpen) {
        closeAddedModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAddedModalOpen, closeAddedModal]);

  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_OVER - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_OVER) * 100);
  const isFreeShipping = subtotal >= FREE_SHIPPING_OVER;

  const handleViewCartAndCheckout = () => {
    closeAddedModal();
    openCart();
  };

  const handleInstantCheckout = () => {
    closeAddedModal();
    router.push("/checkout");
  };

  return (
    <AnimatePresence>
      {isAddedModalOpen && addedProduct && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeAddedModal}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="relative w-full max-w-[460px] overflow-hidden rounded-[26px] border border-white/15 bg-gradient-to-b from-[#1b1b1b] via-[#141414] to-[#0f0f0f] p-6 sm:p-7 text-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95),0_0_40px_rgba(245,158,11,0.15)]"
          >
            {/* Top Amber Ambient Aura */}
            <div className="pointer-events-none absolute -top-14 left-1/2 -translate-x-1/2 h-44 w-44 rounded-full bg-amber-500/20 blur-3xl" />

            {/* Close Button */}
            <button
              onClick={closeAddedModal}
              className="absolute top-4 right-4 z-20 grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/5 text-white/60 transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header: Animated Celebration Badge & Title */}
            <div className="text-center">
              <div className="relative mx-auto flex h-14 w-14 items-center justify-center">
                {/* Pulsing glow ring */}
                <span className="absolute inset-0 rounded-full bg-emerald-500/25 animate-ping opacity-60" />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-emerald-400/40 bg-gradient-to-br from-emerald-500/20 via-emerald-600/10 to-transparent text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.35)]">
                  <Check className="h-7 w-7 stroke-[2.8]" />
                </div>
              </div>

              <div className="mt-3.5 flex items-center justify-center gap-1.5">
                <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
                <h3 className="font-heading font-bold text-[21px] text-white tracking-tight">
                  Added to Your Bag!
                </h3>
              </div>
              <p className="mt-1 text-[13px] text-[#909090]">
                Item successfully added to your gourmet order
              </p>
            </div>

            {/* Product Snapshot Card */}
            <div className="mt-5 flex items-center gap-3.5 rounded-2xl border border-white/10 bg-black/40 p-3.5 backdrop-blur-sm">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#1c1c1c] border border-white/10">
                <Image
                  src={addedProduct.image}
                  alt={addedProduct.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-heading font-bold text-[15px] text-white truncate">
                    {addedProduct.name}
                  </h4>
                  <span className="shrink-0 text-[14px] font-bold text-amber-300">
                    {formatUSD(addedProduct.price)}
                  </span>
                </div>

                <p className="mt-1 text-[11.5px] text-white/60 truncate">
                  Grade 6+ Suta • Slow Roasted in A2 Ghee
                </p>

                <div className="mt-1 flex items-center gap-2 text-[11px] text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>In Stock • Ready to dispatch</span>
                </div>
              </div>
            </div>

            {/* Cart Summary & Free Shipping Progress */}
            <div className="mt-4 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3.5">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-white/70">
                  Cart Subtotal ({count} item{count !== 1 ? "s" : ""}):
                </span>
                <span className="font-bold text-white text-[14.5px]">
                  {formatUSD(subtotal)}
                </span>
              </div>

              {/* Free shipping bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-[11px] text-white/60 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Truck className="h-3.5 w-3.5 text-amber-400" />
                    {isFreeShipping ? (
                      <span className="font-semibold text-emerald-400">
                        Unlocked Free Worldwide Delivery!
                      </span>
                    ) : (
                      <span>
                        Add{" "}
                        <strong className="text-amber-300">
                          {formatUSD(remainingForFreeShipping)}
                        </strong>{" "}
                        more for Free Shipping
                      </span>
                    )}
                  </span>
                  <span>{Math.round(freeShippingProgress)}%</span>
                </div>

                <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-300 transition-all duration-500 ease-out"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-5 space-y-2.5">
              <button
                onClick={handleViewCartAndCheckout}
                className="group relative flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 py-3.5 text-center text-[14px] font-bold text-black shadow-lg shadow-amber-500/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-amber-500/40 active:scale-[0.98]"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>View Cart & Checkout</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>

              <button
                onClick={closeAddedModal}
                className="w-full rounded-full border border-white/15 bg-white/5 py-2.5 text-center text-[13px] font-medium text-white/80 transition-all duration-200 hover:border-white/30 hover:bg-white/10 hover:text-white active:scale-[0.98]"
              >
                Continue Shopping
              </button>
            </div>


          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

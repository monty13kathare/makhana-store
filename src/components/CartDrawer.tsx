"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
  Tag,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Percent,
  Truck,
  Zap,
} from "lucide-react";
import { FREE_SHIPPING_OVER, useCart, type Coupon } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { formatUSD } from "@/lib/products";
import { EASE } from "./motion-primitives";

export default function CartDrawer() {
  const router = useRouter();
  const { requireAuth } = useAuth();
  const {
    isOpen,
    closeCart,
    detailed,
    subtotal,
    savings,
    shipping,
    discountAmount,
    appliedCoupon,
    total,
    availableCoupons,
    applyCoupon,
    removeCoupon,
    setQty,
    remove,
  } = useCart();

  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [couponFeedback, setCouponFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [showCouponsList, setShowCouponsList] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const remaining = Math.max(0, FREE_SHIPPING_OVER - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_OVER) * 100);
  const isFreeShipping =
    appliedCoupon?.discountType === "freeship" || subtotal >= FREE_SHIPPING_OVER;

  const handleApplyCoupon = (codeToApply?: string) => {
    const targetCode = codeToApply || couponCodeInput;
    if (!targetCode.trim()) return;

    const res = applyCoupon(targetCode);
    if (res.success) {
      setCouponFeedback({ type: "success", message: res.message });
      setCouponCodeInput("");
      setShowCouponsList(false);
    } else {
      setCouponFeedback({ type: "error", message: res.message });
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponFeedback(null);
    setCouponCodeInput("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-[70] bg-black/75 backdrop-blur-md"
          />

          {/* Drawer Sidebar */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.45, ease: EASE }}
            className="fixed right-0 top-0 z-[71] flex h-full w-full max-w-[460px] flex-col border-l border-white/10 bg-[#121212] shadow-2xl text-white overflow-hidden"
          >
            {/* 1. Header */}
            <header className="flex items-center justify-between border-b border-white/10 px-6 py-5 bg-[#141414]">
              <h2 className="flex items-center gap-2.5 text-[17px] font-bold">
                <ShoppingBag className="h-[20px] w-[20px] text-amber-400" />
                <span>Your Bag</span>
                <span className="grid h-6 w-6 place-items-center rounded-full bg-white/10 border border-white/10">
                  <Zap className="h-3 w-3 text-amber-400 fill-amber-400" />
                </span>
              </h2>
              <button
                onClick={closeCart}
                aria-label="Close cart"
                className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/5 text-white/70 transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            {/* 2. Free Shipping Threshold Bar */}
            {detailed.length > 0 && (
              <div className="border-b border-white/10 px-6 py-4 bg-gradient-to-r from-amber-500/[0.04] to-transparent">
                <p className="mb-2 text-[12.5px] text-[#a0a0a0]">
                  {isFreeShipping ? (
                    <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                      <Truck className="h-3.5 w-3.5" />
                      Free Worldwide Express Shipping unlocked!
                    </span>
                  ) : (
                    <>
                      Add{" "}
                      <strong className="font-extrabold text-amber-300">
                        {formatUSD(remaining)}
                      </strong>{" "}
                      more for <span className="text-white font-semibold">Free Express Shipping</span>
                    </>
                  )}
                </p>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300 shadow-sm shadow-amber-400/50"
                    initial={{ width: 0 }}
                    animate={{ width: `${isFreeShipping ? 100 : progress}%` }}
                    transition={{ duration: 0.6, ease: EASE }}
                  />
                </div>
              </div>
            )}

            {/* 3. Items List Container — only this region scrolls */}
            <div className="cart-items-scroll min-h-0 flex-1 overflow-y-auto px-6 py-5">
              {detailed.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <div className="grid h-16 w-16 place-items-center rounded-2xl border border-white/10 bg-white/5">
                    <ShoppingBag className="h-7 w-7 text-white/40" />
                  </div>
                  <div>
                    <p className="text-[17px] font-bold text-white">Your bag is empty</p>
                    <p className="mt-1 text-sm text-[#8a8a8a]">
                      Discover our 6+ Suta roasted fox nuts collection.
                    </p>
                  </div>
                  <Link
                    href="/shop"
                    onClick={closeCart}
                    className="mt-2 rounded-full bg-white px-7 py-3 text-sm font-bold text-black transition-all hover:bg-amber-400 hover:text-black active:bg-amber-300 shadow-md"
                  >
                    Explore Flavours
                  </Link>
                </div>
              ) : (
                <ul className="flex flex-col gap-3.5">
                  <AnimatePresence initial={false}>
                    {detailed.map(({ product, qty }) => (
                      <motion.li
                        key={product.slug}
                        layout
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 30, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.3, ease: EASE }}
                        className="flex gap-3.5 rounded-2xl border border-white/10 bg-[#161616] p-3.5 transition-colors hover:border-white/20 shadow-sm"
                      >
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-neutral-900">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate text-[14px] font-bold text-white">
                                {product.name}
                              </p>
                              <p className="text-[12px] text-[#808080]">
                                {product.weight} · Whole Roasted
                              </p>
                            </div>
                            <button
                              onClick={() => remove(product.slug)}
                              aria-label={"Remove " + product.name}
                              className="text-white/40 transition-colors hover:text-red-400 p-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="mt-auto flex items-center justify-between pt-2">
                            <div className="flex items-center gap-1 rounded-full border border-white/15 bg-white/5 p-0.5">
                              <button
                                onClick={() => setQty(product.slug, qty - 1)}
                                aria-label="Decrease quantity"
                                className="grid h-6 w-6 place-items-center rounded-full transition-colors hover:bg-amber-400/20 hover:text-amber-400 active:text-amber-300"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-6 text-center text-xs font-bold tabular-nums text-white">
                                {qty}
                              </span>
                              <button
                                onClick={() => setQty(product.slug, qty + 1)}
                                aria-label="Increase quantity"
                                className="grid h-6 w-6 place-items-center rounded-full transition-colors hover:bg-amber-400/20 hover:text-amber-400 active:text-amber-300"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <span className="text-[14px] font-extrabold text-white">
                              {formatUSD(product.price * qty)}
                            </span>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {/* 4. Coupons & Summary Footer */}
            {detailed.length > 0 && (
              <footer className="shrink-0 border-t border-white/10 px-6 py-5 bg-[#141414]">
                {/* =========================================================================
                    COUPON FEATURE UI
                   ========================================================================= */}
                <div className="mb-4">
                  {appliedCoupon ? (
                    /* Applied Coupon State */
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.08] p-3 text-[13px]"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                          <Check className="h-4 w-4 stroke-[3]" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-emerald-400">
                              {appliedCoupon.code}
                            </span>
                            <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[10.5px] font-extrabold text-emerald-300">
                              Applied
                            </span>
                          </div>
                          <p className="truncate text-[11.5px] text-[#909090]">
                            {appliedCoupon.description}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={handleRemoveCoupon}
                        className="text-[12px] font-semibold text-red-400 hover:text-red-300 transition-colors shrink-0 ml-2"
                      >
                        Remove
                      </button>
                    </motion.div>
                  ) : (
                    /* Unapplied Coupon Form */
                    <div>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Tag className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
                          <input
                            type="text"
                            value={couponCodeInput}
                            onChange={(e) => {
                              setCouponCodeInput(e.target.value.toUpperCase());
                              setCouponFeedback(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleApplyCoupon();
                              }
                            }}
                            placeholder="Enter coupon code (e.g. ROAST20)"
                            className="w-full rounded-xl border border-white/15 bg-white/[0.03] py-2.5 pl-9 pr-3 text-[13px] font-mono uppercase text-white placeholder:text-white/30 placeholder:normal-case focus:border-amber-400 focus:outline-none"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleApplyCoupon()}
                          className="rounded-xl bg-white px-4 py-2.5 text-[12.5px] font-bold text-black transition-all hover:bg-amber-400 hover:text-black active:bg-amber-300 active:scale-95 shadow-sm"
                        >
                          Apply
                        </button>
                      </div>

                      {/* Error or Success feedback message */}
                      {couponFeedback && (
                        <p
                          className={`mt-1.5 text-[12px] font-medium ${
                            couponFeedback.type === "success"
                              ? "text-emerald-400"
                              : "text-red-400"
                          }`}
                        >
                          {couponFeedback.message}
                        </p>
                      )}

                      {/* Available Coupons Accordion Toggle */}
                      <div className="mt-2.5">
                        <button
                          type="button"
                          onClick={() => setShowCouponsList((prev) => !prev)}
                          className="flex items-center gap-1.5 text-[11.5px] font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                        >
                          <Sparkles className="h-3 w-3" />
                          <span>View Available Offers ({availableCoupons.slice(0, 3).length})</span>
                          {showCouponsList ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )}
                        </button>

                        <AnimatePresence>
                          {showCouponsList && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-2 overflow-hidden"
                            >
                              <div className="cart-coupon-scroll max-h-[220px] overflow-y-auto space-y-2 pr-0.5">
                              {availableCoupons.slice(0, 3).map((c: Coupon) => (
                                <div
                                  key={c.code}
                                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-2.5 transition-colors hover:border-amber-400/40"
                                >
                                  <div className="min-w-0 pr-2">
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono text-[12.5px] font-extrabold text-amber-300">
                                        {c.code}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-[#8e8e8e]">
                                      {c.description}
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleApplyCoupon(c.code)}
                                    className="rounded-lg border border-amber-400/40 bg-amber-400/10 px-2.5 py-1 text-[11px] font-bold text-amber-300 hover:bg-amber-400 hover:text-black transition-colors shrink-0"
                                  >
                                    Apply
                                  </button>
                                </div>
                              ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  )}
                </div>

                {/* Pricing Breakdown Summary */}
                <dl className="mb-4 flex flex-col gap-2 border-t border-white/10 pt-3.5 text-[13.5px]">
                  <div className="flex justify-between text-[#9a9a9a]">
                    <dt>Subtotal</dt>
                    <dd className="font-semibold text-white">{formatUSD(subtotal)}</dd>
                  </div>

                  {savings > 0 && (
                    <div className="flex justify-between text-[#9a9a9a]">
                      <dt>MRP Discount</dt>
                      <dd className="font-semibold text-emerald-400">
                        &minus;{formatUSD(savings)}
                      </dd>
                    </div>
                  )}

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-amber-300">
                      <dt className="flex items-center gap-1.5 font-medium">
                        <Percent className="h-3.5 w-3.5" />
                        Promo ({appliedCoupon?.code})
                      </dt>
                      <dd className="font-bold">
                        &minus;{formatUSD(discountAmount)}
                      </dd>
                    </div>
                  )}

                  <div className="flex justify-between text-[#9a9a9a]">
                    <dt>Worldwide Express Shipping</dt>
                    <dd className="font-semibold text-white">
                      {shipping === 0 ? (
                        <span className="text-emerald-400 font-bold">Free</span>
                      ) : (
                        formatUSD(shipping)
                      )}
                    </dd>
                  </div>

                  <div className="mt-1 flex justify-between border-t border-white/10 pt-3 text-[17px] font-extrabold text-white">
                    <dt>Total</dt>
                    <dd className="text-amber-400">{formatUSD(total)}</dd>
                  </div>
                </dl>

                {/* Checkout CTA */}
                <button
                  onClick={() =>
                    requireAuth(
                      () => {
                        closeCart();
                        router.push("/checkout");
                      },
                      {
                        title: "Sign in to Checkout",
                        message:
                          "Please sign in with your phone or email to complete your order and track delivery.",
                        redirectUrl: "/checkout",
                      }
                    )
                  }
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-white py-3.5 text-center font-bold text-black transition-all hover:bg-amber-400 hover:text-black active:bg-amber-300 active:scale-[0.98] shadow-lg shadow-white/5 text-[14px]"
                >
                  <span>Proceed to Checkout</span>
                  <span>({formatUSD(total)})</span>
                </button>

                <p className="mt-2.5 text-center text-[11.5px] text-[#7a7a7a]">
                  Taxes calculated at checkout &middot; 100% secure payment
                </p>
              </footer>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

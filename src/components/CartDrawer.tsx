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
  Zap,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatMoney } from "@/lib/format";
import { EASE } from "./motion-primitives";

export default function CartDrawer() {
  const router = useRouter();

  const {
    isOpen,
    closeCart,
    detailed,
    subtotal,
    savings,
    shipping,
    codFee,
    discountAmount,
    appliedCoupon,
    couponNotice,
    total,
    availableCoupons,
    applyCoupon,
    removeCoupon,
    setQty,
    remove,
    isQuoting,
    quote,
    quoteError,
    retryQuote,
    problems,
    syncError,
  } = useCart();
  const [applying, setApplying] = useState(false);

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

  const handleApplyCoupon = async (codeToApply?: string) => {
    const targetCode = codeToApply || couponCodeInput;
    if (!targetCode.trim() || applying) return;

    setApplying(true);
    const res = await applyCoupon(targetCode);
    setApplying(false);
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
            <header className="flex items-center justify-between border-b border-white/10 px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))] sm:px-6 sm:py-5 bg-[#141414]">
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
                className="grid h-10 w-10 sm:h-9 sm:w-9 place-items-center rounded-full border border-white/15 bg-white/5 text-white/70 transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </header>



            {/* 3. Items List Container — only this region scrolls */}
            <div className="cart-items-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5">
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
                    className="mt-2 flex h-12 items-center rounded-full bg-white px-7 sm:block sm:h-auto sm:py-3 text-[15px] sm:text-sm font-bold text-black transition-all hover:bg-amber-400 hover:text-black active:bg-amber-300 shadow-md"
                  >
                    Explore Flavours
                  </Link>
                </div>
              ) : (
                <ul className="flex flex-col gap-3 sm:gap-3.5">
                  <AnimatePresence initial={false}>
                    {detailed.map((item) => (
                      <motion.li
                        key={item.key}
                        layout
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 30, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.3, ease: EASE }}
                        className="flex gap-3 sm:gap-3.5 rounded-2xl border border-white/10 bg-[#161616] p-3 sm:p-3.5 transition-colors hover:border-white/20 shadow-sm"
                      >
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-neutral-900">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate text-[15px] sm:text-[14px] font-bold text-white">
                                {item.name}
                              </p>
                              <p className="text-[12px] text-[#808080]">
                                {item.kind === "bundle"
                                  ? item.contents?.length
                                    ? item.contents.map((c) => `${c.qty}× ${c.name.split(" ")[0]}`).join(" · ")
                                    : (item.detail ?? "Gift box")
                                  : `${item.detail ?? ""} · Whole Roasted`}
                              </p>
                              {item.problem && (
                                <p role="alert" className="mt-0.5 flex items-center gap-1 text-[11.5px] font-medium text-red-400">
                                  <AlertTriangle className="h-3 w-3 shrink-0" />
                                  {item.problem.message}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => remove(item.key)}
                              aria-label={"Remove " + item.name}
                              className="-mr-2 -mt-2 grid h-10 w-10 shrink-0 place-items-center rounded-full sm:m-0 sm:block sm:h-auto sm:w-auto sm:rounded-none text-white/40 transition-colors hover:text-red-400 active:text-red-400 p-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="mt-auto flex items-center justify-between pt-1.5 sm:pt-2">
                            <div className="flex items-center gap-1 rounded-full border border-white/15 bg-white/5 p-0.5">
                              <button
                                onClick={() => setQty(item.key, item.qty - 1)}
                                aria-label="Decrease quantity"
                                className="-my-1.5 grid h-10 w-10 sm:my-0 sm:h-6 sm:w-6 place-items-center rounded-full transition-colors active:bg-amber-400/20 sm:active:bg-transparent hover:bg-amber-400/20 hover:text-amber-400 active:text-amber-300"
                              >
                                <Minus className="h-3.5 w-3.5 sm:h-3 sm:w-3" />
                              </button>
                              <span className="w-5 sm:w-6 text-center text-[13px] sm:text-xs font-bold tabular-nums text-white">
                                {item.qty}
                              </span>
                              <button
                                onClick={() => setQty(item.key, item.qty + 1)}
                                aria-label="Increase quantity"
                                className="-my-1.5 grid h-10 w-10 sm:my-0 sm:h-6 sm:w-6 place-items-center rounded-full transition-colors active:bg-amber-400/20 sm:active:bg-transparent hover:bg-amber-400/20 hover:text-amber-400 active:text-amber-300"
                              >
                                <Plus className="h-3.5 w-3.5 sm:h-3 sm:w-3" />
                              </button>
                            </div>
                            <span className="text-[15px] sm:text-[14px] font-extrabold text-white">
                              {formatMoney(item.lineTotal)}
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
              <footer className="shrink-0 border-t border-white/10 px-4 pt-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:px-6 sm:py-5 bg-[#141414]">
                {/* =========================================================================
                    COUPON FEATURE UI
                   ========================================================================= */}
                <div className="mb-3 sm:mb-4">
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
                            {appliedCoupon.description ?? appliedCoupon.message}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={handleRemoveCoupon}
                        className="min-h-10 px-2 -mr-1 sm:min-h-0 sm:px-0 sm:mr-0 text-[13px] sm:text-[12px] font-semibold text-red-400 hover:text-red-300 transition-colors shrink-0 ml-2"
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
                            aria-label="Coupon code"
                            autoComplete="off"
                            autoCapitalize="characters"
                            enterKeyHint="go"
                            className="w-full rounded-xl border border-white/15 bg-white/[0.03] py-2.5 pl-9 pr-3 text-[16px] sm:text-[13px] font-mono uppercase text-white placeholder:text-white/30 placeholder:normal-case focus:border-amber-400 focus:outline-none"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleApplyCoupon()}
                          disabled={applying}
                          aria-busy={applying}
                          className="disabled:opacity-60 shrink-0 rounded-xl bg-white px-4 py-2.5 text-[14px] sm:text-[12.5px] font-bold text-black transition-all hover:bg-amber-400 hover:text-black active:bg-amber-300 active:scale-95 shadow-sm"
                        >
                          {applying ? "…" : "Apply"}
                        </button>
                      </div>

                      {couponNotice && !couponFeedback && (
                        <p className="mt-1.5 text-[12px] font-medium text-amber-300">{couponNotice}</p>
                      )}

                      {/* Error or Success feedback message */}
                      {couponFeedback && (
                        <p
                          role={couponFeedback.type === "error" ? "alert" : "status"}
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
                      {availableCoupons.length > 0 && (
                      <div className="mt-1 sm:mt-2.5">
                        <button
                          type="button"
                          onClick={() => setShowCouponsList((prev) => !prev)}
                          aria-expanded={showCouponsList}
                          className="flex min-h-10 sm:min-h-0 items-center gap-1.5 text-[13px] sm:text-[11.5px] font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                        >
                          <Sparkles className="h-3 w-3" />
                          <span>View Available Offers ({availableCoupons.length})</span>
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
                              {availableCoupons.map((c) => (
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
                                    <p className="text-[12px] sm:text-[11px] text-[#8e8e8e]">
                                      {c.description}
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleApplyCoupon(c.code)}
                                    className="min-h-10 rounded-lg border border-amber-400/40 bg-amber-400/10 px-4 sm:min-h-0 sm:px-2.5 sm:py-1 text-[12.5px] sm:text-[11px] font-bold text-amber-300 hover:bg-amber-400 hover:text-black transition-colors shrink-0"
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
                      )}
                    </div>
                  )}
                </div>

                {/* Pricing Breakdown Summary */}
                {quoteError && (
                  <p role="alert" className="mb-2 flex items-center justify-between gap-2 text-[12px] text-red-400">
                    <span>{quoteError}</span>
                    <button type="button" onClick={retryQuote} className="shrink-0 font-semibold underline underline-offset-2">
                      Retry
                    </button>
                  </p>
                )}
                <dl
                  aria-busy={isQuoting}
                  aria-live="polite"
                  className={`mb-3 sm:mb-4 flex flex-col gap-1.5 sm:gap-2 border-t border-white/10 pt-3 sm:pt-3.5 text-[13.5px] transition-opacity ${
                    isQuoting ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex justify-between text-[#9a9a9a]">
                    <dt>Subtotal</dt>
                    <dd className="font-semibold text-white">{formatMoney(subtotal)}</dd>
                  </div>

                  {savings > 0 && (
                    <div className="flex justify-between text-[#9a9a9a]">
                      <dt>MRP Discount</dt>
                      <dd className="font-semibold text-emerald-400">
                        &minus;{formatMoney(savings)}
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
                        &minus;{formatMoney(discountAmount)}
                      </dd>
                    </div>
                  )}

                  <div className="flex justify-between text-[#9a9a9a]">
                    <dt>Worldwide Express Shipping</dt>
                    <dd className="font-semibold text-white">
                      {!quote ? (
                        <span className="text-white/50">Calculated next</span>
                      ) : shipping === 0 ? (
                        <span className="text-emerald-400 font-bold">Free</span>
                      ) : (
                        formatMoney(shipping)
                      )}
                    </dd>
                  </div>

                  {codFee > 0 && (
                    <div className="flex justify-between text-[#9a9a9a]">
                      <dt>Cash on delivery fee</dt>
                      <dd className="font-semibold text-white">{formatMoney(codFee)}</dd>
                    </div>
                  )}

                  <div className="mt-1 flex justify-between border-t border-white/10 pt-2.5 sm:pt-3 text-[17px] font-extrabold text-white">
                    <dt className="flex items-center gap-2">
                      Total
                      {isQuoting && <Loader2 className="h-3.5 w-3.5 animate-spin text-white/50" aria-label="Updating totals" />}
                    </dt>
                    <dd className="text-amber-400">{formatMoney(total)}</dd>
                  </div>
                </dl>

                {problems.length > 0 && (
                  <p role="alert" className="mb-2 text-center text-[12px] font-medium text-red-400">
                    Remove or adjust the highlighted items to continue.
                  </p>
                )}

                {/* Checkout CTA */}
                <button
                  onClick={() => {
                    closeCart();
                    router.push("/checkout");
                  }}
                  disabled={problems.length > 0}
                  className="disabled:opacity-50 disabled:pointer-events-none w-full flex items-center justify-center gap-2 rounded-full bg-white min-h-[52px] sm:min-h-0 py-3.5 text-center font-bold text-black transition-all hover:bg-amber-400 hover:text-black active:bg-amber-300 active:scale-[0.98] shadow-lg shadow-white/5 text-[15px] sm:text-[14px]"
                >
                  <span>Proceed to Checkout</span>
                  <span>({formatMoney(total)})</span>
                </button>

                <p className="mt-2 sm:mt-2.5 text-center text-[11.5px] text-[#7a7a7a]">
                  Taxes calculated at checkout &middot; 100% secure payment
                </p>
                {syncError && (
                  <p role="status" className="mt-1.5 text-center text-[11px] text-amber-300/80">
                    {syncError} Your bag is still saved on this device.
                  </p>
                )}
              </footer>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

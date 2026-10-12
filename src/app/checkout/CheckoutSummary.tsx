"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Loader2,
  Minus,
  Percent,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Trash2,
} from "lucide-react";
import { useCart, type DetailedLine } from "@/context/CartContext";
import { formatMoney } from "@/lib/format";
import { EASE } from "@/components/motion-primitives";

/** Coupon input state shared by both summary layouts. */
function useCouponForm() {
  const { applyCoupon } = useCart();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  const apply = async (codeToApply?: string) => {
    const target = codeToApply || code;
    if (!target.trim() || busy) return;
    setError("");
    setSuccess("");
    setBusy(true);
    const res = await applyCoupon(target);
    setBusy(false);
    if (!res.success) setError(res.message);
    else {
      setSuccess(res.message || "Coupon applied successfully!");
      setCode("");
    }
  };

  return {
    code,
    setCode: (v: string) => {
      setCode(v.toUpperCase());
      setError("");
    },
    error,
    success,
    busy,
    apply,
  };
}

function lineDetail(item: DetailedLine): string {
  if (item.kind === "bundle") {
    return item.contents?.length
      ? item.contents.map((c) => `${c.qty}× ${c.name.split(" ")[0]}`).join(" · ")
      : (item.detail ?? "Gift box");
  }
  return `${item.detail ?? ""} · Whole Roasted`;
}

function LineProblem({ item }: { item: DetailedLine }) {
  if (!item.problem) return null;
  return (
    <p role="alert" className="mt-0.5 flex items-center gap-1 text-[11.5px] font-medium text-red-400">
      <AlertTriangle className="h-3 w-3 shrink-0" />
      {item.problem.message}
    </p>
  );
}

function Totals({ size }: { size: "sm" | "md" }) {
  const { subtotal, savings, discountAmount, appliedCoupon, shipping, codFee, total, isQuoting, quote, quoteError, retryQuote } =
    useCart();
  const sm = size === "sm";
  return (
    <>
      {quoteError && (
        <p role="alert" className="mt-3 flex items-center justify-between gap-2 text-[12px] text-red-400">
          <span>{quoteError}</span>
          <button type="button" onClick={retryQuote} className="shrink-0 font-semibold underline underline-offset-2">
            Retry
          </button>
        </p>
      )}
      <div
        aria-busy={isQuoting}
        aria-live="polite"
        className={
          (sm
            ? "mt-4 pt-3 border-t border-white/10 flex flex-col gap-2 text-[13px] sm:text-xs"
            : "mt-5 pt-4 border-t border-white/10 flex flex-col gap-2.5 text-sm") +
          (isQuoting ? " opacity-60 transition-opacity" : " transition-opacity")
        }
      >
        <div className="flex justify-between text-zinc-400">
          <span>Subtotal</span>
          <span className="text-white font-medium">{formatMoney(subtotal)}</span>
        </div>
        {savings > 0 && (
          <div className="flex justify-between text-emerald-400">
            <span>MRP Savings</span>
            <span>&minus;{formatMoney(savings)}</span>
          </div>
        )}
        {discountAmount > 0 && (
          <div className="flex justify-between text-amber-300">
            <span className="flex items-center gap-1.5">
              {!sm && <Percent className="h-3.5 w-3.5" />}
              {sm ? "Discount" : "Promo Discount"} ({appliedCoupon?.code})
            </span>
            <span className={sm ? "" : "font-semibold"}>&minus;{formatMoney(discountAmount)}</span>
          </div>
        )}
        <div className="flex justify-between text-zinc-400">
          <span>{sm ? "Shipping" : "Worldwide Shipping"}</span>
          <span className="text-white font-medium">
            {!quote ? (
              <span className="text-white/50">Calculating…</span>
            ) : shipping === 0 ? (
              <span className="text-emerald-400 font-bold">Free</span>
            ) : (
              formatMoney(shipping)
            )}
          </span>
        </div>
        {codFee > 0 && (
          <div className="flex justify-between text-zinc-400">
            <span>Cash on delivery fee</span>
            <span className="text-white font-medium">{formatMoney(codFee)}</span>
          </div>
        )}
        {quote?.shipping && (
          <div className="flex justify-between text-zinc-500 text-[12px]">
            <span>Delivery ({quote.shipping.zone})</span>
            <span>
              {quote.shipping.window.minDays}–{quote.shipping.window.maxDays} days
            </span>
          </div>
        )}
        {sm ? (
          <div className="mt-2 pt-2 border-t border-white/10 flex justify-between items-center text-sm font-bold text-white">
            <span>Total</span>
            <span className="text-amber-400">{formatMoney(total)}</span>
          </div>
        ) : (
          <div className="mt-2 pt-3.5 border-t border-white/10 flex justify-between items-baseline">
            <span className="flex items-center gap-2 text-[17px] font-bold text-white">
              Total
              {isQuoting && <Loader2 className="h-4 w-4 animate-spin text-white/50" aria-label="Updating totals" />}
            </span>
            <span className="text-[23px] font-extrabold text-amber-400 tabular-nums">{formatMoney(total)}</span>
          </div>
        )}
      </div>
    </>
  );
}

function CouponNotice() {
  const { couponNotice } = useCart();
  return couponNotice ? <p className="mt-1.5 text-xs text-amber-300">{couponNotice}</p> : null;
}

/** Collapsible summary shown above the steps on phones and tablets. */
export function MobileSummary({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
  const { detailed, count, total, appliedCoupon, removeCoupon, remove, setQty } = useCart();
  const coupon = useCouponForm();

  return (
    <div id="checkout-mobile-summary" className="lg:hidden mb-4 sm:mb-6 scroll-mt-20">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full min-h-12 flex items-center justify-between px-4 py-3 sm:p-4 rounded-2xl bg-[#141416] border border-white/10 text-left transition-all active:scale-[0.99]"
      >
        <div className="flex items-center gap-2.5 text-sm font-medium text-zinc-200">
          <ShoppingBag className="h-4 w-4 text-amber-400" />
          <span>{open ? "Hide" : "Show"} order summary</span>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/70">{count}</span>
          {open ? <ChevronUp className="h-4 w-4 text-zinc-400" /> : <ChevronDown className="h-4 w-4 text-zinc-400" />}
        </div>
        <span className="text-base font-bold text-white">{formatMoney(total)}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="mt-3 overflow-hidden"
          >
            <div className="rounded-2xl border border-white/10 bg-[#141416] p-4 sm:p-5 shadow-xl">
              <div className="flex items-center justify-between mb-3.5">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-amber-400" />
                  <span>Items in Order</span>
                </h3>
                <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-[11px] font-bold text-amber-300">
                  {count} items
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {detailed.map((item) => (
                  <div
                    key={item.key}
                    className={`flex gap-3 rounded-xl border bg-[#18181c]/70 p-3 ${item.problem ? "border-red-500/40" : "border-white/10"}`}
                  >
                    <div className="relative shrink-0">
                      <div className="relative h-14 w-14 rounded-lg overflow-hidden bg-black/50 border border-white/10">
                        <Image src={item.image} alt={item.name} fill sizes="56px" className="object-cover" />
                      </div>
                      <span className="absolute -top-1.5 -right-1.5 z-10 flex h-4.5 min-w-4.5 px-1 items-center justify-center rounded-full bg-amber-400 text-[10px] font-black text-black ring-2 ring-[#141416] shadow-sm">
                        {item.qty}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1 flex flex-col justify-between">
                      <div className="flex items-start justify-between gap-1">
                        <div className="min-w-0">
                          <p className="text-[13px] sm:text-xs font-bold text-white truncate">{item.name}</p>
                          <LineProblem item={item} />
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(item.key)}
                          className="-mr-2 -mt-2 grid h-10 w-10 shrink-0 place-items-center rounded-lg text-zinc-500 hover:text-red-400 active:bg-red-500/10"
                          aria-label={"Remove " + item.name}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-1 rounded-full border border-white/15 bg-white/5 p-0.5">
                          <button
                            type="button"
                            onClick={() => setQty(item.key, item.qty - 1)}
                            aria-label="Decrease quantity"
                            className="relative grid h-9 w-9 place-items-center rounded-full text-zinc-400 hover:text-amber-400 active:bg-amber-400/20 after:absolute after:-inset-1 after:content-['']"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-5 text-center text-[13px] font-bold tabular-nums text-white">{item.qty}</span>
                          <button
                            type="button"
                            onClick={() => setQty(item.key, item.qty + 1)}
                            aria-label="Increase quantity"
                            className="relative grid h-9 w-9 place-items-center rounded-full text-zinc-400 hover:text-amber-400 active:bg-amber-400/20 after:absolute after:-inset-1 after:content-['']"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <span className="text-[13px] sm:text-xs font-bold text-white tabular-nums">
                          {formatMoney(item.lineTotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Totals size="sm" />

              {/* Compact discount code (mobile / tablet) */}
              <div className="mt-4 pt-3 border-t border-white/10">
                {appliedCoupon ? (
                  <div className="flex min-h-11 items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/[0.08] pl-3.5 pr-1 text-[13px]">
                    <div className="flex items-center gap-2">
                      <Percent className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="font-mono font-bold text-emerald-400 uppercase">{appliedCoupon.code}</span>
                      <span className="text-zinc-400">applied</span>
                    </div>
                    <button type="button" onClick={removeCoupon} className="min-h-11 px-3 text-[13px] font-semibold text-red-400">
                      Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-400" />
                        <input
                          type="text"
                          value={coupon.code}
                          onChange={(e) => coupon.setCode(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              void coupon.apply();
                            }
                          }}
                          placeholder="Discount code"
                          aria-label="Discount code"
                          autoComplete="off"
                          autoCapitalize="characters"
                          spellCheck={false}
                          enterKeyHint="done"
                          className="h-11 w-full rounded-xl border border-white/10 bg-[#161619] pl-10 pr-3 text-[16px] font-mono uppercase text-white placeholder:font-sans placeholder:normal-case placeholder:text-zinc-500 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => void coupon.apply()}
                        disabled={coupon.busy}
                        className="h-11 rounded-xl bg-white px-4 text-[13px] font-bold text-black active:scale-95 transition-transform disabled:opacity-60"
                      >
                        {coupon.busy ? "…" : "Apply"}
                      </button>
                    </div>
                    <CouponNotice />
                    {coupon.error && <p role="alert" className="mt-1.5 text-xs text-red-400">{coupon.error}</p>}
                    {coupon.success && <p role="status" className="mt-1.5 text-xs text-emerald-400">{coupon.success}</p>}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Sticky order summary card in the left column on desktop. */
export function DesktopSummary() {
  const { detailed, count, appliedCoupon, removeCoupon, remove, setQty } = useCart();
  const coupon = useCouponForm();

  return (
    <div className="hidden lg:block lg:sticky lg:top-28">
      <div className="rounded-[28px] border border-white/10 bg-gradient-to-b from-[#18181c] via-[#141416] to-[#0f0f11] p-6 sm:p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] relative overflow-hidden backdrop-blur-xl">
        <div className="pointer-events-none absolute -top-20 -right-20 h-44 w-44 rounded-full bg-amber-500/10 blur-3xl" />

        <div className="flex items-center justify-between mb-5">
          <h2 className="flex items-center gap-2.5 text-[18px] font-bold text-white tracking-tight">
            <ShoppingBag className="h-5 w-5 text-amber-400" />
            <span>Order Summary</span>
          </h2>
          <span className="rounded-full bg-amber-400/10 border border-amber-400/25 px-2.5 py-0.5 text-[11px] font-bold text-amber-300">
            {count} {count === 1 ? "item" : "items"}
          </span>
        </div>

        <div className="flex flex-col gap-3 max-h-[280px] xl:max-h-[320px] overflow-y-auto pr-1 scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30">
          <AnimatePresence initial={false}>
            {detailed.map((item) => (
              <motion.div
                key={item.key}
                layout
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, x: -16, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.3, ease: EASE }}
                className={`group relative flex gap-3.5 rounded-2xl border bg-[#19191d]/80 hover:bg-[#1d1d23] p-3 sm:p-3.5 transition-all duration-300 shadow-sm ${
                  item.problem ? "border-red-500/40" : "border-white/10 hover:border-amber-400/30"
                }`}
              >
                <div className="relative shrink-0">
                  <div className="relative h-16 w-16 sm:h-[66px] sm:w-[66px] rounded-xl overflow-hidden bg-black/60 border border-white/10 shadow-inner group-hover:border-amber-400/40 transition-colors">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="66px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <motion.span
                    key={`badge-${item.qty}`}
                    initial={{ scale: 0.7 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-1.5 z-10 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1 text-[10.5px] font-black text-black shadow-md shadow-amber-400/40 ring-2 ring-[#131316]"
                  >
                    {item.qty}
                  </motion.span>
                </div>

                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-bold text-white group-hover:text-amber-300 transition-colors">
                        {item.name}
                      </p>
                      <p className="truncate text-[11.5px] text-zinc-400 font-medium">{lineDetail(item)}</p>
                      <LineProblem item={item} />
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(item.key)}
                      className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10 p-1.5 rounded-lg transition-colors shrink-0"
                      title="Remove item"
                      aria-label={"Remove " + item.name}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1 rounded-full border border-white/15 bg-white/5 p-0.5">
                      <button
                        type="button"
                        onClick={() => setQty(item.key, item.qty - 1)}
                        aria-label="Decrease quantity"
                        className="grid h-6 w-6 place-items-center rounded-full text-zinc-400 transition-colors hover:bg-amber-400/20 hover:text-amber-400 active:scale-95"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-5 text-center text-xs font-bold tabular-nums text-white">{item.qty}</span>
                      <button
                        type="button"
                        onClick={() => setQty(item.key, item.qty + 1)}
                        aria-label="Increase quantity"
                        className="grid h-6 w-6 place-items-center rounded-full text-zinc-400 transition-colors hover:bg-amber-400/20 hover:text-amber-400 active:scale-95"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <span className="text-[14.5px] font-extrabold text-white tabular-nums">{formatMoney(item.lineTotal)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Discount Code Section */}
        <div className="mt-5 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-300">
              <Tag className="h-3.5 w-3.5 text-amber-400" />
              <span>Discount code</span>
            </div>
          </div>

          {appliedCoupon ? (
            <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/[0.08] px-3.5 py-2.5 text-xs">
              <div className="flex items-center gap-2">
                <Percent className="h-3.5 w-3.5 text-emerald-400" />
                <span className="font-mono font-bold text-emerald-400 uppercase">{appliedCoupon.code}</span>
                <span className="text-zinc-400">applied</span>
              </div>
              <button
                type="button"
                onClick={removeCoupon}
                className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors"
              >
                Remove
              </button>
            </div>
          ) : (
            <div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={coupon.code}
                  onChange={(e) => coupon.setCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void coupon.apply();
                    }
                  }}
                  aria-label="Coupon code"
                  placeholder="Enter coupon code (e.g. ROAST20)"
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  enterKeyHint="done"
                  className="flex-1 rounded-xl border border-white/10 bg-[#161619] px-3.5 py-2.5 text-[16px] sm:text-[13px] font-mono uppercase text-white placeholder:text-zinc-500 placeholder:normal-case outline-none transition-all focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20"
                />
                <button
                  type="button"
                  onClick={() => void coupon.apply()}
                  disabled={coupon.busy}
                  className="rounded-xl bg-white hover:bg-amber-400 hover:text-black px-4 py-2.5 text-[12.5px] font-bold text-black transition-all active:scale-95 shadow-sm disabled:opacity-60"
                >
                  {coupon.busy ? "…" : "Apply"}
                </button>
              </div>
              <CouponNotice />
              {coupon.error && <p role="alert" className="mt-1.5 text-xs text-red-400">{coupon.error}</p>}
              {coupon.success && <p role="status" className="mt-1.5 text-xs text-emerald-400">{coupon.success}</p>}
            </div>
          )}
        </div>

        <Totals size="md" />

        <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-center gap-2 text-[11.5px] text-zinc-400">
          <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>256-Bit Bank Grade SSL Encrypted Checkout</span>
        </div>
      </div>
    </div>
  );
}

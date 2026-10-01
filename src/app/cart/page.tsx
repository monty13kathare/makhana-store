"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, X, Tag, ArrowRight, ShoppingBag } from "lucide-react";
import { EASE } from "@/components/motion-primitives";
import { NetBankingIcon, CardIcon, UpiIcon, CodIcon } from "@/components/PaymentIcons";

/* --------------------------------------------------------------------------
   Cart Items Data matching Screenshot 2 Exactly
   -------------------------------------------------------------------------- */
type CartItem = {
  id: string;
  name: string;
  desc: string;
  deliveredBy: string;
  priceUSD: number;
  priceINR: number;
  qty: number;
  image: string;
};

const initialCartItems: CartItem[] = [
  {
    id: "cart-1",
    name: "Classic Himalayan Salt",
    desc: "Clean, elegant, and lightly seasoned for a timeless premium crunch.",
    deliveredBy: "Sunday, 25 Sep",
    priceUSD: 14,
    priceINR: 1100,
    qty: 1,
    image: "/img/bowl-classic.jpg",
  },
  {
    id: "cart-2",
    name: "Peri Peri Roast",
    desc: "A bold and modern flavour profile with a rich premium presentation.",
    deliveredBy: "Sunday, 25 Sep",
    priceUSD: 14,
    priceINR: 1500,
    qty: 1,
    image: "/img/bowl-peri.jpg",
  },
  {
    id: "cart-3",
    name: "Truffle Black Pepper",
    desc: "Sophisticated, giftable, and positioned for a high-end snacking audience.",
    deliveredBy: "Sunday, 25 Sep",
    priceUSD: 14,
    priceINR: 1500,
    qty: 1,
    image: "/img/bowl-cheese.jpg",
  },
];

const paymentMethods = [
  { id: "net-banking", label: "Net\nBanking", icon: NetBankingIcon },
  { id: "card", label: "Debit/\nCredit\ncard", icon: CardIcon },
  { id: "upi", label: "UPI", icon: UpiIcon },
  { id: "cod", label: "Cash On\nDelivery", icon: CodIcon },
];

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>(initialCartItems);
  const [selectedMethod, setSelectedMethod] = useState("net-banking");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>("MAKHANA500");
  const [couponError, setCouponError] = useState<string | null>(null);

  // Remove item from cart
  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Quantity updates
  const updateQty = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(1, item.qty + delta);
          return { ...item, qty: newQty };
        }
        return item;
      })
    );
  };

  // Financial calculations matching Reference screenshot numbers
  const cartTotalINR = items.reduce((sum, item) => sum + item.priceINR * item.qty, 0);
  const shippingChargeINR = items.length > 0 ? 400 : 0;
  const couponDiscountINR = appliedCoupon && items.length > 0 ? 500 : 0;
  const totalPayableINR = Math.max(0, cartTotalINR + shippingChargeINR - couponDiscountINR);
  const itemCount = items.reduce((sum, item) => sum + item.qty, 0);

  // Mobile sticky checkout bar: shown until the full Cart Summary (with its
  // own Check Out button) scrolls into view, so it never covers the summary
  // or the footer below it.
  const summaryRef = useRef<HTMLDivElement>(null);
  const [summaryReached, setSummaryReached] = useState(false);
  useEffect(() => {
    const el = summaryRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setSummaryReached(entry.isIntersecting || entry.boundingClientRect.top < 0),
      { rootMargin: "0px 0px -140px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [items.length]);
  const showStickyBar = items.length > 0 && !summaryReached;

  // Apply Coupon Handler
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    if (couponCode.toUpperCase() === "MAKHANA500" || couponCode.toUpperCase() === "GOLDEN") {
      setAppliedCoupon(couponCode.toUpperCase());
      setCouponError(null);
    } else {
      setCouponError("Invalid coupon code");
    }
  };

  return (
    <>
    <main className="relative min-h-screen bg-[#111111] pt-[84px] sm:pt-[110px] pb-20 sm:pb-24 text-white overflow-hidden">
      {/* --------------------------------------------------------------------
          Background Scattered Makhana on Left Edge (Matching Reference Exactly)
          Hidden on phones, where it would sit on top of the first cart row.
          -------------------------------------------------------------------- */}
      <div className="pointer-events-none absolute top-48 hidden sm:block sm:-left-8 sm:h-56 sm:w-56 z-20">
        <Image
          src="/img/makhana-cluster.png"
          alt="Scattered Makhana Lotus Seeds"
          fill
          className="object-contain drop-shadow-[0_18px_35px_rgba(0,0,0,0.9)]"
        />
      </div>

      {/* Ambient background glows */}
      <div className="pointer-events-none absolute right-1/4 top-1/4 h-[550px] w-[550px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(215,160,70,0.06)_0%,transparent_70%)] blur-3xl -z-0" />
      <div className="pointer-events-none absolute left-10 bottom-1/3 h-[450px] w-[450px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.02)_0%,transparent_70%)] blur-2xl -z-0" />

      <div className="container-x relative z-10">
        {/* Main Heading: Centered "My Cart" in Josefin Sans */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="font-heading font-bold text-white text-[28px] sm:text-[54px] lg:text-[62px] leading-[1.05] tracking-tight text-center mb-5 sm:mb-12"
        >
          My Cart
        </motion.h1>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.18fr_0.82fr] gap-8 lg:gap-10 items-start">

          {/* =================================================================
              LEFT COLUMN: Cart Items Cards
              ================================================================= */}
          <div className="flex flex-col gap-3 sm:gap-6">
            <AnimatePresence mode="popLayout">
              {items.map((item, idx) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.45, ease: EASE, delay: idx * 0.05 }}
                  className="group relative flex flex-row gap-3 sm:gap-6 rounded-[18px] sm:rounded-[24px] border border-white/15 sm:border-white/20 bg-[#161616]/95 p-3 sm:p-6 transition-all duration-300 hover:border-white/35 shadow-[0_12px_32px_rgba(0,0,0,0.5)]"
                >
                  {/* Remove Button (✕) on top-right — 40px hit area on phones */}
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    aria-label={`Remove ${item.name} from cart`}
                    className="absolute top-1 right-1 grid h-10 w-10 place-items-center rounded-full active:bg-white/10 sm:top-6 sm:right-6 sm:block sm:h-auto sm:w-auto sm:rounded-none sm:active:bg-transparent text-white/50 hover:text-white transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  {/* Product Thumbnail */}
                  <div className="relative h-[88px] w-[88px] sm:h-[150px] sm:w-[150px] shrink-0 overflow-hidden rounded-[14px] sm:rounded-[18px] border border-white/10 bg-[#1a1a1a]">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="(max-width: 640px) 88px, 150px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  {/* Card Content */}
                  <div className="flex min-w-0 flex-1 flex-col justify-between pr-8 sm:pr-6">
                    <div>
                      {/* Product Name */}
                      <h2 className="font-heading font-bold text-white text-[15.5px] leading-snug sm:text-[21px] sm:leading-normal tracking-tight line-clamp-2 sm:line-clamp-none">
                        {item.name}
                      </h2>

                      {/* Description (hidden on phones to keep rows compact) */}
                      <p className="hidden sm:block mt-1.5 text-[13.5px] leading-relaxed text-[#8e8e8e] max-w-md">
                        {item.desc}
                      </p>

                      {/* Delivery Date */}
                      <p className="mt-0.5 sm:mt-2 text-[12px] sm:text-[12.5px] text-[#737373]">
                        <span className="sm:hidden">Delivery by {item.deliveredBy}</span>
                        <span className="hidden sm:inline">Delivered By : {item.deliveredBy}</span>
                      </p>
                    </div>

                    {/* Bottom Row: Quantity Counter & Price */}
                    <div className="mt-2 sm:mt-5 flex items-center justify-between gap-2">
                      {/* Quantity Pill — compact visual, 40x44 hit areas on phones */}
                      <div className="inline-flex h-9 items-center rounded-full border border-white/10 bg-[#202020] text-[14px] sm:h-auto sm:gap-3 sm:px-3.5 sm:py-1 sm:text-[13px] font-medium text-white">
                        <button
                          type="button"
                          onClick={() => updateQty(item.id, -1)}
                          aria-label="Decrease quantity"
                          className="-my-1 grid h-11 w-10 place-items-center rounded-full sm:my-0 sm:block sm:h-auto sm:w-auto text-[#999999] hover:text-white active:text-white transition-colors"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="min-w-[16px] sm:min-w-[12px] text-center tabular-nums">{item.qty}</span>
                        <button
                          type="button"
                          onClick={() => updateQty(item.id, 1)}
                          aria-label="Increase quantity"
                          className="-my-1 grid h-11 w-10 place-items-center rounded-full sm:my-0 sm:block sm:h-auto sm:w-auto text-[#999999] hover:text-white active:text-white transition-colors"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Price Tag */}
                      <span className="font-heading font-bold text-white text-[17px] sm:text-[22px] tracking-tight">
                        ${item.priceUSD}/-
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {items.length === 0 && (
              <div className="rounded-[22px] sm:rounded-[24px] border border-white/10 bg-[#161616] px-6 py-10 sm:p-12 text-center">
                <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl border border-white/10 bg-white/5 sm:hidden">
                  <ShoppingBag className="h-7 w-7 text-gold" />
                </div>
                <p className="font-heading text-[19px] font-bold text-white sm:hidden">
                  Your cart is empty
                </p>
                <p className="mt-1 sm:mt-0 text-[14.5px] sm:text-[16px] text-[#8e8e8e]">
                  <span className="sm:hidden">Add a few premium flavours to get started.</span>
                  <span className="hidden sm:inline">Your cart is currently empty.</span>
                </p>
                <Link
                  href="/shop"
                  className="mt-6 flex h-12 w-full items-center justify-center rounded-full bg-gold px-6 text-[15px] font-semibold text-black active:scale-[0.98] transition-colors sm:mt-5 sm:inline-block sm:h-auto sm:w-auto sm:rounded-xl sm:bg-white sm:py-3 sm:text-[14px] sm:hover:bg-neutral-200"
                >
                  Explore Collection
                </Link>
              </div>
            )}
          </div>

          {/* =================================================================
              RIGHT COLUMN: Coupon, Payment Methods & Cart Summary
              (hidden below lg when the cart is empty)
              ================================================================= */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.15 }}
            className={items.length === 0 ? "hidden lg:flex lg:flex-col" : "flex flex-col"}
          >
            {/* 1. Apply Coupon Code Section */}
            <div>
              <label
                htmlFor="cart-coupon"
                className="flex items-center gap-2 text-[14.5px] font-medium text-white mb-2.5"
              >
                <Tag className="h-4 w-4 text-white/80" />
                Apply Coupon code
              </label>
              <form onSubmit={handleApplyCoupon} className="flex flex-row gap-2">
                <input
                  id="cart-coupon"
                  type="text"
                  placeholder="Enter code here"
                  autoCapitalize="characters"
                  autoComplete="off"
                  enterKeyHint="go"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#202020] px-4 py-3 text-[16px] sm:text-[14px] text-white placeholder-[#666666] outline-none transition-colors focus:border-white/30"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-xl bg-white px-5 sm:px-6 py-3 text-[14px] font-semibold text-black transition-colors hover:bg-neutral-200 active:scale-[0.98]"
                >
                  <span className="sm:hidden">Apply</span>
                  <span className="hidden sm:inline">Apply here</span>
                </button>
              </form>
              {couponError && (
                <p className="mt-1.5 text-[12px] text-red-400">{couponError}</p>
              )}
              {appliedCoupon && (
                <p className="mt-1.5 text-[12px] text-emerald-400">
                  Coupon &ldquo;{appliedCoupon}&rdquo; applied successfully! (-₹500)
                </p>
              )}
            </div>

            {/* 2. Choose the Payment Method */}
            <div className="mt-6 sm:mt-7">
              <h3 className="text-[14.5px] font-medium text-white mb-3">
                Choose the payment method
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                {paymentMethods.map((m) => {
                  const Icon = m.icon;
                  const isSelected = selectedMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedMethod(m.id)}
                      aria-pressed={isSelected}
                      className={`relative flex flex-row sm:flex-col items-center justify-start sm:justify-center gap-2 sm:gap-0 rounded-[14px] sm:rounded-[18px] px-3 py-2.5 sm:p-4 text-left sm:text-center transition-all duration-200 min-h-[56px] sm:min-h-[90px] active:scale-[0.98] sm:active:scale-100 ${
                        isSelected
                          ? "border-2 border-white bg-[#1e1e1e] text-white shadow-[0_0_18px_rgba(255,255,255,0.12)]"
                          : "border border-white/10 bg-[#161616] text-[#8e8e8e] hover:border-white/20 hover:text-white"
                      }`}
                    >
                      <div className="grid h-8 w-8 shrink-0 place-items-center sm:mb-1.5">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-[13px] sm:text-[11px] leading-tight font-medium whitespace-normal sm:whitespace-pre-line">
                        {m.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Cart Summary Box */}
            <div ref={summaryRef} className="mt-6 sm:mt-7 rounded-[22px] sm:rounded-[24px] border border-white/15 bg-[#161616] p-5 sm:p-7 shadow-[0_16px_40px_rgba(0,0,0,0.6)]">
              <h3 className="font-heading font-bold text-white text-[20px] tracking-tight mb-4">
                Cart Summery
              </h3>

              <div className="flex flex-col gap-2.5 text-[14px]">
                <div className="flex justify-between text-[#8e8e8e]">
                  <span>Cart Total</span>
                  <span className="font-medium text-white">₹{cartTotalINR}</span>
                </div>
                <div className="flex justify-between text-[#8e8e8e]">
                  <span>+ Shipping Charge</span>
                  <span className="font-medium text-[#38bdf8]">₹{shippingChargeINR}</span>
                </div>
                <div className="flex justify-between text-[#8e8e8e]">
                  <span>- Coupon code</span>
                  <span className="font-medium text-white">₹{couponDiscountINR}</span>
                </div>

                <div className="border-t border-white/10 my-2" />

                <div className="flex items-baseline justify-between pt-1">
                  <span className="font-heading font-bold text-white text-[18px] sm:text-[20px]">
                    Total Payable
                  </span>
                  <div className="text-right">
                    <span className="font-heading font-bold text-white text-[22px] sm:text-[24px]">
                      ₹{totalPayableINR}
                    </span>
                    <p className="text-[11.5px] text-[#737373]">Inclusive All Tax</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons matching screenshot */}
              <div className="mt-6 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/orders")}
                  className="w-full rounded-xl bg-[#c5c8cc] py-4 text-[15.5px] font-semibold text-black transition-all hover:bg-white active:scale-[0.99] text-center shadow-md"
                >
                  Check Out
                </button>
                <Link
                  href="/shop"
                  className="w-full rounded-xl bg-white py-4 text-[15.5px] font-semibold text-black transition-all hover:bg-neutral-200 active:scale-[0.99] text-center shadow-md"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>

    {/* Sticky mobile checkout bar — sits directly above the bottom app dock */}
    <AnimatePresence>
      {showStickyBar && (
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 24, opacity: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="fixed inset-x-0 bottom-[calc(64px+env(safe-area-inset-bottom))] z-30 border-t border-white/10 bg-[#0d0d0d]/95 backdrop-blur-xl md:hidden"
        >
          <div className="mx-auto flex max-w-md items-center gap-3 px-4 py-2.5">
            <div className="min-w-0 flex-1">
              <p className="font-heading text-[19px] font-bold leading-tight text-white tabular-nums">
                ₹{totalPayableINR}
              </p>
              <p className="truncate text-[11.5px] text-[#8e8e8e]">
                {itemCount} item{itemCount !== 1 ? "s" : ""} · Incl. all taxes
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/orders")}
              className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-gold px-6 text-[15px] font-bold text-black shadow-[0_8px_20px_-8px_rgba(229,169,60,0.8)] transition-transform active:scale-[0.97]"
            >
              Checkout
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}

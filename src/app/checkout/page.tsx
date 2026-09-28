"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Contact,
  Truck,
  CreditCard,
  Trash2,
  Tag,
  Check,
  Lock,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Percent,
  Sparkles,
  Minus,
  Plus,
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Calendar,
  ArrowRight,
  ArrowLeft,
  Zap,
} from "lucide-react";
import { useCart, type Coupon } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { EASE, Reveal } from "@/components/motion-primitives";

type Step = 1 | 2 | 3;

interface FormData {
  // Step 1: Contact Details
  name: string;
  email: string;
  phone: string;
  // Step 2: Shipping Address
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  // Step 3: Payment Details
  cardNumber: string;
  expiry: string;
  cvc: string;
  cardHolder: string;
}

export default function CheckoutPage() {
  const {
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
    remove,
    setQty,
    add,
    clear,
  } = useCart();

  const { user, requireAuth } = useAuth();

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [placed, setPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMobileSummary, setShowMobileSummary] = useState(false);
  const [showCouponsList, setShowCouponsList] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "paypal" | "cod">("card");
  const [upiId, setUpiId] = useState("");

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  const totalItemsCount = detailed.reduce((acc, item) => acc + item.qty, 0);
  const freeShippingProgress = Math.min(100, (subtotal / 49) * 100);
  const remainingForFreeShipping = Math.max(0, 49 - subtotal);
  const isFreeShipping = shipping === 0 || subtotal >= 49;

  // Form State
  const [form, setForm] = useState<FormData>({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    country: "United States",
    cardNumber: "",
    expiry: "",
    cvc: "",
    cardHolder: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  // Sync user info if available
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || user.name || "",
        phone: prev.phone || user.phone || "",
        email: prev.email || user.email || "",
      }));
    }
  }, [user]);

  // Price formatter with 2 decimal places to match reference image (£149.00 / $14.00)
  const formatPrice = (amount: number) => {
    return "$" + amount.toFixed(2);
  };

  // Card input formatters
  const handleCardNumberChange = (value: string) => {
    const raw = value.replace(/\D/g, "").slice(0, 16);
    const formatted = raw.match(/.{1,4}/g)?.join(" ") || raw;
    setForm((prev) => ({ ...prev, cardNumber: formatted }));
    if (errors.cardNumber) setErrors((prev) => ({ ...prev, cardNumber: "" }));
  };

  const handleExpiryChange = (value: string) => {
    const raw = value.replace(/\D/g, "").slice(0, 4);
    let formatted = raw;
    if (raw.length >= 3) {
      formatted = `${raw.slice(0, 2)}/${raw.slice(2, 4)}`;
    }
    setForm((prev) => ({ ...prev, expiry: formatted }));
    if (errors.expiry) setErrors((prev) => ({ ...prev, expiry: "" }));
  };

  const handleCvcChange = (value: string) => {
    const raw = value.replace(/\D/g, "").slice(0, 4);
    setForm((prev) => ({ ...prev, cvc: raw }));
    if (errors.cvc) setErrors((prev) => ({ ...prev, cvc: "" }));
  };

  // Step 1 Validation
  const validateStep1 = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!form.name.trim() || form.name.trim().length < 2) {
      newErrors.name = "Please enter your full name";
    }
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!form.phone.trim() || form.phone.replace(/\D/g, "").length < 8) {
      newErrors.phone = "Please enter a valid phone number";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step 2 Validation
  const validateStep2 = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!form.address1.trim()) {
      newErrors.address1 = "Please enter your street address";
    }
    if (!form.city.trim()) {
      newErrors.city = "Please enter your city";
    }
    if (!form.state.trim()) {
      newErrors.state = "Please enter your state / province";
    }
    if (!form.zip.trim()) {
      newErrors.zip = "Please enter your postal / ZIP code";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step 3 Validation
  const validateStep3 = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (paymentMethod === "card") {
      const cleanCard = form.cardNumber.replace(/\s/g, "");
      if (!cleanCard || cleanCard.length < 15) {
        newErrors.cardNumber = "Please enter a valid 15–16 digit card number";
      }
      if (!form.expiry || form.expiry.length < 5) {
        newErrors.expiry = "Enter expiry in MM/YY format";
      }
      if (!form.cvc || form.cvc.length < 3) {
        newErrors.cvc = "Enter 3–4 digit CVC";
      }
    }
    if (paymentMethod === "upi") {
      if (!upiId.trim() || !/^[\w.]+@[\w]+$/.test(upiId.trim())) {
        newErrors.cardNumber = "Please enter a valid UPI ID (e.g. name@upi)";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation handlers
  const handleProceedToShipping = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) {
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep2()) {
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep3()) {
      requireAuth(
        () => {
          setIsSubmitting(true);
          setTimeout(() => {
            setIsSubmitting(false);
            setOrderNumber(`MK-${Math.floor(100000 + Math.random() * 900000)}`);
            setPlaced(true);
            clear();
          }, 900);
        },
        {
          title: "Verify to Complete Order",
          message: "Please verify your phone or email to track your order and receive updates.",
          prefill: {
            phone: form.phone,
            email: form.email,
            name: form.name
          },
          actionText: "Verify & Complete Order"
        }
      );
    }
  };

  // Apply Coupon Handler
  const handleApplyCoupon = (codeToApply?: string) => {
    const target = codeToApply || couponCode;
    if (!target.trim()) return;
    setCouponError("");
    setCouponSuccess("");
    const res = applyCoupon(target);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponSuccess(res.message || "Coupon applied successfully!");
      setCouponCode("");
      setShowCouponsList(false);
    }
  };

  // Helper to load sample items if cart is empty for testing
  const loadDemoItems = () => {
    add("peri-peri-roast", 1);
    add("truffle-black-pepper", 1);
  };

  // 1. ORDER PLACED SCREEN
  if (placed) {
    return (
      <section className="relative min-h-screen grid place-items-center px-4 pt-28 pb-16 bg-[#0a0a0c] text-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#141416] p-8 text-center shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-2 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 rounded-b-full shadow-[0_0_20px_rgba(245,158,11,0.5)]" />

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
            className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 text-black shadow-lg"
          >
            <Check className="h-10 w-10 stroke-[2.5]" />
          </motion.div>

          <span className="inline-block rounded-full bg-amber-400/10 border border-amber-400/20 px-3.5 py-1 text-xs font-bold tracking-wider text-amber-400 uppercase mb-3">
            Payment Confirmed
          </span>

          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Thank you for your order!
          </h1>

          <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
            Order <span className="font-mono font-bold text-white">{orderNumber}</span> has been confirmed. A confirmation receipt and dispatch details have been sent to{" "}
            <span className="font-medium text-white">{form.email || "your email"}</span>.
          </p>

          <div className="mt-6 rounded-2xl border border-white/5 bg-white/[0.03] p-4 text-left text-xs text-zinc-300 space-y-2">
            <div className="flex justify-between">
              <span className="text-zinc-500">Delivery to:</span>
              <span className="font-medium text-white">{form.name || "Customer"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Destination:</span>
              <span className="font-medium text-white">
                {form.city ? `${form.city}, ${form.state || ""}` : "Express Shipping"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Estimated Dispatch:</span>
              <span className="font-medium text-emerald-400">Within 24 Hours</span>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              href="/shop"
              className="flex-1 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-black transition-all hover:bg-zinc-200 active:scale-95 shadow-md"
            >
              Continue Shopping
            </Link>
            <Link
              href="/"
              className="flex-1 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/10"
            >
              Return Home
            </Link>
          </div>
        </motion.div>

        {/* Floating corner makhana */}
        <div className="pointer-events-none fixed bottom-0 right-0 z-0 max-w-[220px] sm:max-w-[280px] opacity-80 select-none">
          <Image
            src="/img/login-corner-makhana.png"
            alt="Makhana"
            width={340}
            height={260}
            className="w-full h-auto object-contain"
          />
        </div>
      </section>
    );
  }

  // 2. EMPTY BAG STATE
  if (detailed.length === 0) {
    return (
      <section className="relative min-h-screen grid place-items-center px-4 pt-28 pb-16 bg-[#0a0a0c] text-white">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#141416] p-8 text-center shadow-2xl">
          <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-white/5 border border-white/10">
            <ShoppingBag className="h-8 w-8 text-zinc-400" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Your bag is empty</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Select your favourite roasted lotus seed flavours to start checkout.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={loadDemoItems}
              className="rounded-xl bg-amber-400 px-6 py-3 text-sm font-bold text-black transition-all hover:bg-amber-300 shadow-md flex items-center justify-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Load Sample Pack (Peri Peri & Truffle)
            </button>
            <Link
              href="/shop"
              className="rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10"
            >
              Browse Flavour Collection
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // Premium input class
  const inputClass =
    "w-full rounded-xl border border-white/10 bg-[#16161a] px-4 py-3.5 text-[14px] text-white placeholder:text-zinc-500 outline-none transition-all duration-200 focus:border-amber-400 focus:bg-[#1a1a1f] focus:ring-1 focus:ring-amber-400/20 hover:border-white/20";

  return (
    <section className="relative min-h-screen bg-[#0a0a0c] text-white pt-20 pb-20 sm:pt-28 sm:pb-28 overflow-x-hidden">
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Mobile Accordion Summary Bar (visible only on screens < lg) */}
        <div className="lg:hidden mb-6">
          <button
            type="button"
            onClick={() => setShowMobileSummary(!showMobileSummary)}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-[#141416] border border-white/10 text-left transition-all active:scale-[0.99]"
          >
            <div className="flex items-center gap-2.5 text-sm font-medium text-zinc-200">
              <ShoppingBag className="h-4 w-4 text-amber-400" />
              <span>{showMobileSummary ? "Hide" : "Show"} order summary</span>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/70">
                {detailed.reduce((acc, item) => acc + item.qty, 0)}
              </span>
              {showMobileSummary ? (
                <ChevronUp className="h-4 w-4 text-zinc-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-zinc-400" />
              )}
            </div>
            <span className="text-base font-bold text-white">{formatPrice(total)}</span>
          </button>

          <AnimatePresence>
            {showMobileSummary && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="mt-3 overflow-hidden"
              >
                {/* Embedded Summary Card for Mobile */}
                <div className="rounded-2xl border border-white/10 bg-[#141416] p-4 sm:p-5 shadow-xl">
                  <div className="flex items-center justify-between mb-3.5">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4 text-amber-400" />
                      <span>Items in Order</span>
                    </h3>
                    <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-[11px] font-bold text-amber-300">
                      {totalItemsCount} items
                    </span>
                  </div>

                  <div className="flex flex-col gap-3">
                    {detailed.map(({ product, qty }) => (
                      <div
                        key={product.slug}
                        className="flex gap-3 rounded-xl border border-white/10 bg-[#18181c]/70 p-3"
                      >
                        <div className="relative shrink-0">
                          <div className="relative h-14 w-14 rounded-lg overflow-hidden bg-black/50 border border-white/10">
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          </div>
                          <span className="absolute -top-1.5 -right-1.5 z-10 flex h-4.5 min-w-4.5 px-1 items-center justify-center rounded-full bg-amber-400 text-[10px] font-black text-black ring-2 ring-[#141416] shadow-sm">
                            {qty}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1 flex flex-col justify-between">
                          <div className="flex items-start justify-between gap-1">
                            <p className="text-xs font-bold text-white truncate">{product.name}</p>
                            <button
                              type="button"
                              onClick={() => remove(product.slug)}
                              className="text-zinc-500 hover:text-red-400 p-1"
                              aria-label={"Remove " + product.name}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-1 rounded-full border border-white/15 bg-white/5 p-0.5">
                              <button
                                type="button"
                                onClick={() => setQty(product.slug, qty - 1)}
                                className="grid h-5 w-5 place-items-center rounded-full text-zinc-400 hover:text-amber-400"
                              >
                                <Minus className="h-2.5 w-2.5" />
                              </button>
                              <span className="w-4 text-center text-[11px] font-bold text-white">
                                {qty}
                              </span>
                              <button
                                type="button"
                                onClick={() => setQty(product.slug, qty + 1)}
                                className="grid h-5 w-5 place-items-center rounded-full text-zinc-400 hover:text-amber-400"
                              >
                                <Plus className="h-2.5 w-2.5" />
                              </button>
                            </div>
                            <span className="text-xs font-bold text-white">
                              {formatPrice(product.price * qty)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 flex flex-col gap-2 text-xs">
                    <div className="flex justify-between text-zinc-400">
                      <span>Subtotal</span>
                      <span className="text-white font-medium">{formatPrice(subtotal)}</span>
                    </div>
                    {savings > 0 && (
                      <div className="flex justify-between text-emerald-400">
                        <span>MRP Savings</span>
                        <span>&minus;{formatPrice(savings)}</span>
                      </div>
                    )}
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-amber-300">
                        <span>Discount ({appliedCoupon?.code})</span>
                        <span>&minus;{formatPrice(discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-zinc-400">
                      <span>Shipping</span>
                      <span className="text-white font-medium">{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-white/10 flex justify-between items-center text-sm font-bold text-white">
                      <span>Total</span>
                      <span className="text-amber-400">{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Desktop 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] xl:grid-cols-[420px_1fr] gap-6 lg:gap-10 items-start">
          
          {/* ============================================================== */}
          {/* LEFT COLUMN: ORDER SUMMARY CARD (Matches reference screenshot) */}
          {/* ============================================================== */}
          <div className="hidden lg:block lg:sticky lg:top-28">
            <div className="rounded-[28px] border border-white/10 bg-gradient-to-b from-[#18181c] via-[#141416] to-[#0f0f11] p-6 sm:p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] relative overflow-hidden backdrop-blur-xl">
              
              {/* Subtle Ambient Radial Gold Glow */}
              <div className="pointer-events-none absolute -top-20 -right-20 h-44 w-44 rounded-full bg-amber-500/10 blur-3xl" />

              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="flex items-center gap-2.5 text-[18px] font-bold text-white tracking-tight">
                  <ShoppingBag className="h-5 w-5 text-amber-400" />
                  <span>Order Summary</span>
                </h2>
                <span className="rounded-full bg-amber-400/10 border border-amber-400/25 px-2.5 py-0.5 text-[11px] font-bold text-amber-300">
                  {totalItemsCount} {totalItemsCount === 1 ? "item" : "items"}
                </span>
              </div>

              {/* Items List — scrollable when many items */}
              <div className="flex flex-col gap-3 max-h-[280px] xl:max-h-[320px] overflow-y-auto pr-1 scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30">
                <AnimatePresence initial={false}>
                  {detailed.map(({ product, qty }) => (
                    <motion.div
                      key={product.slug}
                      layout
                      initial={{ opacity: 0, y: 12, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9, x: -16, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.3, ease: EASE }}
                      className="group relative flex gap-3.5 rounded-2xl border border-white/10 bg-[#19191d]/80 hover:bg-[#1d1d23] hover:border-amber-400/30 p-3 sm:p-3.5 transition-all duration-300 shadow-sm"
                    >
                      {/* Thumbnail with floating badge */}
                      <div className="relative shrink-0">
                        <div className="relative h-16 w-16 sm:h-[66px] sm:w-[66px] rounded-xl overflow-hidden bg-black/60 border border-white/10 shadow-inner group-hover:border-amber-400/40 transition-colors">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="66px"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <motion.span
                          key={`badge-${qty}`}
                          initial={{ scale: 0.7 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1.5 -right-1.5 z-10 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1 text-[10.5px] font-black text-black shadow-md shadow-amber-400/40 ring-2 ring-[#131316]"
                        >
                          {qty}
                        </motion.span>
                      </div>

                      {/* Title, weight & controls */}
                      <div className="flex min-w-0 flex-1 flex-col justify-between">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-[14px] font-bold text-white group-hover:text-amber-300 transition-colors">
                              {product.name}
                            </p>
                            <p className="text-[11.5px] text-zinc-400 font-medium">
                              {product.weight || "200g"} · Whole Roasted
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => remove(product.slug)}
                            className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10 p-1.5 rounded-lg transition-colors shrink-0"
                            title="Remove item"
                            aria-label={"Remove " + product.name}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mt-2 flex items-center justify-between">
                          {/* Quantity stepper pill */}
                          <div className="flex items-center gap-1 rounded-full border border-white/15 bg-white/5 p-0.5">
                            <button
                              type="button"
                              onClick={() => setQty(product.slug, qty - 1)}
                              aria-label="Decrease quantity"
                              className="grid h-6 w-6 place-items-center rounded-full text-zinc-400 transition-colors hover:bg-amber-400/20 hover:text-amber-400 active:scale-95"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-5 text-center text-xs font-bold tabular-nums text-white">
                              {qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => setQty(product.slug, qty + 1)}
                              aria-label="Increase quantity"
                              className="grid h-6 w-6 place-items-center rounded-full text-zinc-400 transition-colors hover:bg-amber-400/20 hover:text-amber-400 active:scale-95"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          <span className="text-[14.5px] font-extrabold text-white tabular-nums">
                            {formatPrice(product.price * qty)}
                          </span>
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
                      <span className="font-mono font-bold text-emerald-400 uppercase">
                        {appliedCoupon.code}
                      </span>
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
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value.toUpperCase());
                          setCouponError("");
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleApplyCoupon();
                          }
                        }}
                        placeholder="Enter coupon code (e.g. ROAST20)"
                        className="flex-1 rounded-xl border border-white/10 bg-[#161619] px-3.5 py-2.5 text-[13px] font-mono uppercase text-white placeholder:text-zinc-500 placeholder:normal-case outline-none transition-all focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20"
                      />
                      <button
                        type="button"
                        onClick={() => handleApplyCoupon()}
                        className="rounded-xl bg-white hover:bg-amber-400 hover:text-black px-4 py-2.5 text-[12.5px] font-bold text-black transition-all active:scale-95 shadow-sm"
                      >
                        Apply
                      </button>
                    </div>

                    {couponError && (
                      <p className="mt-1.5 text-xs text-red-400">{couponError}</p>
                    )}
                    {couponSuccess && (
                      <p className="mt-1.5 text-xs text-emerald-400">{couponSuccess}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Price Breakdown Totals */}
              <div className="mt-5 pt-4 border-t border-white/10 flex flex-col gap-2.5 text-sm">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal</span>
                  <span className="text-white font-medium">{formatPrice(subtotal)}</span>
                </div>

                {savings > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>MRP Savings</span>
                    <span>&minus;{formatPrice(savings)}</span>
                  </div>
                )}

                {discountAmount > 0 && (
                  <div className="flex justify-between text-amber-300">
                    <span className="flex items-center gap-1.5">
                      <Percent className="h-3.5 w-3.5" />
                      Promo Discount ({appliedCoupon?.code})
                    </span>
                    <span className="font-semibold">&minus;{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-zinc-400">
                  <span>Worldwide Shipping</span>
                  <span className="text-white font-medium">
                    {shipping === 0 ? (
                      <span className="text-emerald-400 font-bold">Free</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>

                <div className="mt-2 pt-3.5 border-t border-white/10 flex justify-between items-baseline">
                  <span className="text-[17px] font-bold text-white">Total</span>
                  <span className="text-[23px] font-extrabold text-amber-400 tabular-nums">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              {/* Security reassurance */}
              <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-center gap-2 text-[11.5px] text-zinc-400">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>256-Bit Bank Grade SSL Encrypted Checkout</span>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* RIGHT COLUMN: STEPPER + STEP-WISE PAYMENT FLOW UI */}
          {/* ============================================================== */}
          <div className="w-full">
            
            {/* STEPPER HEADER — Premium amber-accented progress UI */}
            <div className="mb-8 lg:mb-10">
              <div className="flex items-center justify-between w-full">
                
                {/* STEP 1: Contact Details */}
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2.5 group text-left cursor-pointer transition-all"
                >
                  <motion.div
                    animate={{
                      scale: currentStep === 1 ? 1.05 : 1,
                    }}
                    transition={{ duration: 0.2 }}
                    className={`grid h-11 w-11 place-items-center rounded-full transition-all duration-300 ${
                      currentStep === 1
                        ? "bg-gradient-to-br from-amber-400 to-amber-500 text-black shadow-lg shadow-amber-500/30 ring-4 ring-amber-400/20"
                        : currentStep > 1
                        ? "bg-gradient-to-br from-amber-400 to-amber-500 text-black shadow-md shadow-amber-500/20"
                        : "bg-transparent border-2 border-white text-white"
                    }`}
                  >
                    {currentStep > 1 ? <Check className="h-5 w-5 stroke-[2.5]" /> : <User className="h-5 w-5" />}
                  </motion.div>
                  <div className="text-center sm:text-left">
                    <span
                      className={`block text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-colors ${
                        currentStep === 1 ? "text-amber-400" : currentStep > 1 ? "text-amber-400" : "text-white/80"
                      }`}
                    >
                      Step 1
                    </span>
                    <span className={`hidden sm:block text-[13px] font-semibold transition-colors ${
                      currentStep === 1 ? "text-white" : "text-zinc-400"
                    }`}>Contact</span>
                  </div>
                </button>

                {/* Connecting Line 1 — animated fill */}
                <div className="flex-1 mx-3 sm:mx-4 h-[2px] rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300"
                    initial={{ width: "0%" }}
                    animate={{ width: currentStep > 1 ? "100%" : "0%" }}
                    transition={{ duration: 0.45, ease: EASE }}
                  />
                </div>

                {/* STEP 2: Shipping Address */}
                <button
                  type="button"
                  onClick={() => { if (validateStep1()) setCurrentStep(2); }}
                  className={`flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2.5 group text-left transition-all ${
                    currentStep >= 2 ? "cursor-pointer" : "cursor-default"
                  }`}
                >
                  <motion.div
                    animate={{ scale: currentStep === 2 ? 1.05 : 1 }}
                    transition={{ duration: 0.2 }}
                    className={`grid h-11 w-11 place-items-center rounded-full transition-all duration-300 ${
                      currentStep === 2
                        ? "bg-gradient-to-br from-amber-400 to-amber-500 text-black shadow-lg shadow-amber-500/30 ring-4 ring-amber-400/20"
                        : currentStep > 2
                        ? "bg-gradient-to-br from-amber-400 to-amber-500 text-black shadow-md shadow-amber-500/20"
                        : "bg-transparent border-2 border-white text-white"
                    }`}
                  >
                    {currentStep > 2 ? <Check className="h-5 w-5 stroke-[2.5]" /> : <Truck className="h-5 w-5" />}
                  </motion.div>
                  <div className="text-center sm:text-left">
                    <span className={`block text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-colors ${
                      currentStep === 2 ? "text-amber-400" : currentStep > 2 ? "text-amber-400" : "text-white/80"
                    }`}>Step 2</span>
                    <span className={`hidden sm:block text-[13px] font-semibold transition-colors ${
                      currentStep === 2 ? "text-white" : "text-zinc-400"
                    }`}>Shipping</span>
                  </div>
                </button>

                {/* Connecting Line 2 */}
                <div className="flex-1 mx-3 sm:mx-4 h-[2px] rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300"
                    initial={{ width: "0%" }}
                    animate={{ width: currentStep > 2 ? "100%" : "0%" }}
                    transition={{ duration: 0.45, ease: EASE }}
                  />
                </div>

                {/* STEP 3: Payment Details */}
                <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2.5 text-left">
                  <motion.div
                    animate={{ scale: currentStep === 3 ? 1.05 : 1 }}
                    transition={{ duration: 0.2 }}
                    className={`grid h-11 w-11 place-items-center rounded-full transition-all duration-300 ${
                      currentStep === 3
                        ? "bg-gradient-to-br from-amber-400 to-amber-500 text-black shadow-lg shadow-amber-500/30 ring-4 ring-amber-400/20"
                        : "bg-transparent border-2 border-white text-white"
                    }`}
                  >
                    <CreditCard className="h-5 w-5" />
                  </motion.div>
                  <div className="text-center sm:text-left">
                    <span className={`block text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-colors ${
                      currentStep === 3 ? "text-amber-400" : "text-white/80"
                    }`}>Step 3</span>
                    <span className={`hidden sm:block text-[13px] font-semibold transition-colors ${
                      currentStep === 3 ? "text-white" : "text-zinc-400"
                    }`}>Payment</span>
                  </div>
                </div>
              </div>
            </div>

            {/* STEP FORMS CONTAINER */}
            <div className="w-full max-w-xl">
              <AnimatePresence mode="wait">
                
                {/* -------------------------------------------------------- */}
                {/* STEP 1: CONTACT DETAILS */}
                {/* -------------------------------------------------------- */}
                {currentStep === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.32, ease: EASE }}
                  >
                    <div className="mb-7">
                      <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1 text-[11.5px] font-bold text-amber-400 mb-3">
                        <User className="h-3.5 w-3.5" /> Step 1 of 3
                      </span>
                      <h1 className="text-[28px] sm:text-[32px] font-extrabold text-white tracking-tight">
                        Contact Details
                      </h1>
                      <p className="mt-1.5 text-sm text-zinc-400">We'll use this to send your order confirmation.</p>
                    </div>

                    <form onSubmit={handleProceedToShipping} className="space-y-5">
                      <div>
                        <label className="block text-[12.5px] font-semibold text-zinc-300 mb-2 uppercase tracking-wider">
                          Full Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                          <input
                            type="text"
                            required
                            value={form.name}
                            onChange={(e) => { setForm({ ...form, name: e.target.value }); if (errors.name) setErrors({ ...errors, name: "" }); }}
                            placeholder="Enter your full name"
                            className={inputClass + " pl-11"}
                          />
                        </div>
                        {errors.name && <p className="mt-1.5 text-xs text-red-400">{errors.name}</p>}
                      </div>

                      <div>
                        <label className="block text-[12.5px] font-semibold text-zinc-300 mb-2 uppercase tracking-wider">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                          <input
                            type="email"
                            required
                            value={form.email}
                            onChange={(e) => { setForm({ ...form, email: e.target.value }); if (errors.email) setErrors({ ...errors, email: "" }); }}
                            placeholder="Enter your email address"
                            className={inputClass + " pl-11"}
                          />
                        </div>
                        {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>}
                      </div>

                      <div>
                        <label className="block text-[12.5px] font-semibold text-zinc-300 mb-2 uppercase tracking-wider">
                          Mobile Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                          <input
                            type="tel"
                            required
                            value={form.phone}
                            onChange={(e) => { setForm({ ...form, phone: e.target.value }); if (errors.phone) setErrors({ ...errors, phone: "" }); }}
                            placeholder="+1 555 123 4567"
                            className={inputClass + " pl-11"}
                          />
                        </div>
                        {errors.phone && <p className="mt-1.5 text-xs text-red-400">{errors.phone}</p>}
                      </div>

                      <div className="pt-4">
                        <button
                          type="submit"
                          className="w-full flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 py-3.5 text-[14px] font-bold text-black shadow-lg shadow-amber-500/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-amber-500/40 active:scale-[0.98]"
                        >
                          Continue to Shipping
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* -------------------------------------------------------- */}
                {/* STEP 2: SHIPPING ADDRESS */}
                {/* -------------------------------------------------------- */}
                {currentStep === 2 && (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: EASE }}
                  >
                    <h1 className="text-[26px] sm:text-[30px] font-bold text-white mb-6 tracking-tight">
                      Shipping Address
                    </h1>

                    <form onSubmit={handleProceedToPayment} className="space-y-4">
                      <div>
                        <label className="block text-[13px] font-medium text-white/80 mb-2">
                          Street Address
                        </label>
                        <input
                          type="text"
                          required
                          value={form.address1}
                          onChange={(e) => {
                            setForm({ ...form, address1: e.target.value });
                            if (errors.address1) setErrors({ ...errors, address1: "" });
                          }}
                          placeholder="House number, flat, and street name"
                          className={inputClass}
                        />
                        {errors.address1 && (
                          <p className="mt-1.5 text-xs text-red-400">{errors.address1}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-[13px] font-medium text-white/80 mb-2">
                          Apartment, suite, unit (optional)
                        </label>
                        <input
                          type="text"
                          value={form.address2}
                          onChange={(e) => setForm({ ...form, address2: e.target.value })}
                          placeholder="Apartment, suite, unit, building, floor, etc."
                          className={inputClass}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[13px] font-medium text-white/80 mb-2">
                            City
                          </label>
                          <input
                            type="text"
                            required
                            value={form.city}
                            onChange={(e) => {
                              setForm({ ...form, city: e.target.value });
                              if (errors.city) setErrors({ ...errors, city: "" });
                            }}
                            placeholder="Enter city"
                            className={inputClass}
                          />
                          {errors.city && (
                            <p className="mt-1.5 text-xs text-red-400">{errors.city}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-[13px] font-medium text-white/80 mb-2">
                            State / Province
                          </label>
                          <input
                            type="text"
                            required
                            value={form.state}
                            onChange={(e) => {
                              setForm({ ...form, state: e.target.value });
                              if (errors.state) setErrors({ ...errors, state: "" });
                            }}
                            placeholder="Enter state"
                            className={inputClass}
                          />
                          {errors.state && (
                            <p className="mt-1.5 text-xs text-red-400">{errors.state}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[13px] font-medium text-white/80 mb-2">
                            Postal / PIN Code
                          </label>
                          <input
                            type="text"
                            required
                            value={form.zip}
                            onChange={(e) => {
                              setForm({ ...form, zip: e.target.value });
                              if (errors.zip) setErrors({ ...errors, zip: "" });
                            }}
                            placeholder="ZIP / Postal Code"
                            className={inputClass}
                          />
                          {errors.zip && (
                            <p className="mt-1.5 text-xs text-red-400">{errors.zip}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-[13px] font-medium text-white/80 mb-2">
                            Country
                          </label>
                          <input
                            type="text"
                            required
                            value={form.country}
                            onChange={(e) => setForm({ ...form, country: e.target.value })}
                            placeholder="Country"
                            className={inputClass}
                          />
                        </div>
                      </div>

                      <div className="pt-6 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setCurrentStep(1)}
                          className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 px-5 py-3 text-[13.5px] font-semibold text-white transition-all active:scale-95"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Back
                        </button>
                        <button
                          type="submit"
                          className="flex-1 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 py-3.5 text-[14px] font-bold text-black shadow-lg shadow-amber-500/25 transition-all duration-300 hover:scale-[1.01] hover:shadow-amber-500/40 active:scale-[0.98]"
                        >
                          Continue to Payment
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* -------------------------------------------------------- */}
                {/* STEP 3: PAYMENT DETAILS — MULTI-METHOD                   */}
                {/* -------------------------------------------------------- */}
                {currentStep === 3 && (
                  <motion.div
                    key="step-3"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.32, ease: EASE }}
                  >
                    {/* Header */}
                    <div className="mb-7">
                      <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1 text-[11.5px] font-bold text-amber-400 mb-3">
                        <Lock className="h-3.5 w-3.5" /> Step 3 of 3 · Secure Checkout
                      </span>
                      <h1 className="text-[28px] sm:text-[32px] font-extrabold text-white tracking-tight">
                        Payment Details
                      </h1>
                      <p className="mt-1.5 text-sm text-zinc-400">Choose your preferred payment method.</p>
                    </div>

                    {/* Payment Method Tabs */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
                      {(
                        [
                          { id: "card", label: "Card", icon: "💳" },
                          { id: "upi", label: "UPI", icon: "📱" },
                          { id: "paypal", label: "PayPal", icon: "🅿️" },
                          { id: "cod", label: "Cash on Delivery", icon: "🏠" },
                        ] as const
                      ).map((method) => (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setPaymentMethod(method.id)}
                          className={`relative flex flex-col items-center justify-center gap-1.5 rounded-2xl border py-3.5 px-2 text-center transition-all duration-200 active:scale-[0.97] ${
                            paymentMethod === method.id
                              ? "border-amber-400 bg-amber-400/10 shadow-lg shadow-amber-500/10"
                              : "border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/5"
                          }`}
                        >
                          {paymentMethod === method.id && (
                            <motion.div
                              layoutId="payment-active"
                              className="absolute inset-0 rounded-2xl border border-amber-400/60 bg-amber-400/5"
                              transition={{ duration: 0.2 }}
                            />
                          )}
                          <span className="text-xl leading-none">{method.icon}</span>
                          <span
                            className={`text-[11px] font-bold leading-tight ${
                              paymentMethod === method.id ? "text-amber-400" : "text-zinc-400"
                            }`}
                          >
                            {method.label}
                          </span>
                        </button>
                      ))}
                    </div>

                    <form onSubmit={handleFinalSubmit} className="space-y-5">
                      {/* ── CREDIT / DEBIT CARD ── */}
                      <AnimatePresence mode="wait">
                        {paymentMethod === "card" && (
                          <motion.div
                            key="card-form"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.22 }}
                            className="space-y-4"
                          >
                            {/* Card Preview */}
                            <div className="relative h-[140px] w-full max-w-sm rounded-2xl overflow-hidden bg-gradient-to-br from-zinc-800 via-zinc-900 to-black border border-white/10 p-5 shadow-xl">
                              <div className="absolute top-0 right-0 w-40 h-40 bg-amber-400/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/3 rounded-full translate-y-1/2 -translate-x-1/2" />
                              <div className="relative z-10 flex flex-col h-full justify-between">
                                <div className="flex items-center justify-between">
                                  <div className="flex gap-1">
                                    <div className="h-5 w-7 rounded-sm bg-amber-400/80" />
                                    <div className="h-5 w-7 rounded-sm bg-amber-400/40" />
                                  </div>
                                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                    {form.cardNumber.startsWith("4") ? "VISA" : form.cardNumber.startsWith("5") ? "MASTERCARD" : "CARD"}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-[13px] font-mono tracking-[0.2em] text-white/70">
                                    {form.cardNumber || "•••• •••• •••• ••••"}
                                  </p>
                                  <div className="flex items-center justify-between mt-1.5">
                                    <p className="text-[11px] text-zinc-500 uppercase tracking-wider">
                                      {form.cardHolder || "Card Holder"}
                                    </p>
                                    <p className="text-[11px] text-zinc-500 font-mono">
                                      {form.expiry || "MM/YY"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Card Holder */}
                            <div>
                              <label className="block text-[12.5px] font-semibold text-zinc-300 mb-2 uppercase tracking-wider">
                                Card Holder Name
                              </label>
                              <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                                <input
                                  type="text"
                                  value={form.cardHolder}
                                  onChange={(e) => setForm({ ...form, cardHolder: e.target.value })}
                                  placeholder="Name as on card"
                                  className={inputClass + " pl-11"}
                                />
                              </div>
                            </div>

                            {/* Card Number */}
                            <div>
                              <label className="block text-[12.5px] font-semibold text-zinc-300 mb-2 uppercase tracking-wider">
                                Card Number
                              </label>
                              <div className="relative">
                                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  value={form.cardNumber}
                                  onChange={(e) => handleCardNumberChange(e.target.value)}
                                  placeholder="1234 5678 9012 3456"
                                  className={inputClass + " pl-11 font-mono tracking-wider"}
                                  maxLength={19}
                                />
                              </div>
                              {errors.cardNumber && (
                                <p className="mt-1.5 text-xs text-red-400">{errors.cardNumber}</p>
                              )}
                            </div>

                            {/* Expiry + CVC */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[12.5px] font-semibold text-zinc-300 mb-2 uppercase tracking-wider">
                                  Expiry Date
                                </label>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  value={form.expiry}
                                  onChange={(e) => handleExpiryChange(e.target.value)}
                                  placeholder="MM/YY"
                                  className={inputClass + " font-mono"}
                                />
                                {errors.expiry && (
                                  <p className="mt-1.5 text-xs text-red-400">{errors.expiry}</p>
                                )}
                              </div>
                              <div>
                                <label className="block text-[12.5px] font-semibold text-zinc-300 mb-2 uppercase tracking-wider">
                                  CVC / CVV
                                </label>
                                <div className="relative">
                                  <input
                                    type="password"
                                    inputMode="numeric"
                                    maxLength={4}
                                    value={form.cvc}
                                    onChange={(e) => handleCvcChange(e.target.value)}
                                    placeholder="•••"
                                    className={inputClass + " font-mono"}
                                  />
                                </div>
                                {errors.cvc && (
                                  <p className="mt-1.5 text-xs text-red-400">{errors.cvc}</p>
                                )}
                              </div>
                            </div>

                            {/* Security badge */}
                            <div className="flex items-center gap-2 text-[11.5px] text-zinc-500">
                              <ShieldCheck className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                              <span>256-bit SSL encrypted. Your card details are never stored.</span>
                            </div>
                          </motion.div>
                        )}

                        {/* ── UPI ── */}
                        {paymentMethod === "upi" && (
                          <motion.div
                            key="upi-form"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.22 }}
                            className="space-y-4"
                          >
                            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
                              <p className="text-sm font-semibold text-white mb-1">Pay via UPI</p>
                              <p className="text-[12.5px] text-zinc-400">Enter your UPI ID linked to any bank or wallet app.</p>
                            </div>

                            <div>
                              <label className="block text-[12.5px] font-semibold text-zinc-300 mb-2 uppercase tracking-wider">
                                UPI ID
                              </label>
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm pointer-events-none">📱</span>
                                <input
                                  type="text"
                                  value={upiId}
                                  onChange={(e) => { setUpiId(e.target.value); if (errors.cardNumber) setErrors({ ...errors, cardNumber: "" }); }}
                                  placeholder="yourname@upi"
                                  className={inputClass + " pl-11"}
                                />
                              </div>
                              {errors.cardNumber && (
                                <p className="mt-1.5 text-xs text-red-400">{errors.cardNumber}</p>
                              )}
                            </div>

                            {/* UPI App logos row */}
                            <div>
                              <p className="text-[11.5px] text-zinc-500 mb-3">Accepted UPI apps:</p>
                              <div className="flex items-center gap-3 flex-wrap">
                                {["GPay", "PhonePe", "Paytm", "BHIM", "Amazon Pay"].map((app) => (
                                  <span key={app} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-zinc-300">
                                    {app}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {/* ── PAYPAL ── */}
                        {paymentMethod === "paypal" && (
                          <motion.div
                            key="paypal-form"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.22 }}
                            className="space-y-4"
                          >
                            <div className="rounded-2xl border border-[#003087]/40 bg-[#003087]/10 p-5 flex items-center gap-4">
                              <div className="text-4xl">🅿️</div>
                              <div>
                                <p className="text-sm font-bold text-white">PayPal</p>
                                <p className="text-[12.5px] text-zinc-400 mt-0.5">
                                  You'll be redirected to PayPal to complete your payment securely.
                                </p>
                              </div>
                            </div>
                            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-[12.5px] text-zinc-400 space-y-2">
                              <div className="flex items-center gap-2">
                                <Check className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                                <span>No card details needed — pay with your PayPal balance or linked card</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Check className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                                <span>Protected by PayPal Buyer Protection</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Check className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                                <span>Instant payment confirmation</span>
                              </div>
                            </div>
                            <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 px-4 py-3 text-[12px] text-amber-300 flex items-start gap-2">
                              <span className="text-base leading-none mt-0.5">ℹ️</span>
                              <span>After clicking "Place Order Securely", you'll be redirected to PayPal to authorize the payment of <strong>${total.toFixed(2)}</strong>.</span>
                            </div>
                          </motion.div>
                        )}

                        {/* ── CASH ON DELIVERY ── */}
                        {paymentMethod === "cod" && (
                          <motion.div
                            key="cod-form"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.22 }}
                            className="space-y-4"
                          >
                            <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-5 flex items-center gap-4">
                              <div className="text-4xl">🏠</div>
                              <div>
                                <p className="text-sm font-bold text-white">Cash on Delivery</p>
                                <p className="text-[12.5px] text-zinc-400 mt-0.5">
                                  Pay in cash when your order arrives at your door.
                                </p>
                              </div>
                            </div>
                            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 space-y-3">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-zinc-400">Amount to pay on delivery</span>
                                <span className="font-bold text-white text-base">${total.toFixed(2)}</span>
                              </div>
                              <div className="h-px bg-white/5" />
                              <div className="text-[12px] text-zinc-500 space-y-1.5">
                                <div className="flex items-center gap-2"><Check className="h-3 w-3 text-emerald-400" /> No online payment required</div>
                                <div className="flex items-center gap-2"><Check className="h-3 w-3 text-emerald-400" /> Pay exact amount in cash to delivery agent</div>
                                <div className="flex items-center gap-2"><Check className="h-3 w-3 text-zinc-500" /> COD fee may apply depending on your location</div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* CTA Buttons */}
                      <div className="pt-6 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setCurrentStep(2)}
                          className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 px-5 py-3 text-[13.5px] font-semibold text-white transition-all active:scale-95"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex-1 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 py-3.5 text-[14px] font-bold text-black shadow-lg shadow-amber-500/25 transition-all duration-300 hover:scale-[1.01] hover:shadow-amber-500/40 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="h-4 w-4 rounded-full border-2 border-black/60 border-t-black animate-spin" />
                              <span>Processing…</span>
                            </>
                          ) : (
                            <>
                              <Lock className="h-4 w-4" />
                              <span>
                                {paymentMethod === "paypal"
                                  ? "Continue to PayPal"
                                  : paymentMethod === "cod"
                                  ? "Place Order (Pay on Delivery)"
                                  : "Place Order Securely"}
                              </span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}


              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Makhana Seeds in the Bottom-Right Corner (Matches reference image) */}
      <div className="pointer-events-none fixed bottom-0 right-0 z-0 select-none max-w-[180px] sm:max-w-[240px] lg:max-w-[300px] opacity-75 sm:opacity-90">
        <Image
          src="/img/login-corner-makhana.png"
          alt="Roasted makhana seeds decor"
          width={340}
          height={260}
          className="w-full h-auto object-contain select-none"
          priority
        />
      </div>
    </section>
  );
}

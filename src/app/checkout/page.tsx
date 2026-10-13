"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronUp,
  CreditCard,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Truck,
  User,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useStoreConfig } from "@/context/StoreConfigContext";
import { EASE } from "@/components/motion-primitives";
import { CardIcon, UpiIcon, PayPalIcon, CodIcon } from "@/components/PaymentIcons";
import { getAccessToken } from "@/lib/api/session";
import { contact as contactApi, orders as ordersApi } from "@/lib/api/store";
import { ApiError, isApiError } from "@/lib/api/errors";
import type { CheckoutInput, PaymentMethod, RazorpayCheckout, StoreOrder } from "@/lib/api/types";
import { toApiLines, type CartLine } from "@/lib/cart-lines";
import { formatMoney } from "@/lib/format";
import { randomId } from "@/lib/id";
import { useRazorpay } from "@/hooks/useRazorpay";
import { DesktopSummary, MobileSummary } from "./CheckoutSummary";
import { OrderPlaced, PaymentPending } from "./OrderResult";

type Step = 1 | 2 | 3;

interface FormData {
  name: string;
  email: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

type FieldErrors = Partial<Record<keyof FormData | "address", string>>;

/** API validation paths -> form fields. */
const FIELD_MAP: Record<string, keyof FormData | "address"> = {
  "customer.name": "name",
  "customer.email": "email",
  "customer.phone": "phone",
  "shippingAddress.line1": "address1",
  "shippingAddress.line2": "address2",
  "shippingAddress.city": "city",
  "shippingAddress.state": "state",
  "shippingAddress.zip": "zip",
  "shippingAddress.country": "country",
  shippingAddress: "address1",
  addressId: "address",
};
const STEP_OF: Record<keyof FormData | "address", Step> = {
  name: 1,
  email: 1,
  phone: 1,
  address1: 2,
  address2: 2,
  city: 2,
  state: 2,
  zip: 2,
  country: 2,
  address: 2,
};

const METHOD_META: Record<PaymentMethod, { label: string; icon: typeof CardIcon; blurb: string }> = {
  card: { label: "Card", icon: CardIcon, blurb: "Visa, Mastercard, RuPay and international cards." },
  upi: { label: "UPI", icon: UpiIcon, blurb: "GPay, PhonePe, Paytm, BHIM or any UPI app." },
  paypal: { label: "PayPal", icon: PayPalIcon, blurb: "Pay with your PayPal balance or linked card." },
  cod: { label: "Cash on Delivery", icon: CodIcon, blurb: "Pay in cash when your order arrives at your door." },
};

type Result =
  | { kind: "placed"; order: StoreOrder }
  | {
      kind: "pending";
      order: StoreOrder;
      payment: RazorpayCheckout | null;
      message: string | null;
    };

type Banner = { message: string; requestId?: string | null; link?: { href: string; label: string } };

export default function CheckoutPage() {
  const cart = useCart();
  const { detailed, lines, count, total, couponCode, appliedCoupon, giftNote, setQuoteContext, setCheckoutProblems, subtract, quote, problems } =
    cart;
  const { user, status, requireAuth, refreshUser } = useAuth();
  const { config } = useStoreConfig();
  const razorpay = useRazorpay(config.payments.enabled);

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [result, setResult] = useState<Result | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paying, setPaying] = useState(false);
  const [showMobileSummary, setShowMobileSummary] = useState(false);
  const [banner, setBanner] = useState<Banner | null>(null);

  /* ── Form (untouched fields mirror the signed-in member) ──────────── */

  const [draft, setDraft] = useState<Partial<FormData>>({});
  const form: FormData = {
    name: draft.name ?? user?.name ?? "",
    email: draft.email ?? user?.email ?? "",
    phone: draft.phone ?? user?.phone ?? "",
    address1: draft.address1 ?? "",
    address2: draft.address2 ?? "",
    city: draft.city ?? "",
    state: draft.state ?? "",
    zip: draft.zip ?? "",
    country: draft.country ?? "United States",
  };
  const [errors, setErrors] = useState<FieldErrors>({});
  const setField = (k: keyof FormData, v: string) => {
    setDraft((prev) => ({ ...prev, [k]: v }));
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: "" }));
  };

  /* ── Saved addresses (members) ─────────────────────────────────────── */

  const savedAddresses = user?.addresses ?? [];
  const [addressChoiceState, setAddressChoice] = useState<string | null>(null);
  const defaultAddressId = savedAddresses.find((a) => a.isDefault)?.id ?? savedAddresses[0]?.id;
  const addressChoice =
    addressChoiceState && (addressChoiceState === "new" || savedAddresses.some((a) => a.id === addressChoiceState))
      ? addressChoiceState
      : (defaultAddressId ?? "new");
  const selectedAddress = savedAddresses.find((a) => a.id === addressChoice) ?? null;
  const [saveAddress, setSaveAddress] = useState(true);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const shipTo = selectedAddress ?? { line1: form.address1, line2: form.address2, city: form.city, state: form.state, zip: form.zip, country: form.country };
  const shippingLine = [shipTo.line1, shipTo.line2, shipTo.city, `${shipTo.state} ${shipTo.zip}`, shipTo.country]
    .map((s) => s?.trim())
    .filter(Boolean)
    .join(", ");

  // The cached member may predate addresses saved by an earlier order or on the profile page.
  const refreshedOnOpen = useRef(false);
  useEffect(() => {
    if (status !== "authenticated" || refreshedOnOpen.current) return;
    refreshedOnOpen.current = true;
    refreshUser().catch(() => {});
  }, [status, refreshUser]);

  /* ── Payment methods from /store/config ────────────────────────────── */

  const methods = config.payments.enabled
    ? config.payments.methods
    : config.payments.methods.filter((m) => m === "cod");
  const [methodState, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const paymentMethod: PaymentMethod | null =
    methodState && methods.includes(methodState) ? methodState : (methods[0] ?? null);
  const codUnavailable = paymentMethod === "cod" && quote !== null && !quote.shipping.codAvailable;

  // Quote shipping for the destination and the COD fee for the chosen method.
  const destinationCountry = selectedAddress?.country ?? form.country;
  useEffect(() => {
    setQuoteContext({ country: destinationCountry.trim() || undefined, paymentMethod: paymentMethod ?? undefined });
  }, [destinationCountry, paymentMethod, setQuoteContext]);
  useEffect(() => () => setQuoteContext({}), [setQuoteContext]);

  /* ── Validation ────────────────────────────────────────────────────── */

  const validateStep1 = (): boolean => {
    const e: FieldErrors = {};
    if (form.name.trim().length < 2) e.name = "Please enter your full name";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) e.email = "Please enter a valid email address";
    if (form.phone.replace(/\D/g, "").length < 8) e.phone = "Please enter a valid phone number";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = (): boolean => {
    if (selectedAddress) {
      setErrors({});
      return true;
    }
    const e: FieldErrors = {};
    if (!form.address1.trim()) e.address1 = "Please enter your street address";
    if (!form.city.trim()) e.city = "Please enter your city";
    if (!form.state.trim()) e.state = "Please enter your state / province";
    if (!form.zip.trim()) e.zip = "Please enter your postal / ZIP code";
    if (!form.country.trim()) e.country = "Please enter your country";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

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

  /* ── Placing the order ─────────────────────────────────────────────── */

  // requireAuth may run the callback after sign-in, from an older render:
  // read the latest values from a ref.
  const latest = useRef({ form, selectedAddress, paymentMethod, lines, couponCode, appliedCoupon, giftNote, saveAddress, marketingOptIn, user });
  useEffect(() => {
    latest.current = { form, selectedAddress, paymentMethod, lines, couponCode, appliedCoupon, giftNote, saveAddress, marketingOptIn, user };
  });

  // Signing in at "Verify & Complete Order" runs placeOrder before React re-renders
  // with the member, so `latest.current.user` can still be null: the token is the truth.
  const isSignedIn = () => Boolean(latest.current.user || getAccessToken());

  /** One Idempotency-Key per attempt; reused when the outcome of the last try is unknown. */
  const attempt = useRef<{ key: string; sig: string; uncertain: boolean } | null>(null);
  const orderedLines = useRef<CartLine[]>([]);

  const finishPaid = (order: StoreOrder) => {
    subtract(orderedLines.current);
    setResult({ kind: "placed", order });
    window.scrollTo({ top: 0 });
  };

  const openPayment = async (order: StoreOrder, payment: RazorpayCheckout | null) => {
    setPaying(true);
    try {
      let options = payment;
      // Fresh options for a retry (or when the first attempt couldn't reach Razorpay).
      if (!options || Date.parse(options.expiresAt) <= Date.now()) {
        options = await ordersApi.startPayment(order.id, isSignedIn() ? undefined : order.contact.email);
      }
      setResult({ kind: "pending", order, payment: options, message: null });
      const outcome = await razorpay.pay(order.id, options);
      if (outcome.status === "paid") finishPaid(outcome.order);
      else
        setResult({
          kind: "pending",
          order,
          payment: null,
          message:
            outcome.status === "failed"
              ? outcome.message
              : "The payment window was closed before paying. Your order is saved; complete the payment to confirm it.",
        });
    } catch (e) {
      setResult({
        kind: "pending",
        order,
        payment: null,
        message: isApiError(e) ? e.message : "We couldn't open the payment window. Please try again.",
      });
    } finally {
      setPaying(false);
    }
  };

  const applyApiError = (e: ApiError) => {
    if (e.code === "validation_failed") {
      const mapped: FieldErrors = {};
      const other: string[] = [];
      for (const [path, msg] of Object.entries(e.fields)) {
        const field = FIELD_MAP[path];
        if (field) mapped[field] ??= msg;
        else other.push(msg);
      }
      setErrors(mapped);
      const steps = (Object.keys(mapped) as (keyof FieldErrors)[]).map((k) => STEP_OF[k]);
      if (steps.length) setCurrentStep(Math.min(...steps) as Step);
      setBanner({ message: other[0] ?? e.message, requestId: e.requestId });
      return;
    }
    if (e.isStockProblem) {
      setCheckoutProblems(e.problems);
      setShowMobileSummary(true);
      setBanner({ message: `${e.message} Please update the highlighted items in your bag.` });
      return;
    }
    if (e.code === "address_not_found" || e.code === "address_requires_login") {
      setAddressChoice("new");
      setCurrentStep(2);
      setErrors({ address: e.message });
      setBanner({ message: e.message });
      return;
    }
    if (e.code === "idempotency_key_reused") {
      setBanner({
        message: "This checkout was already submitted. Please check My Orders before placing it again.",
        link: { href: "/orders", label: "Open My Orders" },
      });
      return;
    }
    // Coupon codes, cod_unavailable, payments_unavailable, customer_blocked and anything else: show the message.
    setBanner({ message: e.message, requestId: e.requestId });
  };

  const placeOrder = async () => {
    const v = latest.current;
    if (!v.paymentMethod) {
      setBanner({ message: "No payment method is available right now. Please try again later." });
      return;
    }
    const body: CheckoutInput = {
      customer: { name: v.form.name.trim(), email: v.form.email.trim(), phone: v.form.phone.trim() },
      ...(v.selectedAddress
        ? { addressId: v.selectedAddress.id }
        : {
            shippingAddress: {
              line1: v.form.address1.trim(),
              ...(v.form.address2.trim() ? { line2: v.form.address2.trim() } : {}),
              city: v.form.city.trim(),
              state: v.form.state.trim(),
              zip: v.form.zip.trim(),
              country: v.form.country.trim(),
            },
          }),
      items: toApiLines(v.lines),
      // Only a code that currently applies; a stale one would block the order.
      ...(v.couponCode && v.appliedCoupon ? { couponCode: v.couponCode } : {}),
      paymentMethod: v.paymentMethod,
      ...(v.giftNote.trim() ? { giftNote: v.giftNote.trim().slice(0, 500) } : {}),
      saveAddress: isSignedIn() && !v.selectedAddress && v.saveAddress,
    };

    const sig = JSON.stringify(body);
    const prev = attempt.current;
    const current = prev && (prev.sig === sig || prev.uncertain) ? prev : { key: randomId(), sig, uncertain: false };
    attempt.current = current;

    setBanner(null);
    setCheckoutProblems([]);
    setIsSubmitting(true);
    try {
      const res = await ordersApi.place(body, current.key);
      attempt.current = null;
      orderedLines.current = v.lines;
      // Pick up the address the order just saved, so the next checkout offers it.
      if (body.saveAddress) refreshUser().catch(() => {});
      // Only once the order exists; a failed sign-up must never get in the way of the purchase.
      if (v.marketingOptIn) contactApi.subscribe({ email: body.customer.email, source: "checkout" }).catch(() => {});
      if (!res.payment && !res.paymentError) {
        finishPaid(res.order);
        return;
      }
      if (res.paymentError) {
        setResult({ kind: "pending", order: res.order, payment: null, message: res.paymentError.message });
        return;
      }
      await openPayment(res.order, res.payment);
    } catch (e) {
      if (isApiError(e)) {
        // No answer (or a server error): keep the key so a retry can't create a second order.
        current.uncertain = e.isNetwork || e.status >= 500;
        if (!current.uncertain) attempt.current = null;
        applyApiError(e);
      } else {
        console.error("[checkout] unexpected error", e);
        setBanner({ message: "Something went wrong. Please try again." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1()) {
      setCurrentStep(1);
      return;
    }
    if (!validateStep2()) {
      setCurrentStep(2);
      return;
    }
    if (codUnavailable) {
      setBanner({ message: `Cash on delivery isn't available for ${quote?.shipping.zone ?? "this destination"}.` });
      return;
    }
    if (paymentMethod && paymentMethod !== "cod" && razorpay.scriptState === "error") {
      setBanner({ message: "The secure payment window couldn't load. Check your connection or disable blockers, then try again." });
      return;
    }
    // Members verify their phone before ordering (the API also accepts guests).
    requireAuth(
      () => {
        void placeOrder();
      },
      {
        title: "Verify to Complete Order",
        message: "Please verify your phone or email to track your order and receive updates.",
        prefill: { phone: form.phone, email: form.email, name: form.name },
        actionText: "Verify & Complete Order",
      },
    );
  };

  /* ── Screens ───────────────────────────────────────────────────────── */

  if (result?.kind === "placed") return <OrderPlaced order={result.order} />;

  if (result?.kind === "pending") {
    return (
      <>
        {razorpay.script}
        <PaymentPending
          order={result.order}
          deadline={result.payment?.expiresAt ?? result.order.paymentDueAt ?? null}
          message={result.message}
          busy={paying}
          onPay={() => void openPayment(result.order, result.payment)}
        />
      </>
    );
  }

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
            <Link
              href="/shop"
              className="rounded-xl bg-amber-400 px-6 py-3 text-sm font-bold text-black transition-all hover:bg-amber-300 shadow-md"
            >
              Browse Flavour Collection
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const inputClass =
    "w-full min-h-12 rounded-xl border border-white/10 bg-[#16161a] px-4 py-3 sm:py-3.5 text-[16px] sm:text-[14px] text-white placeholder:text-zinc-500 outline-none transition-all duration-200 focus:border-amber-400 focus:bg-[#1a1a1f] focus:ring-1 focus:ring-amber-400/20 hover:border-white/20";
  const errorText = (k: keyof FieldErrors) =>
    errors[k] ? (
      <p id={`co-${k}-error`} role="alert" className="mt-1.5 text-xs text-red-400">
        {errors[k]}
      </p>
    ) : null;
  const blocked = problems.length > 0 || codUnavailable || !paymentMethod;

  const ctaLabel =
    paymentMethod === "cod"
      ? "Place Order (Pay on Delivery)"
      : paymentMethod === "paypal"
        ? "Continue to PayPal"
        : "Place Order & Pay Securely";

  const bannerEl = banner && (
    <div
      role="alert"
      className="mt-5 flex items-start gap-2.5 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-[13px] text-red-300"
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <div>
        <p>{banner.message}</p>
        {banner.link && (
          <Link href={banner.link.href} className="mt-1 inline-block font-semibold text-white underline underline-offset-2">
            {banner.link.label}
          </Link>
        )}
        {banner.requestId && <p className="mt-1 text-[11px] text-red-300/60">Reference: {banner.requestId}</p>}
      </div>
    </div>
  );

  return (
    <section className="relative min-h-screen bg-[#0a0a0c] text-white pt-20 pb-[calc(7rem+env(safe-area-inset-bottom))] sm:pt-28 md:pb-28 overflow-x-hidden">
      {razorpay.script}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <MobileSummary open={showMobileSummary} setOpen={setShowMobileSummary} />

        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] xl:grid-cols-[420px_1fr] gap-6 lg:gap-10 items-start">
          <DesktopSummary />

          <div className="w-full">
            {/* MOBILE STEPPER — compact progress + thumb-sized back button */}
            <div className="sm:hidden mb-5 flex items-center gap-3">
              {currentStep === 1 ? (
                <Link
                  href="/cart"
                  aria-label="Back to bag"
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/15 bg-white/5 text-white active:scale-95 transition-transform"
                >
                  <ArrowLeft className="h-[18px] w-[18px]" />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => setCurrentStep((currentStep - 1) as Step)}
                  aria-label={currentStep === 2 ? "Back to contact details" : "Back to shipping address"}
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/15 bg-white/5 text-white active:scale-95 transition-transform"
                >
                  <ArrowLeft className="h-[18px] w-[18px]" />
                </button>
              )}
              <ol className="flex flex-1 items-center gap-1.5" aria-label="Checkout progress">
                {(["Contact", "Shipping", "Payment"] as const).map((label, i) => {
                  const step = (i + 1) as Step;
                  const done = step < currentStep;
                  const active = step === currentStep;
                  return (
                    <li key={label} className="flex-1">
                      <button
                        type="button"
                        disabled={!done}
                        onClick={() => setCurrentStep(step)}
                        aria-current={active ? "step" : undefined}
                        className="flex min-h-11 w-full flex-col justify-center gap-1.5 text-left disabled:cursor-default"
                      >
                        <span className="h-1 w-full overflow-hidden rounded-full bg-white/10">
                          <motion.span
                            className="block h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300"
                            initial={false}
                            animate={{ width: done || active ? "100%" : "0%" }}
                            transition={{ duration: 0.4, ease: EASE }}
                          />
                        </span>
                        <span
                          className={`flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider ${
                            active ? "text-amber-400" : done ? "text-white/80" : "text-zinc-500"
                          }`}
                        >
                          {done && <Check className="h-3 w-3 stroke-[3] text-amber-400" />}
                          {label}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>

            {/* STEPPER HEADER */}
            <div className="hidden sm:block mb-8 lg:mb-10">
              <div className="flex items-center justify-between w-full">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2.5 group text-left cursor-pointer transition-all"
                >
                  <motion.div
                    animate={{ scale: currentStep === 1 ? 1.05 : 1 }}
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
                    <span className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-colors text-amber-400">
                      Step 1
                    </span>
                    <span
                      className={`hidden sm:block text-[13px] font-semibold transition-colors ${
                        currentStep === 1 ? "text-white" : "text-zinc-400"
                      }`}
                    >
                      Contact
                    </span>
                  </div>
                </button>

                <div className="flex-1 mx-3 sm:mx-4 h-[2px] rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300"
                    initial={{ width: "0%" }}
                    animate={{ width: currentStep > 1 ? "100%" : "0%" }}
                    transition={{ duration: 0.45, ease: EASE }}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (validateStep1()) setCurrentStep(2);
                  }}
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
                    <span
                      className={`block text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-colors ${
                        currentStep >= 2 ? "text-amber-400" : "text-white/80"
                      }`}
                    >
                      Step 2
                    </span>
                    <span
                      className={`hidden sm:block text-[13px] font-semibold transition-colors ${
                        currentStep === 2 ? "text-white" : "text-zinc-400"
                      }`}
                    >
                      Shipping
                    </span>
                  </div>
                </button>

                <div className="flex-1 mx-3 sm:mx-4 h-[2px] rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300"
                    initial={{ width: "0%" }}
                    animate={{ width: currentStep > 2 ? "100%" : "0%" }}
                    transition={{ duration: 0.45, ease: EASE }}
                  />
                </div>

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
                    <span
                      className={`block text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-colors ${
                        currentStep === 3 ? "text-amber-400" : "text-white/80"
                      }`}
                    >
                      Step 3
                    </span>
                    <span
                      className={`hidden sm:block text-[13px] font-semibold transition-colors ${
                        currentStep === 3 ? "text-white" : "text-zinc-400"
                      }`}
                    >
                      Payment
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full max-w-xl">
              <AnimatePresence mode="wait">
                {/* STEP 1: CONTACT DETAILS */}
                {currentStep === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.32, ease: EASE }}
                  >
                    <div className="mb-5 sm:mb-7">
                      <span className="hidden sm:inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1 text-[11.5px] font-bold text-amber-400 mb-3">
                        <User className="h-3.5 w-3.5" /> Step 1 of 3
                      </span>
                      <h1 className="text-[24px] xs:text-[26px] sm:text-[32px] font-extrabold text-white tracking-tight">
                        Contact Details
                      </h1>
                      <p className="mt-1 sm:mt-1.5 text-[13px] sm:text-sm text-zinc-400">
                        We&apos;ll use this to send your order confirmation.
                      </p>
                    </div>

                    <form id="checkout-step-1" onSubmit={handleProceedToShipping} className="space-y-4 sm:space-y-5" noValidate>
                      {(
                        [
                          { k: "name", label: "Full Name", icon: User, type: "text", auto: "name", ph: "Enter your full name", mode: undefined },
                          { k: "email", label: "Email Address", icon: Mail, type: "email", auto: "email", ph: "Enter your email address", mode: "email" },
                          { k: "phone", label: "Mobile Phone Number", icon: Phone, type: "tel", auto: "tel", ph: "+1 555 123 4567", mode: "tel" },
                        ] as const
                      ).map((f) => (
                        <div key={f.k}>
                          <label
                            htmlFor={`co-${f.k}`}
                            className="block text-[12px] sm:text-[12.5px] font-semibold text-zinc-300 mb-1.5 sm:mb-2 uppercase tracking-wider"
                          >
                            {f.label}
                          </label>
                          <div className="relative">
                            <f.icon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                            <input
                              id={`co-${f.k}`}
                              name={f.k}
                              type={f.type}
                              inputMode={f.mode}
                              autoComplete={f.auto}
                              autoCapitalize={f.k === "name" ? "words" : "none"}
                              spellCheck={f.k === "name"}
                              enterKeyHint={f.k === "phone" ? "go" : "next"}
                              required
                              aria-invalid={!!errors[f.k]}
                              aria-describedby={errors[f.k] ? `co-${f.k}-error` : undefined}
                              value={form[f.k]}
                              onChange={(e) => setField(f.k, e.target.value)}
                              placeholder={f.ph}
                              className={inputClass + " pl-11"}
                            />
                          </div>
                          {errorText(f.k)}
                        </div>
                      ))}

                      {/* Opt-in, never pre-ticked; hidden for members who already get the emails. */}
                      {!user?.preferences?.exclusiveDrops && (
                        <label className="flex items-start gap-2.5 text-[13px] text-zinc-300">
                          <input
                            type="checkbox"
                            checked={marketingOptIn}
                            onChange={(e) => setMarketingOptIn(e.target.checked)}
                            className="mt-0.5 h-4 w-4 accent-amber-400"
                          />
                          <span>
                            Email me new flavours and members-only offers.{" "}
                            <span className="text-zinc-500">Unsubscribe anytime.</span>
                          </span>
                        </label>
                      )}

                      <div className="pt-4 hidden md:block">
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

                {/* STEP 2: SHIPPING ADDRESS */}
                {currentStep === 2 && (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: EASE }}
                  >
                    <h1 className="text-[24px] xs:text-[26px] sm:text-[30px] font-bold text-white mb-4 sm:mb-6 tracking-tight">
                      Shipping Address
                    </h1>

                    <form id="checkout-step-2" onSubmit={handleProceedToPayment} className="space-y-4" noValidate>
                      {savedAddresses.length > 0 && (
                        <fieldset>
                          <legend className="mb-2 text-[13px] font-medium text-white/80">Deliver to</legend>
                          <div role="radiogroup" className="grid gap-2.5 sm:grid-cols-2">
                            {savedAddresses.map((a) => {
                              const active = addressChoice === a.id;
                              return (
                                <button
                                  key={a.id}
                                  type="button"
                                  role="radio"
                                  aria-checked={active}
                                  onClick={() => {
                                    setAddressChoice(a.id);
                                    setErrors({});
                                  }}
                                  className={`rounded-2xl border p-3.5 text-left transition-all ${
                                    active
                                      ? "border-amber-400 bg-amber-400/10 shadow-lg shadow-amber-500/10"
                                      : "border-white/10 bg-white/[0.03] hover:border-white/25"
                                  }`}
                                >
                                  <span className="flex items-center justify-between gap-2">
                                    <span className="flex items-center gap-1.5 text-[13.5px] font-bold text-white">
                                      <MapPin className="h-3.5 w-3.5 text-amber-400" />
                                      {a.label}
                                    </span>
                                    {a.isDefault && (
                                      <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-[10.5px] font-semibold text-amber-300">
                                        Default
                                      </span>
                                    )}
                                  </span>
                                  <span className="mt-1 block text-[12.5px] text-zinc-400 leading-relaxed">
                                    {a.recipient} · {a.line1}
                                    {a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.zip}, {a.country}
                                  </span>
                                </button>
                              );
                            })}
                            <button
                              type="button"
                              role="radio"
                              aria-checked={addressChoice === "new"}
                              onClick={() => setAddressChoice("new")}
                              className={`rounded-2xl border border-dashed p-3.5 text-left text-[13.5px] font-semibold transition-all ${
                                addressChoice === "new"
                                  ? "border-amber-400 bg-amber-400/10 text-amber-300"
                                  : "border-white/15 text-white/80 hover:border-amber-400/40"
                              }`}
                            >
                              + Ship to a new address
                            </button>
                          </div>
                          {errorText("address")}
                        </fieldset>
                      )}

                      {addressChoice === "new" && (
                        <>
                          <div>
                            <label htmlFor="co-address1" className="block text-[13px] font-medium text-white/80 mb-1.5 sm:mb-2">
                              Street Address
                            </label>
                            <input
                              id="co-address1"
                              name="address-line1"
                              type="text"
                              autoComplete="shipping address-line1"
                              enterKeyHint="next"
                              required
                              aria-invalid={!!errors.address1}
                              value={form.address1}
                              onChange={(e) => setField("address1", e.target.value)}
                              placeholder="House number, flat, and street name"
                              className={inputClass}
                            />
                            {errorText("address1")}
                          </div>

                          <div>
                            <label htmlFor="co-address2" className="block text-[13px] font-medium text-white/80 mb-1.5 sm:mb-2">
                              Apartment, suite, unit (optional)
                            </label>
                            <input
                              id="co-address2"
                              name="address-line2"
                              type="text"
                              autoComplete="shipping address-line2"
                              enterKeyHint="next"
                              value={form.address2}
                              onChange={(e) => setField("address2", e.target.value)}
                              placeholder="Apartment, suite, unit, building, floor, etc."
                              className={inputClass}
                            />
                            {errorText("address2")}
                          </div>

                          <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            <div>
                              <label htmlFor="co-city" className="block text-[13px] font-medium text-white/80 mb-1.5 sm:mb-2">
                                City
                              </label>
                              <input
                                id="co-city"
                                name="city"
                                type="text"
                                autoComplete="shipping address-level2"
                                enterKeyHint="next"
                                required
                                aria-invalid={!!errors.city}
                                value={form.city}
                                onChange={(e) => setField("city", e.target.value)}
                                placeholder="Enter city"
                                className={inputClass}
                              />
                              {errorText("city")}
                            </div>
                            <div>
                              <label htmlFor="co-state" className="block text-[13px] font-medium text-white/80 mb-1.5 sm:mb-2">
                                <span className="sm:hidden">State</span>
                                <span className="hidden sm:inline">State / Province</span>
                              </label>
                              <input
                                id="co-state"
                                name="state"
                                type="text"
                                autoComplete="shipping address-level1"
                                enterKeyHint="next"
                                required
                                aria-invalid={!!errors.state}
                                value={form.state}
                                onChange={(e) => setField("state", e.target.value)}
                                placeholder="Enter state"
                                className={inputClass}
                              />
                              {errorText("state")}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            <div>
                              <label htmlFor="co-zip" className="block text-[13px] font-medium text-white/80 mb-1.5 sm:mb-2">
                                <span className="sm:hidden">Postal / ZIP</span>
                                <span className="hidden sm:inline">Postal / PIN Code</span>
                              </label>
                              <input
                                id="co-zip"
                                name="postal-code"
                                type="text"
                                autoComplete="shipping postal-code"
                                autoCapitalize="characters"
                                autoCorrect="off"
                                spellCheck={false}
                                enterKeyHint="next"
                                required
                                aria-invalid={!!errors.zip}
                                value={form.zip}
                                onChange={(e) => setField("zip", e.target.value)}
                                placeholder="ZIP / Postal Code"
                                className={inputClass}
                              />
                              {errorText("zip")}
                            </div>
                            <div>
                              <label htmlFor="co-country" className="block text-[13px] font-medium text-white/80 mb-1.5 sm:mb-2">
                                Country
                              </label>
                              <input
                                id="co-country"
                                name="country"
                                type="text"
                                autoComplete="shipping country-name"
                                enterKeyHint="go"
                                required
                                aria-invalid={!!errors.country}
                                value={form.country}
                                onChange={(e) => setField("country", e.target.value)}
                                placeholder="Country"
                                className={inputClass}
                              />
                              {errorText("country")}
                            </div>
                          </div>

                          {/* Everyone verifies before ordering, so guests can opt in too. */}
                          <label className="flex items-center gap-2.5 text-[13px] text-zinc-300">
                            <input
                              type="checkbox"
                              checked={saveAddress}
                              onChange={(e) => setSaveAddress(e.target.checked)}
                              className="h-4 w-4 accent-amber-400"
                            />
                            {user ? "Save this address to my account" : "Save this address for faster checkout next time"}
                          </label>
                        </>
                      )}

                      {quote?.shipping && (
                        <p className="text-[12.5px] text-zinc-400">
                          Delivery to {quote.shipping.zone}: {quote.shipping.window.minDays}–{quote.shipping.window.maxDays}{" "}
                          working days.
                        </p>
                      )}

                      <div className="pt-6 hidden md:flex items-center gap-3">
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

                {/* STEP 3: PAYMENT */}
                {currentStep === 3 && (
                  <motion.div
                    key="step-3"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.32, ease: EASE }}
                  >
                    <div className="mb-4 sm:mb-7">
                      <span className="hidden sm:inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1 text-[11.5px] font-bold text-amber-400 mb-3">
                        <Lock className="h-3.5 w-3.5" /> Step 3 of 3 · Secure Checkout
                      </span>
                      <h1 className="text-[24px] xs:text-[26px] sm:text-[32px] font-extrabold text-white tracking-tight">
                        Payment Details
                      </h1>
                      <p className="mt-1 sm:mt-1.5 text-[13px] sm:text-sm text-zinc-400 flex items-center gap-1.5">
                        <Lock className="h-3.5 w-3.5 text-emerald-400 sm:hidden" />
                        Choose your preferred payment method.
                      </p>
                    </div>

                    {/* Last look at where the order goes, without leaving the payment step. */}
                    <div className="mb-4 flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                      <div className="flex min-w-0 items-start gap-2.5">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                        <div className="min-w-0 text-[12.5px] leading-relaxed">
                          <p className="font-semibold text-white">
                            Shipping to {selectedAddress?.recipient || form.name.trim()}
                            {selectedAddress && <span className="font-normal text-zinc-400"> · {selectedAddress.label}</span>}
                          </p>
                          <p className="truncate text-zinc-400">{shippingLine}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="shrink-0 text-[12.5px] font-semibold text-amber-400 hover:text-amber-300"
                      >
                        Change
                      </button>
                    </div>

                    {!config.payments.enabled && (
                      <div className="mb-4 rounded-2xl border border-amber-400/20 bg-amber-400/5 px-4 py-3 text-[12.5px] text-amber-300">
                        Online payments are temporarily unavailable. You can pay in cash when your order arrives.
                      </div>
                    )}

                    <div
                      role="radiogroup"
                      aria-label="Payment method"
                      className={`grid gap-2 sm:gap-2.5 mb-5 sm:mb-6 ${
                        methods.length >= 4 ? "grid-cols-2 sm:grid-cols-4" : methods.length === 1 ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-3"
                      }`}
                    >
                      {methods.map((id) => {
                        const m = METHOD_META[id];
                        const active = paymentMethod === id;
                        return (
                          <button
                            key={id}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            onClick={() => {
                              setPaymentMethod(id);
                              setBanner(null);
                            }}
                            className={`relative flex flex-row sm:flex-col items-center justify-start sm:justify-center gap-2.5 sm:gap-1.5 min-h-13 sm:min-h-0 rounded-2xl border py-2.5 px-3.5 sm:py-3.5 sm:px-2 text-left sm:text-center transition-all duration-200 active:scale-[0.97] ${
                              active
                                ? "border-amber-400 bg-amber-400/10 shadow-lg shadow-amber-500/10"
                                : "border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/5"
                            }`}
                          >
                            {active && (
                              <motion.div
                                layoutId="payment-active"
                                className="absolute inset-0 rounded-2xl border border-amber-400/60 bg-amber-400/5"
                                transition={{ duration: 0.2 }}
                              />
                            )}
                            <m.icon
                              className={`relative h-6 w-6 shrink-0 transition-colors ${active ? "text-amber-400" : "text-zinc-400"}`}
                            />
                            <span
                              className={`text-[13px] sm:text-[11px] font-bold leading-tight ${active ? "text-amber-400" : "text-zinc-400"}`}
                            >
                              {m.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <form id="checkout-step-3" onSubmit={handleFinalSubmit} className="space-y-5" noValidate>
                      <AnimatePresence mode="wait">
                        {paymentMethod && paymentMethod !== "cod" && (
                          <motion.div
                            key={`${paymentMethod}-info`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.22 }}
                            className="space-y-4"
                          >
                            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5 flex items-center gap-4">
                              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-amber-400/10 text-amber-400">
                                {(() => {
                                  const Icon = METHOD_META[paymentMethod].icon;
                                  return <Icon className="h-7 w-7" />;
                                })()}
                              </span>
                              <div>
                                <p className="text-sm font-bold text-white">{METHOD_META[paymentMethod].label}</p>
                                <p className="text-[12.5px] text-zinc-400 mt-0.5">{METHOD_META[paymentMethod].blurb}</p>
                              </div>
                            </div>
                            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-[12.5px] text-zinc-400 space-y-2">
                              <div className="flex items-center gap-2">
                                <Check className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                                <span>
                                  After you place the order, a secure Razorpay window opens to pay{" "}
                                  <strong className="text-white">{formatMoney(total)}</strong>.
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Check className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                                <span>Your card and UPI details are entered with Razorpay, never on this site.</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Check className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                                <span>Complete the payment within {config.payments.timeoutMinutes} minutes to confirm your order.</span>
                              </div>
                            </div>
                            {razorpay.scriptState === "error" && (
                              <p role="alert" className="text-[12.5px] text-red-400">
                                The secure payment window couldn&apos;t load. Check your connection or disable blockers.
                              </p>
                            )}
                          </motion.div>
                        )}

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
                              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-emerald-500/15 text-emerald-400">
                                <CodIcon className="h-7 w-7" />
                              </span>
                              <div>
                                <p className="text-sm font-bold text-white">Cash on Delivery</p>
                                <p className="text-[12.5px] text-zinc-400 mt-0.5">{METHOD_META.cod.blurb}</p>
                              </div>
                            </div>
                            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 space-y-3">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-zinc-400">Amount to pay on delivery</span>
                                <span className="font-bold text-white text-base">{formatMoney(total)}</span>
                              </div>
                              <div className="h-px bg-white/5" />
                              <div className="text-[12px] text-zinc-500 space-y-1.5">
                                <div className="flex items-center gap-2">
                                  <Check className="h-3 w-3 text-emerald-400" /> No online payment required
                                </div>
                                <div className="flex items-center gap-2">
                                  <Check className="h-3 w-3 text-emerald-400" /> Pay exact amount in cash to delivery agent
                                </div>
                                <div className="flex items-center gap-2">
                                  <Check className="h-3 w-3 text-zinc-500" />
                                  {cart.codFee > 0
                                    ? `Includes a ${formatMoney(cart.codFee)} cash-on-delivery fee`
                                    : "No cash-on-delivery fee for this destination"}
                                </div>
                              </div>
                            </div>
                            {codUnavailable && (
                              <p role="alert" className="text-[12.5px] text-red-400">
                                Cash on delivery isn&apos;t available for {quote?.shipping.zone}.
                                {methods.length > 1 ? " Please choose an online payment method." : " Please choose another address."}
                              </p>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {bannerEl}

                      <div className="pt-6 hidden md:flex items-center gap-3">
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
                          disabled={isSubmitting || paying || blocked}
                          aria-busy={isSubmitting}
                          className="flex-1 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 py-3.5 text-[14px] font-bold text-black shadow-lg shadow-amber-500/25 transition-all duration-300 hover:scale-[1.01] hover:shadow-amber-500/40 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {isSubmitting || paying ? (
                            <>
                              <div className="h-4 w-4 rounded-full border-2 border-black/60 border-t-black animate-spin" />
                              <span>{paying ? "Waiting for payment…" : "Placing order…"}</span>
                            </>
                          ) : (
                            <>
                              <Lock className="h-4 w-4" />
                              <span>{ctaLabel}</span>
                            </>
                          )}
                        </button>
                      </div>
                      {problems.length > 0 && (
                        <p role="alert" className="text-[12.5px] text-red-400">
                          Some items in your bag need attention. Update them in the order summary to continue.
                        </p>
                      )}
                      <p className="flex items-center gap-2 text-[11.5px] text-zinc-500">
                        <ShieldCheck className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                        {count} {count === 1 ? "item" : "items"} · Prices and stock are confirmed when you place the order.
                      </p>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
              {currentStep !== 3 && bannerEl}
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE STICKY ACTION BAR */}
      <div className="md:hidden fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#0d0d0d]/85 backdrop-blur-xl pb-[env(safe-area-inset-bottom)] shadow-[0_-12px_30px_-12px_rgba(0,0,0,0.8)]">
        <div className="mx-auto flex max-w-xl items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => {
              setShowMobileSummary(true);
              document.getElementById("checkout-mobile-summary")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            aria-label="View order summary"
            className="flex min-h-12 shrink-0 flex-col justify-center pr-1 text-left active:opacity-70"
          >
            <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Total · {count} {count === 1 ? "item" : "items"}
              <ChevronUp className="h-3 w-3" />
            </span>
            <span className="text-[19px] font-extrabold leading-tight tabular-nums text-amber-400">{formatMoney(total)}</span>
          </button>
          <button
            type="submit"
            form={`checkout-step-${currentStep}`}
            disabled={isSubmitting || paying || (currentStep === 3 && blocked)}
            className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 px-4 text-[15px] font-bold text-black shadow-lg shadow-amber-500/25 transition-transform active:scale-[0.98] disabled:opacity-60"
          >
            {isSubmitting || paying ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-black/60 border-t-black animate-spin" />
                <span>Processing…</span>
              </>
            ) : currentStep === 3 ? (
              <>
                <Lock className="h-4 w-4" />
                <span>{paymentMethod === "cod" ? "Place Order" : "Pay Securely"}</span>
              </>
            ) : (
              <>
                <span>{currentStep === 1 ? "Continue to Shipping" : "Continue to Payment"}</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>

      <div className="pointer-events-none fixed bottom-0 right-0 z-0 hidden sm:block select-none max-w-[180px] sm:max-w-[240px] lg:max-w-[300px] opacity-75 sm:opacity-90">
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

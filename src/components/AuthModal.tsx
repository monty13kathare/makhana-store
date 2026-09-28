"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  ArrowRight,
  ShieldCheck,
  Check,
  Phone,
  MessageSquare,
  Sparkles,
  Truck,
  RotateCcw,
  ShoppingBag,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { formatUSD } from "@/lib/products";
import { LogoIcon } from "./BrandLogo";
import { EASE } from "./motion-primitives";

export default function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    modalOptions,
    startLogin,
    verify,
    activeOtpNotice,
  } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<"input" | "verify">("input");
  const [identifier, setIdentifier] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(""));
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [seconds, setSeconds] = useState(30);

  const otpInputs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset state whenever modal is opened
  useEffect(() => {
    if (isAuthModalOpen) {
      setError("");
      setOtpDigits(Array(6).fill(""));
      setSeconds(30);

      const prefId = modalOptions.prefill?.identifier;
      if (prefId) {
        setIdentifier(prefId);
        startLogin(prefId);
        setStep("verify");
      } else {
        setIdentifier("");
        setStep("input");
      }
      setFullName(modalOptions.prefill?.name || "");
    }
  }, [isAuthModalOpen, modalOptions]);

  // Resend countdown
  useEffect(() => {
    if (step !== "verify" || seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [step, seconds]);

  if (!isAuthModalOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = identifier.trim();
    const digits = clean.replace(/\D/g, "");
    if (digits.length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setError("");
    setIsSubmitting(true);
    startLogin("+1" + digits.slice(-10));
    setStep("verify");
    setSeconds(30);
    setIsSubmitting(false);
    setTimeout(() => otpInputs.current[0]?.focus(), 150);
  };

  const handleOtpChange = (index: number, val: string) => {
    const char = val.replace(/\D/g, "").slice(-1);
    const updated = [...otpDigits];
    updated[index] = char;
    setOtpDigits(updated);
    setError("");

    if (char && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  const handlePasteOtp = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    e.preventDefault();
    const updated = Array(6).fill("");
    for (let i = 0; i < text.length; i++) {
      updated[i] = text[i];
    }
    setOtpDigits(updated);
    otpInputs.current[Math.min(text.length, 5)]?.focus();
  };

  const handleAutofillCode = (code: string) => {
    const digits = code.split("").slice(0, 6);
    const updated = Array(6).fill("");
    for (let i = 0; i < digits.length; i++) {
      updated[i] = digits[i];
    }
    setOtpDigits(updated);
    setError("");
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = otpDigits.join("");
    if (entered.length < 4) {
      setError("Please enter the complete verification code.");
      return;
    }

    const success = verify(entered, fullName);
    if (!success) {
      setError("Invalid verification code. Please check and try again.");
    }
  };

  const handleFullLoginPage = () => {
    closeAuthModal();
    const redirect = modalOptions.redirectUrl
      ? `?redirect=${encodeURIComponent(modalOptions.redirectUrl)}`
      : "";
    router.push(`/login${redirect}`);
  };

  const handleClose = () => {
    closeAuthModal();
  };

  const maskedIdentifier = identifier
    ? identifier.includes("@")
      ? `${identifier.slice(0, 2)}•••@${identifier.split("@")[1]}`
      : `+1 (${identifier.slice(0, 3)}) •••-${identifier.slice(-4)}`
    : "your account";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop with luxury dark blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-xl"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 24 }}
          transition={{ duration: 0.45, ease: EASE }}
          className="relative w-full max-w-[460px] overflow-hidden rounded-[32px] border border-white/15 bg-gradient-to-b from-[#181818] via-[#121212] to-[#0e0e0e] p-6 sm:p-8 text-white shadow-[0_25px_80px_rgba(0,0,0,0.9)] z-10 my-auto"
        >
          {/* Ambient Lighting Orbs */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gradient-to-br from-amber-500/25 via-amber-400/10 to-transparent blur-3xl" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-gradient-to-tr from-amber-400/15 via-yellow-500/5 to-transparent blur-2xl" />

          {/* Top Bar: Brand Badge & Close */}
          <div className="relative z-10 flex items-center justify-between pb-2">
            <div className="flex items-center gap-2.5">
              <LogoIcon size={32} />
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[11px] font-bold text-amber-300">
                <Sparkles className="h-3 w-3" />
                VIP Member Access
              </span>
            </div>

            <button
              onClick={handleClose}
              aria-label="Close dialog"
              className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/5 text-white/70 transition-all hover:border-amber-400/50 hover:bg-amber-400/10 hover:text-amber-400 active:scale-90"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Product Preview Callout (When user triggered auth by adding a product) */}
          {modalOptions.product && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative z-10 mt-5 flex items-center gap-3.5 rounded-2xl border border-amber-400/20 bg-gradient-to-r from-amber-400/[0.08] to-transparent p-3"
            >
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/15 bg-neutral-900 shadow-md">
                <Image
                  src={modalOptions.product.image}
                  alt={modalOptions.product.name}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-amber-400">
                    Selected Item
                  </span>
                  <span className="h-1 w-1 rounded-full bg-amber-400" />
                  <span className="text-[11px] text-emerald-400 font-semibold">
                    Ready to Add
                  </span>
                </div>
                <p className="truncate text-[14px] font-bold text-white">
                  {modalOptions.product.name}
                </p>
                <p className="text-[12px] font-semibold text-white/70">
                  {formatUSD(modalOptions.product.price)} · Slow-roasted Fox Nuts
                </p>
              </div>
            </motion.div>
          )}

          {/* Heading Content */}
          <div className="relative z-10 mt-5">
            <h2 className="text-[23px] font-extrabold tracking-tight text-white sm:text-[25px]">
              {step === "input"
                ? modalOptions.title || "Sign in to Continue"
                : "Verify Your Identity"}
            </h2>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-[#9e9e9e]">
              {step === "input"
                ? modalOptions.message ||
                  "Sign in with your mobile number to sync your cart, view delivery checkpoints, and checkout in 1 click."
                : `We sent a secure 6-digit verification code to ${maskedIdentifier}.`}
            </p>
          </div>

          {/* STEP 1: Phone Input Form */}
          {step === "input" && (
            <form onSubmit={handleSendOtp} className="relative z-10 mt-6">
              <div>
                <label className="block mb-2 text-[12px] font-medium text-white/70">
                  Mobile Number
                </label>
                <div className="flex items-center gap-2.5 rounded-2xl border border-white/15 bg-white/[0.03] px-4 py-3.5 transition-all focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/25">
                  <span className="flex items-center gap-1.5 text-[13.5px] font-black text-amber-400">
                    <Phone className="h-3.5 w-3.5" />
                    <span>+1</span>
                  </span>
                  <span className="h-5 w-px bg-white/15" />
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    autoFocus
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      setError("");
                    }}
                    placeholder="(555) 389-2041"
                    className="w-full bg-transparent text-[14.5px] font-medium text-white tracking-wide outline-none placeholder:text-white/30"
                  />
                </div>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2.5 text-[12.5px] font-medium text-red-400"
                >
                  {error}
                </motion.p>
              )}

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileTap={{ scale: 0.98 }}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-white py-3.5 text-[14.5px] font-bold text-black transition-all hover:bg-amber-400 hover:text-black active:bg-amber-300 shadow-xl shadow-white/5 disabled:opacity-50"
              >
                <span>Continue with OTP</span>
                <ArrowRight className="h-4 w-4" />
              </motion.button>

              {/* Perks Grid */}
              <div className="mt-6 grid grid-cols-3 gap-2 border-t border-white/10 pt-4 text-center">
                <div className="flex flex-col items-center gap-1 rounded-xl bg-white/[0.02] p-2">
                  <Truck className="h-4 w-4 text-amber-400" />
                  <span className="text-[10.5px] font-medium text-white/70">
                    Live Tracking
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1 rounded-xl bg-white/[0.02] p-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span className="text-[10.5px] font-medium text-white/70">
                    6+ Suta Guarantee
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1 rounded-xl bg-white/[0.02] p-2">
                  <ShoppingBag className="h-4 w-4 text-amber-300" />
                  <span className="text-[10.5px] font-medium text-white/70">
                    Saved Cart
                  </span>
                </div>
              </div>

              {/* Secondary Options */}
              <div className="mt-4 flex items-center justify-between text-[12.5px] text-white/50 pt-2">
                <button
                  type="button"
                  onClick={handleFullLoginPage}
                  className="hover:text-amber-400 transition-colors"
                >
                  Full sign-in page &rarr;
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="hover:text-white transition-colors"
                >
                  Continue browsing
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: 6-Digit OTP Verification Form */}
          {step === "verify" && (
            <form onSubmit={handleVerifyOtp} className="relative z-10 mt-6">
              {/* SMS Simulator Preview Banner */}
              {activeOtpNotice && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-4 flex items-center justify-between rounded-2xl border border-amber-400/30 bg-amber-400/[0.08] p-3 text-[12.5px]"
                >
                  <div className="flex items-center gap-2.5 text-white/90">
                    <MessageSquare className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>
                      Passcode: <strong className="text-amber-300 font-mono text-[14px] tracking-wider">{activeOtpNotice.code}</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAutofillCode(activeOtpNotice.code)}
                    className="rounded-lg bg-amber-400/20 px-2.5 py-1 text-[11.5px] font-bold text-amber-300 hover:bg-amber-400 hover:text-black transition-colors"
                  >
                    Auto-fill
                  </button>
                </motion.div>
              )}

              {/* 6 Box Inputs */}
              <div>
                <label className="block mb-2 text-[12px] font-bold uppercase tracking-wider text-white/60">
                  Enter 6-Digit Code
                </label>
                <div className="grid grid-cols-6 gap-2" onPaste={handlePasteOtp}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={1}
                      value={digit}
                      aria-label={`Digit ${idx + 1}`}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className={`h-13 sm:h-14 w-full rounded-2xl border bg-black/40 text-center text-[22px] font-black outline-none transition-all ${
                        error
                          ? "border-red-400 text-red-300 ring-2 ring-red-400/30"
                          : digit
                          ? "border-amber-400 text-amber-300 ring-2 ring-amber-400/25"
                          : "border-white/15 text-white focus:border-amber-400 focus:ring-2 focus:ring-amber-400/25"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Full Name for New Members */}
              <div className="mt-4">
                <label className="block mb-1.5 text-[12px] font-medium text-white/70">
                  Full Name (Optional for new members)
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full rounded-2xl border border-white/15 bg-white/[0.03] px-4 py-3 text-[13.5px] text-white outline-none transition-colors focus:border-amber-400"
                />
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2.5 text-center text-[12.5px] font-medium text-red-400"
                >
                  {error}
                </motion.p>
              )}

              {/* Verify Button */}
              <motion.button
                type="submit"
                whileTap={{ scale: 0.98 }}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-white py-3.5 text-[14.5px] font-bold text-black transition-all hover:bg-amber-400 hover:text-black active:bg-amber-300 shadow-xl shadow-white/5"
              >
                <Check className="h-4 w-4 stroke-[3]" />
                <span>{modalOptions.actionText || "Verify & Continue"}</span>
              </motion.button>

              {/* Resend and Back */}
              <div className="mt-4 flex items-center justify-between text-[12.5px]">
                <button
                  type="button"
                  onClick={() => setStep("input")}
                  className="text-white/60 hover:text-amber-400 transition-colors"
                >
                  &larr; Change mobile/email
                </button>

                {seconds > 0 ? (
                  <span className="text-white/40 tabular-nums">
                    Resend in {seconds}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (identifier) startLogin(identifier);
                      setSeconds(30);
                      setOtpDigits(Array(6).fill(""));
                      setError("");
                    }}
                    className="font-bold text-amber-400 hover:text-amber-300 underline underline-offset-4"
                  >
                    Resend code
                  </button>
                )}
              </div>
            </form>
          )}

          {/* Footer Security Assurance */}
          <div className="relative z-10 mt-5 flex items-center justify-center gap-2 text-[11.5px] text-white/40 border-t border-white/10 pt-4">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>256-bit SSL encrypted · Authentic Makhana Direct Store</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

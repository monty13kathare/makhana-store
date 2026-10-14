"use client";

import Image from "next/image";
import { useCallback, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  ArrowRight,
  ShieldCheck,
  Check,
  Mail,
  Sparkles,
  Truck,
  ShoppingBag,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { formatMoney } from "@/lib/format";
import { otpSentMessage, toIdentifier } from "@/lib/identifier";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { LogoIcon } from "./BrandLogo";
import { EASE } from "./motion-primitives";

const EMPTY_CODE = () => Array<string>(6).fill("");

export default function AuthModal() {
  const { isAuthModalOpen } = useAuth();
  // The panel mounts fresh each time the dialog opens, so its state starts clean.
  if (!isAuthModalOpen) return null;
  return <AuthModalPanel />;
}

function AuthModalPanel() {
  const {
    closeAuthModal,
    modalOptions,
    startLogin,
    verify,
    otpChallenge,
  } = useAuth();
  const router = useRouter();

  // Checkout passes its email: valid ones skip straight to the code step.
  const prefId = toIdentifier(modalOptions.prefill?.email ?? "") ?? "";
  const [step, setStep] = useState<"input" | "verify">(prefId ? "verify" : "input");
  const [identifier, setIdentifier] = useState(prefId);
  const [otpDigits, setOtpDigits] = useState<string[]>(EMPTY_CODE);
  const [fullName, setFullName] = useState(modalOptions.prefill?.name || "");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [seconds, setSeconds] = useState(30);

  const otpInputs = useRef<(HTMLInputElement | null)[]>([]);

  // Phones get a bottom sheet (slides up); sm+ keeps the centred card.
  const isSheet = useMediaQuery("(max-width: 639px)");

  // Lock background scroll while the dialog is open.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const sendCode = useCallback(
    async (id: string): Promise<boolean> => {
      setIsSubmitting(true);
      setError("");
      const res = await startLogin(id);
      setIsSubmitting(false);
      if (!res.ok) {
        setError(res.message);
        return false;
      }
      setSeconds(res.challenge.resendAfterSeconds || 30);
      setOtpDigits(EMPTY_CODE());
      // Don't pull the cursor out of a field the shopper is typing in (e.g. Full Name).
      setTimeout(() => {
        const busy = document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement;
        if (!busy || otpInputs.current.includes(document.activeElement as HTMLInputElement)) otpInputs.current[0]?.focus();
      }, 150);
      return true;
    },
    [startLogin],
  );

  // Prefilled (e.g. from checkout): send the code straight away, once per open.
  const autoSent = useRef(false);
  useEffect(() => {
    if (!prefId || autoSent.current) return;
    autoSent.current = true;
    void sendCode(prefId).then((ok) => {
      if (!ok) setStep("input");
    });
  }, [prefId, sendCode]);

  // Resend countdown
  useEffect(() => {
    if (step !== "verify" || seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [step, seconds]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = toIdentifier(identifier);
    if (!id) {
      setError("Please enter a valid email address.");
      return;
    }
    if (await sendCode(id)) {
      setIdentifier(id);
      setStep("verify");
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    const digits = val.replace(/\D/g, "");
    const updated = [...otpDigits];
    if (digits.length > 1) {
      // SMS autofill (autoComplete="one-time-code") drops the whole code into one box.
      const code = digits.slice(-6);
      const start = code.length === 6 ? 0 : index;
      for (let i = 0; i < code.length && start + i < 6; i++) updated[start + i] = code[i];
      setOtpDigits(updated);
      setError("");
      otpInputs.current[Math.min(start + code.length, 5)]?.focus();
      return;
    }
    updated[index] = digits;
    setOtpDigits(updated);
    setError("");

    if (digits && index < 5) {
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
    const updated = EMPTY_CODE();
    for (let i = 0; i < text.length; i++) {
      updated[i] = text[i];
    }
    setOtpDigits(updated);
    otpInputs.current[Math.min(text.length, 5)]?.focus();
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const entered = otpDigits.join("");
    if (entered.length < 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }
    setIsSubmitting(true);
    const res = await verify(entered, fullName);
    // On success the dialog closes (and this panel unmounts).
    if (!res.ok) {
      setIsSubmitting(false);
      setError(res.message);
      setOtpDigits(EMPTY_CODE());
      otpInputs.current[0]?.focus();
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

  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-[120] flex items-end justify-center p-0 sm:items-center sm:p-6 overflow-y-auto"
      >
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
          initial={isSheet ? { opacity: 1, y: "100%" } : { opacity: 0, scale: 0.93, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={isSheet ? { opacity: 1, y: "100%" } : { opacity: 0, scale: 0.93, y: 24 }}
          transition={{ duration: isSheet ? 0.38 : 0.45, ease: EASE }}
          className="relative z-10 max-h-[92dvh] w-full overflow-y-auto overflow-x-hidden overscroll-contain rounded-t-[28px] border border-b-0 border-white/15 bg-gradient-to-b from-[#181818] via-[#121212] to-[#0e0e0e] px-5 pt-3 pb-[calc(20px+env(safe-area-inset-bottom))] text-white shadow-[0_-12px_60px_rgba(0,0,0,0.8)] sm:my-auto sm:max-h-none sm:max-w-[460px] sm:overflow-hidden sm:rounded-[32px] sm:border-b sm:p-8 sm:shadow-[0_25px_80px_rgba(0,0,0,0.9)]"
        >
          {/* Sheet grab handle (phones) */}
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20 sm:hidden" aria-hidden />
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
              className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/5 text-white/70 sm:h-9 sm:w-9 transition-all hover:border-amber-400/50 hover:bg-amber-400/10 hover:text-amber-400 active:scale-90"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Product Preview Callout (When user triggered auth by adding a product) */}
          {modalOptions.product && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative z-10 mt-3 flex items-center gap-3.5 rounded-2xl sm:mt-5 border border-amber-400/20 bg-gradient-to-r from-amber-400/[0.08] to-transparent p-3"
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
                  {formatMoney(modalOptions.product.price)} · Slow-roasted Fox Nuts
                </p>
              </div>
            </motion.div>
          )}

          {/* Heading Content */}
          <div className="relative z-10 mt-3 sm:mt-5">
            <h2 className="text-[22px] font-extrabold tracking-tight text-white sm:text-[25px]">
              {step === "input"
                ? modalOptions.title || "Sign in to Continue"
                : "Verify Your Identity"}
            </h2>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-[#9e9e9e]">
              {step === "input"
                ? modalOptions.message ||
                  "Sign in with your email to sync your cart, view delivery checkpoints, and checkout in 1 click."
                : otpSentMessage(otpChallenge?.sentTo ?? identifier)}
            </p>
          </div>

          {/* STEP 1: Email Input Form */}
          {step === "input" && (
            <form onSubmit={handleSendOtp} className="relative z-10 mt-5 sm:mt-6">
              <div>
                <label htmlFor="auth-modal-email" className="block mb-2 text-[12px] font-medium text-white/70">
                  Email address
                </label>
                <div className="flex min-h-[52px] items-center gap-2.5 rounded-2xl border border-white/15 bg-white/[0.03] px-4 py-3 sm:min-h-0 sm:py-3.5 transition-all focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/25">
                  <span className="flex items-center gap-1.5 text-[15px] font-black text-amber-400 sm:text-[13.5px]">
                    <Mail className="h-3.5 w-3.5" />
                  </span>
                  <span className="h-5 w-px bg-white/15" />
                  <input
                    id="auth-modal-email"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoCapitalize="none"
                    spellCheck={false}
                    autoComplete="email"
                    enterKeyHint="go"
                    autoFocus
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      setError("");
                    }}
                    placeholder="you@example.com"
                    className="w-full bg-transparent text-[16px] font-medium sm:text-[14.5px] text-white tracking-wide outline-none placeholder:text-white/30"
                  />
                </div>
              </div>

              {error && (
                <motion.p
                  role="alert"
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
                aria-busy={isSubmitting}
                whileTap={{ scale: 0.98 }}
                className="mt-4 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-white py-3.5 text-[15px] sm:mt-5 sm:min-h-0 sm:text-[14.5px] font-bold text-black transition-all hover:bg-amber-400 hover:text-black active:bg-amber-300 shadow-xl shadow-white/5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Sending code…</span>
                  </>
                ) : (
                  <>
                    <span>Continue with OTP</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </motion.button>

              {/* Perks Grid */}
              <div className="mt-5 grid grid-cols-3 gap-2 border-t border-white/10 pt-4 text-center sm:mt-6">
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
              <div className="mt-2 flex items-center justify-between text-[13px] text-white/50 sm:mt-4 sm:pt-2 sm:text-[12.5px]">
                <button
                  type="button"
                  onClick={handleFullLoginPage}
                  className="min-h-[44px] pr-3 hover:text-amber-400 active:text-amber-400 transition-colors sm:min-h-0 sm:pr-0"
                >
                  Full sign-in page &rarr;
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="min-h-[44px] pl-3 hover:text-white active:text-white transition-colors sm:min-h-0 sm:pl-0"
                >
                  Continue browsing
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: 6-Digit OTP Verification Form */}
          {step === "verify" && (
            <form onSubmit={handleVerifyOtp} className="relative z-10 mt-5 sm:mt-6">
              {/* 6 Box Inputs */}
              <div>
                <label className="block mb-2 text-[12px] font-bold uppercase tracking-wider text-white/60">
                  Enter 6-Digit Code
                </label>
                <div className="grid grid-cols-6 gap-1.5 xs:gap-2" onPaste={handlePasteOtp}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete="one-time-code"
                      enterKeyHint={idx === 5 ? "done" : "next"}
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
                <label htmlFor="auth-modal-name" className="block mb-1.5 text-[12px] font-medium text-white/70">
                  Full Name (Optional for new members)
                </label>
                <input
                  id="auth-modal-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  autoCapitalize="words"
                  enterKeyHint="go"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full rounded-2xl border border-white/15 bg-white/[0.03] px-4 py-3 text-[16px] sm:text-[13.5px] text-white outline-none transition-colors focus:border-amber-400"
                />
              </div>

              {isSubmitting && !otpChallenge && !error && (
                <p role="status" className="mt-2.5 text-center text-[12.5px] text-white/60">
                  Sending your code…
                </p>
              )}
              {error && (
                <motion.p
                  role="alert"
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
                disabled={isSubmitting || !otpChallenge}
                aria-busy={isSubmitting}
                whileTap={{ scale: 0.98 }}
                className="mt-4 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-white py-3.5 text-[15px] sm:mt-5 sm:min-h-0 sm:text-[14.5px] font-bold text-black transition-all hover:bg-amber-400 hover:text-black active:bg-amber-300 shadow-xl shadow-white/5"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 stroke-[3]" />
                )}
                <span>{modalOptions.actionText || "Verify & Continue"}</span>
              </motion.button>

              {/* Resend and Back */}
              <div className="mt-2 flex items-center justify-between text-[13px] sm:mt-4 sm:text-[12.5px]">
                <button
                  type="button"
                  onClick={() => {
                    setStep("input");
                    setError("");
                  }}
                  className="min-h-[44px] pr-3 text-white/60 hover:text-amber-400 active:text-amber-400 transition-colors sm:min-h-0 sm:pr-0"
                >
                  &larr; Change email
                </button>

                {seconds > 0 ? (
                  <span className="text-white/40 tabular-nums">
                    Resend in {seconds}s
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => {
                      if (identifier) void sendCode(identifier);
                    }}
                    className="min-h-[44px] pl-3 font-bold text-amber-400 hover:text-amber-300 underline underline-offset-4 sm:min-h-0 sm:pl-0"
                  >
                    Resend code
                  </button>
                )}
              </div>
            </form>
          )}

          {/* Footer Security Assurance */}
          <div className="relative z-10 mt-3 flex items-center justify-center gap-2 text-[11.5px] text-white/40 border-t border-white/10 pt-3.5 sm:mt-5 sm:pt-4">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>256-bit SSL encrypted · Authentic Makhana Direct Store</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

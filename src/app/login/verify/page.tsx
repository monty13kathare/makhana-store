"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldCheck, MessageSquare, Copy, Check, ArrowRight } from "lucide-react";
import AuthShell from "@/components/AuthShell";
import { useAuth } from "@/context/AuthContext";
import { EASE } from "@/components/motion-primitives";

const LENGTH = 6;

export default function VerifyPage() {
  const router = useRouter();
  const { user, pendingIdentifier, activeOtpNotice, verify, startLogin } = useAuth();
  const [code, setCode] = useState<string[]>(Array(LENGTH).fill(""));
  const [error, setError] = useState(false);
  const [seconds, setSeconds] = useState(30);
  const [copied, setCopied] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // If already logged in, redirect straight to home page
    if (user) {
      router.replace("/");
      return;
    }
    // If no identifier pending, redirect to login
    if (!pendingIdentifier) {
      router.replace("/login");
      return;
    }
    inputs.current[0]?.focus();
  }, [user, pendingIdentifier, router]);

  // Resend countdown
  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const setDigit = (i: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[i] = digit;
    setCode(next);
    setError(false);
    if (digit && i < LENGTH - 1) inputs.current[i + 1]?.focus();
  };

  const onKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };

  const onPaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LENGTH);
    if (!text) return;
    e.preventDefault();
    const next = Array(LENGTH)
      .fill("")
      .map((_, i) => text[i] ?? "");
    setCode(next);
    inputs.current[Math.min(text.length, LENGTH - 1)]?.focus();
  };

  const handleAutofill = (otp: string) => {
    const digits = otp.split("").slice(0, LENGTH);
    const next = Array(LENGTH)
      .fill("")
      .map((_, i) => digits[i] ?? "");
    setCode(next);
    setError(false);
  };

  const handleResend = () => {
    if (!pendingIdentifier) return;
    startLogin(pendingIdentifier);
    setSeconds(30);
    setCode(Array(LENGTH).fill(""));
    setError(false);
    inputs.current[0]?.focus();
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = code.join("");
    if (entered.length < 4) {
      setError(true);
      return;
    }

    if (verify(entered)) {
      router.replace("/");
    } else {
      setError(true);
    }
  };

  const digits = pendingIdentifier ? pendingIdentifier.replace(/\D/g, "") : "";
  const masked = digits.length >= 10
    ? `+1 (${digits.slice(-10, -7)}) •••-${digits.slice(-4)}`
    : pendingIdentifier || "your phone";

  return (
    <AuthShell
      title="Verification Code"
      subtitle={`Enter the 6-digit code sent to ${masked} to securely access your account.`}
      footer={
        <div className="flex items-center justify-center gap-2 text-[12px] text-white/50">
          <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>One-time code expires in 10 minutes</span>
        </div>
      }
    >
      {/* Simulation / Dispatch Notice (like real SMS preview) */}
      {activeOtpNotice && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 flex items-center justify-between rounded-xl border border-amber-400/30 bg-amber-400/[0.08] p-3 text-[12.5px]"
        >
          <div className="flex items-center gap-2.5 text-white/90">
            <MessageSquare className="h-4 w-4 text-amber-400 shrink-0" />
            <span>
              Security Code: <strong className="text-amber-300 font-mono tracking-wider">{activeOtpNotice.code}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleAutofill(activeOtpNotice.code)}
            className="flex items-center gap-1 rounded-md bg-amber-400/20 px-2 py-1 text-[11.5px] font-bold text-amber-300 hover:bg-amber-400 hover:text-black transition-colors"
          >
            Auto-fill
          </button>
        </motion.div>
      )}

      <form onSubmit={submit}>
        <motion.div
          animate={error ? { x: [0, -8, 8, -6, 6, 0] } : undefined}
          transition={{ duration: 0.45, ease: EASE }}
          className="grid grid-cols-6 gap-2"
          onPaste={onPaste}
        >
          {code.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                inputs.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={1}
              value={d}
              aria-label={`Digit ${i + 1}`}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => onKeyDown(i, e)}
              className={`h-14 w-full rounded-xl border bg-black/40 text-center text-[20px] font-bold outline-none transition-all ${
                error
                  ? "border-red-400/70 text-red-300 ring-1 ring-red-400/50"
                  : d
                  ? "border-amber-400 text-white ring-1 ring-amber-400/30"
                  : "border-white/15 text-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40"
              }`}
            />
          ))}
        </motion.div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 text-center text-[12.5px] text-red-400"
          >
            Invalid verification code. Please check and try again.
          </motion.p>
        )}

        <div className="mt-5 flex items-center justify-between text-[12.5px]">
          <span className="text-white/60">Didn&apos;t receive code?</span>
          {seconds > 0 ? (
            <span className="tabular-nums font-medium text-white/50">
              Resend in {seconds}s
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="font-bold text-amber-400 transition-colors hover:text-amber-300 underline underline-offset-4"
            >
              Resend code now
            </button>
          )}
        </div>

        <motion.button
          type="submit"
          whileTap={{ scale: 0.98 }}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-[14.5px] font-bold text-black transition-all hover:bg-amber-400 hover:text-black active:bg-amber-300 shadow-md"
        >
          <span>Verify &amp; Continue</span>
          <ArrowRight className="h-4 w-4" />
        </motion.button>
      </form>
    </AuthShell>
  );
}

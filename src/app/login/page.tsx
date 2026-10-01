"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, Phone } from "lucide-react";
import AuthShell from "@/components/AuthShell";
import { useAuth } from "@/context/AuthContext";

/** Formats up to 10 digits as (971) 135-5198. */
function formatPhone(digits: string) {
  const d = digits.slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

export default function LoginPage() {
  const router = useRouter();
  const { user, startLogin } = useAuth();
  const [digits, setDigits] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      router.replace("/");
    }
  }, [user, router]);

  // Autofocus on desktop only — on phones the keyboard would cover the hero.
  useEffect(() => {
    if (window.matchMedia("(min-width: 1024px)").matches) {
      inputRef.current?.focus();
    }
  }, []);

  const isValid = digits.length === 10;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setError("");
    setIsSubmitting(true);
    startLogin("+1" + digits);
    router.push("/login/verify");
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in with your mobile number. We'll text you a one-time code."
    >
      <form onSubmit={submit} noValidate>
        <label
          htmlFor="phone"
          className="mb-2 block px-1 text-[12px] font-semibold uppercase tracking-[0.14em] text-white/50"
        >
          Mobile number
        </label>
        <motion.div
          animate={error ? { x: [0, -6, 6, -4, 4, 0] } : undefined}
          transition={{ duration: 0.4 }}
          className={`flex h-14 items-center overflow-hidden rounded-2xl border bg-surface transition-all focus-within:ring-2 ${
            error
              ? "border-red-400/60 ring-red-400/20"
              : "border-white/10 focus-within:border-gold/60 focus-within:ring-gold/15"
          }`}
        >
          <span className="flex h-full shrink-0 items-center gap-2 border-r border-white/10 pl-4 pr-3 text-[16px] font-semibold text-white">
            <Phone className="h-4 w-4 text-gold" />
            +1
          </span>
          {/* 16px text keeps iOS Safari from zooming on focus */}
          <input
            ref={inputRef}
            id="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            enterKeyHint="go"
            value={formatPhone(digits)}
            onChange={(e) => {
              setDigits(e.target.value.replace(/\D/g, "").slice(0, 10));
              setError("");
            }}
            placeholder="(971) 135-5198"
            aria-invalid={!!error}
            aria-describedby={error ? "phone-error" : undefined}
            className="h-full w-full bg-transparent px-4 text-[16px] font-medium tracking-wide text-white outline-none placeholder:text-white/30"
          />
        </motion.div>

        {error && (
          <motion.p
            id="phone-error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 px-1 text-[12.5px] text-red-400"
          >
            {error}
          </motion.p>
        )}

        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileTap={{ scale: 0.97 }}
          className={`mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-[15px] font-bold transition-all disabled:opacity-60 ${
            isValid
              ? "bg-gold text-black shadow-[0_12px_32px_-12px_rgba(229,169,60,0.7)] hover:bg-[#f0b84f]"
              : "bg-white text-black hover:bg-neutral-200"
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending code…
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </motion.button>
      </form>
    </AuthShell>
  );
}

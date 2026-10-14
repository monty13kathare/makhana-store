"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, Mail } from "lucide-react";
import AuthShell from "@/components/AuthShell";
import { useAuth } from "@/context/AuthContext";
import { toIdentifier } from "@/lib/identifier";
import { safeRedirect } from "@/lib/redirect";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const redirectParam = useSearchParams().get("redirect");
  const redirect = safeRedirect(redirectParam);
  const { user, startLogin } = useAuth();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      router.replace(redirect);
    }
  }, [user, router, redirect]);

  // Autofocus on desktop only — on phones the keyboard would cover the hero.
  useEffect(() => {
    if (window.matchMedia("(min-width: 1024px)").matches) {
      inputRef.current?.focus();
    }
  }, []);

  const identifier = toIdentifier(value);
  const isValid = identifier !== null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setIsSubmitting(true);
    const res = await startLogin(identifier);
    if (!res.ok) {
      setIsSubmitting(false);
      setError(res.message);
      return;
    }
    router.push(redirectParam ? `/login/verify?redirect=${encodeURIComponent(redirect)}` : "/login/verify");
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in with your email. We'll send you a one-time code."
      footer={
        <p className="text-center text-[12.5px] text-white/50">
          Ordered as a guest?{" "}
          <Link href="/track" className="font-semibold text-amber-400 hover:text-amber-300">
            Track your order
          </Link>
        </p>
      }
    >
      <form onSubmit={submit} noValidate>
        <label
          htmlFor="email"
          className="mb-2 block px-1 text-[12px] font-semibold uppercase tracking-[0.14em] text-white/50"
        >
          Email address
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
            <Mail className="h-4 w-4 text-gold" />
          </span>
          {/* 16px text keeps iOS Safari from zooming on focus */}
          <input
            ref={inputRef}
            id="email"
            type="email"
            inputMode="email"
            autoCapitalize="none"
            spellCheck={false}
            autoComplete="email"
            enterKeyHint="go"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError("");
            }}
            placeholder="you@example.com"
            aria-invalid={!!error}
            aria-describedby={error ? "email-error" : undefined}
            className="h-full w-full bg-transparent px-4 text-[16px] font-medium tracking-wide text-white outline-none placeholder:text-white/30"
          />
        </motion.div>

        {error && (
          <motion.p
            id="email-error"
            role="alert"
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

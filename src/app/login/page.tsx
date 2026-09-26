"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import AuthShell from "@/components/AuthShell";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { user, startLogin } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      router.replace("/");
    }
  }, [user, router]);

  const submit = (e: React.FormEvent) => {
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
    router.push("/login/verify");
  };

  return (
    <AuthShell
      title="Log in"
      subtitle="Enter your phone number to unlock your account."
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <div className="relative flex items-center rounded-full border border-white/10 bg-[#1c1c1c] px-6 py-3.5 transition-all focus-within:border-white/30 focus-within:ring-2 focus-within:ring-white/10">
            <input
              id="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              autoFocus
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                setError("");
              }}
              placeholder="+1 (971) 135-5198"
              className="w-full bg-transparent text-[14.5px] text-white tracking-wide outline-none placeholder:text-white/35"
            />
          </div>
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-2 text-[12.5px] text-red-400"
          >
            {error}
          </motion.p>
        )}

        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileTap={{ scale: 0.98 }}
          className="mt-2 w-full rounded-full bg-white py-3.5 text-center text-[14.5px] font-bold text-black transition-all hover:bg-neutral-200 active:scale-98 shadow-md disabled:opacity-50"
        >
          {isSubmitting ? "Sending Code..." : "Log in"}
        </motion.button>
      </form>
    </AuthShell>
  );
}

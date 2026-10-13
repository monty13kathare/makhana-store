"use client";

import { useState } from "react";
import { ArrowRight, Check, Loader2, Mail } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { contact } from "@/lib/api/store";
import { errorMessage } from "@/lib/api/errors";

type State = { kind: "idle" } | { kind: "sending" } | { kind: "done" } | { kind: "error"; message: string };

/** Footer sign-up for the email list (POST /store/newsletter). */
export default function NewsletterSignup() {
  const { user } = useAuth();
  const [draft, setDraft] = useState<string | null>(null);
  const email = draft ?? user?.email ?? "";
  const [honeypot, setHoneypot] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!/^\S+@\S+\.\S+$/.test(value)) {
      setState({ kind: "error", message: "Please enter a valid email address." });
      return;
    }
    setState({ kind: "sending" });
    try {
      await contact.subscribe({ email: value, source: "footer", ...(honeypot ? { website: honeypot } : {}) });
      setState({ kind: "done" });
    } catch (err) {
      setState({ kind: "error", message: errorMessage(err, "We couldn't sign you up. Please try again.") });
    }
  };

  return (
    <div className="flex flex-col gap-5 rounded-[22px] border border-amber-400/15 bg-gradient-to-br from-amber-400/[0.07] to-transparent p-5 sm:p-7 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
      <div className="max-w-md">
        <p className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider text-amber-400">
          <Mail className="h-3.5 w-3.5" /> The inner circle
        </p>
        <h3 className="mt-2 text-[20px] sm:text-[22px] font-bold leading-tight text-white">New flavours and members-only offers, first.</h3>
        <p className="mt-1.5 text-[13px] text-white/55">A couple of emails a month. Unsubscribe with one click, anytime.</p>
      </div>

      {state.kind === "done" ? (
        <div role="status" className="flex items-start gap-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3.5 text-[13.5px] text-emerald-300 lg:w-[420px]">
          <Check className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            You&apos;re in! Check <span className="font-semibold text-emerald-200">{email.trim()}</span> for a welcome email.
          </p>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="w-full lg:w-[420px]">
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setDraft(e.target.value);
                if (state.kind === "error") setState({ kind: "idle" });
              }}
              placeholder="you@example.com"
              aria-invalid={state.kind === "error"}
              aria-describedby={state.kind === "error" ? "newsletter-error" : undefined}
              className="h-12 flex-1 rounded-full border border-white/12 bg-white/[0.04] px-5 text-[14px] text-white placeholder:text-white/35 outline-none transition-colors focus:border-amber-400/60"
            />
            {/* Honeypot: hidden from people, filled by bots. */}
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              className="absolute -left-[9999px] h-0 w-0 opacity-0"
            />
            <button
              type="submit"
              disabled={state.kind === "sending"}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-amber-400 px-6 text-[14px] font-bold text-black transition-colors hover:bg-amber-300 disabled:opacity-70"
            >
              {state.kind === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              Subscribe
            </button>
          </div>
          {state.kind === "error" && (
            <p id="newsletter-error" role="alert" className="mt-2 px-2 text-[12.5px] text-red-300">
              {state.message}
            </p>
          )}
        </form>
      )}
    </div>
  );
}

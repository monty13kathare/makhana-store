"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { AlertTriangle, Check, Loader2, MailX } from "lucide-react";
import { contact } from "@/lib/api/store";
import { errorMessage, isApiError } from "@/lib/api/errors";

type State = { kind: "confirm" } | { kind: "working" } | { kind: "done" } | { kind: "error"; message: string };

/**
 * Landing page for the unsubscribe link in newsletter emails. It asks for a
 * click instead of unsubscribing on load: mail scanners open every link in a
 * message, and would otherwise unsubscribe people who never clicked.
 */
export default function UnsubscribeClient() {
  const token = useSearchParams().get("token")?.trim() ?? "";
  const [state, setState] = useState<State>(
    token.length >= 10 ? { kind: "confirm" } : { kind: "error", message: "This unsubscribe link is incomplete. Please use the link from the email." },
  );

  const unsubscribe = async () => {
    setState({ kind: "working" });
    try {
      await contact.unsubscribe(token);
      setState({ kind: "done" });
    } catch (e) {
      setState({
        kind: "error",
        message:
          isApiError(e) && e.code === "invalid_token"
            ? "This unsubscribe link isn't valid any more. You may already be unsubscribed."
            : errorMessage(e, "We couldn't unsubscribe you. Please try again."),
      });
    }
  };

  return (
    <main className="min-h-screen bg-[#111111] px-4 pt-[110px] pb-20 text-white">
      <div className="mx-auto max-w-[460px] rounded-[24px] border border-white/10 bg-[#161616] p-6 sm:p-8 text-center shadow-2xl">
        {state.kind === "done" ? (
          <>
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-emerald-500/30 bg-emerald-500/10">
              <Check className="h-6 w-6 text-emerald-400" />
            </div>
            <h1 className="mt-5 font-heading text-[24px] font-bold">You&apos;re unsubscribed</h1>
            <p className="mt-2 text-[14px] leading-relaxed text-[#8a8a8a]">
              You won&apos;t get newsletter emails from us any more. Order updates (confirmations, shipping, refunds) still arrive as usual.
            </p>
            <p className="mt-4 text-[13px] text-[#6a6a6a]">Changed your mind? Sign up again anytime from the bottom of any page.</p>
            <Link href="/" className="mt-6 inline-block rounded-full bg-white px-6 py-2.5 text-[14px] font-bold text-black hover:bg-amber-400 transition-colors">
              Back to the store
            </Link>
          </>
        ) : state.kind === "error" ? (
          <>
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-red-500/30 bg-red-500/10">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
            <h1 className="mt-5 font-heading text-[24px] font-bold">Something&apos;s not right</h1>
            <p role="alert" className="mt-2 text-[14px] leading-relaxed text-[#8a8a8a]">
              {state.message}
            </p>
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
              {token.length >= 10 && (
                <button
                  type="button"
                  onClick={() => void unsubscribe()}
                  className="rounded-full border border-white/15 px-6 py-2.5 text-[14px] font-semibold hover:bg-white/8 transition-colors"
                >
                  Try again
                </button>
              )}
              <Link href="/contact" className="rounded-full bg-white px-6 py-2.5 text-[14px] font-bold text-black hover:bg-amber-400 transition-colors">
                Contact us
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-amber-400/30 bg-amber-400/10">
              <MailX className="h-6 w-6 text-amber-400" />
            </div>
            <h1 className="mt-5 font-heading text-[24px] font-bold">Unsubscribe from our newsletter?</h1>
            <p className="mt-2 text-[14px] leading-relaxed text-[#8a8a8a]">
              You&apos;ll stop getting news about new flavours and offers. Order updates for anything you buy still arrive as usual.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-center">
              <Link href="/" className="rounded-full border border-white/15 px-6 py-2.5 text-[14px] font-semibold hover:bg-white/8 transition-colors">
                Keep me subscribed
              </Link>
              <button
                type="button"
                onClick={() => void unsubscribe()}
                disabled={state.kind === "working"}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-red-500 px-6 py-2.5 text-[14px] font-bold text-white hover:bg-red-600 transition-colors disabled:opacity-70"
              >
                {state.kind === "working" && <Loader2 className="h-4 w-4 animate-spin" />}
                Unsubscribe
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

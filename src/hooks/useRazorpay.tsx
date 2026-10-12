"use client";

import Script from "next/script";
import { useCallback, useState } from "react";
import { orders } from "@/lib/api/store";
import { errorMessage } from "@/lib/api/errors";
import type { RazorpayCheckout, StoreOrder } from "@/lib/api/types";

/* Minimal typings for https://checkout.razorpay.com/v1/checkout.js */
type RazorpaySuccess = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};
type RazorpayFailure = { error?: { description?: string; reason?: string } };
type RazorpayOptions = {
  key: string;
  order_id: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  prefill: RazorpayCheckout["prefill"];
  notes: RazorpayCheckout["notes"];
  handler: (response: RazorpaySuccess) => void;
  modal: { ondismiss: () => void; confirm_close?: boolean };
  theme?: { color?: string };
};
type RazorpayInstance = {
  open: () => void;
  on: (event: "payment.failed", cb: (response: RazorpayFailure) => void) => void;
};
type RazorpayConstructor = new (options: RazorpayOptions) => RazorpayInstance;

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

const SRC = "https://checkout.razorpay.com/v1/checkout.js";

export type PaymentOutcome =
  | { status: "paid"; order: StoreOrder }
  | { status: "dismissed" }
  | { status: "failed"; message: string };

type ScriptState = "loading" | "ready" | "error";

/**
 * Razorpay Checkout. Render `script` once on pages that take online payments;
 * `pay()` opens the Razorpay window and resolves after the server has verified
 * the payment (or the shopper closed the window / the payment failed).
 * Card and UPI details are entered in Razorpay's window, never in our pages.
 */
export function useRazorpay(enabled: boolean) {
  // next/script calls onReady on every mount, including when the script is already cached.
  const [scriptState, setScriptState] = useState<ScriptState>("loading");

  const script = enabled ? (
    <Script
      src={SRC}
      strategy="afterInteractive"
      onReady={() => setScriptState("ready")}
      onError={() => setScriptState("error")}
    />
  ) : null;

  const pay = useCallback(
    (orderId: string, payment: RazorpayCheckout): Promise<PaymentOutcome> =>
      new Promise((resolve) => {
        const Razorpay = window.Razorpay;
        if (!Razorpay) {
          resolve({
            status: "failed",
            message: "The secure payment window couldn't load. Check your connection or disable blockers, then try again.",
          });
          return;
        }
        let lastFailure: string | null = null;
        let settled = false;
        const settle = (o: PaymentOutcome) => {
          if (!settled) {
            settled = true;
            resolve(o);
          }
        };
        const rzp = new Razorpay({
          key: payment.keyId,
          order_id: payment.razorpayOrderId,
          amount: payment.amount,
          currency: payment.currency,
          name: payment.name,
          description: payment.description,
          prefill: payment.prefill,
          notes: payment.notes,
          theme: { color: "#e5a93c" },
          handler: (r) => {
            // The browser's word is not enough: the API re-checks with Razorpay.
            orders
              .verifyPayment(orderId, {
                razorpayOrderId: r.razorpay_order_id,
                razorpayPaymentId: r.razorpay_payment_id,
                razorpaySignature: r.razorpay_signature,
              })
              .then((order) => settle({ status: "paid", order }))
              .catch((e: unknown) =>
                settle({
                  status: "failed",
                  message: errorMessage(
                    e,
                    "We couldn't confirm your payment yet. If you were charged, it will be confirmed automatically.",
                  ),
                }),
              );
          },
          modal: {
            ondismiss: () =>
              settle(lastFailure ? { status: "failed", message: lastFailure } : { status: "dismissed" }),
          },
        });
        rzp.on("payment.failed", (resp) => {
          // Razorpay keeps its window open so the shopper can try another method.
          lastFailure = resp.error?.description || "The payment didn't go through.";
        });
        rzp.open();
      }),
    [],
  );

  return { script, scriptState, pay };
}

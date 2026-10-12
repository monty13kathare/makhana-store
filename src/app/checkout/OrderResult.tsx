"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertTriangle, Check, Clock, Loader2, Lock } from "lucide-react";
import type { StoreOrder } from "@/lib/api/types";
import { formatDateTime, formatDeliveryWindow, formatMoney } from "@/lib/format";
import { EASE } from "@/components/motion-primitives";

const PAYMENT_LABEL: Record<StoreOrder["paymentMethod"], string> = {
  card: "Card",
  upi: "UPI",
  paypal: "PayPal",
  cod: "Cash on delivery",
};

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <section className="relative min-h-screen grid place-items-center px-4 pt-24 pb-[calc(2rem+env(safe-area-inset-bottom))] sm:pt-28 sm:pb-16 bg-[#0a0a0c] text-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#141416] p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-2 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 rounded-b-full shadow-[0_0_20px_rgba(245,158,11,0.5)]" />
        {children}
      </motion.div>

      <div className="pointer-events-none fixed bottom-0 right-0 z-0 hidden sm:block max-w-[220px] sm:max-w-[280px] opacity-80 select-none">
        <Image
          src="/img/login-corner-makhana.png"
          alt=""
          width={340}
          height={260}
          className="w-full h-auto object-contain"
        />
      </div>
    </section>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-zinc-500 shrink-0">{label}</span>
      <span className={`font-medium text-right truncate ${accent ? "text-emerald-400" : "text-white"}`}>{value}</span>
    </div>
  );
}

/** Success screen built from the real order returned by the API. */
export function OrderPlaced({ order }: { order: StoreOrder }) {
  const paid = order.paymentStatus === "paid";
  const { city, state } = order.shippingAddress;
  const eta = order.estimatedDelivery
    ? formatDeliveryWindow(order.estimatedDelivery.from, order.estimatedDelivery.to)
    : "Shared when your order ships";

  return (
    <Shell>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
        className="mx-auto mb-5 sm:mb-6 grid h-16 w-16 sm:h-20 sm:w-20 place-items-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 text-black shadow-lg"
      >
        <Check className="h-8 w-8 sm:h-10 sm:w-10 stroke-[2.5]" />
      </motion.div>

      <span className="inline-block rounded-full bg-amber-400/10 border border-amber-400/20 px-3.5 py-1 text-xs font-bold tracking-wider text-amber-400 uppercase mb-3">
        {paid ? "Payment Confirmed" : "Order Confirmed"}
      </span>

      <h1 className="text-[26px] leading-tight sm:text-3xl font-extrabold tracking-tight text-white">
        Thank you for your order!
      </h1>

      <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
        Order <span className="font-mono font-bold text-white">{order.number}</span> has been confirmed. A confirmation
        and dispatch details will be sent to <span className="font-medium text-white">{order.contact.email}</span>.
      </p>

      <div className="mt-5 sm:mt-6 rounded-2xl border border-white/5 bg-white/[0.03] p-4 text-left text-[13px] sm:text-xs text-zinc-300 space-y-2.5 sm:space-y-2">
        <Row label="Delivery to:" value={order.contact.name} />
        <Row label="Destination:" value={[city, state].filter(Boolean).join(", ")} />
        <Row label="Estimated Delivery:" value={eta} accent />
        <Row
          label="Payment:"
          value={
            paid
              ? `${PAYMENT_LABEL[order.paymentMethod]} · Paid`
              : order.paymentMethod === "cod"
                ? `Pay ${formatMoney(order.total)} on delivery`
                : `${PAYMENT_LABEL[order.paymentMethod]} · ${order.paymentStatus}`
          }
        />
        <Row label="Total:" value={formatMoney(order.total)} />
      </div>

      <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3">
        <Link
          href={`/orders?id=${encodeURIComponent(order.id)}`}
          className="flex-1 flex items-center justify-center min-h-12 sm:block sm:min-h-0 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-black transition-all hover:bg-zinc-200 active:scale-95 shadow-md"
        >
          View Order
        </Link>
        <Link
          href="/shop"
          className="flex-1 flex items-center justify-center min-h-12 sm:block sm:min-h-0 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/10"
        >
          Continue Shopping
        </Link>
      </div>
    </Shell>
  );
}

/** Online order created but not paid yet (window closed, payment failed or gateway hiccup). */
export function PaymentPending({
  order,
  deadline,
  message,
  busy,
  onPay,
}: {
  order: StoreOrder;
  deadline: string | null;
  message: string | null;
  busy: boolean;
  onPay: () => void;
}) {
  return (
    <Shell>
      <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full border border-amber-400/40 bg-amber-400/10 text-amber-400">
        <Clock className="h-8 w-8" />
      </div>
      <span className="inline-block rounded-full bg-amber-400/10 border border-amber-400/20 px-3.5 py-1 text-xs font-bold tracking-wider text-amber-400 uppercase mb-3">
        Payment Pending
      </span>
      <h1 className="text-[24px] leading-tight sm:text-[28px] font-extrabold tracking-tight text-white">
        Complete your payment
      </h1>
      <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
        Order <span className="font-mono font-bold text-white">{order.number}</span> is reserved for you. Pay{" "}
        <span className="font-semibold text-white">{formatMoney(order.total)}</span>
        {deadline ? (
          <>
            {" "}by <span className="font-semibold text-white">{formatDateTime(deadline)}</span>
          </>
        ) : null}{" "}
        or it will be cancelled automatically.
      </p>

      {message && (
        <p role="alert" className="mt-4 flex items-start gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-left text-[13px] text-red-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {message}
        </p>
      )}

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onPay}
          disabled={busy}
          className="flex-1 flex items-center justify-center gap-2 min-h-12 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 px-6 py-3.5 text-sm font-bold text-black shadow-lg shadow-amber-500/25 transition-all active:scale-95 disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
          {busy ? "Opening secure payment…" : "Pay now"}
        </button>
        <Link
          href={`/orders?id=${encodeURIComponent(order.id)}`}
          className="flex-1 flex items-center justify-center min-h-12 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/10"
        >
          View in My Orders
        </Link>
      </div>
    </Shell>
  );
}

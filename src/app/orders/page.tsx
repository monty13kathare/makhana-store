"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, Suspense, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ChevronDown,
  RotateCcw,
  Package,
  X,
  AlertTriangle,
  Loader2,
  LogIn,
  ExternalLink,
  Copy,
  CreditCard,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { me as meApi, orders as ordersApi } from "@/lib/api/store";
import { useRazorpay } from "@/hooks/useRazorpay";
import { isApiError, errorMessage } from "@/lib/api/errors";
import type { StoreOrder, OrderGroup, ReorderResult } from "@/lib/api/types";
import { EASE } from "@/components/motion-primitives";
import { formatMoney, formatDate, formatDateTime, formatDeliveryWindow } from "@/lib/format";

/* ── Helpers ── */
const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-violet-600",
  processing: "bg-amber-500",
  shipped: "bg-blue-500",
  delivered: "bg-emerald-600",
  cancelled: "bg-red-500",
  refunded: "bg-zinc-500",
};

/** Orders whose status can still change on its own (staff, carrier, payment). */
const ACTIVE_STATUSES: StoreOrder["status"][] = ["pending", "processing", "shipped"];
const LIVE_REFRESH_MS = 30_000;

type GroupTab = { label: string; value: OrderGroup | "all" };
const FILTER_TABS: GroupTab[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

const isCutout = (src: string) => src?.endsWith(".png");
const imgFit = (src: string) => (isCutout(src) ? "object-contain p-0.5" : "object-cover");
const tileBg = (src: string) => (isCutout(src) ? "bg-white" : "bg-[#1c1c1c]");

function deriveBadgeColor(status: string): string {
  return STATUS_COLOR[status] ?? "bg-zinc-600";
}

/* ── Refunds ── */
const PAID_VIA: Record<string, string> = {
  upi: "UPI",
  card: "card",
  netbanking: "net banking",
  wallet: "wallet",
  emi: "EMI",
  paypal: "PayPal",
};
const paidVia = (method?: string) => (method && PAID_VIA[method] ? PAID_VIA[method] : "original payment method");

/** What goes back to the customer if they cancel now: only money actually collected online. */
const refundOnCancel = (o: StoreOrder) => (o.paymentMethod !== "cod" && o.paymentStatus === "paid" ? o.total : 0);

/** Refunds still on their way to the bank, or stuck and awaiting a staff retry. */
const refundInFlight = (o: StoreOrder) => (o.refunds ?? []).some((r) => r.status !== "processed");

const refundedTotal = (o: StoreOrder) =>
  (o.refunds ?? []).filter((r) => r.status !== "failed").reduce((sum, r) => sum + r.amount, 0);

/* ── Cancel Modal ── */
function CancelModal({
  order,
  onConfirm,
  onClose,
  busy,
  error,
}: {
  order: StoreOrder;
  onConfirm: (reason?: string) => void;
  onClose: () => void;
  busy: boolean;
  error: string | null;
}) {
  const [reason, setReason] = useState("");
  const refund = refundOnCancel(order);
  const [sheet] = useState(() => typeof window !== "undefined" && window.innerWidth < 640);
  const firstItem = order.items[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={sheet ? { y: 60, opacity: 0 } : { scale: 0.94, opacity: 0 }}
        animate={sheet ? { y: 0, opacity: 1 } : { scale: 1, opacity: 1 }}
        exit={sheet ? { y: 60, opacity: 0 } : { scale: 0.94, opacity: 0 }}
        transition={{ duration: 0.2, ease: EASE }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Cancel order"
        className="w-full sm:max-w-sm rounded-t-[24px] sm:rounded-[20px] border border-white/12 bg-[#1a1a1a] px-5 pt-3 pb-[calc(20px+env(safe-area-inset-bottom))] sm:p-6 shadow-2xl"
      >
        <div aria-hidden className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/15 sm:hidden" />
        <div className="flex items-center sm:items-start justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-red-500/15 border border-red-500/25 shrink-0">
              <AlertTriangle className="h-4 w-4 text-red-400" />
            </div>
            <h3 className="font-heading font-bold text-white text-[17px]">Cancel Order?</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-2.5 grid h-11 w-11 place-items-center sm:mr-0 sm:block sm:h-auto sm:w-auto text-[#606060] hover:text-white transition-colors"
          >
            <X className="h-5 w-5 sm:h-4 sm:w-4" />
          </button>
        </div>

        {firstItem && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/8 mb-4">
            <div className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-[10px] border border-white/8 ${tileBg(firstItem.image ?? "")}`}>
              {firstItem.image && (
                <Image src={firstItem.image} alt={firstItem.name} fill sizes="48px" className={imgFit(firstItem.image)} />
              )}
            </div>
            <div>
              <p className="text-[14px] sm:text-[13.5px] font-semibold text-white">{firstItem.name}</p>
              <p className="text-[12.5px] sm:text-[12px] text-[#808080]">
                Order {order.number} · {formatMoney(order.total)}
              </p>
            </div>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-[12px] font-semibold uppercase tracking-wider text-[#707070] mb-1.5">
            Reason (optional)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            maxLength={300}
            placeholder="Changed my mind, found a better price..."
            className="w-full rounded-xl border border-white/10 bg-[#161616] px-3.5 py-2.5 text-[14px] text-white placeholder:text-zinc-600 outline-none resize-none focus:border-amber-400/50 transition-colors"
          />
        </div>

        {/* Say exactly what happens to the customer's money, per payment state. */}
        <div className="mb-5 rounded-xl border border-white/8 bg-white/[0.02] p-3.5 text-[14px] sm:text-[13px] leading-relaxed text-[#8a8a8a]">
          {refund > 0 ? (
            <>
              <p className="mb-1 flex items-center gap-1.5 font-semibold text-emerald-400">
                <RotateCcw className="h-3.5 w-3.5" /> Full refund: {formatMoney(refund)}
              </p>
              We&apos;ll send it back to your original payment method right away. Banks usually show it in{" "}
              <span className="text-white">5–7 business days</span>; UPI is often faster.
            </>
          ) : order.awaitingPayment ? (
            <>You haven&apos;t been charged for this order, so there&apos;s nothing to refund.</>
          ) : (
            <>This is a cash-on-delivery order and nothing has been paid, so there&apos;s nothing to refund.</>
          )}
        </div>

        {error && (
          <p role="alert" className="mb-4 flex items-start gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2.5 text-[13px] text-red-300">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </p>
        )}

        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="flex-1 min-h-[48px] sm:min-h-0 rounded-xl border border-white/15 py-2.5 text-[15px] sm:text-[13.5px] font-semibold text-white hover:bg-white/8 transition-colors disabled:opacity-50"
          >
            Keep Order
          </button>
          <button
            type="button"
            onClick={() => onConfirm(reason.trim() || undefined)}
            disabled={busy}
            className="flex-1 min-h-[48px] sm:min-h-0 flex items-center justify-center gap-1.5 rounded-xl bg-red-500 py-2.5 text-[15px] sm:text-[13.5px] font-semibold text-white hover:bg-red-600 transition-colors disabled:opacity-70"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {busy ? "Cancelling…" : refund > 0 ? "Cancel & Refund" : "Yes, Cancel"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Delivery stepper ── */
// Every order starts at "pending" (placed), so that is the first step, not an empty bar.
const STEPS = ["pending", "processing", "shipped", "delivered"] as const;
const STEP_LABELS: Record<(typeof STEPS)[number], string> = {
  pending: "Order Placed",
  processing: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
};
/** What the customer is waiting for next, per status. */
const NEXT_UP: Partial<Record<StoreOrder["status"], string>> = {
  pending: "We've received your order and will start packing it soon.",
  processing: "Your order is being packed. You'll get an email when it ships.",
  shipped: "On its way. Track it with the carrier below.",
};

function OrderStepper({ order }: { order: StoreOrder }) {
  const current = Math.max(0, STEPS.indexOf(order.status as (typeof STEPS)[number]));
  const finished = order.status === "delivered";
  const message = order.awaitingPayment ? "Complete the payment to confirm this order." : NEXT_UP[order.status];

  return (
    <div className="pt-3 sm:pt-2">
      <div className="relative">
        {/* Track runs between the first and last dot centres (columns are 25% wide). */}
        <div className="absolute top-[10px] left-[12.5%] right-[12.5%] h-[2px] bg-white/8">
          <div
            className="h-full bg-emerald-500 transition-all duration-700"
            style={{ width: `${(current / (STEPS.length - 1)) * 100}%` }}
          />
        </div>
        <ol className="relative grid grid-cols-4 gap-1 text-center">
          {STEPS.map((step, i) => {
            const done = i < current || finished;
            const active = i === current && !finished;
            const at = order.timeline?.find((t) => t.status === step)?.at;
            const label = step === "pending" && order.awaitingPayment ? "Awaiting Payment" : STEP_LABELS[step];
            return (
              <li key={step} className="flex flex-col items-center" aria-current={active ? "step" : undefined}>
                <div
                  className={`grid h-5 w-5 place-items-center rounded-full border transition-all ${
                    done
                      ? "bg-emerald-500 border-emerald-500 text-black"
                      : active
                        ? "border-amber-400 bg-amber-400/15 ring-4 ring-amber-400/10"
                        : "border-white/15 bg-[#1e1e1e]"
                  }`}
                >
                  {done ? (
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  ) : active ? (
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                  ) : null}
                </div>
                <span
                  className={`mt-1.5 text-[11.5px] sm:text-[10.5px] font-medium leading-tight ${
                    active ? "text-amber-300" : done ? "text-white" : "text-[#666]"
                  }`}
                >
                  {label}
                </span>
                <span className="text-[11px] sm:text-[9.5px] text-[#5a5a5a] mt-0.5">{at ? formatDate(at) : "—"}</span>
              </li>
            );
          })}
        </ol>
      </div>
      {message && <p className="mt-3 text-center text-[12.5px] sm:text-[12px] text-[#8a8a8a]">{message}</p>}
    </div>
  );
}

/** Every status change, newest first, with the note left by staff or the system. */
function OrderUpdates({ order }: { order: StoreOrder }) {
  const events = [...(order.timeline ?? [])].reverse();
  if (events.length === 0) return null;
  return (
    <div>
      <p className="mb-2 text-[11.5px] sm:text-[11px] font-semibold uppercase tracking-wider text-[#666]">Order updates</p>
      <ol className="relative space-y-3 border-l border-white/10 pl-4">
        {events.map((e, i) => (
          <li key={`${e.status}-${e.at}`} className="relative">
            <span
              className={`absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-[#161616] ${
                i === 0 ? deriveBadgeColor(e.status) : "bg-white/20"
              }`}
            />
            <p className={`text-[13px] sm:text-[12.5px] font-semibold ${i === 0 ? "text-white" : "text-white/70"}`}>
              {ORDER_STATUS_LABEL[e.status] ?? e.status}
              <span className="ml-2 font-normal text-[#666]">{formatDateTime(e.at)}</span>
            </p>
            {e.note && <p className="text-[12.5px] sm:text-[12px] text-[#8a8a8a]">{e.note}</p>}
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Cancelled/refunded orders: why, and exactly where the customer's money is. */
function RefundStatus({ order }: { order: StoreOrder }) {
  const [copied, setCopied] = useState<string | null>(null);
  const refunds = order.refunds ?? [];
  const reason = [...(order.timeline ?? [])].reverse().find((e) => e.status === order.status)?.note;

  const copy = (ref: string) => {
    void navigator.clipboard?.writeText(ref).then(() => {
      setCopied(ref);
      setTimeout(() => setCopied(null), 1500);
    });
  };

  return (
    <div className="mt-3 sm:mt-0 space-y-3">
      <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-[13px] sm:text-[12.5px] text-red-300">
        <X className="mt-px h-4 w-4 shrink-0" />
        <div>
          <p className="font-semibold">{order.status === "refunded" ? "This order was refunded." : "This order was cancelled."}</p>
          {reason && <p className="text-red-300/80">{reason}</p>}
        </div>
      </div>

      {refunds.length > 0 ? (
        refunds.map((r) => {
          const done = r.status === "processed";
          const failed = r.status === "failed";
          return (
            <div key={r.reference} className="rounded-xl border border-white/10 bg-white/[0.025] p-3.5 sm:p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="flex items-center gap-2 text-[14px] sm:text-[13.5px] font-semibold text-white">
                  <RotateCcw className="h-4 w-4 text-amber-400" />
                  Refund {formatMoney(r.amount)}
                </p>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                    done ? "bg-emerald-500/15 text-emerald-300" : failed ? "bg-red-500/15 text-red-300" : "bg-amber-400/15 text-amber-300"
                  }`}
                >
                  {done ? "Refunded" : failed ? "Delayed" : "In progress"}
                </span>
              </div>

              {/* Two-step tracker: initiated by us → credited by the bank. */}
              <ol className="mt-3 grid grid-cols-2 gap-2 text-[12px] sm:text-[11.5px]">
                <li className="flex items-center gap-2 text-white">
                  <span className="grid h-4 w-4 place-items-center rounded-full bg-emerald-500 text-black">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </span>
                  <span>
                    Initiated <span className="text-[#666]">{formatDate(r.createdAt)}</span>
                  </span>
                </li>
                <li className={`flex items-center gap-2 ${done ? "text-white" : "text-[#666]"}`}>
                  <span
                    className={`grid h-4 w-4 place-items-center rounded-full border ${
                      done ? "border-emerald-500 bg-emerald-500 text-black" : failed ? "border-red-400" : "border-amber-400"
                    }`}
                  >
                    {done ? <Check className="h-2.5 w-2.5 stroke-[3]" /> : !failed && <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />}
                  </span>
                  <span>
                    Credited to {paidVia(r.method)}
                    {done && <span className="text-[#666]"> {formatDate(r.updatedAt)}</span>}
                  </span>
                </li>
              </ol>

              <p className="mt-3 text-[12.5px] sm:text-[12px] leading-relaxed text-[#8a8a8a]">
                {done
                  ? `The bank has the money. If it isn't in your account yet, it will appear within a few business days.`
                  : failed
                    ? "The bank couldn't complete this refund. Our team has been alerted and will send it again. You don't need to do anything."
                    : `Sent to your ${paidVia(r.method)}. Banks usually credit it within 5–7 business days; UPI is often faster.`}
              </p>

              <div className="mt-2.5 flex items-center gap-2 text-[11.5px] text-[#666]">
                <span>Refund reference</span>
                <code className="font-mono text-white/80 break-all">{r.reference}</code>
                <button
                  type="button"
                  onClick={() => copy(r.reference)}
                  aria-label="Copy refund reference"
                  className="grid h-7 w-7 place-items-center rounded-md hover:bg-white/8 hover:text-white"
                >
                  {copied === r.reference ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          );
        })
      ) : order.paymentStatus === "refunded" ? (
        <p className="rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3 text-[12.5px] text-[#8a8a8a]">
          A refund of <span className="font-semibold text-white">{formatMoney(order.total)}</span> was issued for this order. If you
          haven&apos;t received it, <Link href="/contact" className="text-amber-400 hover:underline">contact us</Link>.
        </p>
      ) : (
        <p className="rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3 text-[12.5px] text-[#8a8a8a]">
          You weren&apos;t charged for this order, so there&apos;s nothing to refund.
        </p>
      )}
    </div>
  );
}

/* ── Main Component ── */
function OrdersContent() {
  const searchParams = useSearchParams();
  const queryId = searchParams.get("id");
  const { addLines, openCart } = useCart();
  const { user, status: authStatus, openAuthModal } = useAuth();

  const [filter, setFilter] = useState<OrderGroup | "all">("all");
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<StoreOrder | null>(null);
  const [cancelBusy, setCancelBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);

  // Always the full list: tabs filter locally, so every tab's count stays right.
  // `silent` refreshes keep the list on screen (no skeleton, no error swap).
  // `loading` starts true; Retry sets it again before calling this.
  const signedIn = Boolean(user);
  const fetchOrders = useCallback(
    (silent = false) =>
      meApi
        .orders({ pageSize: 50 })
        .then(
          (result) => {
            setOrders(result.data);
            setError(null);
          },
          (e: unknown) => {
            if (!silent) setError(errorMessage(e, "We couldn't load your orders. Please try again."));
          },
        )
        .finally(() => {
          if (!silent) setLoading(false);
        }),
    [],
  );

  useEffect(() => {
    // Guests see the sign-in gate, which doesn't depend on `loading`.
    if (authStatus === "loading" || !signedIn) return;
    void fetchOrders();
  }, [authStatus, signedIn, fetchOrders]);

  // Open the order from ?id= once the list has it (e.g. arriving from an order email).
  const [openedQueryId, setOpenedQueryId] = useState<string | null>(null);
  if (queryId && queryId !== openedQueryId && orders.some((o) => o.id === queryId)) {
    setOpenedQueryId(queryId);
    setExpandedId(queryId);
  }

  // Live status: re-check while the page is open and something is still on its way,
  // and whenever the customer comes back to the tab.
  const hasActive = orders.some((o) => ACTIVE_STATUSES.includes(o.status) || refundInFlight(o));
  useEffect(() => {
    if (!signedIn) return;
    const refresh = () => {
      if (document.visibilityState === "visible") void fetchOrders(true);
    };
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    const timer = hasActive ? window.setInterval(refresh, LIVE_REFRESH_MS) : undefined;
    return () => {
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
      window.clearInterval(timer);
    };
  }, [signedIn, hasActive, fetchOrders]);

  // Load Razorpay only when an order can still be paid.
  const razorpay = useRazorpay(orders.some((o) => o.awaitingPayment));

  /** Retry a failed or abandoned online payment from the order card. */
  const handlePay = async (order: StoreOrder) => {
    setActionError(null);
    setNotice(null);
    setPayingId(order.id);
    try {
      const options = await ordersApi.startPayment(order.id);
      const outcome = await razorpay.pay(order.id, options);
      if (outcome.status === "paid") {
        setOrders((prev) => prev.map((o) => (o.id === outcome.order.id ? outcome.order : o)));
        setNotice(`Payment received. Order ${outcome.order.number} is confirmed.`);
      } else if (outcome.status === "failed") {
        setActionError(outcome.message);
      }
    } catch (e) {
      // e.g. the payment window closed: the order was cancelled meanwhile.
      setActionError(errorMessage(e, "We couldn't start the payment. Please try again."));
      void fetchOrders(true);
    } finally {
      setPayingId(null);
    }
  };

  const toggleExpand = (id: string) => setExpandedId((prev) => (prev === id ? null : id));

  const handleReorder = async (order: StoreOrder) => {
    setActionError(null);
    try {
      const result: ReorderResult = await meApi.reorder(order.id);
      if (result.items?.length) {
        addLines(
          result.items.map((item) => ({
            slug: item.slug,
            variant: item.variant,
            bundle: item.bundle,
            qty: item.qty,
          })),
          result.quote?.lines
        );
      }
      openCart();
    } catch (e) {
      if (isApiError(e)) setActionError(e.message);
      else setActionError(errorMessage(e, "Could not reorder items."));
    }
  };

  const handleCancelConfirm = async (reason?: string) => {
    if (!cancelTarget) return;
    setCancelBusy(true);
    setCancelError(null);
    setNotice(null);
    try {
      const updated = await meApi.cancelOrder(cancelTarget.id, reason);
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      setCancelTarget(null);
      setExpandedId(updated.id);
      const refunded = refundedTotal(updated);
      setNotice(
        refunded > 0
          ? `Order ${updated.number} cancelled. Your refund of ${formatMoney(refunded)} has been initiated; you'll get an email when the bank completes it.`
          : `Order ${updated.number} cancelled. You weren't charged.`,
      );
    } catch (e) {
      // Shown inside the dialog, which stays open: if the refund couldn't start, nothing was cancelled.
      setCancelError(errorMessage(e, "We couldn't cancel this order. Please try again or contact us."));
    } finally {
      setCancelBusy(false);
    }
  };

  const counts = {
    all: orders.length,
    active: orders.filter((o) => !["delivered", "cancelled", "refunded"].includes(o.status)).length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => ["cancelled", "refunded"].includes(o.status)).length,
  };

  const filtered =
    filter === "all" ? orders :
    filter === "active" ? orders.filter((o) => !["delivered", "cancelled", "refunded"].includes(o.status)) :
    filter === "delivered" ? orders.filter((o) => o.status === "delivered") :
    orders.filter((o) => ["cancelled", "refunded"].includes(o.status));

  const activeFilterColor: Record<string, string> = {
    all: "bg-white text-black",
    active: "bg-violet-600 text-white",
    delivered: "bg-emerald-600 text-white",
    cancelled: "bg-red-500 text-white",
  };

  /* Guest gate */
  if (authStatus !== "loading" && !user) {
    return (
      <main className="min-h-screen bg-[#111111] pt-[84px] sm:pt-[100px] pb-8 sm:pb-20 text-white">
        <div className="container-x relative z-10 max-w-[720px] flex flex-col items-center justify-center min-h-[50vh] text-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-2xl border border-white/10 bg-white/5 mb-2">
            <LogIn className="h-8 w-8 text-amber-400" />
          </div>
          <h1 className="font-heading font-bold text-white text-[28px] sm:text-[36px]">My Orders</h1>
          <p className="text-[14px] text-[#707070]">Sign in to view and manage your orders.</p>
          <button
            type="button"
            onClick={() => openAuthModal({ title: "Sign in to view orders" })}
            className="mt-2 rounded-full bg-amber-400 px-8 py-3 text-[14px] font-bold text-black hover:bg-amber-300 transition-all"
          >
            Sign In
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#111111] pt-[84px] sm:pt-[100px] pb-8 sm:pb-20 text-white">
      {razorpay.script}
      <div className="pointer-events-none fixed left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(215,160,70,0.04)_0%,transparent_70%)] blur-3xl -z-0" />
      <div className="container-x relative z-10 max-w-[720px]">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: EASE }}
          className="mb-4 sm:mb-6"
        >
          <h1 className="font-heading font-bold text-white text-[28px] sm:text-[38px] tracking-tight">My Orders</h1>
          <p className="mt-1 text-[13px] text-[#707070]">Track and manage your Makhana shipments.</p>
        </motion.div>

        {actionError && (
          <div role="alert" className="mb-4 flex items-start gap-2 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-[13px] text-red-300">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{actionError}</p>
          </div>
        )}
        {notice && (
          <div role="status" className="mb-4 flex items-start gap-2 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-[13px] text-emerald-300">
            <Check className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="flex-1">{notice}</p>
            <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss" className="-m-1 p-1 text-emerald-300/70 hover:text-emerald-200">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div role="tablist" aria-label="Filter orders" className="swipe-row items-center gap-2 pb-1 mb-4 sm:mb-5 sm:mx-0 sm:px-0">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={filter === tab.value}
              onClick={() => setFilter(tab.value)}
              className={`shrink-0 snap-start inline-flex items-center h-10 sm:h-auto rounded-full px-4 sm:py-1.5 text-[13.5px] sm:text-[12.5px] font-semibold whitespace-nowrap transition-all ${
                filter === tab.value
                  ? activeFilterColor[tab.value]
                  : "border border-white/10 text-[#8a8a8a] sm:text-[#707070] hover:text-white"
              }`}
            >
              {tab.label}
              <span className="ml-1.5 opacity-70">({counts[tab.value]})</span>
            </button>
          ))}
        </div>

        {/* Loading skeletons */}
        {(loading || authStatus === "loading") && (
          <div className="flex flex-col gap-2.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-[16px] border border-white/10 bg-[#161616] h-[82px] animate-pulse" />
            ))}
          </div>
        )}

        {/* API Error */}
        {error && !loading && (
          <div className="rounded-[16px] border border-red-500/20 bg-red-500/8 p-6 text-center">
            <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-3" />
            <p className="text-[14px] text-red-300 mb-4">{error}</p>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                setError(null);
                void fetchOrders();
              }}
              className="rounded-full bg-white px-5 py-2 text-[13px] font-bold text-black hover:bg-amber-400 transition-all"
            >
              Retry
            </button>
          </div>
        )}

        {/* Order list */}
        {!loading && !error && (
          <div className="flex flex-col gap-2.5">
            <AnimatePresence initial={false}>
              {filtered.map((order, idx) => {
                const isExpanded = expandedId === order.id;
                const canCancel = order.canCancel;
                const firstItem = order.items[0];
                const imageUrl = firstItem?.image ?? null;
                const deliveryEst = order.estimatedDelivery
                  ? formatDeliveryWindow(order.estimatedDelivery.from, order.estimatedDelivery.to)
                  : "—";

                return (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.3, ease: EASE, delay: idx * 0.04 }}
                    className={`rounded-[16px] border bg-[#161616] overflow-hidden transition-all duration-200 ${
                      isExpanded
                        ? "border-amber-400/30 shadow-[0_0_18px_rgba(245,158,11,0.07)]"
                        : "border-white/10 hover:border-white/18"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleExpand(order.id)}
                      aria-expanded={isExpanded}
                      aria-controls={`order-${order.id}-details`}
                      className="w-full flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 text-left active:bg-white/[0.03] sm:active:bg-transparent transition-colors"
                    >
                      <div className={`relative h-[56px] w-[56px] sm:h-[60px] sm:w-[60px] shrink-0 overflow-hidden rounded-[10px] border border-white/8 ${tileBg(imageUrl ?? "")}`}>
                        {imageUrl ? (
                          <Image src={imageUrl} alt={firstItem?.name ?? ""} fill sizes="60px" className={imgFit(imageUrl)} />
                        ) : (
                          <Package className="absolute inset-0 m-auto h-6 w-6 text-zinc-600" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[11.5px] sm:text-[10.5px] font-semibold text-amber-400/80">{order.number}</span>
                          <span className="text-[11px] sm:text-[10px] text-[#555]">·</span>
                          <span className="text-[11.5px] sm:text-[10.5px] text-[#707070] sm:text-[#606060]">{formatDate(order.createdAt)}</span>
                        </div>
                        <p className="font-heading font-bold text-white text-[15px] sm:text-[16px] leading-tight truncate">
                          {firstItem?.name ?? `${order.items.length} item${order.items.length === 1 ? "" : "s"}`}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 min-w-0">
                          <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] sm:text-[10.5px] font-semibold text-white ${deriveBadgeColor(order.status)}`}>
                            {ORDER_STATUS_LABEL[order.status] ?? order.status}
                          </span>
                          {order.awaitingPayment && (
                            <span className="text-[11.5px] sm:text-[11px] text-amber-300/90 truncate">Payment pending</span>
                          )}
                          {order.status === "delivered" && (
                            (() => {
                              const del = order.timeline?.find((t) => t.status === "delivered")?.at;
                              return del ? (
                                <span className="text-[11.5px] sm:text-[11px] text-[#707070] truncate">Delivered {formatDate(del)}</span>
                              ) : null;
                            })()
                          )}
                          {(order.refunds?.length ?? 0) > 0 && (
                            <span className={`text-[11.5px] sm:text-[11px] truncate ${refundInFlight(order) ? "text-amber-300/90" : "text-emerald-400/90"}`}>
                              {refundInFlight(order) ? "Refund in progress" : `Refunded ${formatMoney(refundedTotal(order))}`}
                            </span>
                          )}
                          {order.status === "shipped" && deliveryEst !== "—" && (
                            <span className="text-[11.5px] sm:text-[11px] text-[#707070] truncate">Est. {deliveryEst}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <span className="font-heading font-bold text-white text-[16px]">{formatMoney(order.total)}</span>
                        <span className={`grid h-7 w-7 place-items-center rounded-full bg-white/[0.04] sm:bg-transparent sm:h-auto sm:w-auto transition-transform duration-200 ${
                          isExpanded ? "rotate-180 text-amber-400 sm:text-[#555]" : "text-[#707070] sm:text-[#555]"
                        }`}>
                          <ChevronDown className="h-4 w-4" />
                        </span>
                      </div>
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          id={`order-${order.id}-details`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.28, ease: EASE }}
                          className="overflow-hidden"
                        >
                          <div className="px-3.5 sm:px-5 pb-4 sm:pb-5 pt-1 border-t border-white/8 space-y-4 sm:space-y-5">
                            {!["cancelled", "refunded"].includes(order.status) ? (
                              <OrderStepper order={order} />
                            ) : (
                              <RefundStatus order={order} />
                            )}

                            {order.items.length > 1 && (
                              <ul className="space-y-2">
                                {order.items.map((item, iIdx) => (
                                  <li key={item.productId ?? item.bundleId ?? `${item.slug}-${item.variant ?? ""}-${iIdx}`} className="flex items-center gap-3">
                                    <div className={`relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-white/8 ${tileBg(item.image ?? "")}`}>
                                      {item.image && <Image src={item.image} alt={item.name} fill sizes="40px" className={imgFit(item.image)} />}
                                    </div>
                                    <span className="flex-1 min-w-0 text-[13px] text-white/90 truncate">{item.name}</span>
                                    <span className="text-[12.5px] text-[#7a7a7a]">x{item.qty}</span>
                                    <span className="text-[13px] font-semibold text-white tabular-nums">{formatMoney(item.price * item.qty)}</span>
                                  </li>
                                ))}
                              </ul>
                            )}

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-3 gap-y-3 text-[13px] sm:text-[12px] rounded-xl sm:rounded-none bg-white/[0.02] sm:bg-transparent p-3 sm:p-0">
                              {[
                                { label: "Carrier", value: order.carrier ?? "—" },
                                { label: "Tracking", value: order.trackingNumber ?? "—", mono: true, href: order.trackingUrl },
                                { label: "Order Date", value: formatDate(order.createdAt) },
                                { label: "Est. Delivery", value: deliveryEst },
                              ].map((m) => (
                                <div key={m.label} className="min-w-0">
                                  <p className="text-[11.5px] sm:text-[12px] text-[#666] sm:text-[#555] mb-0.5">{m.label}</p>
                                  {m.href ? (
                                    <a
                                      href={m.href}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 font-mono text-[11.5px] sm:text-[10.5px] font-medium text-amber-400 hover:text-amber-300 break-all"
                                    >
                                      {m.value}
                                      <ExternalLink className="h-3 w-3 shrink-0" />
                                    </a>
                                  ) : (
                                    <p className={`text-white font-medium ${m.mono ? "font-mono text-[11.5px] sm:text-[10.5px] break-all" : ""}`}>{m.value}</p>
                                  )}
                                </div>
                              ))}
                            </div>

                            <OrderUpdates order={order} />

                            <div className="rounded-xl border border-white/8 bg-white/[0.025] p-3.5 sm:p-4 space-y-2 text-[13.5px] sm:text-[12.5px]">
                              <div className="flex justify-between text-[#7a7a7a]">
                                <span>Subtotal</span><span className="text-white">{formatMoney(order.subtotal)}</span>
                              </div>
                              {order.discount > 0 && (
                                <div className="flex justify-between text-[#7a7a7a]">
                                  <span>Discount</span><span className="text-emerald-400">-{formatMoney(order.discount)}</span>
                                </div>
                              )}
                              <div className="flex justify-between text-[#7a7a7a]">
                                <span>Shipping</span>
                                <span className="text-white">{order.shipping === 0 ? "Free" : formatMoney(order.shipping)}</span>
                              </div>
                              {order.codFee > 0 && (
                                <div className="flex justify-between text-[#7a7a7a]">
                                  <span>COD Fee</span><span className="text-white">{formatMoney(order.codFee)}</span>
                                </div>
                              )}
                              <div className="flex justify-between font-bold text-white text-[15px] sm:text-[13.5px] pt-2 border-t border-white/8">
                                <span>Total</span><span>{formatMoney(order.total)}</span>
                              </div>
                              {refundedTotal(order) > 0 && (
                                <div className="flex justify-between text-[#7a7a7a]">
                                  <span>{refundInFlight(order) ? "Refund (in progress)" : "Refunded"}</span>
                                  <span className="text-emerald-400">-{formatMoney(refundedTotal(order))}</span>
                                </div>
                              )}
                            </div>

                            {order.awaitingPayment && order.paymentDueAt && (
                              <p className="text-[12.5px] sm:text-[12px] text-amber-300/90">
                                Pay by {formatDateTime(order.paymentDueAt)}, or the order is cancelled automatically.
                              </p>
                            )}

                            <div className="flex flex-wrap items-center gap-2.5">
                              {order.awaitingPayment && (
                                <button
                                  type="button"
                                  onClick={() => void handlePay(order)}
                                  disabled={payingId !== null || razorpay.scriptState === "loading"}
                                  className="w-full sm:w-auto justify-center min-h-[44px] sm:min-h-0 flex items-center gap-1.5 rounded-xl bg-amber-400 px-4 py-2.5 text-[14px] sm:text-[12.5px] font-bold text-black hover:bg-amber-300 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                                >
                                  {payingId === order.id ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <CreditCard className="h-3.5 w-3.5" />
                                  )}
                                  Pay {formatMoney(order.total)}
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => void handleReorder(order)}
                                className="flex-1 sm:flex-none justify-center min-h-[44px] sm:min-h-0 flex items-center gap-1.5 rounded-xl border border-white/12 bg-white/5 px-4 py-2.5 text-[14px] sm:text-[12.5px] font-semibold text-white hover:bg-white hover:text-black transition-all"
                              >
                                <RotateCcw className="h-3.5 w-3.5" />
                                Reorder
                              </button>
                              {canCancel && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCancelError(null);
                                    setCancelTarget(order);
                                  }}
                                  className="flex-1 sm:flex-none justify-center min-h-[44px] sm:min-h-0 flex items-center gap-1.5 rounded-xl border border-red-500/25 bg-red-500/8 px-4 py-2.5 text-[14px] sm:text-[12.5px] font-semibold text-red-400 hover:bg-red-500/15 transition-all"
                                >
                                  <X className="h-3.5 w-3.5" />
                                  Cancel Order
                                </button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filtered.length === 0 && !loading && (
              <div className="rounded-[16px] border border-white/8 bg-[#161616] py-14 sm:py-16 text-center">
                <Package className="h-9 w-9 text-[#3a3a3a] mx-auto mb-3" />
                <p className="text-[14px] text-[#5a5a5a]">
                  {filter === "all" ? "You haven't placed any orders yet." : "No orders in this category."}
                </p>
                {filter !== "all" ? (
                  <button
                    type="button"
                    onClick={() => setFilter("all")}
                    className="mt-2 sm:mt-3 min-h-[44px] sm:min-h-0 px-4 sm:px-0 text-[14px] sm:text-[12.5px] font-semibold text-amber-400 hover:underline"
                  >
                    View all orders
                  </button>
                ) : (
                  <Link href="/shop" className="mt-4 inline-block rounded-full bg-amber-400 px-6 py-2.5 text-[13px] font-bold text-black hover:bg-amber-300 transition-all">
                    Browse the Collection
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {cancelTarget && (
          <CancelModal
            order={cancelTarget}
            onConfirm={(reason) => void handleCancelConfirm(reason)}
            onClose={() => {
              if (cancelBusy) return;
              setCancelTarget(null);
              setCancelError(null);
            }}
            busy={cancelBusy}
            error={cancelError}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

export default function OrdersPage() {
  return (
    <Suspense>
      <OrdersContent />
    </Suspense>
  );
}

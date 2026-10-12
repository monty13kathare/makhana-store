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
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { me as meApi } from "@/lib/api/store";
import { isApiError, errorMessage } from "@/lib/api/errors";
import type { StoreOrder, OrderGroup, ReorderResult } from "@/lib/api/types";
import { EASE } from "@/components/motion-primitives";
import { formatMoney, formatDate, formatDeliveryWindow } from "@/lib/format";

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

/* ── Cancel Modal ── */
function CancelModal({
  order,
  onConfirm,
  onClose,
  busy,
}: {
  order: StoreOrder;
  onConfirm: (reason?: string) => void;
  onClose: () => void;
  busy: boolean;
}) {
  const [reason, setReason] = useState("");
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

        <p className="text-[14px] sm:text-[13px] text-[#8a8a8a] leading-relaxed mb-5">
          Any paid amount of{" "}
          <span className="text-white font-semibold">{formatMoney(order.total)}</span> will be
          refunded within 3-5 business days.
        </p>

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
            Yes, Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Delivery stepper ── */
const STEPS = ["processing", "shipped", "delivered"] as const;
const STEP_LABELS: Record<string, string> = {
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
};

function OrderStepper({ order }: { order: StoreOrder }) {
  const si = STEPS.indexOf(order.status as (typeof STEPS)[number]);
  const currentStep = si === -1 ? 0 : si + 1;

  return (
    <div className="relative pt-3 sm:pt-2">
      <div className="absolute top-[22px] sm:top-[18px] left-[12.5%] right-[12.5%] sm:left-[18px] sm:right-[18px] h-[2px] bg-white/8">
        <div
          className="h-full bg-emerald-500 transition-all duration-700"
          style={{
            width:
              currentStep <= 1 ? "0%" :
              currentStep === 2 ? "50%" : "100%",
          }}
        />
      </div>
      <div className="grid grid-cols-3 gap-1 relative text-center">
        {STEPS.map((step, si2) => {
          const sn = si2 + 1;
          const done = sn <= currentStep;
          const current = sn === currentStep;
          const stepTime = order.timeline?.find((t) => t.status === step)?.at;
          const date = stepTime ? formatDate(stepTime) : "—";
          return (
            <div key={step} className="flex flex-col items-center">
              <div className={`grid h-5 w-5 place-items-center rounded-full border transition-all ${
                done ? "bg-emerald-500 border-emerald-500 text-black" :
                current ? "border-amber-400 bg-amber-400/15" :
                "border-white/15 bg-[#1e1e1e]"
              }`}>
                {done ? <Check className="h-2.5 w-2.5 stroke-[3]" /> :
                 current ? <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" /> : null}
              </div>
              <span className={`mt-1.5 text-[11.5px] sm:text-[10px] font-medium leading-tight ${done ? "text-white" : "text-[#666]"}`}>
                {STEP_LABELS[step]}
              </span>
              <span className="text-[11px] sm:text-[9.5px] text-[#5a5a5a] mt-0.5">{date}</span>
            </div>
          );
        })}
      </div>
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

  // Auto-expand via ?id= query param
  const [syncedQueryId, setSyncedQueryId] = useState<string | null>(null);
  if (queryId !== syncedQueryId) {
    setSyncedQueryId(queryId);
    if (queryId && orders.some((o) => o.id === queryId)) setExpandedId(queryId);
  }

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const group = filter === "all" ? undefined : filter;
      const result = await meApi.orders({ group, pageSize: 50 });
      setOrders(result.data);
    } catch (e) {
      setError(errorMessage(e, "We couldn't load your orders. Please try again."));
    } finally {
      setLoading(false);
    }
  }, [user, filter]);

  useEffect(() => {
    if (authStatus === "loading") return;
    if (!user) { setLoading(false); return; }
    void fetchOrders();
  }, [authStatus, user, fetchOrders]);

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
    setActionError(null);
    try {
      const updated = await meApi.cancelOrder(cancelTarget.id, reason);
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      setCancelTarget(null);
    } catch (e) {
      if (isApiError(e)) setActionError(e.message);
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
              onClick={() => void fetchOrders()}
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
                const canCancel = ["pending", "processing"].includes(order.status);
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
                          {order.status === "delivered" && (
                            (() => {
                              const del = order.timeline?.find((t) => t.status === "delivered")?.at;
                              return del ? (
                                <span className="text-[11.5px] sm:text-[11px] text-[#707070] truncate">Delivered {formatDate(del)}</span>
                              ) : null;
                            })()
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
                              <div className="mt-3 sm:mt-0 flex items-start sm:items-center gap-2.5 rounded-xl bg-red-500/8 border border-red-500/20 px-4 py-3 text-[13px] sm:text-[12.5px] text-red-400">
                                <X className="h-4 w-4 shrink-0 mt-px sm:mt-0" />
                                {order.status === "refunded"
                                  ? "This order has been refunded."
                                  : "This order has been cancelled. Refund processed within 3-5 business days."}
                              </div>
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
                                { label: "Tracking", value: order.trackingNumber ?? "—", mono: true },
                                { label: "Order Date", value: formatDate(order.createdAt) },
                                { label: "Est. Delivery", value: deliveryEst },
                              ].map((m) => (
                                <div key={m.label} className="min-w-0">
                                  <p className="text-[11.5px] sm:text-[12px] text-[#666] sm:text-[#555] mb-0.5">{m.label}</p>
                                  <p className={`text-white font-medium ${m.mono ? "font-mono text-[11.5px] sm:text-[10.5px] break-all" : ""}`}>{m.value}</p>
                                </div>
                              ))}
                            </div>

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
                            </div>

                            <div className="flex sm:flex-wrap items-center gap-2.5">
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
                                  onClick={() => setCancelTarget(order)}
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
            onClose={() => setCancelTarget(null)}
            busy={cancelBusy}
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

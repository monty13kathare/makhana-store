"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ChevronDown,
  RotateCcw,
  Package,
  X,
  AlertTriangle,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { EASE } from "@/components/motion-primitives";

/* ── Types ── */
type BadgeType = "Ordered" | "Cancelled" | "Delivered";

type Order = {
  id: string;
  badgeType: BadgeType;
  badgeColor: string;
  carrier: string;
  trackingNumber: string;
  orderDate: string;
  deliveryDate: string;
  currentStep: number;
  isCancelled: boolean;
  steps: { name: string; date: string }[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  item: {
    id: string;
    name: string;
    price: number;
    qty: number;
    image: string;
  };
};

/* ── Seed Data ── */
const SEED_ORDERS: Order[] = [
  {
    id: "1234",
    badgeType: "Ordered",
    badgeColor: "bg-violet-600",
    carrier: "DHL Express Global",
    trackingNumber: "DHL-9928-8472-US",
    orderDate: "Sep 24, 2026",
    deliveryDate: "Sep 27, 2026",
    currentStep: 2,
    isCancelled: false,
    steps: [
      { name: "Packed", date: "Sep 24" },
      { name: "Shipped", date: "Sep 25" },
      { name: "In Transit", date: "Sep 26" },
      { name: "Delivered", date: "Sep 27" },
    ],
    subtotal: 14,
    discount: 0,
    shipping: 10,
    total: 24,
    item: { id: "item-1", name: "Classic Himalayan Salt", price: 14, qty: 1, image: "/img/bowl-classic.jpg" },
  },
  {
    id: "1235",
    badgeType: "Cancelled",
    badgeColor: "bg-red-500",
    carrier: "FedEx International",
    trackingNumber: "FDX-4412-8819-US",
    orderDate: "Sep 20, 2026",
    deliveryDate: "—",
    currentStep: 1,
    isCancelled: true,
    steps: [
      { name: "Packed", date: "Sep 20" },
      { name: "Cancelled", date: "Sep 20" },
      { name: "In Transit", date: "—" },
      { name: "Delivered", date: "—" },
    ],
    subtotal: 14,
    discount: 0,
    shipping: 0,
    total: 0,
    item: { id: "item-2", name: "Peri Peri Roast", price: 14, qty: 1, image: "/img/bowl-peri.jpg" },
  },
  {
    id: "1236",
    badgeType: "Delivered",
    badgeColor: "bg-emerald-600",
    carrier: "BlueDart Express",
    trackingNumber: "BD-8831-2940-INT",
    orderDate: "Sep 15, 2026",
    deliveryDate: "Sep 19, 2026",
    currentStep: 4,
    isCancelled: false,
    steps: [
      { name: "Packed", date: "Sep 15" },
      { name: "Shipped", date: "Sep 16" },
      { name: "In Transit", date: "Sep 17" },
      { name: "Delivered", date: "Sep 19" },
    ],
    subtotal: 14,
    discount: 0,
    shipping: 0,
    total: 14,
    item: { id: "item-3", name: "Truffle Black Pepper", price: 14, qty: 1, image: "/img/bowl-cheese.jpg" },
  },
  {
    id: "1237",
    badgeType: "Ordered",
    badgeColor: "bg-violet-600",
    carrier: "DHL Express Global",
    trackingNumber: "DHL-5510-9921-US",
    orderDate: "Sep 26, 2026",
    deliveryDate: "Sep 29, 2026",
    currentStep: 3,
    isCancelled: false,
    steps: [
      { name: "Packed", date: "Sep 26" },
      { name: "Shipped", date: "Sep 27" },
      { name: "In Transit", date: "Sep 28" },
      { name: "Delivered", date: "Sep 29" },
    ],
    subtotal: 28,
    discount: 4,
    shipping: 10,
    total: 34,
    item: { id: "item-4", name: "Truffle & Parmesan Tin", price: 28, qty: 1, image: "/img/makhana-prod-truffle.png" },
  },
];

const FILTER_TABS: { label: string; value: "ALL" | BadgeType }[] = [
  { label: "All", value: "ALL" },
  { label: "In Transit", value: "Ordered" },
  { label: "Delivered", value: "Delivered" },
  { label: "Cancelled", value: "Cancelled" },
];

/* Product PNGs are cut-outs on white — contain them on a light tile; photos fill. */
const isCutout = (src: string) => src.endsWith(".png");
const imgFit = (src: string) => (isCutout(src) ? "object-contain p-0.5" : "object-cover");
const tileBg = (src: string) => (isCutout(src) ? "bg-white" : "bg-[#1c1c1c]");

/* "Sep 19, 2026" -> "Sep 19" for compact phone rows */
const shortDate = (d: string) => d.replace(/,\s*\d{4}$/, "");

/* ── Cancel Modal (bottom sheet on phones, dialog from sm up) ── */
function CancelModal({
  order,
  onConfirm,
  onClose,
}: {
  order: Order;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const [sheet] = useState(() => typeof window !== "undefined" && window.innerWidth < 640);
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

        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/8 mb-4">
          <div className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-[10px] border border-white/8 ${tileBg(order.item.image)}`}>
            <Image src={order.item.image} alt={order.item.name} fill sizes="48px" className={imgFit(order.item.image)} />
          </div>
          <div>
            <p className="text-[14px] sm:text-[13.5px] font-semibold text-white">{order.item.name}</p>
            <p className="text-[12.5px] sm:text-[12px] text-[#808080] sm:text-[#707070]">Order #{order.id} · ${order.total}</p>
          </div>
        </div>

        <p className="text-[14px] sm:text-[13px] text-[#8a8a8a] leading-relaxed mb-5">
          Are you sure you want to cancel this order? Any paid amount of{" "}
          <span className="text-white font-semibold">${order.total}</span> will be refunded within 3–5 business days.
        </p>

        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 min-h-[48px] sm:min-h-0 rounded-xl border border-white/15 py-2.5 text-[15px] sm:text-[13.5px] font-semibold text-white hover:bg-white/8 transition-colors"
          >
            Keep Order
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 min-h-[48px] sm:min-h-0 rounded-xl bg-red-500 py-2.5 text-[15px] sm:text-[13.5px] font-semibold text-white hover:bg-red-600 transition-colors"
          >
            Yes, Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Main Component ── */
function OrdersContent() {
  const searchParams = useSearchParams();
  const queryId = searchParams.get("id");
  const { add, openCart } = useCart();

  const [orders, setOrders] = useState<Order[]>(SEED_ORDERS);
  const [filter, setFilter] = useState<"ALL" | BadgeType>("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);

  // Auto-expand the order referenced by ?id= (synced during render when the query changes).
  const [syncedQueryId, setSyncedQueryId] = useState<string | null>(null);
  if (queryId !== syncedQueryId) {
    setSyncedQueryId(queryId);
    if (queryId && orders.some((o) => o.id === queryId)) setExpandedId(queryId);
  }

  const filtered = orders.filter((o) =>
    filter === "ALL" ? true : o.badgeType === filter
  );

  const toggleExpand = (id: string) =>
    setExpandedId((prev) => (prev === id ? null : id));

  const handleReorder = (order: Order) => {
    add(order.item.id, order.item.qty);
    openCart();
  };

  const handleCancelConfirm = () => {
    if (!cancelTarget) return;
    setOrders((prev) =>
      prev.map((o) =>
        o.id === cancelTarget.id
          ? { ...o, isCancelled: true, badgeType: "Cancelled", badgeColor: "bg-red-500", total: 0, currentStep: 1 }
          : o
      )
    );
    setCancelTarget(null);
  };

  const counts = {
    ALL: orders.length,
    Ordered: orders.filter((o) => o.badgeType === "Ordered").length,
    Delivered: orders.filter((o) => o.badgeType === "Delivered").length,
    Cancelled: orders.filter((o) => o.badgeType === "Cancelled").length,
  };

  const activeFilterColors: Record<string, string> = {
    ALL: "bg-white text-black",
    Ordered: "bg-violet-600 text-white",
    Delivered: "bg-emerald-600 text-white",
    Cancelled: "bg-red-500 text-white",
  };

  return (
    <main className="min-h-screen bg-[#111111] pt-[84px] sm:pt-[100px] pb-8 sm:pb-20 text-white">
      <div className="pointer-events-none fixed left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(215,160,70,0.04)_0%,transparent_70%)] blur-3xl -z-0" />

      <div className="container-x relative z-10 max-w-[720px]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: EASE }}
          className="mb-4 sm:mb-6"
        >
          <h1 className="font-heading font-bold text-white text-[28px] sm:text-[38px] tracking-tight">
            My Orders
          </h1>
          <p className="mt-1 text-[13px] text-[#707070]">
            Track and manage your Makhana shipments.
          </p>
        </motion.div>

        {/* Filter Pills — horizontal swipe row on phones */}
        <div
          role="tablist"
          aria-label="Filter orders"
          className="swipe-row items-center gap-2 pb-1 mb-4 sm:mb-5 sm:mx-0 sm:px-0"
        >
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={filter === tab.value}
              onClick={() => setFilter(tab.value)}
              className={`shrink-0 snap-start inline-flex items-center h-10 sm:h-auto rounded-full px-4 sm:py-1.5 text-[13.5px] sm:text-[12.5px] font-semibold whitespace-nowrap transition-all ${
                filter === tab.value
                  ? activeFilterColors[tab.value]
                  : "border border-white/10 text-[#8a8a8a] sm:text-[#707070] hover:text-white"
              }`}
            >
              {tab.label}
              <span className="ml-1.5 opacity-70">({counts[tab.value]})</span>
            </button>
          ))}
        </div>

        {/* Order Cards */}
        <div className="flex flex-col gap-2.5">
          <AnimatePresence initial={false}>
            {filtered.map((order, idx) => {
              const isExpanded = expandedId === order.id;
              const canCancel = order.badgeType === "Ordered" && !order.isCancelled;

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
                  {/* Collapsed Row — whole row is the tap target */}
                  <button
                    type="button"
                    onClick={() => toggleExpand(order.id)}
                    aria-expanded={isExpanded}
                    aria-controls={`order-${order.id}-details`}
                    className="w-full flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 text-left active:bg-white/[0.03] sm:active:bg-transparent transition-colors"
                  >
                    {/* Thumbnail */}
                    <div className={`relative h-[56px] w-[56px] sm:h-[60px] sm:w-[60px] shrink-0 overflow-hidden rounded-[10px] border border-white/8 ${tileBg(order.item.image)}`}>
                      <Image
                        src={order.item.image}
                        alt={order.item.name}
                        fill
                        sizes="60px"
                        className={imgFit(order.item.image)}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[11.5px] sm:text-[10.5px] font-semibold text-amber-400/80">#{order.id}</span>
                        <span className="text-[11px] sm:text-[10px] text-[#555]">·</span>
                        <span className="text-[11.5px] sm:text-[10.5px] text-[#707070] sm:text-[#606060]">{order.orderDate}</span>
                      </div>
                      <p className="font-heading font-bold text-white text-[15px] sm:text-[16px] leading-tight truncate">
                        {order.item.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 min-w-0">
                        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] sm:text-[10.5px] font-semibold text-white ${order.badgeColor}`}>
                          {order.badgeType === "Ordered" ? "In Transit" : order.badgeType}
                        </span>
                        {order.badgeType === "Delivered" && (
                          <span className="text-[11.5px] sm:text-[11px] text-[#707070] sm:text-[#606060] truncate">
                            <span className="sm:hidden">on {shortDate(order.deliveryDate)}</span>
                            <span className="hidden sm:inline">Delivered {order.deliveryDate}</span>
                          </span>
                        )}
                        {order.badgeType === "Ordered" && (
                          <span className="text-[11.5px] sm:text-[11px] text-[#707070] sm:text-[#606060] truncate">
                            Est. <span className="sm:hidden">{shortDate(order.deliveryDate)}</span>
                            <span className="hidden sm:inline">{order.deliveryDate}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price + chevron */}
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                      <span className="font-heading font-bold text-white text-[16px]">
                        ${order.total}
                      </span>
                      <span
                        className={`grid h-7 w-7 place-items-center rounded-full bg-white/[0.04] sm:bg-transparent sm:h-auto sm:w-auto transition-transform duration-200 ${
                          isExpanded ? "rotate-180 text-amber-400 sm:text-[#555]" : "text-[#707070] sm:text-[#555]"
                        }`}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </span>
                    </div>
                  </button>

                  {/* Expanded Detail */}
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

                          {/* Stepper */}
                          {!order.isCancelled ? (
                            <div className="relative pt-3 sm:pt-2">
                              {/* Line — spans first to last dot centre (1/8 of width each side) */}
                              <div className="absolute top-[22px] sm:top-[18px] left-[12.5%] right-[12.5%] sm:left-[18px] sm:right-[18px] h-[2px] bg-white/8">
                                <div
                                  className="h-full bg-emerald-500 transition-all duration-700"
                                  style={{
                                    width:
                                      order.currentStep === 1 ? "0%" :
                                      order.currentStep === 2 ? "33%" :
                                      order.currentStep === 3 ? "66%" : "100%",
                                  }}
                                />
                              </div>
                              <div className="grid grid-cols-4 gap-1 relative text-center">
                                {order.steps.map((step, si) => {
                                  const sn = si + 1;
                                  const done = sn <= order.currentStep;
                                  const current = sn === order.currentStep;
                                  return (
                                    <div key={step.name} className="flex flex-col items-center">
                                      <div className={`grid h-5 w-5 place-items-center rounded-full border transition-all ${
                                        done
                                          ? "bg-emerald-500 border-emerald-500 text-black"
                                          : current
                                          ? "border-amber-400 bg-amber-400/15"
                                          : "border-white/15 bg-[#1e1e1e]"
                                      }`}>
                                        {done ? (
                                          <Check className="h-2.5 w-2.5 stroke-[3]" />
                                        ) : current ? (
                                          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                                        ) : null}
                                      </div>
                                      <span className={`mt-1.5 text-[11.5px] sm:text-[10px] font-medium leading-tight ${done ? "text-white" : "text-[#666] sm:text-[#555]"}`}>
                                        {step.name}
                                      </span>
                                      <span className="text-[11px] sm:text-[9.5px] text-[#5a5a5a] sm:text-[#484848] mt-0.5">{step.date}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ) : (
                            <div className="mt-3 sm:mt-0 flex items-start sm:items-center gap-2.5 rounded-xl bg-red-500/8 border border-red-500/20 px-4 py-3 text-[13px] sm:text-[12.5px] text-red-400">
                              <X className="h-4 w-4 shrink-0 mt-px sm:mt-0" />
                              This order has been cancelled. Refund processed within 3–5 business days.
                            </div>
                          )}

                          {/* Metadata grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-3 gap-y-3 text-[13px] sm:text-[12px] rounded-xl sm:rounded-none bg-white/[0.02] sm:bg-transparent p-3 sm:p-0">
                            {[
                              { label: "Carrier", value: order.carrier },
                              { label: "Tracking", value: order.trackingNumber, mono: true },
                              { label: "Order Date", value: order.orderDate },
                              { label: "Delivery", value: order.deliveryDate },
                            ].map((m) => (
                              <div key={m.label} className="min-w-0">
                                <p className="text-[11.5px] sm:text-[12px] text-[#666] sm:text-[#555] mb-0.5">{m.label}</p>
                                <p className={`text-white font-medium ${m.mono ? "font-mono text-[11.5px] sm:text-[10.5px] break-all" : ""}`}>
                                  {m.value}
                                </p>
                              </div>
                            ))}
                          </div>

                          {/* Price summary */}
                          <div className="rounded-xl border border-white/8 bg-white/[0.025] p-3.5 sm:p-4 space-y-2 text-[13.5px] sm:text-[12.5px]">
                            <div className="flex justify-between text-[#7a7a7a]">
                              <span>Subtotal</span><span className="text-white">${order.subtotal}</span>
                            </div>
                            {order.discount > 0 && (
                              <div className="flex justify-between text-[#7a7a7a]">
                                <span>Discount</span><span className="text-emerald-400">−${order.discount}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-[#7a7a7a]">
                              <span>Shipping</span><span className="text-white">${order.shipping}</span>
                            </div>
                            <div className="flex justify-between font-bold text-white text-[15px] sm:text-[13.5px] pt-2 border-t border-white/8">
                              <span>Total</span><span>${order.total}</span>
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="flex sm:flex-wrap items-center gap-2.5">
                            <button
                              type="button"
                              onClick={() => handleReorder(order)}
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

          {/* Empty state */}
          {filtered.length === 0 && (
            <div className="rounded-[16px] border border-white/8 bg-[#161616] py-14 sm:py-16 text-center">
              <Package className="h-9 w-9 text-[#3a3a3a] mx-auto mb-3" />
              <p className="text-[14px] text-[#5a5a5a]">No orders in this category.</p>
              <button
                type="button"
                onClick={() => setFilter("ALL")}
                className="mt-2 sm:mt-3 min-h-[44px] sm:min-h-0 px-4 sm:px-0 text-[14px] sm:text-[12.5px] font-semibold text-amber-400 hover:underline"
              >
                View all orders
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      <AnimatePresence>
        {cancelTarget && (
          <CancelModal
            order={cancelTarget}
            onConfirm={handleCancelConfirm}
            onClose={() => setCancelTarget(null)}
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

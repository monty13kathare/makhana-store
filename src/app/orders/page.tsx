"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Minus,
  Plus,
  Search,
  Copy,
  Clock,
  MapPin,
  Truck,
  RotateCcw,
  AlertCircle,
  ExternalLink,
  Download,
  FileText,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { EASE } from "@/components/motion-primitives";

/* --------------------------------------------------------------------------
   Multi-Order Data Schema & Seed Data
   -------------------------------------------------------------------------- */
export type OrderDetail = {
  id: string; // "1234", "1235", "1236", "1237"
  orderNumber: string; // "#ORD-1234"
  statusBadge: "Ordered in transits" | "Cancelled" | "Delivered";
  badgeType: "Ordered" | "Cancelled" | "Delivered";
  badgeColor: string;
  carrier: string;
  trackingNumber: string;
  orderDate: string;
  deliveryDate: string;
  address: string;
  currentStep: number; // 1: Packed, 2: Sent out, 3: In Transit, 4: Deliver
  isCancelled: boolean;
  steps: {
    name: string;
    date: string;
    time: string;
  }[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  item: {
    id: string;
    name: string;
    desc: string;
    deliveredBy?: string;
    price: number;
    qty: number;
    image: string;
  };
};

export const INITIAL_ORDERS: OrderDetail[] = [
  {
    id: "1234",
    orderNumber: "#ORD-1234",
    statusBadge: "Ordered in transits",
    badgeType: "Ordered",
    badgeColor: "bg-[#7c3aed]", // Purple matching screenshot
    carrier: "DHL Express Global",
    trackingNumber: "DHL-9928-8472-US",
    orderDate: "Sep 24, 2026",
    deliveryDate: "Sep 24, 2026",
    address: "70 Pleasant Valley Street, Methuen MA 1844",
    currentStep: 2,
    isCancelled: false,
    steps: [
      { name: "Packed", date: "March 8 2026", time: "08:00pm" },
      { name: "Sent out", date: "March 8 2026", time: "08:00pm" },
      { name: "In Transit", date: "March 8 2026", time: "08:00pm" },
      { name: "Deliver", date: "March 8 2026", time: "08:00pm" },
    ],
    subtotal: 14,
    discount: 0,
    shipping: 100,
    total: 140,
    item: {
      id: "item-1",
      name: "Classic Himalayan Salt",
      desc: "Clean, elegant, and lightly seasoned for a timeless premium crunch.",
      deliveredBy: "Sunday, 25 Sep",
      price: 14,
      qty: 1,
      image: "/img/bowl-classic.jpg",
    },
  },
  {
    id: "1235",
    orderNumber: "#ORD-1235",
    statusBadge: "Cancelled",
    badgeType: "Cancelled",
    badgeColor: "bg-[#ef4444]", // Red
    carrier: "FedEx International",
    trackingNumber: "FDX-4412-8819-US",
    orderDate: "Sep 20, 2026",
    deliveryDate: "Cancelled",
    address: "70 Pleasant Valley Street, Methuen MA 1844",
    currentStep: 1,
    isCancelled: true,
    steps: [
      { name: "Packed", date: "March 5 2026", time: "11:30am" },
      { name: "Cancelled", date: "March 5 2026", time: "01:15pm" },
      { name: "In Transit", date: "Pending", time: "--" },
      { name: "Deliver", date: "Pending", time: "--" },
    ],
    subtotal: 14,
    discount: 0,
    shipping: 0,
    total: 0,
    item: {
      id: "item-2",
      name: "Peri Peri Roast",
      desc: "A bold and modern flavour profile with a rich premium presentation.",
      price: 14,
      qty: 1,
      image: "/img/bowl-peri.jpg",
    },
  },
  {
    id: "1236",
    orderNumber: "#ORD-1236",
    statusBadge: "Delivered",
    badgeType: "Delivered",
    badgeColor: "bg-[#10b981]", // Emerald
    carrier: "BlueDart Express",
    trackingNumber: "BD-8831-2940-INT",
    orderDate: "Sep 15, 2026",
    deliveryDate: "Sunday, 25 Sep",
    address: "70 Pleasant Valley Street, Methuen MA 1844",
    currentStep: 4,
    isCancelled: false,
    steps: [
      { name: "Packed", date: "March 1 2026", time: "09:00am" },
      { name: "Sent out", date: "March 2 2026", time: "02:30pm" },
      { name: "In Transit", date: "March 3 2026", time: "07:15pm" },
      { name: "Deliver", date: "March 4 2026", time: "03:45pm" },
    ],
    subtotal: 14,
    discount: 0,
    shipping: 0,
    total: 14,
    item: {
      id: "item-3",
      name: "Truffle Black Pepper",
      desc: "Sophisticated, giftable, and positioned for a high-end snacking audience.",
      deliveredBy: "Sunday, 25 Sep",
      price: 14,
      qty: 1,
      image: "/img/bowl-cheese.jpg",
    },
  },
  {
    id: "1237",
    orderNumber: "#ORD-1237",
    statusBadge: "Ordered in transits",
    badgeType: "Ordered",
    badgeColor: "bg-[#7c3aed]",
    carrier: "DHL Express Global",
    trackingNumber: "DHL-5510-9921-US",
    orderDate: "Sep 26, 2026",
    deliveryDate: "Sep 29, 2026",
    address: "70 Pleasant Valley Street, Methuen MA 1844",
    currentStep: 3,
    isCancelled: false,
    steps: [
      { name: "Packed", date: "March 8 2026", time: "10:15am" },
      { name: "Sent out", date: "March 8 2026", time: "04:45pm" },
      { name: "In Transit", date: "March 9 2026", time: "09:30am" },
      { name: "Deliver", date: "March 10 2026", time: "05:00pm" },
    ],
    subtotal: 28,
    discount: 4,
    shipping: 10,
    total: 34,
    item: {
      id: "item-4",
      name: "Truffle & Parmesan Tin",
      desc: "Small-batch slow roasted lily seeds tossed in genuine Italian white truffle essence.",
      deliveredBy: "Thursday, 29 Sep",
      price: 28,
      qty: 1,
      image: "/img/tin-truffle.png",
    },
  },
];

function OrdersContent() {
  const searchParams = useSearchParams();
  const queryId = searchParams.get("id");
  const { add, openCart } = useCart();

  const [orders, setOrders] = useState<OrderDetail[]>(INITIAL_ORDERS);
  const [selectedOrderId, setSelectedOrderId] = useState<string>("1234");
  const [filterTab, setFilterTab] = useState<"ALL" | "ORDERED" | "DELIVERED" | "CANCELLED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedTracking, setCopiedTracking] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [invoiceToast, setInvoiceToast] = useState(false);
  const [showCarrierModal, setShowCarrierModal] = useState(false);

  // Sync query parameter on mount or route transition
  useEffect(() => {
    if (queryId && orders.some((o) => o.id === queryId)) {
      setSelectedOrderId(queryId);
    }
  }, [queryId, orders]);

  // Active selected order for live tracker panel
  const selectedOrder = orders.find((o) => o.id === selectedOrderId) || orders[0];

  // Quantity handlers
  const updateQty = (orderId: string, delta: number) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          const newQty = Math.max(1, order.item.qty + delta);
          const newSubtotal = order.item.price * newQty;
          const newTotal = order.isCancelled ? 0 : newSubtotal + order.shipping - order.discount;
          return {
            ...order,
            item: { ...order.item, qty: newQty },
            subtotal: newSubtotal,
            total: newTotal,
          };
        }
        return order;
      })
    );
  };

  // Cancel order handler
  const handleCancelOrder = () => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === selectedOrderId) {
          return {
            ...order,
            isCancelled: true,
            statusBadge: "Cancelled",
            badgeType: "Cancelled",
            badgeColor: "bg-[#ef4444]",
            total: 0,
          };
        }
        return order;
      })
    );
    setShowCancelModal(false);
  };

  // Reorder handler
  const handleReorder = (order: OrderDetail) => {
    add(order.item.id, order.item.qty);
    openCart();
  };

  // Download invoice simulation
  const handleDownloadInvoice = () => {
    setInvoiceToast(true);
    setTimeout(() => setInvoiceToast(false), 3000);
  };

  // Copy tracking number to clipboard
  const handleCopyTracking = (trackNum: string) => {
    navigator.clipboard.writeText(trackNum);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  // Search by ID or track directly
  const handleDirectTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const found = orders.find(
      (o) =>
        o.id.includes(searchQuery.trim()) ||
        o.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        o.item.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );
    if (found) {
      setSelectedOrderId(found.id);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    // Filter tab
    if (filterTab === "ORDERED" && order.badgeType !== "Ordered") return false;
    if (filterTab === "DELIVERED" && order.badgeType !== "Delivered") return false;
    if (filterTab === "CANCELLED" && order.badgeType !== "Cancelled") return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        order.id.includes(q) ||
        order.item.name.toLowerCase().includes(q) ||
        order.trackingNumber.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <main className="min-h-screen bg-[#111111] pt-[84px] sm:pt-[104px] pb-20 sm:pb-24 text-white">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute left-1/4 top-1/4 h-[550px] w-[550px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(215,160,70,0.06)_0%,transparent_70%)] blur-3xl -z-0" />
      <div className="pointer-events-none absolute right-10 top-1/3 h-[450px] w-[450px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.03)_0%,transparent_70%)] blur-2xl -z-0" />

      {/* Invoice Download Toast Notification */}
      <AnimatePresence>
        {invoiceToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 sm:top-24 right-4 sm:right-6 z-50 flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-[#161616]/95 px-4 sm:px-5 py-3 sm:py-3.5 shadow-2xl backdrop-blur-md"
          >
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            <div>
              <p className="text-[13.5px] font-semibold text-white">
                Invoice {selectedOrder.orderNumber} Ready
              </p>
              <p className="text-[12px] text-[#909090]">
                Official PDF tax receipt generated successfully.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container-x relative z-10">
        {/* Header Row: Title & Quick Multi-Order Search */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-6 sm:mb-10">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="font-heading font-bold text-white text-[34px] sm:text-[54px] lg:text-[62px] leading-[1.05] tracking-tight"
            >
              Order Tracking
            </motion.h1>
            <p className="mt-2 text-[13.5px] sm:text-[14.5px] text-[#8e8e8e]">
              Manage and track multiple customer shipments simultaneously in real time.
            </p>
          </div>

          {/* Quick Track Input Bar */}
          <form onSubmit={handleDirectTrack} className="flex flex-col xs:flex-row items-stretch gap-2 max-w-md w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373]" />
              <input
                type="text"
                placeholder="Search by Order ID (1234, 1237...) or carrier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#181818] pl-10 pr-3 py-2.5 text-[13.5px] text-white placeholder-[#737373] outline-none focus:border-white/30"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-white px-5 py-2.5 text-[13.5px] font-semibold text-black hover:bg-neutral-200 transition-colors whitespace-nowrap text-center"
            >
              Track Now
            </button>
          </form>
        </div>

        {/* Filter Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 mb-6">
          <button
            type="button"
            onClick={() => setFilterTab("ALL")}
            className={`rounded-full px-4 py-1.5 text-[12.5px] font-semibold transition-all ${
              filterTab === "ALL"
                ? "bg-white text-black shadow-md font-bold"
                : "border border-white/10 bg-[#161616] text-[#8e8e8e] hover:text-white"
            }`}
          >
            All Orders ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("ORDERED")}
            className={`rounded-full px-4 py-1.5 text-[12.5px] font-semibold transition-all ${
              filterTab === "ORDERED"
                ? "bg-[#7c3aed] text-white shadow-md font-bold"
                : "border border-white/10 bg-[#161616] text-[#8e8e8e] hover:text-white"
            }`}
          >
            In Transit ({orders.filter((o) => o.badgeType === "Ordered").length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("DELIVERED")}
            className={`rounded-full px-4 py-1.5 text-[12.5px] font-semibold transition-all ${
              filterTab === "DELIVERED"
                ? "bg-[#10b981] text-white shadow-md font-bold"
                : "border border-white/10 bg-[#161616] text-[#8e8e8e] hover:text-white"
            }`}
          >
            Delivered ({orders.filter((o) => o.badgeType === "Delivered").length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("CANCELLED")}
            className={`rounded-full px-4 py-1.5 text-[12.5px] font-semibold transition-all ${
              filterTab === "CANCELLED"
                ? "bg-[#ef4444] text-white shadow-md font-bold"
                : "border border-white/10 bg-[#161616] text-[#8e8e8e] hover:text-white"
            }`}
          >
            Cancelled ({orders.filter((o) => o.badgeType === "Cancelled").length})
          </button>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.18fr_0.82fr] gap-8 lg:gap-10 items-start">
          
          {/* =================================================================
              LEFT COLUMN: Multiple Order Cards List (Clickable to Track)
              ================================================================= */}
          <div className="flex flex-col gap-5 sm:gap-6">
            {filteredOrders.map((order, idx) => {
              const isSelected = order.id === selectedOrderId;
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: EASE, delay: idx * 0.06 }}
                  onClick={() => setSelectedOrderId(order.id)}
                  className={`group relative flex flex-col sm:flex-row gap-5 sm:gap-6 rounded-[24px] p-5 sm:p-6 cursor-pointer transition-all duration-300 shadow-[0_12px_32px_rgba(0,0,0,0.5)] ${
                    isSelected
                      ? "border-2 border-amber-400 bg-[#191919] ring-2 ring-amber-400/20 shadow-[0_0_24px_rgba(245,158,11,0.15)]"
                      : "border border-white/20 bg-[#161616]/95 hover:border-white/35 hover:bg-[#1a1a1a]"
                  }`}
                >
                  {/* "Tracking Now" Active Indicator Banner */}
                  {isSelected && (
                    <div className="absolute -top-3 left-6 z-20">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-0.5 text-[11px] font-black text-black shadow-md uppercase tracking-wider">
                        <span className="h-1.5 w-1.5 rounded-full bg-black animate-pulse" />
                        Live Tracking Now
                      </span>
                    </div>
                  )}

                  {/* Product Thumbnail */}
                  <div className="relative h-[135px] w-[135px] sm:h-[150px] sm:w-[150px] shrink-0 overflow-hidden rounded-[18px] border border-white/10 bg-[#1a1a1a]">
                    <Image
                      src={order.item.image}
                      alt={order.item.name}
                      fill
                      sizes="(max-width: 640px) 135px, 150px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  {/* Card Content */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      {/* Header Row: Title & Status Badge */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] font-semibold text-amber-400/90 tracking-wide">
                              Order #{order.id}
                            </span>
                            <span className="text-[11px] text-[#707070]">• {order.orderDate}</span>
                          </div>
                          <h2 className="font-heading font-bold text-white text-[19px] sm:text-[21px] tracking-tight mt-0.5">
                            {order.item.name}
                          </h2>
                        </div>

                        {/* Status Badge matching Screenshot */}
                        <span
                          className={`shrink-0 rounded-full px-4 py-1 text-[12px] font-semibold text-white shadow-sm ${order.badgeColor}`}
                        >
                          {order.badgeType}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="mt-2 text-[13.5px] leading-relaxed text-[#8e8e8e] max-w-md">
                        {order.item.desc}
                      </p>

                      {/* Delivery Date */}
                      {order.item.deliveredBy && (
                        <p className="mt-2.5 text-[12.5px] text-[#737373]">
                          Delivered By : {order.item.deliveredBy}
                        </p>
                      )}
                    </div>

                    {/* Bottom Row: Quantity Counter, Price & Track Action */}
                    <div className="mt-4 sm:mt-5 flex items-center justify-between flex-wrap gap-2">
                      {/* Quantity Pill */}
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-[#202020] px-3.5 py-1 text-[13px] font-medium text-white"
                      >
                        <button
                          type="button"
                          onClick={() => updateQty(order.id, -1)}
                          aria-label="Decrease quantity"
                          className="text-[#999999] hover:text-white transition-colors"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="min-w-[12px] text-center">{order.item.qty}</span>
                        <button
                          type="button"
                          onClick={() => updateQty(order.id, 1)}
                          aria-label="Increase quantity"
                          className="text-[#999999] hover:text-white transition-colors"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Price & Selection Button */}
                      <div className="flex items-center gap-2.5">
                        <span className="font-heading font-bold text-white text-[20px] sm:text-[22px] tracking-tight">
                          ${order.item.price}/-
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReorder(order);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-[12px] font-medium text-white/80 hover:bg-white hover:text-black transition-colors"
                        >
                          <RotateCcw className="h-3 w-3" />
                          <span>Reorder</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrderId(order.id);
                          }}
                          className={`rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-all ${
                            isSelected
                              ? "bg-amber-400 text-black shadow-sm font-bold"
                              : "border border-white/15 bg-white/5 text-white/80 hover:bg-white/10"
                          }`}
                        >
                          {isSelected ? "Tracking" : "Track"}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {filteredOrders.length === 0 && (
              <div className="rounded-[24px] border border-white/10 bg-[#161616] p-10 text-center text-[#8e8e8e]">
                <p className="text-[15px]">No orders match the selected filter.</p>
                <button
                  type="button"
                  onClick={() => {
                    setFilterTab("ALL");
                    setSearchQuery("");
                  }}
                  className="mt-3 text-[13px] font-semibold text-amber-400 hover:underline"
                >
                  Reset filters
                </button>
              </div>
            )}
          </div>

          {/* =================================================================
              RIGHT COLUMN: Active Tracked Order Details & Live Stepper
              ================================================================= */}
          <motion.div
            key={selectedOrder.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="flex flex-col gap-6 rounded-[26px] border border-white/15 bg-[#161616] p-6 sm:p-8 shadow-[0_16px_40px_rgba(0,0,0,0.6)] sticky top-[110px]"
          >
            {/* Header: Order ID & Status Capsule */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h2 className="font-heading font-bold text-white text-[24px] sm:text-[26px] tracking-tight">
                  Order ID {selectedOrder.id}
                </h2>
                <span
                  className={`rounded-full px-3.5 py-1 text-[12px] font-medium text-white shadow-sm ${
                    selectedOrder.isCancelled
                      ? "bg-red-500/20 text-red-300 border border-red-500/30"
                      : selectedOrder.currentStep === 4
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-[#272727] text-[#c5c5c5]"
                  }`}
                >
                  {selectedOrder.statusBadge}
                </span>
              </div>

              {/* Copy Tracking ID button */}
              <button
                type="button"
                onClick={() => handleCopyTracking(selectedOrder.trackingNumber)}
                className="inline-flex items-center gap-1.5 text-[12px] font-medium text-amber-400 hover:text-amber-300 transition-colors"
              >
                {copiedTracking ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>{selectedOrder.trackingNumber}</span>
                  </>
                )}
              </button>
            </div>

            {/* Stepper Status Box */}
            <div className="rounded-[20px] border border-white/10 bg-[#1f1f1f]/80 p-5 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <p className="text-[13px] font-medium text-[#8e8e8e]">
                  Product in transits
                </p>
                <button
                  type="button"
                  onClick={() => setShowCarrierModal(true)}
                  className="inline-flex items-center gap-1 text-[11.5px] text-[#a0a0a0] hover:text-amber-400 transition-colors"
                >
                  <span>Carrier: {selectedOrder.carrier}</span>
                  <ExternalLink className="h-3 w-3" />
                </button>
              </div>

              {/* 4-Step Timeline with Dynamic Green Progress */}
              <div className="relative">
                {/* Connecting Line */}
                <div className="absolute top-[10px] left-[14px] right-[14px] h-[2px] bg-white/20 -z-0">
                  <div
                    className="h-full bg-[#10b981] transition-all duration-700"
                    style={{
                      width: selectedOrder.isCancelled
                        ? "0%"
                        : selectedOrder.currentStep === 1
                        ? "0%"
                        : selectedOrder.currentStep === 2
                        ? "33%"
                        : selectedOrder.currentStep === 3
                        ? "66%"
                        : "100%",
                    }}
                  />
                </div>

                <div className="grid grid-cols-4 gap-1 relative z-10 text-center">
                  {selectedOrder.steps.map((step, stepIdx) => {
                    const stepNum = stepIdx + 1;
                    const isCompleted =
                      !selectedOrder.isCancelled && stepNum <= selectedOrder.currentStep;
                    const isCurrent =
                      !selectedOrder.isCancelled && stepNum === selectedOrder.currentStep;

                    return (
                      <div key={step.name} className="flex flex-col items-center">
                        {isCompleted ? (
                          <span className="grid h-6 w-6 place-items-center rounded-full bg-[#10b981] text-black shadow-sm">
                            <Check className="h-3.5 w-3.5 stroke-[3]" />
                          </span>
                        ) : isCurrent ? (
                          <span className="grid h-6 w-6 place-items-center rounded-full border-2 border-amber-400 bg-amber-400/20 text-amber-300">
                            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                          </span>
                        ) : (
                          <span className="grid h-6 w-6 place-items-center rounded-full border border-white/30 bg-[#282828]" />
                        )}

                        <span
                          className={`mt-2 text-[11px] sm:text-[12px] font-semibold ${
                            isCompleted
                              ? "text-white"
                              : isCurrent
                              ? "text-amber-300"
                              : "text-[#888888]"
                          }`}
                        >
                          {step.name}
                        </span>

                        <span className="text-[10px] text-[#787878] leading-tight mt-0.5 hidden sm:block">
                          {step.date}
                          <br />
                          {step.time}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Metadata Row: Order date, Delivery date, Address */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div>
                <span className="text-[12px] text-[#7a7a7a]">Order date</span>
                <p className="mt-1 text-[13px] font-medium text-white">
                  {selectedOrder.orderDate}
                </p>
              </div>
              <div>
                <span className="text-[12px] text-[#7a7a7a]">Delivery date</span>
                <p className="mt-1 text-[13px] font-medium text-white">
                  {selectedOrder.deliveryDate}
                </p>
              </div>
              <div>
                <span className="text-[12px] text-[#7a7a7a]">Address</span>
                <p className="mt-1 text-[12.5px] leading-relaxed text-[#c5c5c5]">
                  {selectedOrder.address}
                </p>
              </div>
            </div>

            {/* Order Summary Block */}
            <div className="pt-2 border-t border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-bold text-white text-[18px] tracking-tight">
                  Order Summary
                </h3>
                <button
                  type="button"
                  onClick={handleDownloadInvoice}
                  className="inline-flex items-center gap-1.5 text-[12px] font-medium text-amber-400 hover:text-amber-300 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Invoice PDF</span>
                </button>
              </div>

              <div className="flex flex-col gap-2.5 text-[14px]">
                <div className="flex justify-between text-[#8e8e8e]">
                  <span>Sub Total</span>
                  <span className="font-medium text-white">${selectedOrder.subtotal}/-</span>
                </div>
                <div className="flex justify-between text-[#8e8e8e]">
                  <span>Discount</span>
                  <span className="font-medium text-white">${selectedOrder.discount}</span>
                </div>
                <div className="flex justify-between text-[#8e8e8e]">
                  <span>Shipping</span>
                  <span className="font-medium text-white">${selectedOrder.shipping}/-</span>
                </div>

                <div className="border-t border-white/10 my-2" />

                <div className="flex justify-between text-[16px] font-bold text-white font-heading">
                  <span>Total Amount</span>
                  <span>${selectedOrder.total}/-</span>
                </div>
              </div>
            </div>

            {/* Action Buttons depending on order state */}
            <div className="flex flex-col gap-3 pt-1">
              {!selectedOrder.isCancelled && selectedOrder.currentStep < 4 ? (
                <button
                  type="button"
                  onClick={() => setShowCancelModal(true)}
                  className="w-full rounded-2xl border border-white/20 bg-transparent py-4 text-[15px] font-semibold text-white transition-all hover:bg-white/5 hover:border-white/40 active:scale-[0.99] text-center"
                >
                  Order Cancel
                </button>
              ) : selectedOrder.isCancelled ? (
                <div className="w-full rounded-2xl border border-red-500/30 bg-red-500/10 py-3.5 text-[14px] font-medium text-red-400 text-center">
                  Order #{selectedOrder.id} has been cancelled
                </div>
              ) : (
                <div className="w-full rounded-2xl border border-emerald-500/30 bg-emerald-500/10 py-3.5 text-[14px] font-medium text-emerald-400 text-center">
                  Order #{selectedOrder.id} successfully delivered
                </div>
              )}

              <button
                type="button"
                onClick={() => handleReorder(selectedOrder)}
                className="w-full rounded-2xl bg-white/10 hover:bg-white hover:text-black py-3.5 text-[14px] font-semibold text-white transition-all active:scale-[0.99] text-center flex items-center justify-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reorder Items</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl border border-white/20 bg-[#181818] p-6 shadow-2xl text-white"
            >
              <h3 className="font-heading font-bold text-[20px] text-white">
                Cancel Order #{selectedOrder.id}?
              </h3>
              <p className="mt-2 text-[14px] text-[#9a9a9a] leading-relaxed">
                Are you sure you want to cancel {selectedOrder.item.name}? Any refund of ${selectedOrder.total} will be credited back to your original payment method.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 rounded-xl border border-white/20 py-2.5 text-[14px] font-medium text-white hover:bg-white/10"
                >
                  Keep Order
                </button>
                <button
                  type="button"
                  onClick={handleCancelOrder}
                  className="flex-1 rounded-xl bg-red-500 py-2.5 text-[14px] font-semibold text-white hover:bg-red-600"
                >
                  Yes, Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Carrier Information Modal */}
      <AnimatePresence>
        {showCarrierModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl border border-white/20 bg-[#181818] p-6 shadow-2xl text-white"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-amber-400" />
                  <h3 className="font-heading font-bold text-[18px] text-white">
                    {selectedOrder.carrier}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCarrierModal(false)}
                  className="text-white/60 hover:text-white text-[18px]"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 space-y-3 text-[13.5px] text-[#9a9a9a]">
                <div className="flex justify-between">
                  <span>Waybill Number:</span>
                  <span className="font-mono text-white">{selectedOrder.trackingNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Dispatch Hub:</span>
                  <span className="text-white">Boston International Logistics (BOS-4)</span>
                </div>
                <div className="flex justify-between">
                  <span>Service Tier:</span>
                  <span className="text-emerald-400 font-semibold">Priority Air Express (Guaranteed)</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Delivery:</span>
                  <span className="text-white font-medium">{selectedOrder.deliveryDate}</span>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCarrierModal(false)}
                  className="w-full rounded-xl bg-amber-400 py-2.5 text-[14px] font-bold text-black hover:bg-amber-300"
                >
                  Close Carrier View
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#111111] pt-[120px] text-center text-white/50">
          Loading order tracking system...
        </div>
      }
    >
      <OrdersContent />
    </Suspense>
  );
}

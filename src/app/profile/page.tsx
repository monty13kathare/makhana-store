"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Truck,
  Check,
  Clock,
  MapPin,
  Mail,
  Phone,
  Copy,
  Download,
  RotateCcw,
  Sparkles,
  Search,
  LogOut,
  Minus,
  Plus,
  ShieldCheck,
  Bell,
  Lock,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { useAuth, type UserAddress } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { EASE } from "@/components/motion-primitives";
import { INITIAL_ORDERS, type OrderDetail } from "@/app/orders/page";

type Tab = "tracking" | "history" | "addresses" | "settings";

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const { add, openCart } = useCart();

  // Active user data with fallback to Arvind Kathare matching screenshot
  const currentUser = {
    name: user?.name || "Arvind Kathare",
    email: user?.email || "19399975648@makhana.vip",
    phone: user?.phone || "+19399975648",
    avatar: user?.avatar || "/img/avatar-1.jpg",
    tier: user?.memberTier || "Gold Connoisseur",
  };

  const [activeTab, setActiveTab] = useState<Tab>("settings");
  const [orders, setOrders] = useState<OrderDetail[]>(INITIAL_ORDERS);
  const [selectedOrderId, setSelectedOrderId] = useState<string>("1234");
  const [searchQuery, setSearchQuery] = useState("");
  const [historyFilter, setHistoryFilter] = useState<"ALL" | "ORDERED" | "DELIVERED" | "CANCELLED">("ALL");
  const [copiedTracking, setCopiedTracking] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Form states for Account Details
  const [formName, setFormName] = useState(currentUser.name);
  const [formEmail, setFormEmail] = useState(currentUser.email);
  const [formPhone, setFormPhone] = useState(currentUser.phone);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Notification toggles
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [exclusiveDrops, setExclusiveDrops] = useState(true);

  // Address state
  const [addresses, setAddresses] = useState<UserAddress[]>([
    {
      id: "addr-1",
      tag: "Home (Default)",
      recipient: currentUser.name,
      line1: "70 Pleasant Valley Street",
      city: "Methuen",
      state: "MA",
      zip: "01844",
      country: "United States",
      phone: currentUser.phone,
      isDefault: true,
    },
    {
      id: "addr-2",
      tag: "Studio / Office",
      recipient: currentUser.name,
      line1: "185 Broadway, Floor 8",
      city: "New York",
      state: "NY",
      zip: "10007",
      country: "United States",
      phone: currentUser.phone,
      isDefault: false,
    },
  ]);

  // Selected order for live tracking
  const selectedOrder = orders.find((o) => o.id === selectedOrderId) || orders[0];
  const activeShipmentsCount = orders.filter((o) => !o.isCancelled && o.currentStep < 4).length;

  const updateOrderQty = (orderId: string, delta: number) => {
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

  const handleCancelSelectedOrder = () => {
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

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (updateUser) {
      updateUser({
        name: formName,
        email: formEmail,
        phone: formPhone,
      });
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const copyTracking = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  const handleReorder = (order: OrderDetail) => {
    add(order.item.id, order.item.qty);
    openCart();
  };

  // Filtered orders for Order History tab
  const filteredOrders = orders.filter((o) => {
    if (historyFilter === "ORDERED" && o.badgeType !== "Ordered") return false;
    if (historyFilter === "DELIVERED" && o.badgeType !== "Delivered") return false;
    if (historyFilter === "CANCELLED" && o.badgeType !== "Cancelled") return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.id.includes(q) ||
      o.item.name.toLowerCase().includes(q) ||
      o.trackingNumber.toLowerCase().includes(q) ||
      o.statusBadge.toLowerCase().includes(q)
    );
  });

  return (
    <main className="min-h-screen bg-[#111111] pt-[84px] sm:pt-[104px] pb-20 sm:pb-24 text-white">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute left-1/4 top-1/4 h-[550px] w-[550px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(215,160,70,0.06)_0%,transparent_70%)] blur-3xl -z-0" />
      <div className="pointer-events-none absolute right-10 top-1/3 h-[450px] w-[450px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.02)_0%,transparent_70%)] blur-2xl -z-0" />

      <div className="container-x relative z-10">
        {/* =========================================================================
            1. User Profile Header Banner Card (Matching Screenshot Exactly)
           ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="relative overflow-hidden rounded-[22px] sm:rounded-[26px] border border-white/10 bg-[#141414] p-5 sm:p-8 lg:p-10 shadow-2xl"
        >
          {/* Ambient Warm Corner Glow */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />

          {/* Top Row: User Avatar & Info + Quick Actions */}
          <div className="relative z-10 flex flex-col justify-between gap-5 sm:gap-6 lg:flex-row lg:items-center">
            {/* User Identity */}
            <div className="flex items-center gap-3.5 sm:gap-6">
              {/* Avatar with Online Status Indicator */}
              <div className="relative h-16 w-16 sm:h-22 sm:w-22 shrink-0 overflow-hidden rounded-2xl border-2 border-white/20 bg-neutral-800 shadow-xl">
                <Image
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  fill
                  sizes="88px"
                  className="object-cover"
                />
                <span className="absolute bottom-1 right-1 h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-full border-2 border-[#141414] bg-emerald-500 shadow-sm" />
              </div>

              {/* Name, Tier & Contacts */}
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                  <h1 className="font-heading font-bold text-white text-[20px] sm:text-[28px] lg:text-[32px] tracking-tight truncate">
                    {currentUser.name}
                  </h1>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[11.5px] font-semibold text-amber-300">
                    <Sparkles className="h-3 w-3" />
                    {currentUser.tier}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[12.5px] sm:text-[13px] text-[#909090]">
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-white/50 shrink-0" />
                    <span className="truncate">{currentUser.email}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-white/50 shrink-0" />
                    <span>{currentUser.phone}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab("settings")}
                className="rounded-full border border-white/15 bg-white/5 px-4 sm:px-5 py-2 sm:py-2.5 text-[13px] font-semibold text-white transition-all hover:bg-white/10 hover:border-white/30"
              >
                Account Settings
              </button>
              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/5 px-4 py-2 sm:py-2.5 text-[13px] font-semibold text-red-300 transition-colors hover:bg-red-500/10"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar: 2x2 on Mobile, 4-col on Desktop (Interactive) */}
          <div className="mt-7 sm:mt-8 grid grid-cols-2 gap-3 sm:gap-4 border-t border-white/10 pt-6 lg:grid-cols-4">
            {/* 1. Total Orders */}
            <div
              onClick={() => setActiveTab("history")}
              className="group cursor-pointer rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-all hover:border-white/20 hover:bg-white/[0.04]"
            >
              <p className="text-[12px] text-[#808080] group-hover:text-white transition-colors">
                Total Orders
              </p>
              <p className="mt-1 text-[20px] sm:text-[22px] font-extrabold text-white">
                {orders.length}
              </p>
            </div>

            {/* 2. Active Shipments (Highlighted & Live) */}
            <div
              onClick={() => setActiveTab("tracking")}
              className="cursor-pointer rounded-xl border border-amber-500/30 bg-amber-500/[0.04] p-4 shadow-[0_0_20px_rgba(245,158,11,0.08)] transition-all hover:border-amber-400 hover:bg-amber-500/[0.08]"
            >
              <p className="text-[12px] text-amber-300/90 font-medium">Active Shipments</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
                </span>
                <p className="text-[20px] sm:text-[22px] font-extrabold text-amber-300">
                  {activeShipmentsCount} Live
                </p>
              </div>
            </div>

            {/* 3. Rewards Points */}
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <p className="text-[12px] text-[#808080]">Rewards Points</p>
              <p className="mt-1 text-[20px] sm:text-[22px] font-extrabold text-white">
                480 pts
              </p>
            </div>

            {/* 4. Shipping Status */}
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <p className="text-[12px] text-[#808080]">Shipping Status</p>
              <p className="mt-1 text-[13.5px] sm:text-[14px] font-bold text-emerald-400 truncate">
                Global Express VIP
              </p>
            </div>
          </div>
        </motion.div>

        {/* =========================================================================
            2. Tab Navigation Pills (Scrollable on Mobile)
           ========================================================================= */}
        <div className="mt-8 sm:mt-10 flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-3 border-b border-white/10">
          {/* Tab 1: Live Tracking */}
          <button
            type="button"
            onClick={() => setActiveTab("tracking")}
            className={`flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-[13.5px] font-semibold transition-all ${
              activeTab === "tracking"
                ? "bg-amber-400 text-black shadow-md font-bold"
                : "border border-white/10 bg-transparent text-white/70 hover:border-amber-400/30 hover:text-amber-400"
            }`}
          >
            <Truck className="h-4 w-4" />
            <span>Live Tracking</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10.5px] font-bold ${
                activeTab === "tracking"
                  ? "bg-black/15 text-black"
                  : "bg-amber-400/20 text-amber-300"
              }`}
            >
              {activeShipmentsCount} Active
            </span>
          </button>

          {/* Tab 2: Order History */}
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-[13.5px] font-semibold transition-all ${
              activeTab === "history"
                ? "bg-amber-400 text-black shadow-md font-bold"
                : "border border-white/10 bg-transparent text-white/70 hover:border-amber-400/30 hover:text-amber-400"
            }`}
          >
            <Package className="h-4 w-4" />
            <span>Order History ({orders.length})</span>
          </button>

          {/* Tab 3: Saved Addresses */}
          <button
            type="button"
            onClick={() => setActiveTab("addresses")}
            className={`flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-[13.5px] font-semibold transition-all ${
              activeTab === "addresses"
                ? "bg-amber-400 text-black shadow-md font-bold"
                : "border border-white/10 bg-transparent text-white/70 hover:border-amber-400/30 hover:text-amber-400"
            }`}
          >
            <MapPin className="h-4 w-4" />
            <span>Saved Addresses</span>
          </button>

          {/* Tab 4: Account Details */}
          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className={`flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-[13.5px] font-semibold transition-all ${
              activeTab === "settings"
                ? "bg-amber-400 text-black shadow-md font-bold"
                : "border border-white/10 bg-transparent text-white/70 hover:border-amber-400/30 hover:text-amber-400"
            }`}
          >
            <span>Account Details</span>
          </button>
        </div>

        {/* =========================================================================
            3. Tab Content Display
           ========================================================================= */}
        <div className="mt-8">
          {/* ---------------------------------------------------------------------
              TAB 1: LIVE TRACKING (Full Multi-Order Interactive Tracking)
             --------------------------------------------------------------------- */}
          {activeTab === "tracking" && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="grid grid-cols-1 lg:grid-cols-[1.18fr_0.82fr] gap-8 lg:gap-10 items-start"
            >
              {/* Left Column: Multi-Order Selection List */}
              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-[14px] font-bold uppercase tracking-wider text-[#999999]">
                    Select Shipment to Track ({orders.length})
                  </h2>
                  <Link
                    href="/orders"
                    className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-amber-400 hover:text-amber-300"
                  >
                    <span>Full Orders View</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>

                {orders.map((order) => {
                  const isSelected = order.id === selectedOrderId;
                  return (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrderId(order.id)}
                      className={`group relative flex flex-col sm:flex-row gap-5 sm:gap-6 rounded-[24px] p-5 sm:p-6 cursor-pointer transition-all duration-300 shadow-[0_12px_32px_rgba(0,0,0,0.5)] ${
                        isSelected
                          ? "border-2 border-amber-400 bg-[#191919] ring-2 ring-amber-400/20 shadow-[0_0_24px_rgba(245,158,11,0.15)]"
                          : "border border-white/20 bg-[#161616]/95 hover:border-white/35 hover:bg-[#1a1a1a]"
                      }`}
                    >
                      {/* Active Tracking Pill */}
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
                          sizes="150px"
                          className="object-cover"
                        />
                      </div>

                      {/* Card Content */}
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <span className="text-[12px] font-semibold text-amber-400/90 tracking-wide">
                                Order #{order.id}
                              </span>
                              <h3 className="font-heading font-bold text-white text-[19px] sm:text-[21px] tracking-tight mt-0.5">
                                {order.item.name}
                              </h3>
                            </div>
                            <span
                              className={`shrink-0 rounded-full px-4 py-1 text-[12px] font-semibold text-white shadow-sm ${order.badgeColor}`}
                            >
                              {order.badgeType}
                            </span>
                          </div>
                          <p className="mt-2 text-[13.5px] leading-relaxed text-[#8e8e8e]">
                            {order.item.desc}
                          </p>
                          {order.item.deliveredBy && (
                            <p className="mt-2.5 text-[12.5px] text-[#737373]">
                              Delivered By : {order.item.deliveredBy}
                            </p>
                          )}
                        </div>

                        <div className="mt-4 sm:mt-5 flex items-center justify-between flex-wrap gap-2">
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-[#202020] px-3.5 py-1 text-[13px] font-medium text-white"
                          >
                            <button
                              type="button"
                              onClick={() => updateOrderQty(order.id, -1)}
                              className="text-[#999999] hover:text-white"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span>{order.item.qty}</span>
                            <button
                              type="button"
                              onClick={() => updateOrderQty(order.id, 1)}
                              className="text-[#999999] hover:text-white"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center gap-2.5">
                            <span className="font-heading font-bold text-white text-[20px] sm:text-[22px]">
                              ${order.item.price}/-
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedOrderId(order.id);
                              }}
                              className={`rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-all ${
                                isSelected
                                  ? "bg-amber-400 text-black font-bold"
                                  : "border border-white/15 bg-white/5 text-white/80 hover:bg-white/10"
                              }`}
                            >
                              {isSelected ? "Tracking" : "Track"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Tracking Details & Status Stepper (Dynamically binds to selectedOrder) */}
              <div className="flex flex-col gap-6 rounded-[26px] border border-white/15 bg-[#161616] p-6 sm:p-8 shadow-[0_16px_40px_rgba(0,0,0,0.6)] sticky top-[110px]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <h2 className="font-heading font-bold text-white text-[22px] sm:text-[24px]">
                      Order ID {selectedOrder.id}
                    </h2>
                    <span
                      className={`rounded-full px-3.5 py-1 text-[12px] font-medium text-white ${
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

                  <button
                    type="button"
                    onClick={() => copyTracking(selectedOrder.trackingNumber)}
                    className="inline-flex items-center gap-1.5 text-[12px] text-amber-400 hover:text-amber-300 transition-colors"
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

                {/* 4-Step Stepper Box */}
                <div className="rounded-[20px] border border-white/10 bg-[#1f1f1f]/80 p-5 sm:p-6">
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-[13px] font-medium text-[#8e8e8e]">
                      Product in transits
                    </p>
                    <span className="text-[11.5px] text-[#737373]">
                      Carrier: {selectedOrder.carrier}
                    </span>
                  </div>

                  <div className="relative">
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

                {/* Metadata Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  <div>
                    <span className="text-[12px] text-[#7a7a7a]">Order date</span>
                    <p className="mt-0.5 text-[13px] font-medium text-white">
                      {selectedOrder.orderDate}
                    </p>
                  </div>
                  <div>
                    <span className="text-[12px] text-[#7a7a7a]">Delivery date</span>
                    <p className="mt-0.5 text-[13px] font-medium text-white">
                      {selectedOrder.deliveryDate}
                    </p>
                  </div>
                  <div>
                    <span className="text-[12px] text-[#7a7a7a]">Address</span>
                    <p className="mt-0.5 text-[12px] text-[#c5c5c5] leading-relaxed">
                      {selectedOrder.address}
                    </p>
                  </div>
                </div>

                {/* Order Summary Snapshot */}
                <div className="border-t border-white/10 pt-4">
                  <div className="flex justify-between text-[13.5px] text-[#8e8e8e]">
                    <span>Item Total:</span>
                    <span className="text-white">${selectedOrder.subtotal}/-</span>
                  </div>
                  <div className="flex justify-between text-[13.5px] text-[#8e8e8e] mt-1.5">
                    <span>Shipping:</span>
                    <span className="text-white">${selectedOrder.shipping}/-</span>
                  </div>
                  <div className="flex justify-between text-[15px] font-bold text-white mt-2 pt-2 border-t border-white/10">
                    <span>Total Amount:</span>
                    <span>${selectedOrder.total}/-</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2.5">
                  {!selectedOrder.isCancelled && selectedOrder.currentStep < 4 ? (
                    <button
                      type="button"
                      onClick={() => setShowCancelModal(true)}
                      className="w-full rounded-2xl border border-white/20 bg-transparent py-3.5 text-[14.5px] font-semibold text-white transition-all hover:bg-white/5 hover:border-white/40 active:scale-[0.99]"
                    >
                      Order Cancel
                    </button>
                  ) : selectedOrder.isCancelled ? (
                    <div className="w-full rounded-2xl border border-red-500/30 bg-red-500/10 py-3 text-[13.5px] font-medium text-red-400 text-center">
                      Order #{selectedOrder.id} has been cancelled
                    </div>
                  ) : (
                    <div className="w-full rounded-2xl border border-emerald-500/30 bg-emerald-500/10 py-3 text-[13.5px] font-medium text-emerald-400 text-center">
                      Order #{selectedOrder.id} delivered
                    </div>
                  )}

                  <Link
                    href={`/orders?id=${selectedOrder.id}`}
                    className="w-full rounded-2xl bg-white/10 hover:bg-white hover:text-black py-3 text-[13.5px] font-semibold text-white transition-all active:scale-[0.99] text-center flex items-center justify-center gap-1.5"
                  >
                    <span>Open Detailed Tracking Page</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {/* ---------------------------------------------------------------------
              TAB 2: ORDER HISTORY (Multi-Order Cards with Live Track & Reorder)
             --------------------------------------------------------------------- */}
          {activeTab === "history" && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="flex flex-col gap-6"
            >
              {/* Search Bar & Filter Tabs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="relative max-w-md w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#777777]" />
                  <input
                    type="text"
                    placeholder="Search past orders by flavor or status..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-[#161616] pl-11 pr-4 py-3 text-[14px] text-white placeholder-[#777777] outline-none focus:border-white/30"
                  />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                  <button
                    type="button"
                    onClick={() => setHistoryFilter("ALL")}
                    className={`rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-all ${
                      historyFilter === "ALL"
                        ? "bg-white text-black"
                        : "border border-white/10 bg-[#161616] text-[#8e8e8e] hover:text-white"
                    }`}
                  >
                    All ({orders.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setHistoryFilter("ORDERED")}
                    className={`rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-all ${
                      historyFilter === "ORDERED"
                        ? "bg-[#7c3aed] text-white"
                        : "border border-white/10 bg-[#161616] text-[#8e8e8e] hover:text-white"
                    }`}
                  >
                    In Transit
                  </button>
                  <button
                    type="button"
                    onClick={() => setHistoryFilter("DELIVERED")}
                    className={`rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-all ${
                      historyFilter === "DELIVERED"
                        ? "bg-[#10b981] text-white"
                        : "border border-white/10 bg-[#161616] text-[#8e8e8e] hover:text-white"
                    }`}
                  >
                    Delivered
                  </button>
                  <button
                    type="button"
                    onClick={() => setHistoryFilter("CANCELLED")}
                    className={`rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-all ${
                      historyFilter === "CANCELLED"
                        ? "bg-[#ef4444] text-white"
                        : "border border-white/10 bg-[#161616] text-[#8e8e8e] hover:text-white"
                    }`}
                  >
                    Cancelled
                  </button>
                </div>
              </div>

              {/* Order Cards List */}
              <div className="flex flex-col gap-5">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="group relative flex flex-col sm:flex-row gap-5 sm:gap-6 rounded-[24px] border border-white/20 bg-[#161616]/95 p-5 sm:p-6 transition-all duration-300 hover:border-white/35 shadow-[0_12px_32px_rgba(0,0,0,0.5)]"
                  >
                    <div className="relative h-[135px] w-[135px] sm:h-[150px] sm:w-[150px] shrink-0 overflow-hidden rounded-[18px] border border-white/10 bg-[#1a1a1a]">
                      <Image
                        src={order.item.image}
                        alt={order.item.name}
                        fill
                        sizes="150px"
                        className="object-cover"
                      />
                    </div>

                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="text-[12px] font-semibold text-amber-400/90 tracking-wide">
                              Order #{order.id} • {order.orderDate}
                            </span>
                            <h2 className="font-heading font-bold text-white text-[19px] sm:text-[21px] tracking-tight mt-0.5">
                              {order.item.name}
                            </h2>
                          </div>

                          <span
                            className={`shrink-0 rounded-full px-4 py-1 text-[12px] font-semibold text-white shadow-sm ${order.badgeColor}`}
                          >
                            {order.badgeType}
                          </span>
                        </div>

                        <p className="mt-2 text-[13.5px] leading-relaxed text-[#8e8e8e] max-w-md">
                          {order.item.desc}
                        </p>

                        {order.item.deliveredBy && (
                          <p className="mt-2.5 text-[12.5px] text-[#737373]">
                            Delivered By : {order.item.deliveredBy}
                          </p>
                        )}
                      </div>

                      <div className="mt-4 sm:mt-5 flex items-center justify-between flex-wrap gap-3">
                        <span className="font-heading font-bold text-white text-[20px] sm:text-[22px]">
                          ${order.item.price}/-
                        </span>

                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedOrderId(order.id);
                              setActiveTab("tracking");
                            }}
                            className="flex items-center gap-1.5 rounded-xl bg-amber-400 px-4 py-2 text-[13px] font-bold text-black hover:bg-amber-300 transition-colors shadow-sm"
                          >
                            <Truck className="h-3.5 w-3.5" />
                            <span>Track Live Status</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleReorder(order)}
                            className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-[13px] font-semibold text-white hover:bg-white hover:text-black transition-colors"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            <span>Reorder</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredOrders.length === 0 && (
                  <div className="rounded-[24px] border border-white/10 bg-[#161616] p-10 text-center text-[#8e8e8e]">
                    <p className="text-[15px]">No orders match the selected filter criteria.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setHistoryFilter("ALL");
                        setSearchQuery("");
                      }}
                      className="mt-3 text-[13px] font-semibold text-amber-400 hover:underline"
                    >
                      Reset filters
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ---------------------------------------------------------------------
              TAB 3: SAVED ADDRESSES
             --------------------------------------------------------------------- */}
          {activeTab === "addresses" && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="rounded-[24px] border border-white/15 bg-[#161616] p-6 sm:p-7 flex flex-col justify-between gap-5 transition-all hover:border-white/30"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-heading font-bold text-[18px] text-white">
                        {addr.tag}
                      </span>
                      {addr.isDefault && (
                        <span className="rounded-full bg-amber-400/20 px-3 py-0.5 text-[11px] font-semibold text-amber-300 border border-amber-400/30">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="mt-3 text-[14px] text-white font-medium">
                      {addr.recipient}
                    </p>
                    <p className="mt-1 text-[13.5px] text-[#8e8e8e] leading-relaxed">
                      {addr.line1}, {addr.city}, {addr.state} {addr.zip}, {addr.country}
                    </p>
                    <p className="mt-2 text-[13px] text-[#777777]">
                      Phone: {addr.phone}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 border-t border-white/10 pt-4 text-[13px]">
                    <button
                      type="button"
                      className="font-medium text-amber-400 hover:text-amber-300"
                    >
                      Edit Address
                    </button>
                    {!addr.isDefault && (
                      <button
                        type="button"
                        onClick={() =>
                          setAddresses((prev) =>
                            prev.map((a) => ({ ...a, isDefault: a.id === addr.id }))
                          )
                        }
                        className="text-[#888888] hover:text-white"
                      >
                        Set as Default
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* ---------------------------------------------------------------------
              TAB 4: ACCOUNT DETAILS (Matching User's Screenshot Exactly)
             --------------------------------------------------------------------- */}
          {activeTab === "settings" && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="rounded-[26px] border border-white/10 bg-[#141414] p-6 sm:p-8 lg:p-10 shadow-2xl"
            >
              <form onSubmit={handleSaveProfile} className="max-w-3xl">
                {/* Section Header */}
                <h2 className="font-heading font-bold text-white text-[24px] sm:text-[28px] tracking-tight">
                  Personal Information
                </h2>
                <p className="mt-1.5 text-[14px] text-[#8e8e8e]">
                  Update your contact details and order notification preferences.
                </p>

                {/* Form Fields matching Screenshot */}
                <div className="mt-8 space-y-6">
                  {/* FULL NAME */}
                  <div>
                    <label className="block text-[11.5px] font-bold uppercase tracking-wider text-[#737373] mb-2.5">
                      FULL NAME
                    </label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-[#1c1c1c] px-5 py-3.5 text-[15px] text-white outline-none transition-colors focus:border-amber-400/50 focus:bg-[#202020]"
                      required
                    />
                  </div>

                  {/* 2-Column: EMAIL ADDRESS & PHONE NUMBER */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[11.5px] font-bold uppercase tracking-wider text-[#737373] mb-2.5">
                        EMAIL ADDRESS
                      </label>
                      <input
                        type="email"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-[#1c1c1c] px-5 py-3.5 text-[15px] text-white outline-none transition-colors focus:border-amber-400/50 focus:bg-[#202020]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11.5px] font-bold uppercase tracking-wider text-[#737373] mb-2.5">
                        PHONE NUMBER
                      </label>
                      <input
                        type="tel"
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-[#1c1c1c] px-5 py-3.5 text-[15px] text-white outline-none transition-colors focus:border-amber-400/50 focus:bg-[#202020]"
                        required
                      />
                    </div>
                  </div>

                  {/* Password & Security Block */}
                  <div className="border-t border-white/10 pt-8 mt-8">
                    <h3 className="font-heading font-bold text-white text-[18px] tracking-tight mb-4 flex items-center gap-2">
                      <Lock className="h-4 w-4 text-amber-400" />
                      Security &amp; Password
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[11.5px] font-bold uppercase tracking-wider text-[#737373] mb-2.5">
                          CURRENT PASSWORD
                        </label>
                        <input
                          type="password"
                          placeholder="••••••••••••"
                          className="w-full rounded-2xl border border-white/10 bg-[#1c1c1c] px-5 py-3.5 text-[15px] text-white outline-none focus:border-white/30"
                        />
                      </div>
                      <div>
                        <label className="block text-[11.5px] font-bold uppercase tracking-wider text-[#737373] mb-2.5">
                          NEW PASSWORD
                        </label>
                        <input
                          type="password"
                          placeholder="Enter new password"
                          className="w-full rounded-2xl border border-white/10 bg-[#1c1c1c] px-5 py-3.5 text-[15px] text-white outline-none focus:border-white/30"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Notification Preferences */}
                  <div className="border-t border-white/10 pt-8 mt-8">
                    <h3 className="font-heading font-bold text-white text-[18px] tracking-tight mb-4 flex items-center gap-2">
                      <Bell className="h-4 w-4 text-amber-400" />
                      Notification Preferences
                    </h3>
                    <div className="space-y-4">
                      <label className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02] cursor-pointer hover:bg-white/[0.04]">
                        <div>
                          <p className="text-[14px] font-semibold text-white">Order Status &amp; Live Tracking</p>
                          <p className="text-[12.5px] text-[#8e8e8e]">Receive real-time shipment updates via SMS &amp; Email</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={smsAlerts}
                          onChange={(e) => setSmsAlerts(e.target.checked)}
                          className="h-5 w-5 accent-amber-400 cursor-pointer"
                        />
                      </label>

                      <label className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02] cursor-pointer hover:bg-white/[0.04]">
                        <div>
                          <p className="text-[14px] font-semibold text-white">WhatsApp Delivery Dispatch</p>
                          <p className="text-[12.5px] text-[#8e8e8e]">Get courier tracking links directly on your registered mobile</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={whatsappAlerts}
                          onChange={(e) => setWhatsappAlerts(e.target.checked)}
                          className="h-5 w-5 accent-amber-400 cursor-pointer"
                        />
                      </label>

                      <label className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02] cursor-pointer hover:bg-white/[0.04]">
                        <div>
                          <p className="text-[14px] font-semibold text-white">Limited Reserve &amp; Harvest Drops</p>
                          <p className="text-[12.5px] text-[#8e8e8e]">VIP alerts when rare artisanal batches and truffle tins release</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={exclusiveDrops}
                          onChange={(e) => setExclusiveDrops(e.target.checked)}
                          className="h-5 w-5 accent-amber-400 cursor-pointer"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Save Changes Button */}
                  <div className="pt-6 flex flex-wrap items-center gap-4">
                    <button
                      type="submit"
                      className="rounded-xl bg-amber-400 px-8 py-3.5 text-[14px] font-bold text-black transition-all hover:bg-amber-300 active:scale-95 shadow-lg shadow-amber-400/20"
                    >
                      Save Changes
                    </button>

                    <AnimatePresence>
                      {saveSuccess && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0 }}
                          className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-emerald-400"
                        >
                          <Check className="h-4 w-4" />
                          Personal details updated successfully!
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </form>
            </motion.div>
          )}
        </div>
      </div>

      {/* Cancel Order Modal */}
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
                Are you sure you want to cancel {selectedOrder.item.name}? Any refund of ${selectedOrder.total} will be credited back to your original payment method within 3 business days.
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
                  onClick={handleCancelSelectedOrder}
                  className="flex-1 rounded-xl bg-red-500 py-2.5 text-[14px] font-semibold text-white hover:bg-red-600"
                >
                  Yes, Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}

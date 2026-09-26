"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Mail,
  Phone,
  Copy,
  Check,
  Download,
  RotateCcw,
  ShieldCheck,
  ChevronRight,
  LogOut,
  ExternalLink,
  Plus,
  Sparkles,
  Search,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { formatUSD, products } from "@/lib/products";
import { EASE } from "@/components/motion-primitives";

type Tab = "tracking" | "history" | "addresses" | "settings";

type OrderItem = {
  slug: string;
  name: string;
  weight: string;
  price: number;
  qty: number;
  image: string;
};

type Order = {
  id: string;
  date: string;
  status: "In Transit" | "Delivered" | "Processing" | "Packed";
  carrier: string;
  trackingNumber: string;
  estimatedDelivery: string;
  deliveryAddress: string;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  items: OrderItem[];
  checkpoints: {
    status: string;
    location: string;
    time: string;
    completed: boolean;
    current?: boolean;
  }[];
};

const SAMPLE_ORDERS: Order[] = [
  {
    id: "MK-89241",
    date: "24 Sep 2026",
    status: "In Transit",
    carrier: "DHL Express Global",
    trackingNumber: "DHL-9928-8472-US",
    estimatedDelivery: "Tomorrow by 3:00 PM",
    deliveryAddress: "742 Evergreen Terrace, Brooklyn, NY 11201, USA",
    subtotal: 52,
    shipping: 0,
    discount: 5,
    total: 47,
    items: [
      {
        slug: "classic-himalayan-salt",
        name: "Classic Himalayan Salt",
        weight: "200g",
        price: 11,
        qty: 2,
        image: "/img/bowl-classic.jpg",
      },
      {
        slug: "peri-peri-roast",
        name: "Peri Peri Roast",
        weight: "200g",
        price: 14,
        qty: 1,
        image: "/img/bowl-peri.jpg",
      },
      {
        slug: "truffle-black-pepper",
        name: "Truffle Black Pepper",
        weight: "200g",
        price: 16,
        qty: 1,
        image: "/img/bowl-cheese.jpg",
      },
    ],
    checkpoints: [
      {
        status: "Order Confirmed & Payment Verified",
        location: "Makhana Direct HQ",
        time: "24 Sep, 09:15 AM",
        completed: true,
      },
      {
        status: "Graded 6+ Suta & Slow-Roasted in Small Batch",
        location: "Mithila Roastery Facility",
        time: "24 Sep, 01:30 PM",
        completed: true,
      },
      {
        status: "Nitrogen Multi-Barrier Sealed & Dispatched",
        location: "Central Hub",
        time: "24 Sep, 06:45 PM",
        completed: true,
      },
      {
        status: "Departed Sort Facility / In Transit",
        location: "JFK International Hub, New York",
        time: "Today, 08:30 AM",
        completed: true,
        current: true,
      },
      {
        status: "Out for Delivery to Doorstep",
        location: "Brooklyn Station Courier",
        time: "Estimated Tomorrow, 02:00 PM",
        completed: false,
      },
      {
        status: "Delivered & Signed",
        location: "Brooklyn, NY",
        time: "Pending Arrival",
        completed: false,
      },
    ],
  },
  {
    id: "MK-87114",
    date: "12 Sep 2026",
    status: "Delivered",
    carrier: "FedEx International",
    trackingNumber: "FDX-7714-9921-US",
    estimatedDelivery: "Delivered on 15 Sep 2026",
    deliveryAddress: "742 Evergreen Terrace, Brooklyn, NY 11201, USA",
    subtotal: 38,
    shipping: 0,
    discount: 0,
    total: 38,
    items: [
      {
        slug: "peri-peri-roast",
        name: "Peri Peri Roast",
        weight: "200g",
        price: 14,
        qty: 2,
        image: "/img/bowl-peri.jpg",
      },
      {
        slug: "classic-himalayan-salt",
        name: "Classic Himalayan Salt",
        weight: "200g",
        price: 11,
        qty: 1,
        image: "/img/bowl-classic.jpg",
      },
    ],
    checkpoints: [
      {
        status: "Delivered & Signed",
        location: "Front Door, Brooklyn, NY",
        time: "15 Sep, 01:22 PM",
        completed: true,
        current: true,
      },
    ],
  },
  {
    id: "MK-84502",
    date: "28 Aug 2026",
    status: "Delivered",
    carrier: "DHL Express",
    trackingNumber: "DHL-6632-1190-US",
    estimatedDelivery: "Delivered on 31 Aug 2026",
    deliveryAddress: "742 Evergreen Terrace, Brooklyn, NY 11201, USA",
    subtotal: 64,
    shipping: 0,
    discount: 8,
    total: 56,
    items: [
      {
        slug: "truffle-black-pepper",
        name: "Truffle Black Pepper",
        weight: "200g",
        price: 16,
        qty: 4,
        image: "/img/bowl-cheese.jpg",
      },
    ],
    checkpoints: [
      {
        status: "Delivered",
        location: "Reception, Brooklyn, NY",
        time: "31 Aug, 11:40 AM",
        completed: true,
        current: true,
      },
    ],
  },
];

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const { add, openCart } = useCart();

  const [activeTab, setActiveTab] = useState<Tab>("tracking");
  const [selectedOrder, setSelectedOrder] = useState<Order>(SAMPLE_ORDERS[0]);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Profile form state
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [notifyUpdates, setNotifyUpdates] = useState(true);
  const [notifySms, setNotifySms] = useState(true);

  // Keep form in sync when user logs in
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  // Saved addresses
  const [addresses, setAddresses] = useState([
    {
      id: "addr-1",
      tag: "Home (Default)",
      recipient: "Elena Rostova",
      line1: "742 Evergreen Terrace, Apt 4B",
      city: "Brooklyn",
      state: "NY",
      zip: "11201",
      country: "United States",
      phone: "+1 (555) 389-2041",
      isDefault: true,
    },
    {
      id: "addr-2",
      tag: "Studio / Office",
      recipient: "Elena Rostova",
      line1: "185 Broadway, Floor 8",
      city: "New York",
      state: "NY",
      zip: "10007",
      country: "United States",
      phone: "+1 (555) 389-2041",
      isDefault: false,
    },
  ]);

  const copyTracking = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ name, email, phone });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleReorder = (order: Order) => {
    order.items.forEach((item) => {
      add(item.slug, item.qty);
    });
    openCart();
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-[120px] pb-24">
        <div className="container-x max-w-lg text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-[#161616] shadow-2xl">
            <Package className="h-9 w-9 text-white/60" />
          </div>
          <h1 className="mt-6 text-[28px] font-bold text-white">
            Access Your Account &amp; Orders
          </h1>
          <p className="mt-3 text-[14.5px] leading-relaxed text-[#8a8a8a]">
            Track international packages in real time, view order receipts, and
            manage saved delivery locations.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/login?redirect=/profile"
              className="rounded-full bg-white px-8 py-3.5 text-[14px] font-bold text-black transition-all hover:bg-amber-400 hover:text-black active:bg-amber-300 active:scale-95 shadow-lg"
            >
              Sign In with Mobile / Email
            </Link>
            <Link
              href="/shop"
              className="rounded-full border border-white/20 bg-white/5 px-8 py-3.5 text-[14px] font-semibold text-white transition-all hover:border-amber-400/40 hover:text-amber-400 hover:bg-amber-400/10 active:text-amber-300"
            >
              Explore Collection
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Filter orders for history tab
  const filteredOrders = SAMPLE_ORDERS.filter((o) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.id.toLowerCase().includes(q) ||
      o.trackingNumber.toLowerCase().includes(q) ||
      o.items.some((it) => it.name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen pt-[108px] pb-24 lg:pt-[124px]">
      <div className="container-x">
        {/* =========================================================================
            1. User Profile Header Card
           ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="relative overflow-hidden rounded-[26px] border border-white/10 bg-[#141414] p-6 sm:p-8 lg:p-10 shadow-2xl"
        >
          {/* Ambient Glow */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />

          <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            {/* User Info */}
            <div className="flex items-center gap-5 sm:gap-6">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 border-white/20 bg-neutral-800 shadow-xl sm:h-24 sm:w-24">
                <Image
                  src={user.avatar || "/img/avatar-1.jpg"}
                  alt={user.name}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
                <span className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-[#141414] bg-emerald-500" />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-[24px] font-bold text-white sm:text-[30px]">
                    {user.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[11.5px] font-semibold text-amber-300">
                    <Sparkles className="h-3 w-3" />
                    {user.memberTier || "Gold VIP Member"}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[13px] text-[#909090]">
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-white/40" />
                    {user.email || "elena.rostova@luxury.co"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-white/40" />
                    {user.phone}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab("settings")}
                className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-[13px] font-semibold text-white transition-all hover:border-amber-400/40 hover:text-amber-400 active:text-amber-300 hover:bg-amber-400/10"
              >
                Account Settings
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-[13px] font-semibold text-red-300 transition-colors hover:bg-red-500/10 hover:text-red-200"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-8 grid grid-cols-2 gap-3 border-t border-white/10 pt-6 sm:grid-cols-4 sm:gap-4">
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <p className="text-[12px] text-[#808080]">Total Orders</p>
              <p className="mt-1 text-[20px] font-extrabold text-white">
                {SAMPLE_ORDERS.length}
              </p>
            </div>
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-4">
              <p className="text-[12px] text-amber-300/80">Active Shipments</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
                </span>
                <p className="text-[20px] font-extrabold text-amber-300">1 Live</p>
              </div>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <p className="text-[12px] text-[#808080]">Rewards Points</p>
              <p className="mt-1 text-[20px] font-extrabold text-white">
                480 pts
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <p className="text-[12px] text-[#808080]">Shipping Status</p>
              <p className="mt-1 text-[14px] font-bold text-emerald-400">
                Global Express VIP
              </p>
            </div>
          </div>
        </motion.div>

        {/* =========================================================================
            2. Tab Navigation
           ========================================================================= */}
        <div className="mt-10 flex items-center gap-2 overflow-x-auto border-b border-white/10 pb-4">
          <button
            onClick={() => setActiveTab("tracking")}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-[13.5px] font-semibold transition-all ${
              activeTab === "tracking"
                ? "bg-amber-400 text-black shadow-md font-bold"
                : "border border-white/10 bg-transparent text-white/70 hover:border-amber-400/30 hover:bg-amber-400/10 hover:text-amber-400 active:text-amber-300"
            }`}
          >
            <Truck className="h-4 w-4" />
            Live Tracking
            <span
              className={`rounded-full px-2 py-0.5 text-[10.5px] font-extrabold ${
                activeTab === "tracking"
                  ? "bg-black/15 text-black"
                  : "bg-amber-400/20 text-amber-300"
              }`}
            >
              1 Active
            </span>
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-[13.5px] font-semibold transition-all ${
              activeTab === "history"
                ? "bg-amber-400 text-black shadow-md font-bold"
                : "border border-white/10 bg-transparent text-white/70 hover:border-amber-400/30 hover:bg-amber-400/10 hover:text-amber-400 active:text-amber-300"
            }`}
          >
            <Package className="h-4 w-4" />
            Order History ({SAMPLE_ORDERS.length})
          </button>

          <button
            onClick={() => setActiveTab("addresses")}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-[13.5px] font-semibold transition-all ${
              activeTab === "addresses"
                ? "bg-amber-400 text-black shadow-md font-bold"
                : "border border-white/10 bg-transparent text-white/70 hover:border-amber-400/30 hover:bg-amber-400/10 hover:text-amber-400 active:text-amber-300"
            }`}
          >
            <MapPin className="h-4 w-4" />
            Saved Addresses
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-[13.5px] font-semibold transition-all ${
              activeTab === "settings"
                ? "bg-amber-400 text-black shadow-md font-bold"
                : "border border-white/10 bg-transparent text-white/70 hover:border-amber-400/30 hover:bg-amber-400/10 hover:text-amber-400 active:text-amber-300"
            }`}
          >
            Account Details
          </button>
        </div>

        {/* =========================================================================
            3. Tab Content
           ========================================================================= */}
        <div className="mt-8">
          {/* TAB 1: LIVE TRACKING */}
          {activeTab === "tracking" && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]"
            >
              {/* Left: Active Live Stepper Card */}
              <div className="rounded-[24px] border border-white/10 bg-[#161616] p-6 sm:p-8 shadow-xl">
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
                  <div>
                    <span className="text-[12px] font-medium uppercase tracking-wider text-amber-400">
                      Live Delivery in Progress
                    </span>
                    <h2 className="mt-1 text-[22px] font-bold text-white">
                      Order {selectedOrder.id}
                    </h2>
                    <p className="mt-1 text-[13px] text-[#8e8e8e]">
                      Shipped via {selectedOrder.carrier}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => copyTracking(selectedOrder.trackingNumber)}
                      className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[12px] font-medium text-white transition-all hover:border-amber-400/40 hover:text-amber-400 active:text-amber-300 hover:bg-amber-400/10"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5 text-white/60" />
                          <span>{selectedOrder.trackingNumber}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Estimated Delivery Highlight Banner */}
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber-500/20 bg-amber-500/[0.05] p-5">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-black">
                      <Truck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[12px] font-medium text-amber-200/80">
                        Estimated Arrival
                      </p>
                      <p className="text-[16px] font-bold text-white">
                        {selectedOrder.estimatedDelivery}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[12.5px] text-[#9a9a9a]">
                    <MapPin className="h-4 w-4 text-white/40" />
                    <span>Brooklyn, NY</span>
                  </div>
                </div>

                {/* Progress Checkpoints Vertical Timeline */}
                <div className="mt-8">
                  <h3 className="text-[14px] font-bold uppercase tracking-wider text-white/80">
                    Live Checkpoint Timeline
                  </h3>

                  <div className="relative mt-6 space-y-6 pl-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-white/10">
                    {selectedOrder.checkpoints.map((cp, idx) => {
                      return (
                        <div key={idx} className="relative flex items-start gap-4">
                          {/* Dot / Icon */}
                          <div
                            className={`absolute -left-6 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${
                              cp.current
                                ? "border-amber-400 bg-amber-500 text-black shadow-lg shadow-amber-500/40"
                                : cp.completed
                                ? "border-emerald-500 bg-emerald-500 text-black"
                                : "border-white/20 bg-[#161616] text-white/30"
                            }`}
                          >
                            {cp.completed ? (
                              <Check className="h-3.5 w-3.5 stroke-[3]" />
                            ) : cp.current ? (
                              <span className="h-2 w-2 rounded-full bg-black" />
                            ) : (
                              <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1 pl-2">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p
                                className={`text-[14px] font-bold ${
                                  cp.current
                                    ? "text-amber-300"
                                    : cp.completed
                                    ? "text-white"
                                    : "text-white/40"
                                }`}
                              >
                                {cp.status}
                              </p>
                              <span className="text-[12px] text-[#717171]">
                                {cp.time}
                              </span>
                            </div>
                            <p className="mt-0.5 text-[12.5px] text-[#8e8e8e]">
                              {cp.location}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Destination Details */}
                <div className="mt-8 border-t border-white/10 pt-6">
                  <p className="text-[12px] font-semibold uppercase tracking-wider text-[#7a7a7a]">
                    Delivery Address
                  </p>
                  <p className="mt-1.5 text-[13.5px] text-white/80">
                    {selectedOrder.deliveryAddress}
                  </p>
                </div>
              </div>

              {/* Right: Order Package Breakdown & Receipt */}
              <div className="flex flex-col gap-6">
                <div className="rounded-[24px] border border-white/10 bg-[#161616] p-6 shadow-xl">
                  <h3 className="text-[16px] font-bold text-white">
                    Package Items ({selectedOrder.items.length})
                  </h3>

                  <div className="mt-5 divide-y divide-white/10">
                    {selectedOrder.items.map((item) => (
                      <div
                        key={item.slug}
                        className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                      >
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-neutral-900">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[14px] font-semibold text-white">
                            {item.name}
                          </p>
                          <p className="text-[12px] text-[#808080]">
                            {item.weight} · Qty {item.qty}
                          </p>
                        </div>

                        <span className="text-[14px] font-bold text-white">
                          {formatUSD(item.price * item.qty)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="mt-6 border-t border-white/10 pt-4 text-[13px] text-[#8a8a8a]">
                    <div className="flex justify-between py-1">
                      <span>Subtotal</span>
                      <span className="text-white">
                        {formatUSD(selectedOrder.subtotal)}
                      </span>
                    </div>
                    {selectedOrder.discount > 0 && (
                      <div className="flex justify-between py-1 text-emerald-400">
                        <span>VIP Member Discount</span>
                        <span>&minus;{formatUSD(selectedOrder.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-1">
                      <span>Global Express Delivery</span>
                      <span className="text-emerald-400 font-semibold">Free</span>
                    </div>
                    <div className="flex justify-between border-t border-white/10 pt-3 text-[16px] font-extrabold text-white">
                      <span>Total Paid</span>
                      <span>{formatUSD(selectedOrder.total)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleReorder(selectedOrder)}
                      className="flex items-center justify-center gap-2 rounded-full bg-white py-2.5 text-[12.5px] font-bold text-black transition-all hover:bg-amber-400 hover:text-black active:bg-amber-300 active:scale-95 shadow-sm"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Buy Again
                    </button>
                    <a
                      href="#invoice"
                      onClick={(e) => {
                        e.preventDefault();
                        alert(`Invoice PDF generated for ${selectedOrder.id}`);
                      }}
                      className="flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 py-2.5 text-[12.5px] font-semibold text-white transition-all hover:border-amber-400/40 hover:text-amber-400 hover:bg-amber-400/10 active:text-amber-300 active:scale-95"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Invoice PDF
                    </a>
                  </div>
                </div>

                {/* Freshness & Support Guarantee Card */}
                <div className="rounded-[22px] border border-white/10 bg-[#141414] p-5">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-emerald-400" />
                    <div>
                      <h4 className="text-[13.5px] font-bold text-white">
                        Makhana Freshness Promise
                      </h4>
                      <p className="mt-0.5 text-[12px] leading-relaxed text-[#8a8a8a]">
                        Vacuum nitrogen-flushed packaging ensures peak crunch. If
                        any batch isn&apos;t ultra-crisp, we re-ship free.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: ORDER HISTORY */}
          {activeTab === "history" && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="space-y-6"
            >
              {/* Search Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="relative min-w-[280px] flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by Order ID, tracking #, or flavour..."
                    className="w-full rounded-full border border-white/15 bg-[#161616] py-2.5 pl-10 pr-4 text-[13.5px] text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none"
                  />
                </div>
                <p className="text-[13px] text-[#808080]">
                  Showing {filteredOrders.length} of {SAMPLE_ORDERS.length} orders
                </p>
              </div>

              {/* Order Cards List */}
              <div className="grid gap-5">
                {filteredOrders.map((order) => (
                  <article
                    key={order.id}
                    className="rounded-[24px] border border-white/10 bg-[#161616] p-6 transition-all hover:border-white/20"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-[17px] font-bold text-white">
                            {order.id}
                          </h3>
                          <span
                            className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                              order.status === "Delivered"
                                ? "bg-emerald-500/15 text-emerald-400"
                                : "bg-amber-400/15 text-amber-300"
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <p className="mt-1 text-[12.5px] text-[#808080]">
                          Placed on {order.date} · Tracking: {order.trackingNumber}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setActiveTab("tracking");
                          }}
                          className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[12.5px] font-semibold text-white transition-all hover:border-amber-400/40 hover:text-amber-400 active:text-amber-300 hover:bg-amber-400/10"
                        >
                          Track Package
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleReorder(order)}
                          className="rounded-full bg-white px-4 py-2 text-[12.5px] font-semibold text-black transition-all hover:bg-amber-400 hover:text-black active:bg-amber-300 active:scale-95 shadow-sm"
                        >
                          Re-order
                        </button>
                      </div>
                    </div>

                    {/* Order items row */}
                    <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {order.items.map((it) => (
                        <div
                          key={it.slug}
                          className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3"
                        >
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-neutral-900">
                            <Image
                              src={it.image}
                              alt={it.name}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] font-semibold text-white">
                              {it.name}
                            </p>
                            <p className="text-[11.5px] text-[#787878]">
                              Qty {it.qty} · {formatUSD(it.price * it.qty)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3 text-[13px]">
                      <span className="text-[#808080]">
                        Total Amount:{" "}
                        <strong className="text-white">
                          {formatUSD(order.total)}
                        </strong>
                      </span>
                      <button
                        onClick={() =>
                          alert(`Invoice download started for ${order.id}`)
                        }
                        className="text-[12px] text-white/60 hover:text-amber-400 active:text-amber-300 underline transition-colors"
                      >
                        Download PDF Invoice
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 3: SAVED ADDRESSES */}
          {activeTab === "addresses" && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="space-y-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-[20px] font-bold text-white">
                    Saved Delivery Addresses
                  </h2>
                  <p className="mt-1 text-[13.5px] text-[#8e8e8e]">
                    Manage multiple international delivery destinations for fast
                    checkout.
                  </p>
                </div>
                <button
                  onClick={() =>
                    alert("Address modal: You can add an international address.")
                  }
                  className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[13px] font-bold text-black transition-all hover:bg-amber-400 hover:text-black active:bg-amber-300 active:scale-95 shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  Add New Address
                </button>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`relative rounded-[22px] border p-6 transition-all ${
                      addr.isDefault
                        ? "border-amber-400/40 bg-[#181818]"
                        : "border-white/10 bg-[#161616]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                          addr.isDefault
                            ? "bg-amber-400/20 text-amber-300"
                            : "bg-white/10 text-white/70"
                        }`}
                      >
                        {addr.tag}
                      </span>
                      {addr.isDefault && (
                        <span className="flex items-center gap-1 text-[11.5px] text-amber-400">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Default Delivery
                        </span>
                      )}
                    </div>

                    <h3 className="mt-4 text-[16px] font-bold text-white">
                      {addr.recipient}
                    </h3>
                    <p className="mt-1 text-[13.5px] leading-relaxed text-[#909090]">
                      {addr.line1}
                      <br />
                      {addr.city}, {addr.state} {addr.zip}
                      <br />
                      {addr.country}
                    </p>
                    <p className="mt-3 text-[12.5px] text-[#717171]">
                      Phone: {addr.phone}
                    </p>

                    <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-4">
                      <button
                        onClick={() => alert("Edit address form")}
                        className="text-[12.5px] font-medium text-white/70 hover:text-amber-400 active:text-amber-300 transition-colors"
                      >
                        Edit
                      </button>
                      {!addr.isDefault && (
                        <>
                          <span className="text-white/20">·</span>
                          <button
                            onClick={() => {
                              setAddresses((prev) =>
                                prev.map((a) => ({
                                  ...a,
                                  isDefault: a.id === addr.id,
                                }))
                              );
                            }}
                            className="text-[12.5px] font-medium text-amber-400 hover:text-amber-300"
                          >
                            Set as Default
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 4: PROFILE SETTINGS */}
          {activeTab === "settings" && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="max-w-2xl"
            >
              <div className="rounded-[24px] border border-white/10 bg-[#161616] p-7 sm:p-9 shadow-xl">
                <h2 className="text-[20px] font-bold text-white">
                  Personal Information
                </h2>
                <p className="mt-1 text-[13.5px] text-[#8e8e8e]">
                  Update your contact details and order notification preferences.
                </p>

                <form onSubmit={handleSaveProfile} className="mt-7 space-y-5">
                  <div>
                    <label className="block text-[12.5px] font-semibold uppercase tracking-wider text-[#7a7a7a]">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-[14px] text-white focus:border-white/40 focus:outline-none"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[12.5px] font-semibold uppercase tracking-wider text-[#7a7a7a]">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-[14px] text-white focus:border-white/40 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[12.5px] font-semibold uppercase tracking-wider text-[#7a7a7a]">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-[14px] text-white focus:border-white/40 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Notification Toggles */}
                  <div className="border-t border-white/10 pt-5 space-y-4">
                    <h3 className="text-[14px] font-bold text-white">
                      Tracking &amp; Notifications
                    </h3>

                    <label className="flex items-center justify-between gap-4 cursor-pointer">
                      <div>
                        <p className="text-[13.5px] font-semibold text-white">
                          Email Order Checkpoints
                        </p>
                        <p className="text-[12px] text-[#808080]">
                          Receive real-time carrier dispatch and customs notices.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifyUpdates}
                        onChange={(e) => setNotifyUpdates(e.target.checked)}
                        className="h-4 w-4 rounded accent-white"
                      />
                    </label>

                    <label className="flex items-center justify-between gap-4 cursor-pointer">
                      <div>
                        <p className="text-[13.5px] font-semibold text-white">
                          SMS Delivery Alerts
                        </p>
                        <p className="text-[12px] text-[#808080]">
                          Get an SMS ping when driver is 10 minutes away.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifySms}
                        onChange={(e) => setNotifySms(e.target.checked)}
                        className="h-4 w-4 rounded accent-white"
                      />
                    </label>
                  </div>

                  <div className="pt-4 flex items-center gap-4">
                    <button
                      type="submit"
                      className="rounded-full bg-white px-8 py-3 text-[13.5px] font-bold text-black transition-all hover:bg-amber-400 hover:text-black active:bg-amber-300 active:scale-95 shadow-md"
                    >
                      Save Changes
                    </button>
                    {saveSuccess && (
                      <span className="flex items-center gap-1.5 text-[13px] font-semibold text-emerald-400">
                        <CheckCircle2 className="h-4 w-4" />
                        Saved successfully!
                      </span>
                    )}
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Phone,
  Check,
  MapPin,
  LogOut,
  Bell,
  Package,
} from "lucide-react";
import { useAuth, type UserAddress } from "@/context/AuthContext";
import { EASE } from "@/components/motion-primitives";

type Tab = "addresses" | "settings";

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth();

  const currentUser = {
    name: user?.name || "Arvind Kathare",
    email: user?.email || "arvind@makhana.vip",
    phone: user?.phone || "+19399975648",
    avatar: user?.avatar || "/img/avatar-1.jpg",
  };

  const [activeTab, setActiveTab] = useState<Tab>("settings");

  // Form states
  const [formName, setFormName] = useState(currentUser.name);
  const [formEmail, setFormEmail] = useState(currentUser.email);
  const [formPhone, setFormPhone] = useState(currentUser.phone);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Notification toggles
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [exclusiveDrops, setExclusiveDrops] = useState(true);

  // Address state
  const [addresses, setAddresses] = useState<UserAddress[]>([
    {
      id: "addr-1",
      tag: "Home",
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
      tag: "Office",
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

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (updateUser) {
      updateUser({ name: formName, email: formEmail, phone: formPhone });
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "settings", label: "Profile", icon: <Mail className="h-4 w-4" /> },
    { key: "addresses", label: "Saved Addresses", icon: <MapPin className="h-4 w-4" /> },
  ];

  return (
    <main className="min-h-screen bg-[#111111] pt-[84px] sm:pt-[104px] pb-20 text-white">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed left-1/3 top-1/4 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(215,160,70,0.05)_0%,transparent_70%)] blur-3xl -z-0" />

      <div className="container-x relative z-10 max-w-3xl">

        {/* ── Profile Header Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="relative overflow-hidden rounded-[22px] border border-white/10 bg-[#161616] p-5 sm:p-7 shadow-xl mb-6"
        >
          <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-amber-500/8 blur-3xl" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            {/* Avatar + Info */}
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 border-white/15 bg-neutral-800 shadow-lg">
                <Image
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
                <span className="absolute bottom-1 right-1 h-2.5 w-2.5 rounded-full border-2 border-[#161616] bg-emerald-500" />
              </div>

              <div>
                <h1 className="font-heading font-bold text-white text-[20px] sm:text-[24px] tracking-tight">
                  {currentUser.name}
                </h1>
                <div className="mt-1.5 flex flex-col gap-1 text-[12.5px] text-[#909090]">
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3 w-3 text-white/40 shrink-0" />
                    {currentUser.email}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3 w-3 text-white/40 shrink-0" />
                    {currentUser.phone}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2.5 shrink-0">
              <Link
                href="/orders"
                className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[13px] font-semibold text-white hover:bg-white/10 transition-colors"
              >
                <Package className="h-3.5 w-3.5" />
                My Orders
              </Link>
              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/5 px-4 py-2 text-[13px] font-semibold text-red-300 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── Tab Nav ── */}
        <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold transition-all ${
                activeTab === tab.key
                  ? "bg-amber-400 text-black shadow"
                  : "text-[#808080] hover:text-white"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Tab Content ── */}
        <AnimatePresence mode="wait">
          {/* ── ACCOUNT DETAILS ── */}
          {activeTab === "settings" && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="rounded-[20px] border border-white/10 bg-[#161616] p-6 sm:p-8 shadow-xl"
            >
              <form onSubmit={handleSaveProfile}>
                <h2 className="font-heading font-bold text-white text-[20px] tracking-tight">
                  Personal Information
                </h2>
                <p className="mt-1 text-[13px] text-[#7a7a7a]">
                  Update your contact details below.
                </p>

                <div className="mt-6 space-y-5">
                  {/* Full Name */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#606060] mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#1c1c1c] px-4 py-3 text-[14.5px] text-white outline-none transition-colors focus:border-amber-400/50"
                      required
                    />
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#606060] mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#1c1c1c] px-4 py-3 text-[14.5px] text-white outline-none transition-colors focus:border-amber-400/50"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#606060] mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#1c1c1c] px-4 py-3 text-[14.5px] text-white outline-none transition-colors focus:border-amber-400/50"
                        required
                      />
                    </div>
                  </div>


                  {/* Notifications */}
                  <div className="border-t border-white/10 pt-6">
                    <h3 className="flex items-center gap-2 font-semibold text-white text-[15px] mb-4">
                      <Bell className="h-3.5 w-3.5 text-amber-400" />
                      Notifications
                    </h3>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between p-3.5 rounded-xl border border-white/8 bg-white/[0.02] cursor-pointer hover:bg-white/[0.04] transition-colors">
                        <div>
                          <p className="text-[13.5px] font-semibold text-white">Order & Shipment Updates</p>
                          <p className="text-[12px] text-[#7a7a7a] mt-0.5">Real-time tracking via SMS & Email</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={smsAlerts}
                          onChange={(e) => setSmsAlerts(e.target.checked)}
                          className="h-4 w-4 accent-amber-400 cursor-pointer"
                        />
                      </label>
                      <label className="flex items-center justify-between p-3.5 rounded-xl border border-white/8 bg-white/[0.02] cursor-pointer hover:bg-white/[0.04] transition-colors">
                        <div>
                          <p className="text-[13.5px] font-semibold text-white">Exclusive Drops & Offers</p>
                          <p className="text-[12px] text-[#7a7a7a] mt-0.5">Be first to know about new releases</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={exclusiveDrops}
                          onChange={(e) => setExclusiveDrops(e.target.checked)}
                          className="h-4 w-4 accent-amber-400 cursor-pointer"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Save */}
                  <div className="pt-2 flex flex-wrap items-center gap-4">
                    <button
                      type="submit"
                      className="rounded-xl bg-amber-400 px-7 py-3 text-[13.5px] font-bold text-black hover:bg-amber-300 active:scale-95 transition-all shadow-lg shadow-amber-400/20"
                    >
                      Save Changes
                    </button>
                    <AnimatePresence>
                      {saveSuccess && (
                        <motion.span
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0 }}
                          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-emerald-400"
                        >
                          <Check className="h-4 w-4" />
                          Saved successfully!
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </form>
            </motion.div>
          )}

          {/* ── SAVED ADDRESSES ── */}
          {activeTab === "addresses" && (
            <motion.div
              key="addresses"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {addresses.map((addr, i) => (
                <motion.div
                  key={addr.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, ease: EASE }}
                  className="rounded-[18px] border border-white/10 bg-[#161616] p-5 flex flex-col justify-between gap-4 hover:border-white/25 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-[15px] text-white">{addr.tag}</span>
                      {addr.isDefault && (
                        <span className="rounded-full bg-amber-400/15 border border-amber-400/30 px-2.5 py-0.5 text-[10.5px] font-semibold text-amber-300">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-[13.5px] font-medium text-white/90">{addr.recipient}</p>
                    <p className="mt-1 text-[12.5px] text-[#8e8e8e] leading-relaxed">
                      {addr.line1}, {addr.city}, {addr.state} {addr.zip}, {addr.country}
                    </p>
                    <p className="mt-1.5 text-[12px] text-[#707070]">
                      {addr.phone}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 border-t border-white/8 pt-3 text-[12.5px]">
                    <button type="button" className="font-medium text-amber-400 hover:text-amber-300 transition-colors">
                      Edit
                    </button>
                    {!addr.isDefault && (
                      <button
                        type="button"
                        onClick={() =>
                          setAddresses((prev) =>
                            prev.map((a) => ({ ...a, isDefault: a.id === addr.id }))
                          )
                        }
                        className="text-[#707070] hover:text-white transition-colors"
                      >
                        Set as Default
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

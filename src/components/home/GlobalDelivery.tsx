"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import {
  Globe,
  Truck,
  ShieldCheck,
  Sparkles,
  Plane,
  Clock,
  CheckCircle2,
  Navigation,
} from "lucide-react";
import { Reveal, EASE } from "../motion-primitives";

/* --------------------------------------------------------------------------
   Worldwide Shipping Hubs Data
   -------------------------------------------------------------------------- */
type ShippingHub = {
  id: string;
  city: string;
  country: string;
  x: number; // percentage left
  y: number; // percentage top
  svgX: number;
  svgY: number;
  curveCtrlX: number;
  curveCtrlY: number;
  days: string;
  courier: string;
  status: string;
};

const ORIGIN_HUB = {
  city: "New Delhi",
  country: "India (Origin)",
  x: 69,
  y: 45,
  svgX: 690,
  svgY: 270,
};

const shippingHubs: ShippingHub[] = [
  {
    id: "london",
    city: "London",
    country: "United Kingdom",
    x: 48,
    y: 28,
    svgX: 480,
    svgY: 168,
    curveCtrlX: 585,
    curveCtrlY: 170,
    days: "3-4 Days",
    courier: "DHL Express",
    status: "Daily Flights",
  },
  {
    id: "new-york",
    city: "New York",
    country: "United States",
    x: 26,
    y: 33,
    svgX: 260,
    svgY: 198,
    curveCtrlX: 460,
    curveCtrlY: 140,
    days: "3-5 Days",
    courier: "FedEx International",
    status: "Priority Route",
  },
  {
    id: "dubai",
    city: "Dubai",
    country: "United Arab Emirates",
    x: 61,
    y: 42,
    svgX: 610,
    svgY: 252,
    curveCtrlX: 650,
    curveCtrlY: 240,
    days: "2-3 Days",
    courier: "Emirates Post & DHL",
    status: "Express Lane",
  },
  {
    id: "singapore",
    city: "Singapore",
    country: "Singapore",
    x: 76,
    y: 56,
    svgX: 760,
    svgY: 336,
    curveCtrlX: 730,
    curveCtrlY: 310,
    days: "3 Days",
    courier: "SingPost & DHL",
    status: "Active Route",
  },
  {
    id: "sydney",
    city: "Sydney",
    country: "Australia",
    x: 88,
    y: 74,
    svgX: 880,
    svgY: 444,
    curveCtrlX: 800,
    curveCtrlY: 370,
    days: "4-5 Days",
    courier: "Australia Post",
    status: "Direct Courier",
  },
];

const deliveryFeatures = [
  {
    icon: Globe,
    title: "Worldwide shipment support",
    desc: "Tracked international courier delivery to 20+ countries with door-to-door tracking.",
    badge: "20+ Nations",
  },
  {
    icon: Truck,
    title: "Free delivery messaging",
    desc: "Available for qualifying domestic and regional order sizes, applied at checkout.",
    badge: "Free over $49",
  },
  {
    icon: ShieldCheck,
    title: "Secure checkout confidence",
    desc: "100% encrypted transactions with Stripe, Apple Pay, PayPal & global payment cards.",
    badge: "256-bit SSL",
  },
  {
    icon: Sparkles,
    title: "Premium dispatch experience",
    desc: "Hand-inspected, nitrogen-flushed, and sealed in tamper-proof presentation boxes.",
    badge: "Sealed Fresh",
  },
];

export default function GlobalDelivery() {
  const [activeHub, setActiveHub] = useState<ShippingHub>(shippingHubs[1]); // Default New York

  // 3D Parallax Tilt for the Map container
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]), {
    stiffness: 85,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]), {
    stiffness: 85,
    damping: 20,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <section className="relative py-16 lg:py-24 bg-[#0a0a0a] text-white overflow-hidden">
      {/* Subtle warm ambient background glow */}
      <div className="pointer-events-none absolute left-1/3 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(229,169,60,0.06)_0%,transparent_70%)] blur-3xl -z-0" />

      <div className="container-x relative z-10">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
          
          {/* Left Column: Interactive 3D World Map with Live Glowing Transit Arcs */}
          <div
            className="[perspective:1200px]"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <motion.div
              style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
              }}
              className="group relative aspect-[4/3.2] sm:aspect-[4/3] w-full overflow-hidden rounded-[28px] sm:rounded-[36px] border border-white/10 bg-[#141414] shadow-2xl transition-all duration-300 hover:border-amber-400/30"
            >
              {/* Base World Map Image with Dark Luxury Tint */}
              <div className="relative h-full w-full">
                <Image
                  src="/img/map-pins.jpg"
                  alt="Interactive worldwide delivery map with tracked shipping routes"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover opacity-50 brightness-75 contrast-125 filter transition-transform duration-700 group-hover:scale-105"
                  priority
                />
                {/* Deep dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-[#0e0e0e]/50 to-[#0e0e0e]/40" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_69%_45%,rgba(245,158,11,0.18)_0%,transparent_60%)]" />
              </div>

              {/* Animated SVG Flight & Shipping Arcs connecting New Delhi to World Hubs */}
              <svg
                viewBox="0 0 1000 600"
                className="absolute inset-0 h-full w-full pointer-events-none"
              >
                <defs>
                  <linearGradient id="arcGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.2" />
                  </linearGradient>
                </defs>

                {shippingHubs.map((hub) => {
                  const pathData = `M ${ORIGIN_HUB.svgX} ${ORIGIN_HUB.svgY} Q ${hub.curveCtrlX} ${hub.curveCtrlY} ${hub.svgX} ${hub.svgY}`;
                  const isSelected = activeHub.id === hub.id;

                  return (
                    <g key={`route-${hub.id}`}>
                      {/* Underlying dashed arc line */}
                      <path
                        d={pathData}
                        fill="none"
                        stroke={isSelected ? "rgba(245, 158, 11, 0.75)" : "rgba(255, 255, 255, 0.15)"}
                        strokeWidth={isSelected ? "2.2" : "1.2"}
                        strokeDasharray="4 4"
                        className="transition-colors duration-300"
                      />

                      {/* Continuous Pulsing Energy Pulse Travelling Along Route */}
                      <motion.circle
                        r={isSelected ? "4.5" : "3"}
                        fill="#fbbf24"
                        filter="drop-shadow(0 0 6px #f59e0b)"
                      >
                        <animateMotion
                          path={pathData}
                          dur={isSelected ? "2.4s" : "3.6s"}
                          repeatCount="indefinite"
                        />
                      </motion.circle>
                    </g>
                  );
                })}
              </svg>

              {/* Origin Hub (New Delhi / Bihar, India) Marker */}
              <div
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-default"
                style={{ left: `${ORIGIN_HUB.x}%`, top: `${ORIGIN_HUB.y}%` }}
              >
                <div className="relative flex items-center justify-center">
                  <span className="animate-ping absolute h-6 w-6 rounded-full bg-amber-400 opacity-60" />
                  <span className="relative flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-400 ring-4 ring-amber-400/25 shadow-[0_0_12px_#f59e0b]">
                    <span className="h-1.5 w-1.5 rounded-full bg-black" />
                  </span>
                </div>
                {/* Floating Origin Tag */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/90 border border-amber-400/40 px-2 py-0.5 text-[10px] font-bold text-amber-300 shadow-lg pointer-events-none">
                  Origin Hub
                </div>
              </div>

              {/* Destination Hub Markers */}
              {shippingHubs.map((hub) => {
                const isSelected = activeHub.id === hub.id;

                return (
                  <div
                    key={hub.id}
                    onClick={() => setActiveHub(hub)}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group/pin"
                    style={{ left: `${hub.x}%`, top: `${hub.y}%` }}
                  >
                    <div className="relative flex items-center justify-center p-2">
                      {isSelected && (
                        <span className="animate-ping absolute h-7 w-7 rounded-full bg-amber-400 opacity-70" />
                      )}
                      <span
                        className={`relative flex h-3.5 w-3.5 items-center justify-center rounded-full transition-all duration-300 ${
                          isSelected
                            ? "bg-amber-400 ring-4 ring-amber-400/30 scale-125 shadow-[0_0_14px_#f59e0b]"
                            : "bg-white/80 ring-2 ring-white/30 group-hover/pin:scale-125 group-hover/pin:bg-amber-300"
                        }`}
                      >
                        <span className="h-1 w-1 rounded-full bg-black" />
                      </span>
                    </div>

                    {/* Tooltip on active / hover */}
                    <div
                      className={`absolute top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all duration-300 pointer-events-none ${
                        isSelected
                          ? "bg-amber-400 text-black shadow-lg shadow-amber-500/25 scale-100 opacity-100"
                          : "bg-black/85 text-white/90 border border-white/15 opacity-0 group-hover/pin:opacity-100 -translate-y-1 group-hover/pin:translate-y-0"
                      }`}
                    >
                      {hub.city} &bull; {hub.days}
                    </div>
                  </div>
                );
              })}

              {/* Top Status Bar: Live Dispatch Activity */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/75 px-3.5 py-2 backdrop-blur-md z-20">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-[11.5px] font-medium text-white/90">
                    Live Dispatch: <span className="text-emerald-400 font-semibold">Online &amp; Active</span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-amber-300/80 font-mono">
                  <Plane className="h-3.5 w-3.5 text-amber-400" />
                  <span>20+ Countries</span>
                </div>
              </div>

              {/* Bottom Interactive Route Card */}
              <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/15 bg-[#121212]/90 p-3.5 backdrop-blur-md z-20 shadow-xl">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-400/10 border border-amber-400/25 text-amber-400">
                      <Navigation className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[13px] font-bold text-white">
                          {activeHub.city}, {activeHub.country}
                        </span>
                        <span className="rounded-full bg-amber-400/15 border border-amber-400/30 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                          {activeHub.status}
                        </span>
                      </div>
                      <p className="text-[11.5px] text-[#8e8e8e]">
                        Via {activeHub.courier} &bull; Expected transit:{" "}
                        <span className="text-white font-semibold">{activeHub.days}</span>
                      </p>
                    </div>
                  </div>

                  {/* Hub Switcher Dots */}
                  <div className="hidden sm:flex items-center gap-1.5">
                    {shippingHubs.map((h) => (
                      <button
                        key={h.id}
                        onClick={() => setActiveHub(h)}
                        title={h.city}
                        className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                          activeHub.id === h.id ? "w-6 bg-amber-400" : "w-2 bg-white/20 hover:bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Copy & 2x2 Feature Grid */}
          <div>
            <Reveal>
              <p className="text-[13.5px] font-medium tracking-wide text-[#8da366]">
                Worldwide delivery
              </p>

              <h2 className="mt-2 text-[32px] sm:text-[44px] font-heading font-medium tracking-tight text-white leading-[1.12]">
                Delivered Across the World
              </h2>

              <p className="mt-3.5 text-[14.5px] sm:text-[15.5px] leading-relaxed text-[#8e8e8e] max-w-lg">
                Reliable express international logistics direct to your doorstep with end-to-end tracked courier dispatch.
              </p>
            </Reveal>

            {/* 2x2 Grid of dark luxury cards */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {deliveryFeatures.map((feat, i) => {
                const Icon = feat.icon;
                return (
                  <motion.div
                    key={feat.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.55, ease: EASE, delay: i * 0.08 }}
                    whileHover={{ y: -4 }}
                    className="group relative flex flex-col justify-between rounded-[22px] border border-white/10 bg-[#161616] p-5 sm:p-6 transition-all duration-300 hover:border-amber-400/40 hover:bg-[#1a1a1a] shadow-lg hover:shadow-amber-500/5 cursor-default"
                  >
                    <div>
                      {/* Top icon + badge */}
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-white transition-colors group-hover:border-amber-400/40 group-hover:text-amber-400 group-hover:bg-amber-400/10">
                          <Icon className="h-5 w-5 text-white/90 group-hover:text-amber-400 transition-colors" />
                        </span>

                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[10.5px] font-semibold text-amber-300/90 group-hover:border-amber-400/30 group-hover:bg-amber-400/10 transition-colors">
                          {feat.badge}
                        </span>
                      </div>

                      <h3 className="text-[15px] font-bold text-white transition-colors group-hover:text-amber-400 tracking-tight">
                        {feat.title}
                      </h3>

                      <p className="mt-1.5 text-[12.5px] leading-relaxed text-[#8a8a8a]">
                        {feat.desc}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

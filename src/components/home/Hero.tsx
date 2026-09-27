"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EASE } from "../motion-primitives";

/* --------------------------------------------------------------------------
   Makhana Slides Data (Real Makhana Product PNGs - Top Luxury Web UI)
   -------------------------------------------------------------------------- */
const slides = [
  {
    src: "/img/makhana-hero2.png",
    alt: "Signature whole roasted makhana on rustic wooden platter",
    title: "Artisanal Whole Roasted Makhana",
    flavor: "Original Himalayan Crisp",
    glow: "rgba(235, 175, 70, 0.20)",
    accent: "#EBAF46",
  },
  {
    src: "/img/makhana-prod-salt.png",
    alt: "Makhana Himalayan Pink Salt premium pouch with roasted lotus seeds",
    title: "Himalayan Pink Salt Pouch",
    flavor: "Slow-Roasted in Pure A2 Ghee",
    glow: "rgba(244, 160, 160, 0.20)",
    accent: "#F4A0A0",
  },
  {
    src: "/img/makhana-prod-peri.png",
    alt: "Makhana Peri Peri Crunch spicy roasted lotus seeds snack pouch",
    title: "Peri Peri Crunch Pouch",
    flavor: "Scorching & Savory Spices",
    glow: "rgba(255, 107, 74, 0.20)",
    accent: "#FF6B4A",
  },
  {
    src: "/img/makhana-prod-truffle.png",
    alt: "Makhana Truffle & Sea Salt gourmet cylindrical tin canister",
    title: "Truffle & Sea Salt Tin",
    flavor: "Connoisseur Reserve Tin",
    glow: "rgba(218, 165, 32, 0.22)",
    accent: "#DAA520",
  },
];

/* --------------------------------------------------------------------------
   Custom Vector Outline Icons matching the Reference Screenshot Exactly
   -------------------------------------------------------------------------- */
function StarRosetteIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 2l2.4 2.4 3.4-.4 1.4 3.1 3.2 1.3-.4 3.4 2.4 2.4-2.4 2.4.4 3.4-3.2 1.3-1.4 3.1-3.4-.4L12 22l-2.4-2.4-3.4.4-1.4-3.1-3.2-1.3.4-3.4L2 12l2.4-2.4-.4-3.4 3.2-1.3 1.4-3.1 3.4.4L12 2z" />
      <polygon points="12 8 13.2 11.2 16.5 11.2 13.8 13.2 14.8 16.5 12 14.5 9.2 16.5 10.2 13.2 7.5 11.2 10.8 11.2 12 8" />
    </svg>
  );
}

function GlobeIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}

function TruckSpeedIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Speed motion lines */}
      <line x1="1" y1="7" x2="6" y2="7" />
      <line x1="3" y1="11" x2="7" y2="11" />
      <line x1="1" y1="15" x2="5" y2="15" />
      {/* Truck body */}
      <rect x="8" y="5" width="11" height="11" rx="1" />
      <path d="M19 9h4l3 3.5V16h-7V9z" />
      {/* Wheels */}
      <circle cx="12" cy="18" r="2" />
      <circle cx="22" cy="18" r="2" />
      <line x1="14" y1="18" x2="20" y2="18" />
    </svg>
  );
}

function ShieldCheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}


/* --------------------------------------------------------------------------
   Four Trust Feature Pillars Data
   -------------------------------------------------------------------------- */
const trustPillars = [
  {
    icon: StarRosetteIcon,
    title: "Premium Quality",
    desc: "Carefully presented to feel refined, giftable, and globally premium.",
  },
  {
    icon: GlobeIcon,
    title: "Worldwide Shipping",
    desc: "Serve international customers with clear global delivery support.",
  },
  {
    icon: TruckSpeedIcon,
    title: "Free Delivery",
    desc: "Highlight free delivery offers clearly to increase checkout conversion.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Secure Purchase",
    desc: "Elegant checkout flow designed for trust, comfort, and quick buying.",
  },
];

const fadeVariants = {
  enter: {
    opacity: 0,
    scale: 0.93,
    filter: "blur(3px)",
  },
  center: {
    zIndex: 1,
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
  },
  exit: {
    zIndex: 0,
    opacity: 0,
    scale: 1.04,
    filter: "blur(3px)",
  },
};

/* --------------------------------------------------------------------------
   Hero Component
   -------------------------------------------------------------------------- */
export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-slide every 3.8s with smooth instant in-place transition
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3800);
    return () => clearInterval(timer);
  }, [isPaused]);

  const activeSlide = slides[currentSlide];

  return (
    <section className="relative overflow-hidden bg-[#111111] pt-[76px] pb-10 sm:pt-[88px] lg:pt-[98px] lg:pb-14 text-white">
      {/* Hidden preloader to guarantee 0ms instant display without load delays */}
      <div className="hidden pointer-events-none" aria-hidden="true">
        {slides.map((s) => (
          <img key={s.src} src={s.src} alt="" decoding="sync" />
        ))}
      </div>

      {/* Ambient warm glow in the background */}
      <div className="pointer-events-none absolute right-0 top-1/4 h-[650px] w-[650px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(215,160,70,0.14)_0%,transparent_70%)] blur-3xl" />
      <div className="pointer-events-none absolute left-1/4 top-1/3 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.03)_0%,transparent_70%)] blur-2xl" />

      <div className="container-x">
        {/* Main Hero Row */}
        <div className="grid items-center gap-8 sm:gap-10 lg:grid-cols-[1.1fr_1.1fr] lg:gap-12 min-h-[460px] sm:min-h-[520px] lg:min-h-[580px]">
          
          {/* Left Column: Heading, Paragraph, Two Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="relative z-10 max-w-xl"
          >
            {/* Header Title with Josefin Sans font */}
            <h1 className="font-heading font-bold text-white text-[32px] xs:text-[38px] sm:text-[50px] lg:text-[62px] leading-[1.1] tracking-tight">
              Premium Makhana for
              <br className="hidden xs:inline" />{" "}
              the Modern World.
            </h1>

            {/* Paragraph Subtitle matching clone text */}
            <p className="mt-4 sm:mt-6 text-[14px] sm:text-[16px] leading-[1.65] text-[#9a9a9a] max-w-lg">
              Crafted for refined taste, elegant gifting, and everyday indulgence &mdash;
              our premium makhana collection is available for online purchase with
              worldwide shipping and free delivery on eligible orders.
            </p>

            {/* Action Buttons */}
            <div className="mt-7 sm:mt-9 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <Link
                href="/shop"
                className="w-full sm:w-auto text-center rounded-xl bg-white px-7 py-3.5 text-[14.5px] font-semibold text-[#111111] transition-all hover:bg-neutral-100 hover:shadow-[0_8px_24px_rgba(255,255,255,0.18)] active:scale-95"
              >
                Shop Collection
              </Link>
              <Link
                href="/about"
                className="w-full sm:w-auto text-center rounded-xl border border-white/25 bg-white/[0.04] px-7 py-3.5 text-[14.5px] font-semibold text-white transition-all hover:border-white/50 hover:bg-white/[0.08] active:scale-95"
              >
                Explore Brand Story
              </Link>
            </div>
          </motion.div>

          {/* Right Column: Instant In-Place Smooth Animated Product Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
            className="relative flex items-center justify-center lg:justify-end"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Stage wrapper holding the floating transparent PNG */}
            <div className="relative w-full max-w-[420px] sm:max-w-[520px] lg:max-w-[560px] h-[280px] sm:h-[400px] lg:h-[480px] flex items-center justify-center">
              {/* Dynamic ambient spotlight glow behind active product */}
              <motion.div
                animate={{
                  background: `radial-gradient(circle, ${activeSlide.glow} 0%, rgba(0,0,0,0) 70%)`,
                }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="pointer-events-none absolute inset-0 rounded-full blur-3xl -z-10"
              />

              {/* Instant In-Place Smooth Animated Auto-Transition (Zero Blank Wait) */}
              <AnimatePresence initial={false} mode="popLayout">
                <motion.div
                  key={currentSlide}
                  variants={fadeVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    duration: 0.65,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  {/* Organic floating levitation micro-animation */}
                  <motion.div
                    animate={{
                      y: [-8, 8, -8],
                      rotate: [-0.8, 0.8, -0.8],
                    }}
                    transition={{
                      duration: 5.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="relative h-full w-full flex items-center justify-center p-3 sm:p-5"
                  >
                    <img
                      src={activeSlide.src}
                      alt={activeSlide.alt}
                      decoding="sync"
                      loading="eager"
                      className="h-full w-full object-contain drop-shadow-[0_28px_45px_rgba(0,0,0,0.85)] filter select-none pointer-events-none"
                    />
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* -------------------------------------------------------------
            Bottom 4 Trust Pillars (Single Rounded Card matching Screenshot)
            ------------------------------------------------------------- */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
          className="mt-8 lg:mt-10 overflow-hidden rounded-[26px] border border-white/10 bg-[#181818] shadow-2xl"
        >
          <div className="grid grid-cols-1 divide-y divide-white/10 sm:grid-cols-2 sm:divide-y-0 sm:divide-x lg:grid-cols-4">
            {trustPillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="flex flex-col gap-2.5 sm:gap-3 p-5 sm:p-7 lg:p-8 transition-colors hover:bg-white/[0.02]"
                >
                  {/* Clean outline icon */}
                  <div className="text-white/90">
                    <Icon className="h-7 w-7" />
                  </div>

                  {/* Header Title with Josefin Sans */}
                  <h3 className="font-heading font-bold text-[18px] text-white tracking-tight">
                    {pillar.title}
                  </h3>

                  {/* Description paragraph */}
                  <p className="text-[13px] leading-relaxed text-[#8a8a8a]">
                    {pillar.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

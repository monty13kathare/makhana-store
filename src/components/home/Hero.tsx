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
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M16 2.5a3.2 3.2 0 0 1 2.7 1.5 3.2 3.2 0 0 0 3 1.2 3.2 3.2 0 0 1 2.8 1.4 3.2 3.2 0 0 0 3.2.6 3.2 3.2 0 0 1 2.6 1.8 3.2 3.2 0 0 0 3 1.4 3.2 3.2 0 0 1 2 2.4 3.2 3.2 0 0 0 2.4 2.2 3.2 3.2 0 0 1 1.2 3 3.2 3.2 0 0 0 1.5 2.9 3.2 3.2 0 0 1 0 3.2 3.2 3.2 0 0 0-1.5 2.9 3.2 3.2 0 0 1-1.2 3 3.2 3.2 0 0 0-2.4 2.2 3.2 3.2 0 0 1-2 2.4 3.2 3.2 0 0 0-3 1.4 3.2 3.2 0 0 1-2.6 1.8 3.2 3.2 0 0 0-3.2.6 3.2 3.2 0 0 1-2.8 1.4 3.2 3.2 0 0 0-3 1.2 3.2 3.2 0 0 1-2.7 1.5 3.2 3.2 0 0 1-2.7-1.5 3.2 3.2 0 0 0-3-1.2 3.2 3.2 0 0 1-2.8-1.4 3.2 3.2 0 0 0-3.2-.6 3.2 3.2 0 0 1-2.6-1.8 3.2 3.2 0 0 0-3-1.4 3.2 3.2 0 0 1-2-2.4 3.2 3.2 0 0 0-2.4-2.2 3.2 3.2 0 0 1-1.2-3 3.2 3.2 0 0 0-1.5-2.9 3.2 3.2 0 0 1 0-3.2 3.2 3.2 0 0 0 1.5-2.9 3.2 3.2 0 0 1 1.2-3 3.2 3.2 0 0 0 2.4-2.2 3.2 3.2 0 0 1 2-2.4 3.2 3.2 0 0 0 3-1.4 3.2 3.2 0 0 1 2.6-1.8 3.2 3.2 0 0 0 3.2-.6 3.2 3.2 0 0 1 2.8-1.4 3.2 3.2 0 0 0 3-1.2A3.2 3.2 0 0 1 16 2.5z" />
      <circle cx="16" cy="16" r="6.8" />
      <polygon
        points="16 11.5 17.3 14.5 20.5 14.5 17.9 16.5 18.9 19.5 16 17.7 13.1 19.5 14.1 16.5 11.5 14.5 14.7 14.5"
        strokeWidth="1.2"
      />
    </svg>
  );
}

function GlobeIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="16" cy="16" r="13" />
      <path d="M10.5 6.5c1 1.5 2.5 2 2.5 3.5 0 1.5-1 2-2 3s-1.5 2-1 3.5c.5 1.5 2 2 2 3.5 0 1-1 2.5-.5 3.5" />
      <path d="M17 4.5c1.5 1 3 1 3 2.5 0 1-1 1.5-1.5 2.5s0 2 1 2.5 2.5 1 2.5 2.5-1.5 2-2 3c-1 1.5-.5 3 0 4.5" />
      <path d="M24 18c1 .5 1.5 1.5 1 2.5s-2 1.5-2.5 1" />
    </svg>
  );
}

function TruckSpeedIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="3" y1="10" x2="10" y2="10" />
      <line x1="1" y1="15" x2="8" y2="15" />
      <line x1="3" y1="20" x2="9" y2="20" />
      <rect x="11" y="8" width="11" height="11" rx="1.5" />
      <path d="M22 12.5h4.5l2.5 3.5V19h-7v-6.5z" />
      <circle cx="14.5" cy="22" r="2.2" />
      <circle cx="25.5" cy="22" r="2.2" />
      <line x1="16.7" y1="22" x2="23.3" y2="22" />
    </svg>
  );
}

function ShieldCheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M16 4.5l10.5 3.5v7.5c0 7.2-4.8 11.8-10.5 13.5-5.7-1.7-10.5-6.3-10.5-13.5V8L16 4.5z" />
      <path d="M11.5 15.5l3.5 3.5 6-6.5" strokeWidth="1.8" />
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
    <section className="relative bg-[#191919] pt-[76px] sm:pt-[88px] lg:pt-[100px] text-white">
      {/* Hidden preloader to guarantee 0ms instant display without load delays */}
      <div className="hidden pointer-events-none" aria-hidden="true">
        {slides.map((s) => (
          <img key={s.src} src={s.src} alt="" decoding="sync" />
        ))}
      </div>

      {/* Ambient warm glow contained inside overflow-hidden to prevent horizontal scroll */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute right-0 top-1/4 h-[650px] w-[650px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(215,160,70,0.14)_0%,transparent_70%)] blur-3xl" />
        <div className="absolute left-1/4 top-1/3 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.03)_0%,transparent_70%)] blur-2xl" />
      </div>

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
            Centered card overflowing across the hero boundary into the next section
            ------------------------------------------------------------- */}
        <div className="relative z-20 mt-12 sm:mt-16 lg:mt-20 -mb-20 sm:-mb-24 lg:-mb-28">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
            style={{
              backdropFilter: "blur(89.5px)",
              WebkitBackdropFilter: "blur(89.5px)",
            }}
            className="relative overflow-hidden rounded-[32px] sm:rounded-[36px] border border-white/[0.08] bg-[#222222]/70 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)]"
          >
            {/* Inset vertical dividers matching reference image (y: 81 to 234) */}
            <div className="hidden lg:block pointer-events-none absolute top-[14%] bottom-[14%] left-1/4 w-[1px] bg-white/[0.08]" />
            <div className="hidden lg:block pointer-events-none absolute top-[14%] bottom-[14%] left-2/4 w-[1px] bg-white/[0.08]" />
            <div className="hidden lg:block pointer-events-none absolute top-[14%] bottom-[14%] left-3/4 w-[1px] bg-white/[0.08]" />

            <div className="grid grid-cols-1 divide-y divide-white/[0.08] sm:grid-cols-2 sm:divide-y-0 sm:divide-x lg:divide-x-0 lg:grid-cols-4">
              {trustPillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={pillar.title}
                    className="flex flex-col p-6 sm:p-7 lg:py-9 lg:px-8 xl:px-9 transition-colors hover:bg-white/[0.02]"
                  >
                    {/* Clean outline icon in white */}
                    <div className="text-white">
                      <Icon className="h-8 w-8" />
                    </div>

                    {/* Header Title with Josefin Sans and font-weight 500 */}
                    <h3 className="mt-5 sm:mt-6 font-heading font-medium text-[19px] sm:text-[20px] text-white tracking-tight leading-snug">
                      {pillar.title}
                    </h3>

                    {/* Description paragraph with Montserrat */}
                    <p className="mt-2.5 sm:mt-3 text-[13px] leading-[1.6] text-[#8a8a8a] max-w-[28ch] sm:max-w-none">
                      {pillar.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

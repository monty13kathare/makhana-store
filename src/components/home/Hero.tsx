"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion, useInView, useMotionValue, useSpring, useTransform, animate } from "framer-motion";
import { EASE } from "../motion-primitives";
import { useMediaQuery, DESKTOP_POINTER } from "@/lib/useMediaQuery";

/* --------------------------------------------------------------------------
   Makhana Slides Data (Real Makhana Product PNGs - Top Luxury Web UI)
   -------------------------------------------------------------------------- */
const slides = [
  {
    src: "/img/hero-clean-jar.png",
    alt: "Artisanal Truffle & Sea Salt whole roasted makhana in luxury gourmet glass jar",
    title: "Truffle & Sea Salt Gourmet Jar",
    flavor: "Gourmet Roasted Fox Nuts",
    glow: "rgba(235, 175, 70, 0.28)",
    accent: "#EBAF46",
  },
  {
    src: "/img/hero-clean-canister.png",
    alt: "Signature Truffle & Sea Salt roasted makhana in luxury black tin canister",
    title: "Luxury Roasted Canister",
    flavor: "Original Crisp & Golden Roasted",
    glow: "rgba(235, 175, 70, 0.28)",
    accent: "#EBAF46",
  },
  {
    src: "/img/hero-clean-pouch.png",
    alt: "Spicy Peri Peri Crunch roasted makhana in luxury stand-up pouch",
    title: "Peri Peri Crunch Pouch",
    flavor: "Scorching & Savory Spices",
    glow: "rgba(255, 107, 74, 0.28)",
    accent: "#FF6B4A",
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
    x: 60,
    scale: 0.95,
  },
  center: {
    zIndex: 1,
    opacity: 1,
    x: 0,
    scale: 1,
  },
  exit: {
    zIndex: 0,
    opacity: 0,
    x: -60,
    scale: 1.05,
  },
};

/* --------------------------------------------------------------------------
   Hero Component
   -------------------------------------------------------------------------- */
export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  // Ambient motion only runs while the hero is on screen; the 3D sway only on
  // mouse-driven desktops (touch devices can't tilt it, and the loop costs
  // main-thread time every frame).
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef);
  const hasMouse = useMediaQuery(DESKTOP_POINTER);

  // Interactive 3D mouse parallax tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), {
    stiffness: 90,
    damping: 22,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), {
    stiffness: 90,
    damping: 22,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  // Auto-animate 3D parallax when not hovered
  useEffect(() => {
    if (isPaused || !hasMouse || !inView) return;

    // Smooth continuous 3D rotation
    const controlsX = animate(mouseX, [0, 0.12, 0, -0.12, 0], {
      duration: 10,
      ease: "easeInOut",
      repeat: Infinity,
      times: [0, 0.25, 0.5, 0.75, 1]
    });

    const controlsY = animate(mouseY, [0, -0.08, 0, 0.08, 0], {
      duration: 10,
      ease: "easeInOut",
      repeat: Infinity,
      times: [0, 0.25, 0.5, 0.75, 1]
    });

    return () => {
      controlsX.stop();
      controlsY.stop();
    };
  }, [isPaused, hasMouse, inView, mouseX, mouseY]);

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsPaused(false);
  };

  // Reset slide index if slides array is shortened
  useEffect(() => {
    if (currentSlide >= slides.length) {
      setCurrentSlide(0);
    }
  }, [currentSlide]);

  // Auto-slide every 5.2s with silky smooth crossfade transition
  useEffect(() => {
    if (isPaused || !inView || slides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5200);
    return () => clearInterval(timer);
  }, [isPaused, inView]);

  const safeIndex = slides.length > 0 ? currentSlide % slides.length : 0;
  const activeSlide = slides[safeIndex] || slides[0] || {
    src: "/img/hero-clean-jar.png",
    alt: "Signature whole roasted makhana",
    title: "Artisanal Whole Roasted Makhana",
    flavor: "Original Himalayan Crisp",
    glow: "rgba(235, 175, 70, 0.28)",
    accent: "#EBAF46",
  };

  return (
    <section ref={sectionRef} className="relative bg-[#191919] pt-[84px] pb-8 sm:pb-0 sm:pt-[128px] lg:pt-[144px] text-white overflow-x-clip">
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
        <div className="grid items-center gap-2 sm:gap-10 lg:grid-cols-[1.05fr_1.15fr] lg:gap-10 sm:min-h-[540px] lg:min-h-[640px] xl:min-h-[680px]">
          
          {/* Left Column: Heading, Paragraph, Two Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="relative z-10 max-w-xl"
          >
            {/* Mobile eyebrow chip */}
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-gold/25 bg-gold/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-gold sm:hidden">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              6-suta · Zero palm oil
            </span>

            {/* Header Title with Josefin Sans font */}
            <h1 className="font-heading font-bold text-white text-[30px] xs:text-[34px] sm:text-[48px] lg:text-[58px] xl:text-[62px] leading-[1.12] tracking-tight break-words">
              Premium Makhana for
              <br className="hidden xs:inline sm:hidden" />{" "}
              the Modern World.
            </h1>

            {/* Paragraph Subtitle matching clone text */}
            <p className="mt-3 sm:mt-6 text-[14px] sm:text-[16px] leading-[1.65] text-[#9a9a9a] max-w-lg break-words">
              Crafted for refined taste, elegant gifting, and everyday indulgence
              <span className="hidden sm:inline">
                {" "}&mdash; our premium makhana collection is available for online purchase with
                worldwide shipping and free delivery on eligible orders
              </span>
              .
            </p>

            {/* Action Buttons (Desktop only - under subtitle) */}
            <div className="mt-7 sm:mt-9 hidden lg:flex flex-row items-center gap-4">
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

          {/* Right Column: 3D Animated Product Showcase with Interactive Parallax & Zero Cutoff */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
            className="relative flex flex-col items-center justify-center lg:items-end [perspective:1200px] w-full"
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={handleMouseLeave}
          >
            {/* 3D Tilting Stage Wrapper - Responsive for all screens */}
            <motion.div
              style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
              }}
              className="relative w-full max-w-[300px] xs:max-w-[360px] sm:max-w-[480px] lg:max-w-[620px] xl:max-w-[680px] h-[280px] xs:h-[330px] sm:h-[440px] lg:h-[550px] xl:h-[600px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
            >
              {/* Dynamic ambient spotlight glow behind active 3D product */}
              <motion.div
                animate={{
                  background: `radial-gradient(circle, ${activeSlide?.glow || "rgba(235, 175, 70, 0.28)"} 0%, rgba(0,0,0,0) 70%)`,
                }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                className="pointer-events-none absolute inset-0 sm:inset-[-8%] lg:inset-[-15%] rounded-full blur-2xl sm:blur-3xl -z-20"
              />

              {/* Dynamic 3D Ground Contact Shadow */}
              <div className="pointer-events-none absolute bottom-0 sm:bottom-2 w-4/5 h-10 sm:h-12 rounded-full bg-black/95 blur-2xl sm:blur-3xl -z-10 anim-breathe" />

              {/* Instant In-Place Smooth Animated Auto-Transition */}
              <AnimatePresence initial={false} mode="popLayout">
                <motion.div
                  key={safeIndex}
                  variants={fadeVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    duration: 0.85,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ transform: "translateZ(25px)" }}
                >
                  {/* Organic floating levitation micro-animation - Scaled larger in desktop */}
                  {/* CSS keyframes (compositor) rather than a JS loop */}
                  <div className="relative h-full w-full flex items-center justify-center p-0 scale-100 lg:scale-[1.14] xl:scale-[1.20] anim-levitate">
                    <img
                      src={activeSlide?.src || "/img/hero-clean-jar.png"}
                      alt={activeSlide?.alt || "Artisanal 3D Makhana"}
                      decoding="sync"
                      loading="eager"
                      className="h-full w-full object-contain drop-shadow-[0_28px_52px_rgba(0,0,0,0.85)] filter select-none pointer-events-none"
                    />
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Slide indicators */}
            <div className="mt-1 flex items-center justify-center gap-2 lg:hidden">
              {slides.map((s, i) => (
                <button
                  key={s.src}
                  type="button"
                  onClick={() => setCurrentSlide(i)}
                  aria-label={`Show ${s.title}`}
                  aria-current={i === safeIndex}
                  className="grid h-10 min-w-9 place-items-center px-1 sm:h-6 sm:min-w-0 sm:px-0.5"
                >
                  <span
                    className={`block h-1.5 rounded-full transition-all duration-500 ${
                      i === safeIndex ? "w-6 bg-gold" : "w-1.5 bg-white/25"
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Action Buttons (Mobile/tablet - shown below product image) */}
            <div className="mt-4 sm:mt-6 grid w-full max-w-md grid-cols-2 gap-3 lg:hidden">
              <Link
                href="/shop"
                className="flex h-12 items-center justify-center rounded-2xl bg-white px-4 text-[14px] font-bold text-[#111111] transition-all active:scale-95"
              >
                Shop now
              </Link>
              <Link
                href="/about"
                className="flex h-12 items-center justify-center rounded-2xl border border-white/20 bg-white/[0.04] px-4 text-[14px] font-semibold text-white transition-all active:scale-95"
              >
                Our story
              </Link>
            </div>
          </motion.div>
        </div>

        {/* -------------------------------------------------------------
            Bottom 4 Trust Pillars (Single Rounded Card matching Screenshot)
            Centered card overflowing across the hero boundary into the next section
            ------------------------------------------------------------- */}
        <div className="relative z-20 mt-8 sm:mt-16 lg:mt-20 sm:-mb-24 lg:-mb-28">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
            className="relative overflow-hidden rounded-[24px] sm:rounded-[32px] lg:rounded-[36px] border border-white/[0.08] bg-[#202020] sm:bg-[#222222]/70 sm:backdrop-blur-[90px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)]"
          >
            {/* Inset vertical dividers matching reference image (y: 81 to 234) */}
            <div className="hidden lg:block pointer-events-none absolute top-[14%] bottom-[14%] left-1/4 w-[1px] bg-white/[0.08]" />
            <div className="hidden lg:block pointer-events-none absolute top-[14%] bottom-[14%] left-2/4 w-[1px] bg-white/[0.08]" />
            <div className="hidden lg:block pointer-events-none absolute top-[14%] bottom-[14%] left-3/4 w-[1px] bg-white/[0.08]" />

            {/* 2x2 on phones/tablets (inner borders via nth-child), 4-up on desktop */}
            <div className="grid grid-cols-2 lg:grid-cols-4">
              {trustPillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={pillar.title}
                    className="flex flex-col border-white/[0.08] p-4 sm:p-7 lg:py-9 lg:px-8 xl:px-9 transition-colors hover:bg-white/[0.02] even:border-l nth-[n+3]:border-t lg:even:border-l-0 lg:nth-[n+3]:border-t-0"
                  >
                    {/* Clean outline icon (gold on phones for quick scanning) */}
                    <div className="text-gold sm:text-white">
                      <Icon className="h-6 w-6 sm:h-8 sm:w-8" />
                    </div>

                    {/* Header Title with Josefin Sans and font-weight 500 */}
                    <h3 className="mt-3 sm:mt-6 font-heading font-medium text-[15px] sm:text-[20px] text-white tracking-tight leading-snug break-words">
                      {pillar.title}
                    </h3>

                    {/* Description paragraph with Montserrat */}
                    <p className="mt-1 sm:mt-2.5 line-clamp-2 sm:line-clamp-none text-[11.5px] sm:text-[13px] leading-[1.5] sm:leading-[1.6] text-[#8a8a8a] break-words">
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

"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ChevronDown, HelpCircle, ArrowRight } from "lucide-react";
import { Reveal, EASE } from "../motion-primitives";
import { useMediaQuery } from "@/lib/useMediaQuery";

/* --------------------------------------------------------------------------
   FAQ Questions Data
   -------------------------------------------------------------------------- */
const faqs = [
  {
    id: "01",
    q: "What makes this Makhana premium?",
    a: "We exclusively grade for 6+ Suta (19mm+ jumbo diameter) seeds. Each kernel is hand-inspected, slow dry-roasted to peak crunch without palm oil, and sealed immediately to preserve airy crispness and delicate natural nutrients.",
    category: "Quality",
  },
  {
    id: "02",
    q: "How do you ensure crispness and long freshness?",
    a: "Our roasts are nitrogen-flushed and packaged in multi-barrier pouches that lock out oxygen and ambient humidity. Every batch remains ultra-crisp for up to 9 months unopened.",
    category: "Freshness",
  },
  {
    id: "03",
    q: "Do you ship internationally?",
    a: "Yes! We partner with global express couriers to ship directly to over 20+ countries worldwide with real-time end-to-end tracking.",
    category: "Shipping",
  },
  {
    id: "04",
    q: "Are your ingredients 100% natural and vegan?",
    a: "All our roasted varieties are completely plant-based (or made with authentic A2 ghee where specified), non-GMO, gluten-free, and crafted with pure gourmet seasonings without artificial preservatives or artificial flavors.",
    category: "Ingredients",
  },
  {
    id: "05",
    q: "Can I customize a gift box for corporate or weddings?",
    a: "Absolutely. We offer custom foiled sleeves, branded ribbons, and personalized cards for corporate gifting and wedding celebrations with minimum orders of 25 boxes.",
    category: "Gifting",
  },
];

/* --------------------------------------------------------------------------
   Realistic Cascading Seasoning Dust Particle Array
   -------------------------------------------------------------------------- */
const seasoningParticles = [
  // Upper stream (emerging from glass jar mouth)
  { id: 1, left: "49%", top: "27%", endY: 185, driftX: 3, size: 2, delay: 0, duration: 1.8, color: "#fcd34d" },
  { id: 2, left: "51%", top: "28%", endY: 180, driftX: -4, size: 1.5, delay: 0.3, duration: 1.9, color: "#f59e0b" },
  { id: 3, left: "48%", top: "30%", endY: 175, driftX: 2, size: 2.2, delay: 0.65, duration: 1.7, color: "#fef3c7" },
  { id: 4, left: "52%", top: "29%", endY: 185, driftX: -2, size: 1.8, delay: 1.05, duration: 2.0, color: "#fbbf24" },
  
  // Mid stream (flowing curve)
  { id: 5, left: "50%", top: "35%", endY: 160, driftX: 4, size: 2.4, delay: 0.2, duration: 1.8, color: "#d97706" },
  { id: 6, left: "47%", top: "37%", endY: 155, driftX: -3, size: 1.8, delay: 0.5, duration: 1.7, color: "#fbbf24" },
  { id: 7, left: "53%", top: "39%", endY: 150, driftX: 2, size: 2, delay: 0.85, duration: 1.9, color: "#fcd34d" },
  { id: 8, left: "49%", top: "42%", endY: 145, driftX: -2, size: 2.8, delay: 1.25, duration: 1.6, color: "#f59e0b" },
  { id: 9, left: "51%", top: "44%", endY: 140, driftX: 3, size: 1.6, delay: 1.6, duration: 1.8, color: "#fef3c7" },
  
  // Lower stream (approaching bowl)
  { id: 10, left: "48%", top: "48%", endY: 130, driftX: -4, size: 2.5, delay: 0.1, duration: 1.7, color: "#f59e0b" },
  { id: 11, left: "52%", top: "51%", endY: 125, driftX: 3, size: 2, delay: 0.4, duration: 1.8, color: "#fbbf24" },
  { id: 12, left: "46%", top: "53%", endY: 120, driftX: -2, size: 2.6, delay: 0.8, duration: 1.6, color: "#d97706" },
  { id: 13, left: "54%", top: "56%", endY: 115, driftX: 4, size: 1.8, delay: 1.15, duration: 1.9, color: "#fcd34d" },
  { id: 14, left: "50%", top: "59%", endY: 110, driftX: -3, size: 2.2, delay: 1.5, duration: 1.7, color: "#fef3c7" },
  
  // Landing dispersion across makhana bowl
  { id: 15, left: "44%", top: "63%", endY: 90, driftX: -5, size: 2.5, delay: 0.35, duration: 1.6, color: "#f59e0b" },
  { id: 16, left: "56%", top: "64%", endY: 85, driftX: 5, size: 2, delay: 0.75, duration: 1.7, color: "#fbbf24" },
  { id: 17, left: "47%", top: "66%", endY: 80, driftX: -2, size: 2.8, delay: 1.05, duration: 1.5, color: "#d97706" },
  { id: 18, left: "53%", top: "67%", endY: 75, driftX: 3, size: 1.8, delay: 1.45, duration: 1.8, color: "#fcd34d" },
  { id: 19, left: "49%", top: "69%", endY: 70, driftX: 1, size: 2.2, delay: 1.85, duration: 1.6, color: "#fef3c7" },
  { id: 20, left: "52%", top: "70%", endY: 65, driftX: -3, size: 2.5, delay: 2.15, duration: 1.5, color: "#f59e0b" },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0); // First item open by default
  // The decorative visual is desktop-only; don't mount (and animate) it on phones.
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  // Interactive 3D mouse parallax tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), {
    stiffness: 85,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), {
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

  const toggle = (i: number) => {
    setOpen((prev) => (prev === i ? null : i));
  };

  return (
    <section id="faq" className="relative py-12 sm:py-16 lg:py-24 bg-[#0a0a0a] text-white overflow-hidden">
      {/* Background warm golden ambient bloom */}
      <div className="pointer-events-none absolute right-1/4 top-1/2 h-[550px] w-[550px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(229,169,60,0.07)_0%,transparent_70%)] blur-3xl -z-0" />

      <div className="container-x relative z-10">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-6 sm:mb-12">
          <Reveal>
            <p className="text-[13.5px] font-medium tracking-wide text-[#8da366]">
              Frequently asked questions
            </p>
            <h2 className="mt-1.5 sm:mt-2 text-[26px] xs:text-[28px] sm:text-[44px] font-heading font-medium tracking-tight text-white leading-[1.12]">
              Everything customers want to know
            </h2>
            <p className="mt-2 sm:mt-3 text-[13.5px] sm:text-[15.5px] text-[#8e8e8e] leading-relaxed">
              Got questions? Explore answers about our grade selection, roasting process, and international delivery.
            </p>
          </Reveal>
        </div>

        {/* Main 2-Column Responsive Grid */}
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14 items-center">
          
          {/* Left Column: 5 Accordion Items + Help CTA */}
          <div className="flex flex-col gap-3.5 order-2 lg:order-1">
            {faqs.map((f, i) => {
              const isOpen = open === i;
              return (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, ease: EASE, delay: i * 0.06 }}
                  className={`group overflow-hidden rounded-[20px] border transition-all duration-300 ${
                    isOpen
                      ? "border-amber-400/40 bg-[#181818] shadow-[0_8px_24px_rgba(245,158,11,0.08)]"
                      : "border-white/10 bg-[#131313] hover:border-white/20 hover:bg-[#161616]"
                  }`}
                >
                  <button
                    onClick={() => toggle(i)}
                    aria-expanded={isOpen}
                    className={`flex w-full items-center justify-between px-5 sm:px-6 py-4.5 text-left transition-colors cursor-pointer ${
                      isOpen ? "text-amber-400" : "text-white group-hover:text-amber-300"
                    }`}
                  >
                    <div className="flex items-center gap-3.5 pr-2">
                      <span
                        className={`font-mono text-[12px] font-bold transition-colors ${
                          isOpen ? "text-amber-400" : "text-white/30 group-hover:text-amber-400/60"
                        }`}
                      >
                        {f.id}
                      </span>
                      <span className="text-[14.5px] sm:text-[15.5px] font-semibold tracking-tight">
                        {f.q}
                      </span>
                    </div>

                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.3, ease: EASE }}
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-colors ${
                        isOpen
                          ? "border-amber-400/40 bg-amber-400/10 text-amber-400"
                          : "border-white/10 bg-white/5 text-white/60 group-hover:border-amber-400/30 group-hover:text-amber-400"
                      }`}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-white/5 px-5 sm:px-6 pl-11 sm:pl-12 pt-3 pb-5 text-[13.5px] sm:text-[14px] leading-relaxed text-[#9e9e9e]">
                          {f.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}

            {/* Bottom Support Helper Card */}
            <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-[20px] border border-white/10 bg-[#161616] p-4.5 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-400/10 border border-amber-400/25 text-amber-400">
                  <HelpCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[13.5px] font-semibold text-white">
                    Have a different question?
                  </p>
                  <p className="text-[12px] text-[#8e8e8e]">
                    Our customer care team is available 24/7 to assist you.
                  </p>
                </div>
              </div>
              <Link
                href="/contact"
                className="shrink-0 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2 text-[12.5px] font-semibold text-white transition-all hover:bg-white hover:text-black hover:border-white active:scale-95"
              >
                <span>Contact Team</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Right Column: 3D Animated Artisanal Seasoning Visual (makhana-3.png) */}
          {isDesktop && (
          <div
            className="relative hidden lg:flex items-center justify-center order-1 lg:order-2 [perspective:1200px]"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {/* Ambient golden glow behind hand & bowl */}
            <motion.div
              animate={{
                scale: [0.92, 1.08, 0.92],
                opacity: [0.3, 0.55, 0.3],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="pointer-events-none absolute h-[380px] w-[380px] sm:h-[450px] sm:w-[450px] rounded-full bg-[radial-gradient(circle,rgba(229,169,60,0.22)_0%,transparent_70%)] blur-3xl -z-10"
            />

            {/* Outer Luxury Showcase Card Backdrop with 3D Tilt */}
            <motion.div
              style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
              }}
              className="relative w-full max-w-[450px] rounded-[32px] sm:rounded-[40px] border border-white/10 bg-gradient-to-b from-[#1a1a1a]/95 to-[#111111]/95 p-6 sm:p-8 backdrop-blur-xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] overflow-hidden"
            >
              {/* Subtle radial sheen overlay */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(229,169,60,0.09)_0%,transparent_65%)]" />

              {/* Floating Seasoning Pouring Hand & Makhana Bowl Container */}
              <motion.div
                animate={{
                  y: [-6, 6, -6],
                  rotate: [-0.6, 0.6, -0.6],
                }}
                transition={{
                  duration: 6.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative z-10 w-full h-[400px] xs:h-[460px] sm:h-[510px] flex items-center justify-center"
              >
                {/* 1. Realistic Luminous Seasoning Stream Core Glow */}
                <motion.div
                  animate={{
                    opacity: [0.35, 0.65, 0.35],
                    scaleY: [0.96, 1.04, 0.96],
                  }}
                  transition={{
                    duration: 2.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="pointer-events-none absolute top-[28%] left-[46%] w-[9%] h-[42%] bg-gradient-to-b from-amber-400/25 via-amber-300/40 to-amber-500/10 blur-[6px] rounded-full"
                />

                {/* 2. Base Makhana Seasoning Pouring PNG (makhana-3.png) */}
                <Image
                  src="/img/makhana-3.png"
                  alt="Hand pouring artisanal golden spice dusting onto whole roasted makhana"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-contain drop-shadow-[0_28px_56px_rgba(0,0,0,0.9)] filter select-none pointer-events-none"
                  priority
                />

                {/* 3. Continuous Realistic Streaming Seasoning Particles */}
                {seasoningParticles.map((p) => (
                  <motion.span
                    key={p.id}
                    animate={{
                      y: [0, p.endY * 0.45, p.endY],
                      x: [0, p.driftX, p.driftX * 1.4],
                      opacity: [0, 0.95, 0.85, 0],
                      scale: [0.5, 1.25, 0.9, 0.3],
                    }}
                    transition={{
                      duration: p.duration,
                      repeat: Infinity,
                      delay: p.delay,
                      ease: "easeIn",
                    }}
                    className="pointer-events-none absolute rounded-full"
                    style={{
                      top: p.top,
                      left: p.left,
                      width: `${p.size}px`,
                      height: `${p.size}px`,
                      backgroundColor: p.color,
                      boxShadow: `0 0 6px ${p.color}`,
                    }}
                  />
                ))}

                {/* 4. Bowl Landing Zone - Golden Dust Impact Mist Cloud */}
                <motion.div
                  animate={{
                    scale: [0.9, 1.18, 0.9],
                    opacity: [0.25, 0.55, 0.25],
                  }}
                  transition={{
                    duration: 3.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="pointer-events-none absolute top-[69%] left-[34%] w-[32%] h-[12%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.38)_0%,rgba(217,119,6,0.18)_50%,transparent_75%)] blur-md"
                />

                {/* 5. Micro Seasoning Sparks Bouncing Off Crunchy Makhana Kernels */}
                {[
                  { left: "43%", top: "72%", delay: 0.4 },
                  { left: "48%", top: "73%", delay: 1.0 },
                  { left: "53%", top: "71%", delay: 1.6 },
                  { left: "57%", top: "74%", delay: 2.1 },
                ].map((s, idx) => (
                  <motion.span
                    key={`bounce-${idx}`}
                    animate={{
                      y: [0, -9, 2],
                      x: [0, idx % 2 === 0 ? -5 : 5, idx % 2 === 0 ? -9 : 9],
                      opacity: [0, 0.9, 0],
                      scale: [0.3, 1.3, 0.2],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: s.delay,
                      ease: "easeOut",
                    }}
                    className="pointer-events-none absolute h-1 w-1 rounded-full bg-amber-200 shadow-[0_0_8px_#fde68a]"
                    style={{ top: s.top, left: s.left }}
                  />
                ))}
              </motion.div>

              {/* Dynamic 3D Ground Contact Shadow */}
              <motion.div
                animate={{
                  scale: [0.88, 1.1, 0.88],
                  opacity: [0.4, 0.7, 0.4],
                }}
                transition={{
                  duration: 6.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 rounded-full bg-black/90 blur-xl -z-10"
              />
            </motion.div>
          </div>
          )}
        </div>
      </div>
    </section>
  );
}

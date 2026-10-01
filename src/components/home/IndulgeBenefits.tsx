"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import { Reveal, EASE } from "../motion-primitives";

/* --------------------------------------------------------------------------
   Custom Vector Icons matching Reference UI
   -------------------------------------------------------------------------- */

// 1. Four-pointed sparkle star icon
function SparkleStarIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 2C12 7.5 7.5 12 2 12C7.5 12 12 16.5 12 22C12 16.5 16.5 12 22 12C16.5 12 12 7.5 12 2Z" />
    </svg>
  );
}

// 2. Diamond cluster icon (4 solid diamonds in a rhombus formation)
function DiamondClusterIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      {/* Top diamond */}
      <rect x="9.5" y="2.2" width="5" height="5" rx="0.4" transform="rotate(45 12 4.7)" />
      {/* Left diamond */}
      <rect x="2.5" y="9.2" width="5" height="5" rx="0.4" transform="rotate(45 5 11.7)" />
      {/* Right diamond */}
      <rect x="16.5" y="9.2" width="5" height="5" rx="0.4" transform="rotate(45 19 11.7)" />
      {/* Bottom diamond */}
      <rect x="9.5" y="16.2" width="5" height="5" rx="0.4" transform="rotate(45 12 18.7)" />
    </svg>
  );
}

// 3. Concentric circles bullseye icon
function TargetConcentricIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className={className}
    >
      <circle cx="12" cy="12" r="9.5" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4.5" strokeWidth="2.4" />
    </svg>
  );
}

// 4. Circular dotted / dashed ring icon
function DottedCircleIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className={className}
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        strokeWidth="2.2"
        strokeDasharray="2.5 3.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* --------------------------------------------------------------------------
   Benefits Data matching Reference UI Texts
   -------------------------------------------------------------------------- */
const benefits = [
  {
    number: "01",
    tag: "Aesthetic",
    icon: SparkleStarIcon,
    title: "Minimal luxury presentation",
    desc: "Clean spacing, elegant typography, and premium tones create a strong first impression.",
  },
  {
    number: "02",
    tag: "Bespoke",
    icon: DiamondClusterIcon,
    title: "Premium Packaging",
    desc: "Luxury-led visual presentation helps justify premium pricing and gifting appeal.",
  },
  {
    number: "03",
    tag: "Direct",
    icon: TargetConcentricIcon,
    title: "Online Purchase Ready",
    desc: "Simple product layout, focused CTAs, and a strong e-commerce buying journey.",
  },
  {
    number: "04",
    tag: "Global",
    icon: DottedCircleIcon,
    title: "Worldwide Appeal",
    desc: "The brand identity is tailored to work for both domestic and international customers.",
  },
];

/* Ambient golden shimmer particles */
const ambientParticles = [
  { x: "12%", y: "24%", size: 3, delay: 0, duration: 4.5 },
  { x: "28%", y: "65%", size: 4, delay: 1.2, duration: 5.6 },
  { x: "46%", y: "20%", size: 3, delay: 0.6, duration: 4.8 },
  { x: "64%", y: "78%", size: 5, delay: 1.9, duration: 6.2 },
  { x: "82%", y: "26%", size: 3, delay: 2.3, duration: 4.4 },
  { x: "92%", y: "62%", size: 4, delay: 0.8, duration: 5.4 },
];

export default function IndulgeBenefits() {
  return (
    <section className="relative overflow-hidden bg-[#101010] py-12 sm:py-24 lg:py-32 text-white">
      {/* --------------------------------------------------------------------
          Subtle Ambient Background Lighting & Radial Gradients
          -------------------------------------------------------------------- */}
      <div className="pointer-events-none absolute -top-24 left-1/4 h-96 w-96 rounded-full bg-amber-500/10 blur-[120px] -z-0" />
      <div className="pointer-events-none absolute -bottom-24 right-1/4 h-96 w-96 rounded-full bg-amber-500/10 blur-[120px] -z-0" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(245,158,11,0.08),transparent)]" />

      {/* Floating Ambient Shimmer Particles (CSS keyframes — compositor only) */}
      {ambientParticles.map((p, idx) => (
        <span
          key={idx}
          className="pointer-events-none absolute rounded-full bg-amber-400/60 shadow-[0_0_12px_rgba(245,158,11,0.7)] anim-twinkle"
          style={
            {
              left: p.x,
              top: p.y,
              width: p.size,
              height: p.size,
              "--dur": `${p.duration}s`,
              "--delay": `${p.delay}s`,
            } as CSSProperties
          }
        />
      ))}

      {/* --------------------------------------------------------------------
          Dynamic Floating Makhana Seeds with Natural Organic Levitation
          -------------------------------------------------------------------- */}

      {/* Top-left: Blurred out-of-focus makhana seed with slow floating drift */}
      <div
        style={{ "--dur": "8.5s" } as CSSProperties}
        className="pointer-events-none absolute -top-8 left-2 sm:left-10 h-32 w-32 sm:h-44 sm:w-44 opacity-50 sm:opacity-75 blur-[7px] -z-0 anim-float-a"
      >
        <Image
          src="/img/makhana-two-seeds.png"
          alt=""
          fill
          className="object-contain"
        />
      </div>

      {/* Bottom-left: Crisp popped makhana cluster with organic floating levitation */}
      <div
        style={{ "--dur": "6.8s" } as CSSProperties}
        className="pointer-events-none absolute hidden sm:block -bottom-6 -left-6 sm:-left-3 sm:-bottom-5 h-36 w-36 sm:h-60 sm:w-60 opacity-60 sm:opacity-100 z-10 anim-float-b"
      >
        {/* Soft amber backlight bloom */}
        <div className="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full scale-75 animate-pulse" />
        <Image
          src="/img/makhana-cluster.png"
          alt="Crisp popped makhana lotus seeds cluster"
          fill
          className="object-contain drop-shadow-[0_22px_45px_rgba(0,0,0,0.95)]"
        />
      </div>

      {/* Bottom-right: Two golden roasted makhana seeds with asynchronous floating */}
      <div
        style={{ "--dur": "7.4s", "--delay": "0.6s" } as CSSProperties}
        className="pointer-events-none absolute hidden sm:block -bottom-4 -right-4 sm:right-10 sm:-bottom-4 h-32 w-32 sm:h-52 sm:w-52 opacity-60 sm:opacity-100 z-10 anim-float-c"
      >
        {/* Soft golden backlight */}
        <div className="absolute inset-0 bg-amber-400/20 blur-2xl rounded-full scale-75 animate-pulse" />
        <Image
          src="/img/makhana-two-seeds.png"
          alt="Two roasted makhana seeds"
          fill
          className="object-contain drop-shadow-[0_22px_45px_rgba(0,0,0,0.95)]"
        />
      </div>

      {/* Far-right: Depth-of-field blurred seed floating in background */}
      <div
        style={{ "--dur": "9.5s", "--delay": "1.2s" } as CSSProperties}
        className="pointer-events-none absolute top-1/2 -right-8 h-40 w-40 opacity-40 blur-[9px] -z-0 anim-float-d"
      >
        <Image
          src="/img/makhana-two-seeds.png"
          alt=""
          fill
          className="object-contain"
        />
      </div>

      {/* Main Content Container */}
      <div className="container-x relative z-10">
        <Reveal>


          {/* Section Heading */}
          <h2 className="mt-3.5 sm:mt-4 font-heading font-bold text-[26px] xs:text-[28px] sm:text-[42px] lg:text-[50px] leading-[1.12] tracking-tight text-white">
            A smarter way to{" "}
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent">
              indulge.
            </span>
          </h2>

          {/* Subtitle Description */}
          <p className="mt-2 sm:mt-4 max-w-2xl text-[13.5px] sm:text-[16px] leading-[1.7] text-[#9a9a9a]">
            Present the product as a premium lifestyle snack — wholesome,
            beautiful, and crafted for a modern audience.
          </p>
        </Reveal>

        {/* 4 Luxury Cards Grid */}
        <div className="mt-6 sm:mt-14 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {benefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, ease: EASE, delay: i * 0.08 }}
                whileHover={{ y: -7 }}
                className="group relative flex flex-col justify-between overflow-hidden rounded-[18px] sm:rounded-[24px] border border-white/[0.08] bg-gradient-to-b from-[#191919]/95 via-[#131313]/95 to-[#0e0e0e]/98 p-4 sm:p-7 backdrop-blur-md transition-all duration-300 hover:border-amber-400/40 shadow-[0_12px_30px_rgba(0,0,0,0.6)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.9),0_0_30px_rgba(245,158,11,0.12)]"
              >
                {/* Radial golden glow sheen on hover */}
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.12),transparent_70%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                <div>
                  {/* Top Row: Glowing Icon Frame & Number Badge */}
                  <div className="flex items-center justify-between mb-3.5 sm:mb-6">
                    <div className="relative flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-400/15 via-white/[0.04] to-transparent border border-amber-400/25 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.12)] transition-all duration-300 group-hover:scale-105 group-hover:border-amber-400/60 group-hover:shadow-[0_0_22px_rgba(245,158,11,0.28)]">
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-amber-300 group-hover:text-amber-200 transition-colors" />
                    </div>

                    <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-0.5 text-[11px] font-mono tracking-wider text-amber-300/80 transition-all duration-300 group-hover:border-amber-400/50 group-hover:bg-amber-400/20 group-hover:text-amber-200">
                      {b.number}
                    </span>
                  </div>

                  {/* Card Title */}
                  <h3 className="font-heading font-bold text-[15px] sm:text-[18.5px] leading-snug text-white tracking-tight group-hover:text-amber-100 transition-colors duration-200">
                    {b.title}
                  </h3>

                  {/* Card Description */}
                  <p className="mt-1.5 sm:mt-2.5 text-[12px] sm:text-[13.5px] leading-[1.55] sm:leading-[1.65] text-[#8e8e8e] group-hover:text-[#a8a8a8] transition-colors duration-200">
                    {b.desc}
                  </p>
                </div>

                {/* Bottom Card Footer with Tag and Dynamic Progress Line */}
                <div className="mt-6 pt-4 border-t border-white/[0.06] hidden sm:flex items-center justify-between">
                  <span className="text-[11px] font-medium tracking-wider uppercase text-white/35 transition-colors duration-300 group-hover:text-amber-400/80">
                    {b.tag}
                  </span>
                  <span className="h-[2px] w-6 rounded-full bg-white/10 transition-all duration-300 group-hover:w-12 group-hover:bg-amber-400/80" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

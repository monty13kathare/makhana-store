"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Reveal, EASE } from "../motion-primitives";

/* --------------------------------------------------------------------------
   Custom Vector Icons matching Reference UI Screenshot Exactly
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
   Benefits Data matching Reference UI Texts Exactly
   -------------------------------------------------------------------------- */
const benefits = [
  {
    icon: SparkleStarIcon,
    title: "Minimal luxury presentation",
    desc: "Clean spacing, elegant typography, and premium tones create a strong first impression.",
  },
  {
    icon: DiamondClusterIcon,
    title: "Premium Packaging",
    desc: "Luxury-led visual presentation helps justify premium pricing and gifting appeal.",
  },
  {
    icon: TargetConcentricIcon,
    title: "Online Purchase Ready",
    desc: "Simple product layout, focused CTAs, and a strong e-commerce buying journey.",
  },
  {
    icon: DottedCircleIcon,
    title: "Worldwide Appeal",
    desc: "The brand identity is tailored to work for both domestic and international customers.",
  },
];

export default function IndulgeBenefits() {
  return (
    <section className="relative overflow-hidden bg-[#111111] py-14 sm:py-20 lg:py-28 text-white">
      {/* --------------------------------------------------------------------
          Background Scattered & Depth-of-Field Makhana Seeds (Matching Reference)
          -------------------------------------------------------------------- */}

      {/* Top-left: Blurred out-of-focus makhana seed with warm golden glow */}
      <div className="pointer-events-none absolute -top-10 left-2 sm:left-10 h-28 w-28 sm:h-44 sm:w-44 opacity-50 sm:opacity-80 blur-[8px] -z-0">
        <Image
          src="/img/makhana-two-seeds.png"
          alt=""
          fill
          className="object-contain"
        />
      </div>
      <div className="pointer-events-none absolute -top-12 -left-12 h-64 w-64 rounded-full bg-amber-500/12 blur-3xl -z-0" />

      {/* Bottom-left: Crisp Indian popped makhana cluster sitting at the bottom edge */}
      <div className="pointer-events-none absolute -bottom-8 -left-8 sm:-left-4 h-32 w-32 sm:h-56 sm:w-56 opacity-40 sm:opacity-100 z-10">
        <Image
          src="/img/makhana-cluster.png"
          alt="Crisp popped makhana lotus seeds cluster"
          fill
          className="object-contain drop-shadow-[0_18px_35px_rgba(0,0,0,0.9)]"
        />
      </div>

      {/* Bottom-right: Two golden roasted makhana seeds resting on the bottom right */}
      <div className="pointer-events-none absolute -bottom-6 -right-6 sm:right-10 h-28 w-28 sm:h-48 sm:w-48 opacity-40 sm:opacity-100 z-10">
        <Image
          src="/img/makhana-two-seeds.png"
          alt="Two roasted makhana seeds"
          fill
          className="object-contain drop-shadow-[0_18px_35px_rgba(0,0,0,0.9)]"
        />
      </div>

      {/* Far-right: Softly blurred makhana seed in the mid-background for camera bokeh depth */}
      <div className="pointer-events-none absolute top-1/2 -right-8 h-40 w-40 opacity-40 blur-[10px] -z-0">
        <Image
          src="/img/makhana-two-seeds.png"
          alt=""
          fill
          className="object-contain"
        />
      </div>

      {/* Ambient warm lighting */}
      <div className="pointer-events-none absolute right-1/4 top-1/3 h-80 w-80 rounded-full bg-amber-500/6 blur-3xl -z-0" />

      {/* Main Content Container */}
      <div className="container-x relative z-10">
        <Reveal>
          {/* Olive / Sage green pre-title */}
          <p className="text-[14px] font-medium tracking-wide text-[#88b04b]">
            Elegant benefits
          </p>

          {/* Section Heading with Josefin Sans font */}
          <h2 className="mt-2.5 sm:mt-3 font-heading font-bold text-[28px] sm:text-[40px] lg:text-[48px] leading-[1.12] tracking-tight text-white">
            A smarter way to indulge.
          </h2>

          {/* Subtitle Description */}
          <p className="mt-3 sm:mt-4 max-w-2xl text-[14px] sm:text-[16px] leading-[1.65] text-[#8e8e8e]">
            Present the product as a premium lifestyle snack — wholesome,
            beautiful, and crafted for a modern audience.
          </p>
        </Reveal>

        {/* 4 Cards Grid */}
        <div className="mt-10 sm:mt-14 grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, ease: EASE, delay: i * 0.08 }}
                whileHover={{ y: -5 }}
                className="group flex flex-col rounded-[20px] sm:rounded-[22px] border border-white/20 bg-[#161616]/95 p-5 sm:p-7 lg:p-8 backdrop-blur-sm transition-all duration-300 hover:border-white/40 hover:bg-[#1a1a1a] shadow-[0_10px_28px_rgba(0,0,0,0.5)]"
              >
                {/* Direct Vector Icon without square container matching Reference Screenshot */}
                <div className="mb-5 sm:mb-7 text-white/95 transition-transform duration-300 group-hover:scale-105">
                  <Icon className="h-7 w-7 text-white" />
                </div>

                {/* Card Title with Josefin Sans */}
                <h3 className="font-heading font-bold text-[17px] text-white tracking-tight">
                  {b.title}
                </h3>

                {/* Card Description */}
                <p className="mt-2.5 text-[13.5px] leading-[1.65] text-[#888888]">
                  {b.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

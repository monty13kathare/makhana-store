"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Reveal, EASE } from "../motion-primitives";

/* --------------------------------------------------------------------------
   3 Brand Pillars Data Matching Reference Screenshot Exactly
   -------------------------------------------------------------------------- */
const pillars = [
  {
    number: "01",
    title: "Minimal luxury presentation",
    desc: "Clean spacing, elegant typography, and premium tones create a strong first impression.",
  },
  {
    number: "02",
    title: "Built for only 3 products",
    desc: "Instead of looking empty, the layout turns a small catalog into a focused premium collection.",
  },
  {
    number: "03",
    title: "Global e-commerce ready",
    desc: "Worldwide shipment, free delivery messaging, and online purchase clarity are all placed upfront.",
  },
];

export default function BrandPillars() {
  return (
    <section className="relative overflow-hidden bg-[#0d0d0d] py-10 sm:py-16 lg:py-20 text-white">
      {/* Soft subtle dark ambient vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.015),transparent_70%)]" />

      <div className="container-x relative z-10">
        {/* ------------------------------------------------------------------
            Top 4 Photographic Sizing Cards in a Single Row (Production Grade UI)
            ------------------------------------------------------------------ */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="mx-auto max-w-7xl"
        >
          <div className="swipe-row gap-3 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
            {/* 1. Card 1: Digital Caliper 19.05 mm */}
            <div className="group relative aspect-[4/3] w-[72vw] max-w-[300px] shrink-0 snap-start sm:w-auto sm:max-w-none overflow-hidden rounded-[20px] sm:rounded-[22px] border border-white/[0.08] bg-[#141414] hover:border-amber-400/40 transition-all duration-500 shadow-xl shadow-black/60 hover:shadow-2xl hover:shadow-amber-500/10">
              <Image
                src="/img/size-caliper.jpg"
                alt="Digital caliper measuring jumbo 19.05mm makhana"
                fill
                sizes="(max-width: 640px) 75vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-108"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/20" />



              {/* Bottom label */}
              <div className="absolute bottom-3 left-3 right-3 z-10">
                <p className="text-[13px] font-semibold text-white tracking-tight">
                  19.05 mm Caliper
                </p>
                <p className="text-[11px] text-white/60">
                  Digital micrometer verified
                </p>
              </div>
            </div>

            {/* 2. Card 2: Ruler & 6 Suta Size Guide */}
            <div className="group relative aspect-[4/3] w-[72vw] max-w-[300px] shrink-0 snap-start sm:w-auto sm:max-w-none overflow-hidden rounded-[20px] sm:rounded-[22px] border border-white/[0.08] bg-[#141414] hover:border-amber-400/40 transition-all duration-500 shadow-xl shadow-black/60 hover:shadow-2xl hover:shadow-amber-500/10">
              <Image
                src="/img/size-ruler.jpg"
                alt="6 Suta 0.75 inch size guide with ruler"
                fill
                sizes="(max-width: 640px) 75vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-108"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/20" />



              {/* Circular callout badge on middle seed */}
              <div className="pointer-events-none absolute left-[44%] top-[34%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/15 bg-white/95 px-2 py-1 text-center shadow-md backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                <span className="block text-[9px] font-bold text-black leading-tight">
                  6 suta
                </span>
                <span className="block text-[8px] text-black/75 leading-tight">
                  0.75 inch
                </span>
              </div>

              {/* Bottom label */}
              <div className="absolute bottom-3 left-3 right-3 z-10">
                <p className="text-[13px] font-semibold text-white tracking-tight">
                  6 Suta Size Guide
                </p>
                <p className="text-[11px] text-white/60">
                  Standard 0.75" physical scale
                </p>
              </div>
            </div>

            {/* 3. Card 3: Hand holding pristine jumbo makhana */}
            <div className="group relative aspect-[4/3] w-[72vw] max-w-[300px] shrink-0 snap-start sm:w-auto sm:max-w-none overflow-hidden rounded-[20px] sm:rounded-[22px] border border-white/[0.08] bg-[#141414] hover:border-amber-400/40 transition-all duration-500 shadow-xl shadow-black/60 hover:shadow-2xl hover:shadow-amber-500/10">
              <Image
                src="/img/size-hand.jpg"
                alt="Hand holding premium grade 6 suta makhana"
                fill
                sizes="(max-width: 640px) 75vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-108"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/20" />

              {/* Wooden-style badge: PREMIUM GRADE: 6 SUTA / 19 MM */}
              <div className="absolute left-3 top-3 z-10 rounded-md border border-[#c89e57]/40 bg-[#dfb26a] px-2.5 py-1 shadow-md backdrop-blur-sm transition-transform duration-300 group-hover:scale-105">
                <p className="text-[8.5px] sm:text-[9px] font-extrabold tracking-wider text-[#1e1503] uppercase leading-tight">
                  PREMIUM GRADE:
                  <br />
                  6 SUTA / 19 MM
                </p>
              </div>

              {/* Bottom label */}
              <div className="absolute bottom-3 left-3 right-3 z-10">
                <p className="text-[13px] font-semibold text-white tracking-tight">
                  Hand-Graded Harvest
                </p>
                <p className="text-[11px] text-white/60">
                  Single-origin whole seeds
                </p>
              </div>
            </div>

            {/* 4. Card 4: Makhana close-up with dimension overlay */}
            <div className="group relative aspect-[4/3] w-[72vw] max-w-[300px] shrink-0 snap-start sm:w-auto sm:max-w-none overflow-hidden rounded-[20px] sm:rounded-[22px] border border-white/[0.08] bg-[#141414] hover:border-amber-400/40 transition-all duration-500 shadow-xl shadow-black/60 hover:shadow-2xl hover:shadow-amber-500/10">
              <Image
                src="/img/size-ruler.jpg"
                alt="Diameter ~19mm 6 suta close-up"
                fill
                sizes="(max-width: 640px) 75vw, (max-width: 1024px) 50vw, 25vw"
                className="scale-125 object-cover object-[50%_28%] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-135"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/20" />

              {/* Dimension measurement callout pill & arrows */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-3">
                <div className="relative flex flex-col items-center justify-center rounded-xl border border-white/20 bg-black/65 px-3 py-1.5 backdrop-blur-md shadow-lg transition-transform duration-300 group-hover:scale-105">
                  <div className="flex items-center gap-1.5 text-white">
                    <span className="text-[9px]">‹</span>
                    <div className="h-[1px] w-5 sm:w-8 bg-white/70" />
                    <span className="text-[9.5px] sm:text-[10.5px] font-bold tracking-wider text-white">
                      DIAMETER: ~19mm
                    </span>
                    <div className="h-[1px] w-5 sm:w-8 bg-white/70" />
                    <span className="text-[9px]">›</span>
                  </div>
                  <span className="text-[9px] font-medium text-white/80">
                    (6 suta / 0.75 inch)
                  </span>
                </div>
              </div>

              {/* Sparkle watermark in bottom-right corner */}
              <div className="pointer-events-none absolute top-3 right-3 text-white/40 transition-colors duration-300 group-hover:text-amber-300">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M12 2L14.2 9.8L22 12L14.2 14.2L12 22L9.8 14.2L2 12L9.8 9.8L12 2Z" />
                </svg>
              </div>

              {/* Bottom label */}
              <div className="absolute bottom-3 left-3 right-3 z-10">
                <p className="text-[13px] font-semibold text-white tracking-tight">
                  Uniform Kernel Caliber
                </p>
                <p className="text-[11px] text-white/60">
                  Consistent airy crunch
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ------------------------------------------------------------------
            Middle Header Text Block (Compact & Well-proportioned)
            ------------------------------------------------------------------ */}
        <div className="mt-8 sm:mt-12">
          <Reveal>
            {/* Olive Green Subtitle Tag */}
            <p className="text-[13px] font-medium tracking-wide text-[#8da366]">
              Why our brand feels premium
            </p>

            {/* Section Heading with Josefin Sans */}
            <h2 className="mt-2 text-[26px] xs:text-[30px] sm:text-[36px] md:text-[40px] lg:text-[44px] font-heading font-bold tracking-tight text-white lg:whitespace-nowrap">
              A refined identity built around modern snacking.
            </h2>

            {/* Subtitle Description */}
            <p className="mt-3 max-w-2xl text-[14px] sm:text-[14.5px] leading-[1.65] text-[#8e8e8e]">
              This UI is designed to make your makhana brand feel luxurious,
              export-ready, and trustworthy for customers purchasing online from
              anywhere in the world.
            </p>
          </Reveal>
        </div>

        {/* ------------------------------------------------------------------
            Bottom 3 Luxury Numbered Cards (Compact & Elegant)
            ------------------------------------------------------------------ */}
        <div className="mt-6 sm:mt-10 grid gap-3 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map((pillar, i) => (
            <motion.div
              key={pillar.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, ease: EASE, delay: i * 0.08 }}
              whileHover={{ y: -5 }}
              className="group flex flex-col justify-between rounded-[18px] sm:rounded-[20px] border border-white/[0.08] bg-[#141414] p-4 sm:p-6 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-[#171717] shadow-md shadow-black/30"
            >
              <div>
                {/* Circular Number Pill (01, 02, 03) */}
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[11px] font-bold text-white/80 transition-colors duration-300 group-hover:border-amber-400/40 group-hover:bg-amber-400/10 group-hover:text-amber-400">
                  {pillar.number}
                </span>

                {/* Card Title */}
                <h3 className="mt-3 sm:mt-4 font-heading font-bold text-[16.5px] sm:text-[17.5px] text-white tracking-tight transition-colors duration-200 group-hover:text-white">
                  {pillar.title}
                </h3>

                {/* Card Description */}
                <p className="mt-2 text-[12.5px] sm:text-[13px] leading-[1.6] text-[#888888] transition-colors duration-200 group-hover:text-[#9e9e9e]">
                  {pillar.desc}
                </p>
              </div>

              {/* Bottom subtle accent bar */}
              <div className="mt-5 pt-3 border-t border-white/[0.05] hidden sm:flex items-center justify-between">
                <span className="text-[10.5px] font-mono uppercase tracking-wider text-white/30 transition-colors duration-300 group-hover:text-amber-400/70">
                  Pillar {pillar.number}
                </span>
                <span className="h-[1.5px] w-6 rounded-full bg-white/10 transition-all duration-300 group-hover:w-10 group-hover:bg-amber-400/80" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

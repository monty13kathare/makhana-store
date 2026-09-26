"use client";

import { motion } from "framer-motion";
import { Reveal, EASE } from "../motion-primitives";

const pillars = [
  {
    number: "01",
    title: "Minimal luxury presentation",
    desc: "Clean branding, elegant typography, subtle depth, deep contrast, weighted focal points.",
  },
  {
    number: "02",
    title: "Curated artisanal craft",
    desc: "Single-origin superfoods roasted in micro-batches with zero artificial preservatives or filler.",
  },
  {
    number: "03",
    title: "Global e-commerce ready",
    desc: "Worldwide currencies, fast delivery messaging, and universal appeal built for modern shoppers.",
  },
];

export default function BrandPillars() {
  return (
    <section className="py-16 lg:py-24">
      <div className="container-x">
        <Reveal>
          {/* Subtitle tag in olive green */}
          <p className="text-[13px] font-semibold tracking-wide text-[#8da366]">
            Why our brand feels premium
          </p>

          <h2 className="mt-2 max-w-3xl text-[32px] font-bold tracking-tight text-white sm:text-[44px] lg:text-[48px]">
            A refined identity built around modern snacking.
          </h2>

          <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-[#8e8e8e] sm:text-[16px]">
            This UI is designed to make your makhana brand feel luxurious,
            export-ready, and trustworthy for customers purchasing online from
            anywhere in the world.
          </p>
        </Reveal>

        {/* 3 Numbered Cards */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map((pillar, i) => (
            <motion.div
              key={pillar.number}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, ease: EASE, delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className="group flex flex-col rounded-[22px] border border-white/10 bg-[#161616] p-7 transition-all duration-300 hover:border-amber-400/30 hover:bg-[#1a1a1a]"
            >
              <span className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-[13px] font-bold text-white/80 transition-colors group-hover:border-amber-400/40 group-hover:text-amber-400 group-hover:bg-amber-400/10">
                {pillar.number}
              </span>

              <h3 className="mt-6 text-[18px] font-bold text-white transition-colors group-hover:text-amber-400">
                {pillar.title}
              </h3>

              <p className="mt-2 text-[13.5px] leading-relaxed text-[#8a8a8a]">
                {pillar.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

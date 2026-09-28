"use client";

import { motion } from "framer-motion";
import { Reveal, EASE } from "../motion-primitives";

const pillars = [
  {
    number: "01",
    title: "Minimal luxury presentation",
    desc: "Clean spacing, elegant typography, and premium tones create a strong first impression.",
  },
  {
    number: "02",
    title: "Focused signature line",
    desc: "Instead of overwhelming shoppers, the layout highlights a curated signature collection with clear buying clarity.",
  },
  {
    number: "03",
    title: "Global e-commerce ready",
    desc: "Worldwide shipment, free delivery messaging, and online purchase clarity are all placed upfront.",
  },
];

export default function BrandPillars() {
  return (
    <section className="py-16 lg:py-24">
      <div className="container-x">
        <Reveal>
          {/* Subtitle tag in olive green */}
          <p className="text-[13.5px] font-medium tracking-wide text-[#8da366]">
            Why our brand feels premium
          </p>

          <h2 className="mt-2.5 text-[28px] xs:text-[34px] sm:text-[40px] md:text-[44px] lg:text-[44px] xl:text-[50px] font-heading font-medium tracking-tight text-white lg:whitespace-nowrap">
            A refined identity built around modern snacking.
          </h2>

          <p className="mt-4 max-w-4xl text-[14.5px] sm:text-[15.5px] leading-relaxed text-[#8e8e8e]">
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
              className="group flex flex-col rounded-[26px] border border-white/10 bg-[#161616] p-7 sm:p-8 transition-all duration-300 hover:border-amber-400/30 hover:bg-[#1a1a1a]"
            >
              <span className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-[13px] font-bold text-white/80 transition-colors group-hover:border-amber-400/40 group-hover:text-amber-400 group-hover:bg-amber-400/10">
                {pillar.number}
              </span>

              <h3 className="mt-6 font-heading font-medium text-[19px] sm:text-[20px] text-white transition-colors group-hover:text-amber-400">
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

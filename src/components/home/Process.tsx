"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Flame, Hand, Package } from "lucide-react";
import { Reveal, StaggerGroup, StaggerItem } from "../motion-primitives";

const steps = [
  {
    icon: Hand,
    title: "Hand-picked at dawn",
    body: "Divers harvest pods from Mithila's ponds before the sun turns the water warm.",
  },
  {
    icon: Flame,
    title: "Roasted in small batches",
    body: "Ten kilos at a time in iron kadhai, so every seed puffs evenly. No industrial dryers.",
  },
  {
    icon: Package,
    title: "Sealed within 48 hours",
    body: "Nitrogen-flushed pouches lock in the snap before it ever has a chance to soften.",
  },
];

export default function Process() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Counter-parallax on the two photographs.
  const leftY = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);
  const rightY = useTransform(scrollYProgress, [0, 1], ["6%", "-6%"]);

  return (
    <section className="pb-20 lg:pb-28">
      <div className="container-x">
        {/* Split photo banner */}
        <div
          ref={ref}
          className="grid overflow-hidden rounded-[24px] border border-white/10 sm:grid-cols-2"
        >
          <motion.div
            style={{ y: leftY }}
            className="relative aspect-[4/3] overflow-hidden"
          >
            <Image
              src="/img/farm-harvest.jpg"
              alt="Lotus pods drying after the morning harvest"
              fill
              sizes="(max-width: 640px) 100vw, 50vw"
              className="scale-110 object-cover"
            />
            <span className="absolute bottom-4 left-4 rounded-lg bg-white/92 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-ink">
              Mithila ponds
            </span>
          </motion.div>

          <motion.div
            style={{ y: rightY }}
            className="relative aspect-[4/3] overflow-hidden border-t border-white/10 sm:border-l sm:border-t-0"
          >
            <Image
              src="/img/grading-seeds.jpg"
              alt="Seeds being graded by size before roasting"
              fill
              sizes="(max-width: 640px) 100vw, 50vw"
              className="scale-110 object-cover"
            />
            <span className="absolute bottom-4 left-4 rounded-lg bg-white/92 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-ink">
              Graded by hand
            </span>
          </motion.div>
        </div>

        {/* Heading + three steps */}
        <Reveal className="mt-14">
          <p className="mb-3 text-[11.5px] font-semibold uppercase tracking-[0.22em] text-gold">
            How it is made
          </p>
          <h2 className="max-w-[26ch] text-[28px] font-extrabold leading-[1.14] tracking-[-0.02em] sm:text-[38px]">
            A crop that takes three days to harvest and{" "}
            <span className="font-display italic text-gold">
              twelve minutes to roast
            </span>
          </h2>
        </Reveal>

        <StaggerGroup className="mt-10 grid overflow-hidden rounded-[24px] border border-white/10 bg-surface sm:grid-cols-3">
          {steps.map((s, i) => (
            <StaggerItem
              key={s.title}
              className={`px-7 py-8 ${
                i > 0 ? "border-t border-white/10 sm:border-l sm:border-t-0" : ""
              }`}
            >
              <s.icon className="mb-4 h-5 w-5 text-gold" />
              <h3 className="mb-2 text-[16px] font-bold">{s.title}</h3>
              <p className="text-[13.5px] leading-relaxed text-dim">{s.body}</p>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}

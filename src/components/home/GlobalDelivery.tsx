"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Globe, Truck, ShieldCheck, Sparkles } from "lucide-react";
import { Reveal, EASE } from "../motion-primitives";

const deliveryFeatures = [
  {
    icon: Globe,
    title: "Worldwide shipment support",
    desc: "Tracked international shipping to 20+ countries.",
  },
  {
    icon: Truck,
    title: "Free delivery messaging",
    desc: "Available for qualifying domestic and regional order sizes.",
  },
  {
    icon: ShieldCheck,
    title: "Secure checkout confidence",
    desc: "100% encrypted transactions with global payment gateways.",
  },
  {
    icon: Sparkles,
    title: "Premium dispatch experience",
    desc: "Hand-inspected and sealed in tamper-proof presentation boxes.",
  },
];

export default function GlobalDelivery() {
  return (
    <section className="py-16 lg:py-24">
      <div className="container-x">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
          {/* Left Column: World Map Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="group relative aspect-[4/3.4] overflow-hidden rounded-[26px] border border-white/10 bg-[#161616] shadow-2xl"
          >
            <Image
              src="/img/map-pins.jpg"
              alt="Delivered across the world map with pins"
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
            />
            {/* Warm golden sunset tone gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-amber-950/20 to-transparent" />

            {/* Glowing route pins overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <span className="absolute top-[32%] left-[28%] flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
              </span>
              <span className="absolute top-[38%] left-[54%] flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
              </span>
              <span className="absolute top-[52%] left-[72%] flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
              </span>
            </div>
          </motion.div>

          {/* Right Column: Copy & 2x2 Feature Grid */}
          <div>
            <Reveal>
              <h2 className="text-[32px] font-bold tracking-tight text-white sm:text-[42px]">
                Delivered Across the World
              </h2>

              <p className="mt-3 text-[15px] leading-relaxed text-[#8e8e8e]">
                Reliable international logistics direct to your doorstep with
                tracking.
              </p>
            </Reveal>

            {/* 2x2 Grid of dark cards */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {deliveryFeatures.map((feat, i) => {
                const Icon = feat.icon;
                return (
                  <motion.div
                    key={feat.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.55, ease: EASE, delay: i * 0.08 }}
                    whileHover={{ y: -4 }}
                    className="group flex flex-col rounded-[20px] border border-white/10 bg-[#161616] p-6 transition-all duration-300 hover:border-amber-400/30 hover:bg-[#1a1a1a]"
                  >
                    <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-white transition-colors group-hover:border-amber-400/40 group-hover:text-amber-400 group-hover:bg-amber-400/10">
                      <Icon className="h-5 w-5 text-white/90 group-hover:text-amber-400" />
                    </span>

                    <h3 className="mt-4 text-[15px] font-bold text-white transition-colors group-hover:text-amber-400">
                      {feat.title}
                    </h3>

                    <p className="mt-1.5 text-[12.5px] leading-relaxed text-[#8a8a8a]">
                      {feat.desc}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

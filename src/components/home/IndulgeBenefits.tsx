"use client";

import { motion } from "framer-motion";
import { Sparkles, PackageCheck, ShoppingCart, Globe2 } from "lucide-react";
import { Reveal, EASE } from "../motion-primitives";

const benefits = [
  {
    icon: Sparkles,
    title: "Minimal luxury presentation",
    desc: "Clean framing, elegant aesthetic, and effortless polish that elevates the brand experience.",
  },
  {
    icon: PackageCheck,
    title: "Premium Packaging",
    desc: "Vacuum-sealed protection preserving crisp freshness and shelf elegance.",
  },
  {
    icon: ShoppingCart,
    title: "Online Purchase Ready",
    desc: "Optimized for smooth orders, seamless carts, and friction-free payment flows.",
  },
  {
    icon: Globe2,
    title: "Worldwide Appeal",
    desc: "Flavours balanced to cater to international palates with premium ingredients.",
  },
];

export default function IndulgeBenefits() {
  return (
    <section className="relative overflow-hidden py-16 lg:py-24">
      {/* Decorative ambient elements */}
      <div className="pointer-events-none absolute left-0 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-amber-500/5 blur-3xl" />
      <div className="pointer-events-none absolute right-0 bottom-0 h-80 w-80 rounded-full bg-amber-500/5 blur-3xl" />

      <div className="container-x relative z-10">
        <Reveal>
          {/* Olive green subtitle tag */}
          <p className="text-[13px] font-semibold tracking-wide text-[#8da366]">
            Elegant benefits
          </p>

          <h2 className="mt-2 text-[32px] font-bold tracking-tight text-white sm:text-[44px]">
            A smarter way to indulge.
          </h2>

          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[#8e8e8e]">
            Present the product as a premium lifestyle snack — wholesome,
            beautiful, and crafted for a modern audience.
          </p>
        </Reveal>

        {/* 4 Cards Grid */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, ease: EASE, delay: i * 0.08 }}
                whileHover={{ y: -6 }}
                className="group flex flex-col rounded-[22px] border border-white/10 bg-[#151515] p-6 transition-all duration-300 hover:border-amber-400/30 hover:bg-[#191919]"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-white transition-colors group-hover:border-amber-400/40 group-hover:text-amber-400 group-hover:bg-amber-400/10">
                  <Icon className="h-5 w-5 text-white/90 group-hover:text-amber-400" />
                </span>

                <h3 className="mt-5 text-[16px] font-bold text-white transition-colors group-hover:text-amber-400">
                  {b.title}
                </h3>

                <p className="mt-2 text-[13px] leading-relaxed text-[#888888]">
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

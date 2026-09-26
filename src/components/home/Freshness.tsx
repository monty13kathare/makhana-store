"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Clock, Leaf, ShieldCheck, Truck } from "lucide-react";
import { Reveal, EASE } from "../motion-primitives";

const points = [
  {
    icon: Clock,
    title: "Roasted to order",
    body: "Batches leave the kadhai the same week they ship.",
  },
  {
    icon: Truck,
    title: "2–4 day delivery",
    body: "Free across India on orders above ₹499.",
  },
  {
    icon: ShieldCheck,
    title: "Nitrogen sealed",
    body: "Oxygen stripped out so the snap survives the journey.",
  },
  {
    icon: Leaf,
    title: "Recyclable packs",
    body: "Mono-material pouches and a plastic-free outer box.",
  },
];

export default function Freshness() {
  return (
    <section className="pb-20 lg:pb-28">
      <div className="container-x">
        <div className="grid items-center gap-10 lg:grid-cols-[0.85fr_1fr] lg:gap-14">
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, ease: EASE }}
            className="relative aspect-[4/5] overflow-hidden rounded-[24px] border border-white/10"
          >
            <Image
              src="/img/roasting-fire.jpg"
              alt="Makhana roasting over an open flame"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
          </motion.div>

          <div>
            <Reveal>
              <p className="mb-3 text-[11.5px] font-semibold uppercase tracking-[0.22em] text-gold">
                Freshness
              </p>
              <h2 className="max-w-[18ch] text-[28px] font-extrabold leading-[1.14] tracking-[-0.02em] sm:text-[38px]">
                Delivered fresh,{" "}
                <span className="font-display italic text-gold">not stale</span>
              </h2>
              <p className="mt-4 max-w-[46ch] text-[14.5px] leading-relaxed text-muted">
                Most makhana on a shelf was roasted months ago. Ours is made in
                the same fortnight it reaches you, and we print the roast date on
                every pack.
              </p>
            </Reveal>

            <div className="mt-9 grid gap-x-8 gap-y-7 sm:grid-cols-2">
              {points.map((p, i) => (
                <motion.div
                  key={p.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.55, ease: EASE, delay: i * 0.08 }}
                  className="flex gap-3.5"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/12 bg-white/5">
                    <p.icon className="h-[17px] w-[17px] text-gold" />
                  </span>
                  <div>
                    <h3 className="text-[15px] font-bold">{p.title}</h3>
                    <p className="mt-1 text-[13px] leading-relaxed text-dim">
                      {p.body}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Reveal, EASE } from "../motion-primitives";

const perks = [
  "Includes all 3 signature flavours in airtight presentation jars",
  "Crafted with recycled luxury matte board packaging",
  "Custom gift ribbon & personalized message note options",
];

export default function Gifting() {
  return (
    <section className="py-12 lg:py-20">
      <div className="container-x">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#161616] p-7 sm:p-10 lg:p-14"
        >
          {/* Subtle golden background glow */}
          <div className="pointer-events-none absolute right-0 top-1/2 h-[450px] w-[450px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(229,169,60,0.12)_0%,transparent_70%)] blur-2xl" />

          <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
            {/* Left Copy */}
            <div>
              <Reveal>
                <h2 className="text-[30px] font-bold tracking-tight text-white sm:text-[40px]">
                  The Premium Gifting Box
                </h2>

                <p className="mt-4 max-w-xl text-[14.5px] leading-relaxed text-[#949494] sm:text-[15.5px]">
                  An exquisite curation crafted for festive celebrations,
                  corporate gifting, and luxury snacking boxes.
                </p>

                <ul className="mt-6 flex flex-col gap-3.5">
                  {perks.map((p, i) => (
                    <motion.li
                      key={p}
                      initial={{ opacity: 0, x: -14 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, ease: EASE, delay: i * 0.1 }}
                      className="flex items-center gap-3 text-[14px] text-white/90"
                    >
                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-white/20 bg-white/10 text-white">
                        <Check className="h-3 w-3 stroke-[2.5]" />
                      </span>
                      <span>{p}</span>
                    </motion.li>
                  ))}
                </ul>

                <div className="mt-8">
                  <Link
                    href="/gifting"
                    className="inline-block rounded-full border border-white/20 bg-white/5 px-7 py-3 text-[14px] font-semibold text-white transition-all hover:border-amber-400/40 hover:text-amber-400 hover:bg-amber-400/10 active:text-amber-300 active:scale-95"
                  >
                    Buy Gift Box
                  </Link>
                </div>
              </Reveal>
            </div>

            {/* Right Image: Luxury Gift Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.8, ease: EASE }}
              className="relative aspect-[4/3] w-full overflow-hidden rounded-[20px] bg-[#1a1a1a] shadow-2xl"
            >
              <Image
                src="/img/gift-box.jpg"
                alt="The Premium Gifting Box with curated makhana"
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

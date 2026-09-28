"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Reveal, EASE } from "../motion-primitives";

const perks = [
  "Includes all 3 signature flavours in one premium presentation.",
  "Perfect for boosting average order value and creating a hero product.",
  "Strong option for luxury gifting, festive campaigns, and global customers.",
];

export default function Gifting() {
  return (
    <section className="py-14 lg:py-24 relative overflow-hidden bg-[#0a0a0a]">
      <div className="container-x">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="relative overflow-hidden rounded-[32px] sm:rounded-[40px] lg:rounded-[48px] border border-white/[0.08] bg-[#1d1d1d] p-8 sm:p-12 lg:p-16 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)]"
        >
          {/* Subtle warm ambient background glow */}
          <div className="pointer-events-none absolute right-1/4 top-1/2 h-[450px] w-[450px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(229,169,60,0.08)_0%,transparent_70%)] blur-3xl" />

          <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
            {/* Left Column: Heading, Subtitle, Checkmarks, Buy Gift Box button */}
            <div className="order-2 lg:order-1">
              <Reveal>
                <h2 className="text-[34px] sm:text-[44px] lg:text-[52px] font-heading font-medium tracking-tight text-white leading-[1.15]">
                  The Premium Gifting Box
                </h2>

                <p className="mt-5 max-w-xl text-[14.5px] leading-relaxed text-[#9e9e9e] sm:text-[15.5px]">
                  A curated gift-ready box featuring all three makhana variants &mdash; ideal for
                  first-time buyers, festive gifting, and premium brand positioning.
                </p>

                <ul className="mt-7 flex flex-col gap-4">
                  {perks.map((p, i) => (
                    <motion.li
                      key={p}
                      initial={{ opacity: 0, x: -14 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, ease: EASE, delay: i * 0.1 }}
                      className="flex items-center gap-3.5 text-[14px] sm:text-[14.5px] text-[#b0b0b0]"
                    >
                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/10 text-white/70">
                        <Check className="h-3 w-3 stroke-[2.5]" />
                      </span>
                      <span>{p}</span>
                    </motion.li>
                  ))}
                </ul>

                <div className="mt-9">
                  <Link
                    href="/gifting"
                    className="inline-block rounded-full border border-white/20 bg-transparent px-8 py-3.5 text-[14px] font-medium text-white transition-all hover:bg-white hover:text-black hover:border-white active:scale-95"
                  >
                    Buy Gift box
                  </Link>
                </div>
              </Reveal>
            </div>

            {/* Right Column: Inner Rounded Card Backdrop + Open 3-Section Makhana Box PNG */}
            <div className="relative order-1 lg:order-2 flex items-center justify-center">
              {/* Inner grey backdrop card matching screenshot */}
              <div className="absolute inset-x-4 inset-y-4 sm:inset-x-6 sm:inset-y-6 rounded-[28px] sm:rounded-[36px] bg-[#2a2a2a] -z-0" />

              {/* Floating Gift Box with red ribbon (makhana-1.png) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.8, ease: EASE }}
                className="relative z-10 w-full aspect-[4/3] flex items-center justify-center p-3 sm:p-5"
              >
                <Image
                  src="/img/makhana-1.png"
                  alt="The Premium Gifting Box featuring all 3 roasted makhana flavours"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-contain drop-shadow-[0_24px_36px_rgba(0,0,0,0.7)] transition-transform duration-700 hover:scale-105"
                  priority
                />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { EASE } from "../motion-primitives";

export default function SizeGuide() {
  return (
    <section className="py-12 lg:py-16">
      <div className="container-x">
        {/* 4-Grid Photographic Collage */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="overflow-hidden rounded-[28px] border border-white/10 bg-[#161616] p-3 sm:p-4 shadow-2xl"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            {/* Top-Left: Digital Caliper 19.05mm */}
            <div className="group relative aspect-[4/3] overflow-hidden rounded-[20px] bg-[#1a1a1a]">
              <Image
                src="/img/size-caliper.jpg"
                alt="Digital caliper measuring jumbo 19.05mm makhana"
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
              />
            </div>

            {/* Top-Right: Ruler 6 Suta Size Guide */}
            <div className="group relative aspect-[4/3] overflow-hidden rounded-[20px] bg-[#1a1a1a]">
              <Image
                src="/img/size-ruler.jpg"
                alt="6 Suta 0.75 inch size guide with ruler"
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
              />
            </div>

            {/* Bottom-Left: Hand holding pristine jumbo makhana with badge */}
            <div className="group relative aspect-[4/3] overflow-hidden rounded-[20px] bg-[#1a1a1a]">
              <Image
                src="/img/size-hand.jpg"
                alt="Hand holding premium grade 6 suta makhana"
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
              />
              {/* Badge: PREMIUM GRADE: 6 SUTA / 19 MM */}
              <div className="absolute left-4 top-4 z-10 rounded-lg border border-amber-300/30 bg-[#dfb26a]/90 px-3.5 py-1.5 shadow-lg backdrop-blur-md">
                <p className="text-[11px] font-extrabold tracking-wider text-[#1e1503] uppercase">
                  PREMIUM GRADE: 6 SUTA / 19 MM
                </p>
              </div>
            </div>

            {/* Bottom-Right: Makhana close-up with dimension overlay */}
            <div className="group relative aspect-[4/3] overflow-hidden rounded-[20px] bg-[#1a1a1a]">
              <Image
                src="/img/size-ruler.jpg"
                alt="Diameter ~19mm 6 suta close-up"
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="scale-125 object-cover object-[50%_28%] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-135"
              />
              <div className="absolute inset-0 bg-black/20" />

              {/* Dimension measurement callout pill & arrows */}
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="relative flex flex-col items-center justify-center rounded-2xl border border-white/20 bg-black/60 px-5 py-2.5 backdrop-blur-md shadow-xl">
                  {/* Dimension Line & Arrows */}
                  <div className="flex items-center gap-2 text-white">
                    <span className="text-xs">‹</span>
                    <div className="h-[1px] w-12 bg-white/70" />
                    <span className="text-[12px] font-bold tracking-wider text-white">
                      DIAMETER: ~19mm
                    </span>
                    <div className="h-[1px] w-12 bg-white/70" />
                    <span className="text-xs">›</span>
                  </div>
                  <span className="text-[11px] font-medium text-white/80">
                    (6 suta / 0.75 inch)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

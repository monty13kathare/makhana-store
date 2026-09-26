"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Award,
  Globe,
  ShieldCheck,
  Truck,
  Sparkles,
  Star,
  Check,
  Flame,
} from "lucide-react";
import { EASE } from "../motion-primitives";

const makhanaImages = [
  {
    src: "/img/hero-platter.jpg",
    alt: "Premium roasted makhana on rustic wooden platter",
    tag: "6+ Suta Jumbo",
    flavor: "Whole Roasted Fox Nuts",
    rating: "4.9",
    reviews: "2.8k+",
    highlight: "Grade A Selection",
  },
  {
    src: "/img/bowl-classic.jpg",
    alt: "Classic Himalayan Salt roasted makhana",
    tag: "Artisanal Bestseller",
    flavor: "Classic Himalayan Salt",
    rating: "4.9",
    reviews: "1.2k+",
    highlight: "Pink Mineral Salt",
  },
  {
    src: "/img/bowl-peri.jpg",
    alt: "Fiery Peri Peri roasted makhana",
    tag: "Smoky & Fiery",
    flavor: "Peri Peri Crunch",
    rating: "4.8",
    reviews: "940+",
    highlight: "African Bird's Eye",
  },
  {
    src: "/img/bowl-cheese.jpg",
    alt: "Truffle Black Pepper gourmet makhana",
    tag: "Chef's Selection",
    flavor: "Truffle Black Pepper",
    rating: "4.9",
    reviews: "610+",
    highlight: "Italian Black Truffle",
  },
];

const trustFeatures = [
  {
    icon: Award,
    title: "Premium Quality",
    desc: "Carefully selected 6+ suta fox nuts, crisp and rich in natural nutrients.",
  },
  {
    icon: Globe,
    title: "Worldwide Shipping",
    desc: "Hand-selected batches shipped with our global courier partners.",
  },
  {
    icon: Truck,
    title: "Free Delivery",
    desc: "Free Worldwide Express Delivery on orders over $49.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Purchase",
    desc: "256-bit encrypted checkout flow designed for seamless, secure ordering.",
  },
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-slide every 3.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % makhanaImages.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const activeSlideData = makhanaImages[currentSlide];

  return (
    <section className="relative overflow-hidden pt-[116px] pb-16 lg:pt-[130px] lg:pb-24">
      {/* Background ambient radial glow */}
      <div className="pointer-events-none absolute right-0 top-1/4 h-[600px] w-[600px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(229,169,60,0.18)_0%,transparent_70%)] blur-3xl opacity-80" />

      <div className="container-x">
        {/* Main Hero Grid */}
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
          {/* Left Copy */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="relative z-10 max-w-xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-amber-300 mb-4">
              <Sparkles className="h-3 w-3" />
              <span>Slow-Roasted in Pure A2 Ghee</span>
            </div>

            <h1 className="text-[38px] font-bold leading-[1.12] tracking-tight text-white sm:text-[50px] lg:text-[56px]">
              Premium Makhana for the Modern World.
            </h1>

            <p className="mt-5 text-[15px] leading-relaxed text-[#9a9a9a] sm:text-[16px]">
              Crafted for refined snacking, elegant gifting, and everyday
              indulgence &mdash; our premium roasted fox nuts deliver special crisp
              texture with mindful health benefits. Enjoy fast delivery on
              eligible orders.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/shop"
                className="rounded-full bg-white px-7 py-3.5 text-[14px] font-semibold text-black transition-all hover:bg-amber-400 hover:text-black active:bg-amber-300 active:scale-95 shadow-lg shadow-white/10"
              >
                Shop Collection
              </Link>
              <Link
                href="/about"
                className="rounded-full border border-white/20 bg-white/[0.04] px-7 py-3.5 text-[14px] font-semibold text-white transition-all hover:border-amber-400/40 hover:text-amber-400 hover:bg-amber-400/10 active:text-amber-300 active:scale-95"
              >
                Explore Our Story
              </Link>
            </div>
          </motion.div>

          {/* Right: Clean Auto-Sliding Animated Makhana Images + Floating Responsive Items */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
            className="relative flex items-center justify-center lg:justify-end"
          >
            {/* Outer Stage Wrapper hosting the floating items */}
            <div className="relative aspect-square w-full max-w-[490px] lg:max-w-[550px]">
              {/* Outer soft ambient glow */}
              <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(229,169,60,0.22)_0%,transparent_70%)] blur-2xl -z-10" />

              {/* 1. Floating Card: Upper-Left (Dynamic Roast & Flavour Details) */}
              <motion.div
                animate={{ y: [-4, 4, -4], rotate: [0, 1.2, 0] }}
                transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-4 -left-2 sm:top-8 sm:-left-7 lg:top-10 lg:-left-9 z-20 flex items-center gap-2.5 sm:gap-3 rounded-2xl border border-amber-400/35 bg-[#141414]/95 p-2.5 sm:p-3.5 shadow-[0_16px_36px_rgba(0,0,0,0.85)] backdrop-blur-xl ring-1 ring-amber-400/20 max-w-[200px] sm:max-w-[225px]"
              >
                <div className="grid h-8 w-8 sm:h-9 sm:w-9 shrink-0 place-items-center rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-400">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeSlideData.flavor}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p className="truncate text-[11.5px] sm:text-[12.5px] font-bold text-white flex items-center gap-1">
                        <span className="truncate">{activeSlideData.flavor}</span>
                        <Check className="h-3 w-3 text-amber-400 stroke-[3] shrink-0" />
                      </p>
                      <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-[#909090] mt-0.5">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />
                        <span className="font-semibold text-white">{activeSlideData.rating}</span>
                        <span className="truncate">({activeSlideData.reviews})</span>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* 2. Floating Card: Lower-Right (A2 Ghee & Nutritional Purity) */}
              <motion.div
                animate={{ y: [4, -4, 4], rotate: [0, -1.2, 0] }}
                transition={{ duration: 5.4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-8 -right-2 sm:bottom-12 sm:-right-6 lg:bottom-14 lg:-right-8 z-20 flex items-center gap-2.5 sm:gap-3 rounded-2xl border border-white/15 bg-[#141414]/95 p-2.5 sm:p-3.5 shadow-[0_16px_36px_rgba(0,0,0,0.85)] backdrop-blur-xl ring-1 ring-white/10 max-w-[210px] sm:max-w-[235px]"
              >
                <div className="grid h-8 w-8 sm:h-9 sm:w-9 shrink-0 place-items-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  <Flame className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[11.5px] sm:text-[12.5px] font-bold text-white flex items-center gap-1.5">
                    <span>100% Pure A2 Ghee</span>
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400 animate-pulse" />
                  </p>
                  <p className="truncate text-[10px] sm:text-[11px] text-[#909090] mt-0.5">
                    9.7g Protein &middot; Zero Palm Oil
                  </p>
                </div>
              </motion.div>

              {/* Main Image Frame with overflow-hidden */}
              <div className="relative h-full w-full overflow-hidden rounded-[32px] border border-white/10 bg-[#141414] shadow-2xl">
                {/* Animated Slides */}
                <AnimatePresence mode="sync">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, scale: 1.08 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 1, ease: EASE }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={makhanaImages[currentSlide].src}
                      alt={makhanaImages[currentSlide].alt}
                      fill
                      priority
                      sizes="(max-width: 1024px) 90vw, 45vw"
                      className="object-cover"
                    />
                    {/* Subtle soft edge vignette */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                  </motion.div>
                </AnimatePresence>

                {/* Minimalist Slide Dots Indicator */}
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 rounded-full bg-black/50 px-3 py-1.5 backdrop-blur-md border border-white/10">
                  {makhanaImages.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentSlide(idx)}
                      aria-label={`Go to slide ${idx + 1}`}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        currentSlide === idx
                          ? "w-6 bg-amber-400 shadow-sm shadow-amber-400/50"
                          : "w-2 bg-white/30 hover:bg-white/60"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Four Trust / Value Proposition Pillars */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.2 }}
          className="mt-14 lg:mt-20 overflow-hidden rounded-[24px] border border-white/10 bg-[#141414]/90 backdrop-blur-md"
        >
          <div className="grid grid-cols-1 divide-y divide-white/10 sm:grid-cols-2 sm:divide-y-0 sm:divide-x lg:grid-cols-4">
            {trustFeatures.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="group flex flex-col gap-3 p-6 sm:p-7 transition-colors hover:bg-amber-400/[0.02]"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 text-white transition-colors group-hover:border-amber-400/40 group-hover:text-amber-400 group-hover:bg-amber-400/10">
                    <Icon className="h-5 w-5 text-white/90 group-hover:text-amber-400" />
                  </span>
                  <h3 className="text-[16px] font-bold text-white transition-colors group-hover:text-amber-400">
                    {feat.title}
                  </h3>
                  <p className="text-[12.5px] leading-relaxed text-[#8a8a8a]">
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

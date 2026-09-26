"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Reveal, EASE } from "../motion-primitives";

const testimonials = [
  {
    quote:
      "The flavor profile is delicate and genuinely gourmet. It feels like enjoying a luxury snack brand rather than a regular bagged lotus seed.",
    name: "Elena M.",
    role: "Verified Buyer",
    avatar: "/img/avatar-1.jpg",
  },
  {
    quote:
      "The best packaging I have seen for makhana. Incredibly crisp, zero greasy feel, and perfect evening snacking.",
    name: "Ryan H.",
    role: "Verified Buyer",
    avatar: "/img/avatar-2.jpg",
  },
  {
    quote:
      "A smooth online purchase experience and the presentation box exceeded expectations from the moment it arrived.",
    name: "Sophia K.",
    role: "Verified Buyer",
    avatar: "/img/avatar-3.jpg",
  },
];

export default function Testimonials() {
  return (
    <section className="py-16 lg:py-24">
      <div className="container-x">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          {/* Left Column: Heading & Carousel Indicators */}
          <div className="flex flex-col justify-between">
            <Reveal>
              <p className="text-[13px] font-semibold tracking-wide text-[#8da366]">
                Customer reviews
              </p>

              <h2 className="mt-2 text-[32px] font-bold tracking-tight text-white sm:text-[44px]">
                A premium experience people remember.
              </h2>

              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[#8e8e8e]">
                Read genuine reviews from customers who have upgraded their
                daily snacking.
              </p>
            </Reveal>

            {/* Slider Dots Indicator */}
            <div className="mt-10 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
              <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
              <span className="h-1.5 w-8 rounded-full bg-white/90" />
            </div>
          </div>

          {/* Right Column: 3 White/Silver Testimonial Cards */}
          <div className="flex flex-col gap-4">
            {testimonials.map((t, i) => (
              <motion.figure
                key={t.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, ease: EASE, delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="rounded-[20px] bg-white p-6 sm:p-7 text-black shadow-xl transition-transform duration-300"
              >
                <blockquote className="text-[14px] leading-relaxed text-[#2a2a2a] sm:text-[14.5px]">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>

                <figcaption className="mt-4 flex items-center gap-3">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-neutral-200">
                    <Image
                      src={t.avatar}
                      alt={t.name}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-black">
                      {t.name}
                    </h3>
                    <p className="text-[11.5px] text-[#717171]">{t.role}</p>
                  </div>
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

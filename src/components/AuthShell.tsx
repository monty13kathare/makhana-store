"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { EASE } from "./motion-primitives";
import type { ReactNode } from "react";

/**
 * Split auth layout from the Figma: product photography on the left,
 * a dark form panel on the right with makhana drifting in the corner.
 */
export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section className="pt-[92px]">
      <div className="container-x py-8 lg:py-12">
        <div className="grid overflow-hidden rounded-[24px] border border-white/10 lg:grid-cols-2">
          {/* Left — photography */}
          <motion.div
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: EASE }}
            className="relative hidden min-h-[580px] lg:block bg-black"
          >
            <Image
              src="/img/login-jar.png"
              alt="A jar of premium roasted makhana"
              fill
              priority
              sizes="50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/40" />
          </motion.div>

          {/* Right — form panel */}
          <div className="relative flex min-h-[520px] items-center overflow-hidden bg-[#0d0d0d] px-7 py-14 sm:px-14 lg:min-h-[580px]">
            <div className="glow-warm pointer-events-none absolute -right-24 top-0 h-[420px] w-[420px] opacity-20" />

            {/* Floating corner makhana from Figma */}
            <div className="pointer-events-none absolute -bottom-1 -right-1 w-20 sm:w-24 select-none opacity-85 z-0">
              <Image
                src="/img/login-corner-makhana.png"
                alt=""
                width={96}
                height={140}
                className="object-contain"
              />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease: EASE, delay: 0.15 }}
              className="relative z-10 w-full max-w-[360px] mx-auto lg:mx-0"
            >
              <Link
                href="/"
                className="mb-8 inline-flex items-center gap-1.5 text-[12.5px] text-dim transition-colors hover:text-white"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to store
              </Link>

              <h1 className="text-[28px] font-extrabold tracking-[-0.02em]">
                {title}
              </h1>
              <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
                {subtitle}
              </p>

              <div className="mt-8">{children}</div>

              {footer && <div className="mt-6">{footer}</div>}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

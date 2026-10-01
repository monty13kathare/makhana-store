"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Leaf, ShieldCheck, Sparkles } from "lucide-react";
import { EASE } from "./motion-primitives";
import type { CSSProperties, ReactNode } from "react";

const PERKS = [
  { icon: Leaf, label: "Zero palm oil" },
  { icon: Sparkles, label: "6-suta grade" },
  { icon: ShieldCheck, label: "Secure login" },
];

/**
 * Auth layout. Mobile: full-screen app view — photography on top, a bottom
 * sheet that rises over it. Desktop: split card with photography on the left.
 */
export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
  backHref = "/",
  backLabel = "Back to store",
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <section className="relative min-h-[100dvh] bg-ink lg:flex lg:items-center lg:py-10">
      <div className="lg:mx-auto lg:w-full lg:max-w-300 lg:px-8">
        <div className="relative flex min-h-[100dvh] flex-col lg:grid lg:min-h-[640px] lg:grid-cols-2 lg:overflow-hidden lg:rounded-[28px] lg:border lg:border-white/10 lg:shadow-[0_40px_120px_-40px_rgba(229,169,60,0.25)]">
          {/* Photography — top hero on mobile, left panel on desktop */}
          <motion.div
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: EASE }}
            className="relative h-[38dvh] min-h-[260px] shrink-0 overflow-hidden bg-black lg:h-auto lg:min-h-0"
          >
            {/* Warm glow behind the 3D render */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/25 blur-[80px] lg:top-[42%]" />

            {/* Gentle float gives the render some depth */}
            <div
              style={{ "--dur": "6s" } as CSSProperties}
              className="absolute inset-0 lg:top-[-8%] lg:bottom-[8%] anim-float-e"
            >
              <Image
                src="/img/hero-3d-jar.jpg"
                alt="A jar of premium truffle & sea salt makhana"
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover lg:object-contain lg:scale-110"
              />
            </div>

            {/* Mobile: fade into the sheet. Desktop: dark base for the caption. */}
            <div className="absolute inset-0 bg-linear-to-b from-black/40 via-transparent to-ink lg:bg-linear-to-t lg:from-black lg:via-transparent lg:to-transparent" />

            {/* Desktop caption */}
            <div className="absolute inset-x-0 bottom-0 hidden p-10 lg:block">
              <p className="font-display text-[13px] uppercase tracking-[0.28em] text-gold">
                Members get more
              </p>
              <p className="mt-3 max-w-sm text-[22px] font-bold leading-snug text-white">
                Early access to new flavours, faster checkout &amp; order tracking.
              </p>
            </div>
          </motion.div>

          {/* Mobile floating top bar */}
          <div
            className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-4 lg:hidden"
            style={{ paddingTop: "calc(env(safe-area-inset-top) + 12px)" }}
          >
            <Link
              href={backHref}
              aria-label={backLabel}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white backdrop-blur-md transition-transform active:scale-90"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </div>

          {/* Form panel — bottom sheet on mobile */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
            className="relative z-10 -mt-8 flex flex-1 flex-col overflow-hidden rounded-t-[28px] border-t border-white/10 bg-ink lg:mt-0 lg:items-center lg:justify-center lg:rounded-none lg:border-t-0 lg:bg-[#0d0d0d]"
          >
            <div className="glow-warm pointer-events-none absolute -right-24 top-0 h-[420px] w-[420px] opacity-20" />

            {/* Sheet grabber (decorative) */}
            <div className="mx-auto mt-3 h-1.5 w-10 rounded-full bg-white/15 lg:hidden" />

            {/* Floating corner makhana */}
            <div className="pointer-events-none absolute -bottom-1 -right-1 z-0 hidden w-24 select-none opacity-85 lg:block">
              <Image
                src="/img/login-corner-makhana.png"
                alt=""
                width={96}
                height={140}
                className="object-contain"
              />
            </div>

            <div
              className="relative z-10 mx-auto flex w-full max-w-[400px] flex-1 flex-col px-6 pt-6 sm:px-8 lg:flex-none lg:px-0 lg:pt-0"
              style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 24px)" }}
            >
              <Link
                href={backHref}
                className="mb-8 hidden items-center gap-1.5 text-[12.5px] text-dim transition-colors hover:text-white lg:inline-flex"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                {backLabel}
              </Link>

              <h1 className="font-display text-[30px] font-bold leading-tight tracking-[-0.01em] text-white lg:text-[34px]">
                {title}
              </h1>
              <p className="mt-2 text-[14px] leading-relaxed text-muted">
                {subtitle}
              </p>

              <div className="mt-7">{children}</div>

              {footer && <div className="mt-6">{footer}</div>}

              {/* Perks — pinned to the bottom of the sheet on mobile */}
              <div className="mt-auto pt-10 lg:mt-10 lg:pt-0">
                <div className="grid grid-cols-3 gap-2">
                  {PERKS.map(({ icon: Icon, label }) => (
                    <div
                      key={label}
                      className="flex flex-col items-center gap-1.5 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-2 py-3 text-center"
                    >
                      <Icon className="h-4 w-4 text-gold" />
                      <span className="text-[11px] font-medium leading-tight text-white/60">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-5 text-center text-[11px] leading-relaxed text-white/35">
                  We only use your number to sign you in. No spam, ever.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

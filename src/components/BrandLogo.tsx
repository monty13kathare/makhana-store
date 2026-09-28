"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { EASE } from "./motion-primitives";

import Image from "next/image";

export function LogoIcon({
  size = 40,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={`relative flex shrink-0 items-center justify-center rounded-[10px] bg-white px-2 py-1 shadow-[0_4px_16px_rgba(255,255,255,0.08)] transition-transform group-hover:scale-105 ${className}`}
      style={{ height: `${size}px` }}
    >
      <Image
        src="/img/makhana-logo.png"
        alt="Chakh-low"
        width={120}
        height={80}
        className="h-full w-auto object-contain"
        priority
      />
    </div>
  );
}

export default function BrandLogo({
  size = 40,
  href = "/",
  className = "",
}: {
  size?: number;
  href?: string;
  className?: string;
}) {
  const content = (
    <div className={`group flex shrink-0 items-center gap-3 ${className}`}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3, ease: EASE }}
      >
        <LogoIcon size={size} />
      </motion.div>

      <span className="leading-tight flex flex-col justify-center">
        <span className="font-heading text-[21px] font-bold tracking-tight text-white transition-colors group-hover:text-amber-300">
          Makhana
        </span>
        <span className="text-[10px] font-medium tracking-[0.06em] text-[#8e8e8e]">
          Premium
        </span>
      </span>
    </div>
  );

  if (!href) return content;

  return <Link href={href}>{content}</Link>;
}

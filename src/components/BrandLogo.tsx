"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { EASE } from "./motion-primitives";

export function LogoIcon({
  size = 40,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative flex shrink-0 items-center justify-center rounded-[12px] shadow-[0_4px_18px_rgba(245,158,11,0.38)] transition-transform group-hover:scale-105 ${className}`}
    >
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full overflow-hidden rounded-[12px]"
      >
        <defs>
          {/* Theme Gold/Amber Gradient */}
          <linearGradient id="themeGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="35%" stopColor="#fbbf24" />
            <stop offset="70%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>

          {/* Rim Shimmer */}
          <linearGradient id="themeRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#fef08a" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#b45309" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* Squircle Background with Amber-Gold Theme */}
        <rect width="40" height="40" rx="12" fill="url(#themeGoldGrad)" />
        <rect
          width="38"
          height="38"
          x="1"
          y="1"
          rx="11"
          stroke="url(#themeRimGrad)"
          strokeWidth="1.2"
        />

        {/* Stylized Lotus Seed / Makhana Crown Accent */}
        <path
          d="M20 7 C18.2 9.2 18 10.8 20 12.2 C22 10.8 21.8 9.2 20 7 Z"
          fill="#140f06"
        />

        {/* Bold Modern Luxury 'M' Monogram */}
        <path
          d="M12 28.5 V15 H15 L20 22.2 L25 15 H28 V28.5 H24.8 V19.5 L20.8 25.2 H19.2 L15.2 19.5 V28.5 H12 Z"
          fill="#140f06"
        />
      </svg>
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

      <span className="leading-tight">
        <span className="block text-[20px] font-extrabold tracking-tight text-white transition-colors group-hover:text-amber-300">
          Makhana
        </span>
        <span className="block text-[10.5px] font-bold uppercase tracking-[0.2em] text-amber-400">
          Premium
        </span>
      </span>
    </div>
  );

  if (!href) return content;

  return <Link href={href}>{content}</Link>;
}

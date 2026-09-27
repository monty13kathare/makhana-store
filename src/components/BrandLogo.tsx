"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { EASE } from "./motion-primitives";

export function LogoIcon({
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={`relative flex shrink-0 items-center justify-center rounded-[10px] bg-white px-2.5 py-1.5 shadow-[0_4px_16px_rgba(255,255,255,0.08)] transition-transform group-hover:scale-105 ${className}`}
    >
      <div className="flex flex-col items-center">
        {/* Decorative mini bowl with makhana seeds */}
        <svg
          viewBox="0 0 54 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-[13px] w-[38px]"
        >
          {/* Bowl outline / fill */}
          <path
            d="M6 6 C12 16, 42 16, 48 6 Z"
            fill="#78350f"
          />
          {/* Popped lotus seeds */}
          <circle cx="16" cy="5.5" r="3.6" fill="#fef3c7" stroke="#b45309" strokeWidth="0.6" />
          <circle cx="27" cy="4" r="4.2" fill="#ffffff" stroke="#b45309" strokeWidth="0.6" />
          <circle cx="38" cy="5.5" r="3.6" fill="#fef3c7" stroke="#b45309" strokeWidth="0.6" />
          <circle cx="21" cy="3.5" r="2.8" fill="#ffffff" />
          <circle cx="33" cy="3.5" r="2.8" fill="#fef3c7" />
          {/* Fresh mint accent leaf */}
          <path
            d="M27 1 C28 2, 29 1.5, 30 1 C29 0.5, 28 0.5, 27 1 Z"
            fill="#16a34a"
          />
        </svg>
        <span className="text-[10.5px] font-black tracking-tight leading-none text-[#991b1b] mt-0.5">
          Chakh<span className="text-[#15803d] font-bold ml-0.5">Low</span>
        </span>
      </div>
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

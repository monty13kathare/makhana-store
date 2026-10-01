"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Gift, Home, ShoppingBag, Store, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

type Tab = {
  label: string;
  icon: LucideIcon;
  href?: string;
  match?: (path: string) => boolean;
};

/** Routes that run full-screen or have their own sticky action bar. */
const HIDDEN_ON = ["/login", "/checkout", "/product"];

/**
 * Thumb-friendly bottom app bar for phones. Hidden from md up, where the
 * desktop navigation takes over. Renders an in-flow spacer so page content
 * and the footer never end up underneath it.
 */
export default function MobileDock() {
  const pathname = usePathname();
  const { count, openCart } = useCart();
  const { user } = useAuth();

  if (HIDDEN_ON.some((p) => pathname.startsWith(p))) return null;

  const tabs: Tab[] = [
    { label: "Home", icon: Home, href: "/", match: (p) => p === "/" },
    { label: "Shop", icon: Store, href: "/shop", match: (p) => p.startsWith("/shop") || p.startsWith("/product") },
    { label: "Cart", icon: ShoppingBag },
    { label: "Gifting", icon: Gift, href: "/gifting", match: (p) => p.startsWith("/gifting") },
    {
      label: user ? "Account" : "Log in",
      icon: User,
      href: user ? "/profile" : "/login",
      match: (p) => p.startsWith("/profile") || p.startsWith("/orders"),
    },
  ];

  return (
    <>
      <div
        aria-hidden
        className="md:hidden"
        style={{ height: "calc(76px + env(safe-area-inset-bottom))" }}
      />

      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="absolute inset-0 border-t border-white/10 bg-[#0d0d0d]/92 backdrop-blur-md" />

        <ul className="relative mx-auto grid h-[64px] max-w-md grid-cols-5 px-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isCart = !tab.href;
            const active = tab.match?.(pathname) ?? false;

            const content = (
              <>
                {active && (
                  <motion.span
                    layoutId="dock-glow"
                    className="absolute inset-x-3 top-0 h-[3px] rounded-b-full bg-gold shadow-[0_0_14px_rgba(229,169,60,0.9)]"
                    transition={{ type: "spring", stiffness: 500, damping: 38 }}
                  />
                )}

                {isCart ? (
                  // Raised centre button for the cart
                  <span className="relative -mt-6 grid h-[52px] w-[52px] place-items-center rounded-full bg-gold text-black shadow-[0_10px_24px_-6px_rgba(229,169,60,0.75)] ring-4 ring-[#0d0d0d]">
                    <motion.span
                      key={`dock-bag-${count}`}
                      animate={count > 0 ? { rotate: [0, -12, 12, -6, 6, 0] } : {}}
                      transition={{ duration: 0.45 }}
                    >
                      <Icon className="h-[22px] w-[22px]" strokeWidth={2.2} />
                    </motion.span>
                    <AnimatePresence mode="popLayout">
                      {count > 0 && (
                        <motion.span
                          key={`dock-count-${count}`}
                          initial={{ scale: 0.2 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          transition={{ type: "spring", stiffness: 500, damping: 14 }}
                          className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-white px-1 text-[10.5px] font-black text-black shadow"
                        >
                          {count > 99 ? "99+" : count}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </span>
                ) : (
                  <Icon
                    className={`h-[22px] w-[22px] transition-colors ${active ? "text-gold" : "text-white/55"}`}
                    strokeWidth={active ? 2.2 : 1.8}
                  />
                )}

                <span
                  className={`mt-1 text-[10.5px] font-semibold leading-none tracking-wide transition-colors ${
                    active ? "text-gold" : "text-white/55"
                  }`}
                >
                  {tab.label}
                </span>
              </>
            );

            const cls =
              "relative flex h-full w-full flex-col items-center justify-center transition-transform active:scale-90";

            return (
              <li key={tab.label} className="relative">
                {isCart ? (
                  <button
                    type="button"
                    onClick={openCart}
                    aria-label={`Open cart, ${count} items`}
                    className={cls}
                  >
                    {content}
                  </button>
                ) : (
                  <Link
                    href={tab.href!}
                    aria-current={active ? "page" : undefined}
                    className={cls}
                  >
                    {content}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}

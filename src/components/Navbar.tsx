"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, ShoppingBag, User, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import BrandLogo from "./BrandLogo";
import { EASE } from "./motion-primitives";

const links = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/shipping", label: "Worldwide shipment" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function Logo() {
  return <BrandLogo size={40} />;
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const pathname = usePathname();
  const { count, openCart } = useCart();
  const { user, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile sheet whenever the route changes.
  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  if (pathname.startsWith("/login")) return null;

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: EASE }}
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "border-b border-white/10 bg-[#0d0d0d]/85 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <nav className="container-x flex h-[68px] sm:h-[80px] lg:h-[88px] items-center justify-between gap-2 sm:gap-8">
          <Logo />

          {/* Desktop links */}
          <ul className="hidden items-center gap-1.5 xl:flex">
            {links.map((l) => {
              const active =
                l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className={`relative block rounded-full px-4 py-2 text-[13.5px] transition-colors ${
                      active
                        ? "font-semibold text-amber-400"
                        : "text-white/75 hover:text-amber-400 active:text-amber-300"
                    }`}
                  >
                    {l.label}
                    {active && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 -z-10 rounded-full bg-amber-400/10 border border-amber-400/20"
                        transition={{ duration: 0.4, ease: EASE }}
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
            <button
              type="button"
              onClick={openCart}
              aria-label={`Open cart, ${count} items`}
              className="relative grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-full border border-white/15 text-white transition-colors hover:border-amber-400/50 hover:text-amber-400 active:text-amber-300 hover:bg-amber-400/10 cursor-pointer"
            >
              <motion.div
                key={`bag-${count}`}
                animate={count > 0 ? { rotate: [0, -12, 12, -6, 6, 0], scale: [1, 1.18, 1] } : {}}
                transition={{ duration: 0.45 }}
              >
                <ShoppingBag className="h-[17px] w-[17px]" />
              </motion.div>
              <AnimatePresence mode="popLayout">
                {count > 0 && (
                  <motion.span
                    key={`count-${count}`}
                    initial={{ scale: 0.2, y: -3 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 12 }}
                    className="absolute -right-1 -top-1 grid h-[20px] min-w-[20px] place-items-center rounded-full bg-amber-400 px-1 text-[10.5px] font-black text-black shadow-md shadow-amber-400/40"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* Desktop User Pill Button & Dropdown */}
            {user ? (
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  aria-label="My Account & Track Orders"
                  className="group flex items-center gap-2.5 rounded-full bg-white py-1.5 pl-1.5 pr-4 text-black transition-all hover:bg-neutral-100 hover:shadow-md active:scale-95"
                >
                  <span className="relative grid h-7 w-7 place-items-center overflow-hidden rounded-full ring-1 ring-black/10">
                    <Image
                      src={user?.avatar || "/img/avatar-1.jpg"}
                      alt={user?.name || "User"}
                      fill
                      sizes="28px"
                      className="object-cover"
                    />
                  </span>
                  <span className="text-[12.5px] font-semibold tracking-tight text-neutral-900">
                    {user?.name || "User"}
                  </span>
                </button>

                <AnimatePresence>
                  {isProfileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full mt-2 w-48 rounded-2xl border border-white/10 bg-[#141414] shadow-xl backdrop-blur-xl overflow-hidden"
                    >
                      <div className="flex flex-col p-1.5">
                        <Link
                          href="/profile"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="rounded-xl px-4 py-2.5 text-[13.5px] font-medium text-white/80 hover:bg-white/10 hover:text-amber-400 transition-colors"
                        >
                          Profile
                        </Link>
                        <Link
                          href="/orders"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="rounded-xl px-4 py-2.5 text-[13.5px] font-medium text-white/80 hover:bg-white/10 hover:text-amber-400 transition-colors"
                        >
                          My Order
                        </Link>
                        <div className="my-1 h-[1px] bg-white/10"></div>
                        <button
                          onClick={() => {
                            logout();
                            setIsProfileDropdownOpen(false);
                          }}
                          className="rounded-xl px-4 py-2.5 text-left text-[13.5px] font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href="/login"
                aria-label="Sign In"
                className="group hidden items-center gap-2.5 rounded-full bg-white py-1.5 px-5 text-black transition-all hover:bg-neutral-100 hover:shadow-md active:scale-95 sm:flex font-semibold text-[13px]"
              >
                Sign In
              </Link>
            )}

            {/* Mobile User Icon (< sm) */}
            <Link
              href={user ? "/profile" : "/login"}
              aria-label="Account"
              className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-full border border-white/15 transition-colors hover:border-amber-400/50 sm:hidden"
            >
              <Image
                src={user?.avatar || "/img/avatar-1.jpg"}
                alt={user?.name || "Gretchen Rosser"}
                fill
                sizes="36px"
                className="object-cover"
              />
            </Link>

            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-full border border-white/15 text-white transition-colors hover:border-amber-400/50 hover:text-amber-400 active:text-amber-300 xl:hidden"
            >
              <Menu className="h-[17px] w-[17px]" />
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile sheet */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm xl:hidden"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.45, ease: EASE }}
              className="fixed right-0 top-0 z-[61] flex h-full w-[84vw] max-w-sm flex-col border-l border-white/10 bg-[#141414] p-6 xl:hidden"
            >
              <div className="mb-8 flex items-center justify-between">
                <span className="font-extrabold text-white">Menu</span>
                <button
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close menu"
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-white transition-colors hover:border-amber-400/50 hover:text-amber-400 active:text-amber-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <ul className="flex flex-col gap-1">
                {links.map((l, i) => (
                  <motion.li
                    key={l.href}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.06, ease: EASE }}
                  >
                    <Link
                      href={l.href}
                      className="block rounded-xl px-4 py-3 text-[16px] font-semibold text-white/85 transition-colors hover:bg-amber-400/10 hover:text-amber-400 active:text-amber-300"
                    >
                      {l.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>

              <div className="mt-auto flex flex-col gap-3 border-t border-white/10 pt-5">
                {user ? (
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-white transition-all hover:border-amber-400/40 hover:bg-amber-400/10 hover:text-amber-400 active:text-amber-300"
                  >
                    <span className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full ring-2 ring-amber-400/30">
                      <Image
                        src={user.avatar || "/img/avatar-1.jpg"}
                        alt={user.name}
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14.5px] font-bold text-white">
                        {user.name}
                      </p>
                      <p className="text-[12px] font-medium text-amber-400">
                        My Orders &amp; Profile &rarr;
                      </p>
                    </div>
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 py-3 text-center text-[14px] font-semibold text-white transition-all hover:border-amber-400/40 hover:text-amber-400 active:text-amber-300 hover:bg-amber-400/10"
                  >
                    <User className="h-4 w-4 text-amber-400" />
                    Sign In / Track Order
                  </Link>
                )}

                <Link
                  href="/shop"
                  className="flex items-center justify-center gap-2 rounded-full bg-white py-3 text-center font-bold text-black transition-all hover:bg-amber-400 hover:text-black active:bg-amber-300 active:scale-95 shadow-md"
                >
                  Explore Flavours
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

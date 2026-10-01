"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, Clock, Truck } from "lucide-react";
import BrandLogo from "./BrandLogo";

export default function Footer() {
  const pathname = usePathname();

  if (pathname.startsWith("/login") || pathname.startsWith("/checkout")) return null;

  return (
    <footer className="relative border-t border-white/10 bg-[#0a0a0a] text-white">
      <div className="container-x pt-10 pb-6 sm:py-16 lg:py-20">
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* Column 1: Brand */}
          <div className="col-span-2 flex flex-col md:col-span-1">
            <BrandLogo size={42} />

            <p className="mt-4 sm:mt-5 max-w-xs text-[13.5px] leading-relaxed text-white/60">
              Premium makhana, beautifully positioned for global e-commerce,
              luxury gifting, and direct online purchase.
            </p>

            {/* Social Icons */}
            <div className="mt-5 sm:mt-7 flex items-center gap-3">
              {/* Facebook */}
              <a
                href="#"
                aria-label="Facebook"
                className="flex h-11 w-11 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-white/20 bg-transparent text-white/80 transition-all hover:border-amber-400/50 hover:text-amber-400 active:text-amber-300 hover:bg-amber-400/10"
              >
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="#"
                aria-label="Instagram"
                className="flex h-11 w-11 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-white/20 bg-transparent text-white/80 transition-all hover:border-amber-400/50 hover:text-amber-400 active:text-amber-300 hover:bg-amber-400/10"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>

              {/* Pinterest */}
              <a
                href="#"
                aria-label="Pinterest"
                className="flex h-11 w-11 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-white/20 bg-transparent text-white/80 transition-all hover:border-amber-400/50 hover:text-amber-400 active:text-amber-300 hover:bg-amber-400/10"
              >
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0a12 12 0 0 0-4.37 23.17c-.07-.98-.13-2.48.03-3.55l1.04-4.42s-.26-.52-.26-1.3c0-1.22.7-2.13 1.59-2.13.75 0 1.11.56 1.11 1.24 0 .76-.48 1.89-.73 2.94-.21.88.44 1.6 1.3 1.6 1.57 0 2.77-1.65 2.77-4.04 0-2.11-1.52-3.59-3.69-3.59-2.52 0-4 1.89-4 3.84 0 .76.29 1.57.66 2.02.07.09.08.17.06.26l-.25 1.02c-.04.16-.13.2-.3.12-1.12-.52-1.82-2.16-1.82-3.48 0-2.83 2.06-5.43 5.94-5.43 3.12 0 5.54 2.22 5.54 5.19 0 3.1-1.95 5.59-4.66 5.59-.91 0-1.77-.47-2.06-1.03l-.56 2.14c-.2.78-.75 1.76-1.12 2.36A12 12 0 1 0 12 0z" />
                </svg>
              </a>

              {/* Twitter / X */}
              <a
                href="#"
                aria-label="Twitter / X"
                className="flex h-11 w-11 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-white/20 bg-transparent text-white/80 transition-all hover:border-amber-400/50 hover:text-amber-400 active:text-amber-300 hover:bg-amber-400/10"
              >
                <svg
                  className="h-3.5 w-3.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Shop */}
          <div className="flex flex-col lg:pl-6">
            <h4 className="text-[16px] font-bold text-white">Shop</h4>
            <ul className="mt-2 sm:mt-5 flex flex-col sm:gap-3 text-[14px] text-white/60">
              <li>
                <Link
                  href="/shop"
                  className="block py-2.5 sm:py-0 transition-colors hover:text-amber-400 active:text-amber-300"
                >
                  Classic Himalayan Salt
                </Link>
              </li>
              <li>
                <Link
                  href="/shop"
                  className="block py-2.5 sm:py-0 transition-colors hover:text-amber-400 active:text-amber-300"
                >
                  Peri Peri Roast
                </Link>
              </li>
              <li>
                <Link
                  href="/shop"
                  className="block py-2.5 sm:py-0 transition-colors hover:text-amber-400 active:text-amber-300"
                >
                  Truffle Black Pepper
                </Link>
              </li>
              <li>
                <Link
                  href="/gifting"
                  className="block py-2.5 sm:py-0 transition-colors hover:text-amber-400 active:text-amber-300"
                >
                  Premium Tasting Box
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Support */}
          <div className="flex flex-col lg:border-l lg:border-white/10 lg:pl-8">
            <h4 className="text-[16px] font-bold text-white">Support</h4>
            <ul className="mt-2 sm:mt-5 flex flex-col sm:gap-3 text-[14px] text-white/60">
              <li>
                <Link
                  href="/shipping"
                  className="block py-2.5 sm:py-0 transition-colors hover:text-amber-400 active:text-amber-300"
                >
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping"
                  className="block py-2.5 sm:py-0 transition-colors hover:text-amber-400 active:text-amber-300"
                >
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="block py-2.5 sm:py-0 transition-colors hover:text-amber-400 active:text-amber-300"
                >
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="block py-2.5 sm:py-0 transition-colors hover:text-amber-400 active:text-amber-300"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div className="col-span-2 flex flex-col md:col-span-1 lg:border-l lg:border-white/10 lg:pl-8">
            <h4 className="text-[16px] font-bold text-white">Contact</h4>
            <ul className="mt-2 sm:mt-5 flex flex-col gap-1 sm:gap-3.5 text-[14px] text-white/70">
              <li className="flex min-h-10 items-center gap-3 sm:min-h-0">
                <Mail className="h-4 w-4 shrink-0 text-white/50" />
                <a
                  href="mailto:hello@yourbrand.com"
                  className="block py-2.5 sm:py-0 transition-colors hover:text-amber-400 active:text-amber-300"
                >
                  hello@yourbrand.com
                </a>
              </li>
              <li className="flex min-h-10 items-center gap-3 sm:min-h-0">
                <Clock className="h-4 w-4 shrink-0 text-white/50" />
                <span className="text-white/60">Mon - Sat / 10 AM - 7 PM</span>
              </li>
              <li className="flex min-h-10 items-center gap-3 sm:min-h-0">
                <Truck className="h-4 w-4 shrink-0 text-white/50" />
                <span className="text-white/60">
                  Worldwide shipment support
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar with divider */}
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col sm:flex-row items-center justify-between gap-2 py-5 text-[11.5px] text-white/40 text-center sm:text-left">
          <span>&copy; {new Date().getFullYear()} Makhana Connoisseur. All rights reserved.</span>
          <span>Design and Developed by Veloc</span>
        </div>
      </div>
    </footer>
  );
}

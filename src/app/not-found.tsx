import Link from "next/link";
import { Home, ShoppingBag } from "lucide-react";

export default function NotFound() {
  return (
    <section className="grid min-h-[calc(100dvh-64px)] place-items-center px-5 pt-[88px] pb-10 sm:min-h-screen sm:pb-0">
      <div className="w-full max-w-[420px] text-center">
        <p className="font-display text-[88px] font-bold italic leading-none text-gold sm:text-[80px]">
          404
        </p>
        <h1 className="mt-4 text-[26px] font-extrabold tracking-tight">
          This page popped out of the pan
        </h1>
        <p className="mt-3 text-[14.5px] text-muted">
          The link you followed does not exist any more.
        </p>

        {/* Phones: two big full-width actions. sm+: the original single button. */}
        <div className="mt-8 flex flex-col gap-3 sm:block">
          <Link
            href="/"
            className="flex h-[52px] items-center justify-center gap-2 rounded-full bg-white text-[15px] font-semibold text-ink transition-colors hover:bg-white/85 active:bg-white/85 sm:inline-block sm:h-auto sm:px-8 sm:py-3.5 sm:text-[14px]"
          >
            <Home className="h-[18px] w-[18px] sm:hidden" />
            Back home
          </Link>
          <Link
            href="/shop"
            className="flex h-[52px] items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 text-[15px] font-semibold text-white transition-colors active:bg-white/10 sm:hidden"
          >
            <ShoppingBag className="h-[18px] w-[18px] text-gold" />
            Shop all flavours
          </Link>
        </div>
      </div>
    </section>
  );
}

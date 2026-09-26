import Link from "next/link";

export default function NotFound() {
  return (
    <section className="grid min-h-screen place-items-center px-5 pt-[88px]">
      <div className="text-center">
        <p className="font-display text-[80px] font-bold italic leading-none text-gold">
          404
        </p>
        <h1 className="mt-4 text-[26px] font-extrabold tracking-tight">
          This page popped out of the pan
        </h1>
        <p className="mt-3 text-[14.5px] text-muted">
          The link you followed does not exist any more.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-full bg-white px-8 py-3.5 text-[14px] font-semibold text-ink transition-colors hover:bg-white/85"
        >
          Back home
        </Link>
      </div>
    </section>
  );
}

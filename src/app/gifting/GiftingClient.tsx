"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import {
  Check,
  Gift,
  Mail,
  Package,
  Percent,
  Sparkles,
  Truck,
  HeartHandshake,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";
import { formatMoney } from "@/lib/format";
import type { Bundle } from "@/lib/api/types";
import { useCart } from "@/context/CartContext";
import { useStoreConfig } from "@/context/StoreConfigContext";
import { EASE, Reveal, StaggerGroup, StaggerItem } from "@/components/motion-primitives";
import { EmptyState, ErrorState } from "@/components/ui/DataState";

/** Gift box as the page renders it; `discountedPrice` is the API's bundle `price` (discount included). */
export type GiftBox = {
  id: string;
  name: string;
  count: string;
  totalWeight: string;
  standardPrice: number;
  mrp: number;
  discountPercent: number;
  discountedPrice: number;
  blurb: string;
  image: string;
  inStock: boolean;
  featured?: boolean;
  badge?: string;
  items: Bundle["items"];
};

function toGiftBox(b: Bundle): GiftBox {
  return {
    id: b.slug,
    name: b.name,
    count: b.count,
    totalWeight: b.totalWeight,
    standardPrice: b.standardPrice,
    mrp: b.mrp,
    discountPercent: b.discountPercent,
    discountedPrice: b.price,
    blurb: b.blurb,
    image: b.image,
    inStock: b.inStock,
    featured: b.featured,
    badge: b.badge,
    items: b.items,
  };
}

const steps = [
  {
    icon: Gift,
    title: "1. Choose your box",
    body: "From a sleek trio to an executive 8-roast celebration hamper.",
  },
  {
    icon: Mail,
    title: "2. Add your note",
    body: "We hand-write your personal message onto letterpress textured cards.",
  },
  {
    icon: Package,
    title: "3. Express dispatch",
    body: "Dispatches within 48h in temperature-stable luxury gift packaging.",
  },
];

/** `bundles` comes from GET /store/bundles?kind=gift_box (null when unavailable). */
export default function GiftingClient({ bundles }: { bundles: Bundle[] | null }) {
  const { addBundle, giftNote: savedNote, setGiftNote: saveGiftNote } = useCart();
  const { config } = useStoreConfig();
  const boxes = (bundles ?? []).map(toGiftBox);

  const [picked, setPicked] = useState(() => (boxes.find((b) => b.featured) ?? boxes[0])?.id ?? "");
  // Mirrors the note already in the bag until edited; saved to the bag when a box is added.
  const [draftNote, setGiftNote] = useState<string | null>(null);
  const giftNote = draftNote ?? savedNote;
  const [added, setAdded] = useState(false);

  // Phone-only sticky "add to bag" bar: shown while the box picker is on
  // screen but the inline CTA isn't, so it never overlaps the footer.
  const pickerRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const pickerInView = useInView(pickerRef, { margin: "-80px 0px -140px 0px" });
  const ctaInView = useInView(ctaRef);
  const showStickyBar = pickerInView && !ctaInView;

  const selectedBox: GiftBox | undefined = boxes.find((b) => b.id === picked) ?? boxes[0];
  const discountSavings = selectedBox ? selectedBox.standardPrice - selectedBox.discountedPrice : 0;
  const totalMrpSavings = selectedBox ? selectedBox.mrp - selectedBox.discountedPrice : 0;

  // The box is one cart line priced by the API; its discount is already in the price.
  const handleAddGiftBox = () => {
    if (!selectedBox || !selectedBox.inStock) return;
    if (giftNote.trim()) saveGiftNote(giftNote.trim());
    addBundle(
      {
        slug: selectedBox.id,
        name: selectedBox.name,
        image: selectedBox.image,
        price: selectedBox.discountedPrice,
        mrp: selectedBox.mrp,
        count: selectedBox.count,
      },
      { openDrawer: true },
    );
    setAdded(true);
  };

  return (
    <>
      {/* Hero Section */}
      <section className="pt-[84px] pb-10 sm:pt-[116px] sm:pb-16 lg:pt-[140px] lg:pb-20">
        <div className="container-x">
          <div className="relative grid overflow-hidden rounded-[22px] sm:rounded-[28px] border border-white/10 bg-[#121212] lg:grid-cols-[1.1fr_1fr] shadow-2xl">
            <div className="glow-warm pointer-events-none absolute -right-24 top-0 h-[560px] w-[560px] opacity-70" />

            <Reveal className="relative z-10 px-5 pt-7 pb-6 sm:px-12 sm:py-12 lg:py-16">
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-amber-300">
                <Sparkles className="h-3 w-3" />
                Artisanal Gifting
              </span>
              <h1 className="max-w-[16ch] text-[28px] xs:text-[30px] font-extrabold leading-[1.08] tracking-[-0.025em] sm:text-[48px] text-white">
                A gift that gets{" "}
                <span className="font-display italic text-amber-400">finished</span>
              </h1>
              <p className="mt-3 sm:mt-5 max-w-[46ch] text-[14px] sm:text-[15px] leading-relaxed text-[#9a9a9a]">
                Not another tin of almonds that sits in a cupboard until March.
                Pick a handcrafted box, add a note, and we will send it out in
                satin ribbon and protective thermal wrap.
              </p>

              <div className="mt-5 flex flex-col items-start gap-2.5 text-[12.5px] text-[#8e8e8e] sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>Free Express Delivery on Festival & Corporate Boxes</span>
                </div>
                <div className="flex items-center gap-2">
                  <HeartHandshake className="h-4 w-4 shrink-0 text-amber-400" />
                  <span>Complimentary Hand-written Letterpress Card</span>
                </div>
              </div>
            </Reveal>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: EASE }}
              className="relative min-h-[210px] sm:min-h-[300px] lg:min-h-full"
            >
              <Image
                src="/img/gift-box.jpg"
                alt="Luxury Makhana Gifting Box with Ribbon"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 48vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#121212] via-transparent to-transparent" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3 Ways to Give - Interactive Cards Grid */}
      <section className="pb-12 sm:pb-16 lg:pb-20">
        <div className="container-x">
          <Reveal className="mb-4 sm:mb-9">
            <h2 className="text-[24px] font-extrabold tracking-[-0.02em] sm:text-[36px] text-white">
              Three ways to give
            </h2>
            <p className="mt-1.5 sm:mt-2 text-[13.5px] sm:text-[14px] text-[#909090]">
              Select a box to preview its contents. Each box price already includes its discount.
            </p>
          </Reveal>

          {bundles === null && <ErrorState title="Gift boxes are unavailable right now" />}
          {bundles?.length === 0 && <EmptyState title="New gift boxes are coming soon" />}

          <div
            ref={pickerRef}
            className="swipe-row gap-3 pt-3.5 pb-1 sm:mx-0 sm:grid sm:gap-6 sm:overflow-visible sm:px-0 sm:pt-0 sm:pb-0 lg:grid-cols-3"
          >
            {boxes.map((b, i) => {
              const selected = picked === b.id;
              return (
                <motion.button
                  key={b.id}
                  onClick={() => {
                    setPicked(b.id);
                    setAdded(false);
                  }}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: "some" }}
                  transition={{ duration: 0.6, ease: EASE, delay: i * 0.1 }}
                  whileHover={{ y: -6 }}
                  aria-pressed={selected}
                  className={`group relative flex w-[84%] max-w-[340px] shrink-0 snap-start flex-col rounded-[22px] border p-5 text-left transition-all duration-300 sm:w-auto sm:max-w-none sm:rounded-[24px] sm:p-7 ${
                    selected
                      ? "border-amber-400 bg-[#181818] shadow-2xl shadow-amber-400/10 ring-1 ring-amber-400/30"
                      : "border-white/10 bg-[#141414] hover:border-white/25 hover:bg-[#161616]"
                  }`}
                >
                  {/* Badge */}
                  {b.badge && (
                    <span
                      className={`absolute -top-3 left-5 sm:left-7 rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide shadow-md ${
                        b.featured
                          ? "bg-amber-400 text-black"
                          : "border border-amber-400/40 bg-[#161616] text-amber-300"
                      }`}
                    >
                      {b.badge}
                    </span>
                  )}

                  {/* Top Row: Radio Check & Items pill */}
                  <div className="mb-3.5 sm:mb-5 flex items-center justify-between">
                    <span
                      className={`grid h-7 w-7 place-items-center rounded-full border transition-all ${
                        selected
                          ? "border-amber-400 bg-amber-400 text-black shadow-md shadow-amber-400/30"
                          : "border-white/25 bg-white/5 text-transparent"
                      }`}
                    >
                      <Check className="h-4 w-4 stroke-[3]" />
                    </span>

                    <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[11.5px] font-semibold text-white/70">
                      {b.count} · {b.totalWeight}
                    </span>
                  </div>

                  <h3 className="text-[20px] sm:text-[22px] font-extrabold text-white group-hover:text-amber-300 transition-colors">
                    {b.name}
                  </h3>
                  <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-[#909090] sm:mt-2 sm:line-clamp-none sm:text-[13.5px]">
                    {b.blurb}
                  </p>

                  {/* Included Items Chips */}
                  <div className="mt-3 flex flex-wrap gap-1.5 border-t border-white/10 pt-3 sm:mt-4 sm:pt-4">
                    {b.items.map((it) => (
                      <span
                        key={it.slug}
                        className="rounded-lg bg-white/[0.04] border border-white/10 px-2 py-0.5 text-[11px] font-medium text-white/75"
                      >
                        {it.qty}× {it.name.split(" ")[0]}
                      </span>
                    ))}
                  </div>

                  {/* Special Discount Notice Pill */}
                  <div className="mt-3.5 sm:mt-5 rounded-xl border border-amber-400/30 bg-amber-400/[0.06] p-2.5 text-[12px] flex items-center gap-2">
                    <Percent className="h-4 w-4 text-amber-400 shrink-0" />
                    <div>
                      <span className="font-bold text-amber-300">
                        {b.discountPercent}% Special Discount
                      </span>{" "}
                      <span className="text-white/60">
                        {b.inStock ? "· included in price" : "· currently sold out"}
                      </span>
                    </div>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="mt-4 flex items-baseline gap-2.5 sm:mt-6">
                    <span className="text-[26px] sm:text-[28px] font-extrabold text-amber-400">
                      {formatMoney(b.discountedPrice)}
                    </span>
                    <span className="text-[14px] text-white/50 line-through">
                      {formatMoney(b.standardPrice)}
                    </span>
                    <span className="ml-auto text-[11.5px] font-bold text-emerald-400">
                      Save {formatMoney(b.standardPrice - b.discountedPrice)}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* =========================================================================
              Interactive "What's Inside & Gift Personalization" Drawer Card
             ========================================================================= */}
          {selectedBox && (
          <Reveal delay={0.15} className="mt-6 sm:mt-10">
            <div className="rounded-[22px] sm:rounded-[28px] border border-white/12 bg-[#161616] p-4 sm:p-9 shadow-2xl backdrop-blur-xl">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4 sm:gap-4 sm:pb-6">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-[12px] font-extrabold uppercase tracking-wider text-amber-400">
                    <Package className="h-3.5 w-3.5" />
                    Box Contents & Special Discount
                  </span>
                  <h3 className="mt-1 text-[19px] sm:text-[22px] font-extrabold text-white">
                    What&apos;s inside: {selectedBox.name}
                  </h3>
                </div>

                <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-[12.5px] sm:px-4 sm:py-2 sm:text-[13px]">
                  <Percent className="h-4 w-4 text-emerald-400" />
                  <span className="font-bold text-emerald-300">
                    {selectedBox.discountPercent}% Off Included
                  </span>
                </div>
              </div>

              {/* Items Grid */}
              <div className="mt-4 grid gap-2.5 sm:mt-6 sm:gap-4 sm:grid-cols-3">
                {selectedBox.items.map((item) => (
                  <div
                    key={item.slug}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#121212] p-2.5 sm:gap-3.5 sm:p-3.5 transition-colors hover:border-white/20"
                  >
                    <div className="relative h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-neutral-900">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                      <span className="absolute bottom-1 right-1 grid h-5 w-5 place-items-center rounded-md bg-amber-400 text-[10.5px] font-extrabold text-black">
                        ×{item.qty}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-bold text-white">
                        {item.name}
                      </p>
                      <p className="text-[11.5px] text-[#888888]">
                        {item.weight} &middot; Whole Roasted
                      </p>
                      <p className="mt-1 text-[12.5px] font-semibold text-amber-300">
                        {formatMoney(item.unitPrice * item.qty)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Gift Note Input Box */}
              <div className="mt-4 rounded-2xl border border-white/10 bg-[#121212] p-3.5 sm:mt-6 sm:p-5">
                <label htmlFor="gift-note" className="flex items-center gap-2 text-[13px] font-bold text-white">
                  <Mail className="h-4 w-4 shrink-0 text-amber-400" />
                  <span>Complimentary Hand-Written Letterpress Card Note (Optional)</span>
                </label>
                <textarea
                  id="gift-note"
                  name="gift-note"
                  autoComplete="off"
                  autoCapitalize="sentences"
                  enterKeyHint="done"
                  value={giftNote}
                  onChange={(e) => setGiftNote(e.target.value)}
                  maxLength={250}
                  placeholder="e.g. Wishing you vibrant health and gourmet crunches this festive season! — With love, Sarah"
                  rows={3}
                  className="mt-2.5 w-full rounded-xl border border-white/15 bg-black/40 p-3 text-[16px] sm:text-[13px] text-white placeholder:text-white/30 focus:border-amber-400 focus:outline-none transition-colors resize-none"
                />
                <div className="mt-1 flex justify-between gap-3 text-[11.5px] text-[#777777]">
                  <span>We transcribe this note with ink on handmade cotton paper.</span>
                  <span className="shrink-0 tabular-nums">{giftNote.length} / 250</span>
                </div>
              </div>

              {/* Bottom Action Bar */}
              <div className="mt-5 flex flex-col items-stretch justify-between gap-4 border-t border-white/10 pt-4 sm:mt-8 sm:flex-row sm:items-center sm:gap-6 sm:pt-6">
                <div>
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-[28px] font-extrabold text-amber-400">
                      {formatMoney(selectedBox.discountedPrice)}
                    </span>
                    <span className="text-[15px] text-white/50 line-through">
                      {formatMoney(selectedBox.standardPrice)}
                    </span>
                    <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11.5px] font-bold text-emerald-300">
                      Save {formatMoney(discountSavings)}
                    </span>
                  </div>
                  <p className="mt-1 text-[12px] text-[#8e8e8e]">
                    Total MRP savings: {formatMoney(totalMrpSavings)} &middot;{" "}
                    {selectedBox.discountedPrice >= config.freeShippingOver ? (
                      <span className="text-emerald-400 font-semibold">
                        Free Worldwide Express Shipping
                      </span>
                    ) : (
                      "Standard shipping applied"
                    )}
                  </p>
                </div>

                <button
                  ref={ctaRef}
                  type="button"
                  onClick={handleAddGiftBox}
                  disabled={!selectedBox.inStock}
                  className="disabled:opacity-50 disabled:pointer-events-none flex min-h-[52px] items-center justify-center gap-3 rounded-full bg-white px-6 py-4 sm:px-9 text-[14.5px] font-bold text-black transition-all hover:bg-amber-400 hover:text-black active:bg-amber-300 active:scale-[0.98] shadow-xl shadow-white/5"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>
                    {!selectedBox.inStock
                      ? `${selectedBox.name} is sold out`
                      : added
                        ? `${selectedBox.name} added · add another`
                        : <>Add {selectedBox.name} to bag &middot; {formatMoney(selectedBox.discountedPrice)}</>}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </Reveal>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="pb-12 sm:pb-20 lg:pb-28">
        <div className="container-x">
          <StaggerGroup className="grid overflow-hidden rounded-[24px] border border-white/10 bg-[#141414] sm:grid-cols-3">
            {steps.map((s, i) => (
              <StaggerItem
                key={s.title}
                className={`flex items-start gap-4 px-5 py-5 sm:block sm:px-7 sm:py-9 ${
                  i > 0
                    ? "border-t border-white/10 sm:border-l sm:border-t-0"
                    : ""
                }`}
              >
                <s.icon className="mt-0.5 h-5 w-5 shrink-0 text-amber-400 sm:mt-0 sm:mb-4" />
                <div>
                  <h3 className="mb-1 text-[15px] font-bold text-white sm:mb-2 sm:text-[16px]">{s.title}</h3>
                  <p className="text-[13px] leading-relaxed text-[#909090] sm:text-[13.5px]">
                    {s.body}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* Phone sticky add-to-bag bar (sits above the bottom app dock) */}
      <AnimatePresence>
        {showStickyBar && selectedBox && (
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="fixed inset-x-0 bottom-[calc(64px+env(safe-area-inset-bottom))] z-30 px-3 pb-2 md:hidden"
          >
            <div className="flex items-center gap-3 rounded-2xl border border-white/12 bg-[#161616]/95 p-2 pl-4 shadow-[0_12px_32px_rgba(0,0,0,0.7)] backdrop-blur-xl">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-semibold text-white/70">
                  {selectedBox.name} &middot; {selectedBox.count}
                </p>
                <p className="flex items-baseline gap-1.5">
                  <span className="text-[17px] font-extrabold text-amber-400">
                    {formatMoney(selectedBox.discountedPrice)}
                  </span>
                  <span className="text-[12px] text-white/45 line-through">
                    {formatMoney(selectedBox.standardPrice)}
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddGiftBox}
                disabled={!selectedBox.inStock}
                className="flex h-12 shrink-0 items-center gap-2 rounded-xl bg-white px-5 text-[14px] font-bold text-black transition-all active:scale-[0.97] active:bg-amber-300"
              >
                <ShoppingBag className="h-4 w-4" />
                Add to bag
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
import { formatUSD } from "@/lib/products";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { EASE, Reveal, StaggerGroup, StaggerItem } from "@/components/motion-primitives";

export type GiftBox = {
  id: string;
  name: string;
  count: string;
  totalWeight: string;
  standardPrice: number;
  mrp: number;
  discountPercent: number;
  discountCode: string;
  discountedPrice: number;
  blurb: string;
  featured?: boolean;
  badge?: string;
  items: {
    slug: string;
    name: string;
    qty: number;
    image: string;
    weight: string;
    unitPrice: number;
  }[];
};

const boxes: GiftBox[] = [
  {
    id: "trio",
    name: "The Trio",
    count: "3 flavours",
    totalWeight: "600g",
    standardPrice: 41,
    mrp: 51,
    discountPercent: 15,
    discountCode: "TRIO15",
    discountedPrice: 34.85,
    blurb: "All 3 signature gourmet flavours in a slim keepsake gold-embossed sleeve.",
    badge: "15% Special Discount",
    items: [
      {
        slug: "classic-himalayan-salt",
        name: "Classic Himalayan Salt",
        qty: 1,
        image: "/img/bowl-classic.jpg",
        weight: "200g",
        unitPrice: 11,
      },
      {
        slug: "peri-peri-roast",
        name: "Peri Peri Roast",
        qty: 1,
        image: "/img/bowl-peri.jpg",
        weight: "200g",
        unitPrice: 14,
      },
      {
        slug: "truffle-black-pepper",
        name: "Truffle Black Pepper",
        qty: 1,
        image: "/img/bowl-cheese.jpg",
        weight: "200g",
        unitPrice: 16,
      },
    ],
  },
  {
    id: "festival",
    name: "Festival Box",
    count: "6 flavours",
    totalWeight: "1.2kg",
    standardPrice: 82,
    mrp: 102,
    discountPercent: 25,
    discountCode: "FESTIVAL25",
    discountedPrice: 61.5,
    blurb:
      "Our signature festive celebration box with 6 gourmet roasts, hand-tied gold satin ribbon and note card.",
    featured: true,
    badge: "Most Gifted · 25% OFF",
    items: [
      {
        slug: "classic-himalayan-salt",
        name: "Classic Himalayan Salt",
        qty: 2,
        image: "/img/bowl-classic.jpg",
        weight: "200g",
        unitPrice: 11,
      },
      {
        slug: "peri-peri-roast",
        name: "Peri Peri Roast",
        qty: 2,
        image: "/img/bowl-peri.jpg",
        weight: "200g",
        unitPrice: 14,
      },
      {
        slug: "truffle-black-pepper",
        name: "Truffle Black Pepper",
        qty: 2,
        image: "/img/bowl-cheese.jpg",
        weight: "200g",
        unitPrice: 16,
      },
    ],
  },
  {
    id: "corporate",
    name: "Corporate Case",
    count: "8 roasts",
    totalWeight: "1.6kg",
    standardPrice: 107,
    mrp: 134,
    discountPercent: 35,
    discountCode: "CORP35",
    discountedPrice: 69.55,
    blurb:
      "Luxury executive hamper featuring 8 assorted gourmet jars with custom gift messaging and presentation box.",
    badge: "Executive VIP · 35% OFF",
    items: [
      {
        slug: "classic-himalayan-salt",
        name: "Classic Himalayan Salt",
        qty: 3,
        image: "/img/bowl-classic.jpg",
        weight: "200g",
        unitPrice: 11,
      },
      {
        slug: "peri-peri-roast",
        name: "Peri Peri Roast",
        qty: 3,
        image: "/img/bowl-peri.jpg",
        weight: "200g",
        unitPrice: 14,
      },
      {
        slug: "truffle-black-pepper",
        name: "Truffle Black Pepper",
        qty: 2,
        image: "/img/bowl-cheese.jpg",
        weight: "200g",
        unitPrice: 16,
      },
    ],
  },
];

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

export default function GiftingPage() {
  const { addBundle } = useCart();
  const { requireAuth } = useAuth();
  const [picked, setPicked] = useState("festival");
  const [giftNote, setGiftNote] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const selectedBox = boxes.find((b) => b.id === picked) || boxes[1];
  const discountSavings = selectedBox.standardPrice - selectedBox.discountedPrice;
  const totalMrpSavings = selectedBox.mrp - selectedBox.discountedPrice;

  const handleAddGiftBox = () => {
    requireAuth(
      () => {
        setIsAdding(true);
        // Add all items in the bundle and automatically apply the special gift discount code
        addBundle(
          selectedBox.items.map((it) => ({ slug: it.slug, qty: it.qty })),
          selectedBox.discountCode
        );
        setTimeout(() => setIsAdding(false), 500);
      },
      {
        title: "Sign in to Order Gift Box",
        message: `Sign in to personalize your gift card and claim the exclusive ${selectedBox.discountPercent}% discount.`,
        product: {
          name: selectedBox.name,
          image: selectedBox.items[0]?.image || "/img/gift-box.jpg",
          price: selectedBox.discountedPrice,
        },
      }
    );
  };

  return (
    <>
      {/* Hero Section */}
      <section className="pt-[116px] pb-16 lg:pt-[140px] lg:pb-20">
        <div className="container-x">
          <div className="relative grid overflow-hidden rounded-[28px] border border-white/10 bg-[#121212] lg:grid-cols-[1.1fr_1fr] shadow-2xl">
            <div className="glow-warm pointer-events-none absolute -right-24 top-0 h-[560px] w-[560px] opacity-70" />

            <Reveal className="relative z-10 px-7 py-12 sm:px-12 lg:py-16">
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-amber-300">
                <Sparkles className="h-3 w-3" />
                Artisanal Gifting
              </span>
              <h1 className="max-w-[16ch] text-[34px] font-extrabold leading-[1.08] tracking-[-0.025em] sm:text-[48px] text-white">
                A gift that gets{" "}
                <span className="font-display italic text-amber-400">finished</span>
              </h1>
              <p className="mt-5 max-w-[46ch] text-[15px] leading-relaxed text-[#9a9a9a]">
                Not another tin of almonds that sits in a cupboard until March.
                Pick a handcrafted box, add a note, and we will send it out in
                satin ribbon and protective thermal wrap.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-6 text-[12.5px] text-[#8e8e8e]">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-emerald-400" />
                  <span>Free Express Delivery on Festival & Corporate Boxes</span>
                </div>
                <div className="flex items-center gap-2">
                  <HeartHandshake className="h-4 w-4 text-amber-400" />
                  <span>Complimentary Hand-written Letterpress Card</span>
                </div>
              </div>
            </Reveal>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: EASE }}
              className="relative min-h-[300px] lg:min-h-full"
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
      <section className="pb-16 lg:pb-20">
        <div className="container-x">
          <Reveal className="mb-9">
            <h2 className="text-[28px] font-extrabold tracking-[-0.02em] sm:text-[36px] text-white">
              Three ways to give
            </h2>
            <p className="mt-2 text-[14px] text-[#909090]">
              Select a box to preview its contents and apply the card-specific discount.
            </p>
          </Reveal>

          <div className="grid gap-6 lg:grid-cols-3">
            {boxes.map((b, i) => {
              const selected = picked === b.id;
              return (
                <motion.button
                  key={b.id}
                  onClick={() => setPicked(b.id)}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.6, ease: EASE, delay: i * 0.1 }}
                  whileHover={{ y: -6 }}
                  className={`group relative flex flex-col rounded-[24px] border p-7 text-left transition-all duration-300 ${
                    selected
                      ? "border-amber-400 bg-[#181818] shadow-2xl shadow-amber-400/10 ring-1 ring-amber-400/30"
                      : "border-white/10 bg-[#141414] hover:border-white/25 hover:bg-[#161616]"
                  }`}
                >
                  {/* Badge */}
                  {b.badge && (
                    <span
                      className={`absolute -top-3 left-7 rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide shadow-md ${
                        b.featured
                          ? "bg-amber-400 text-black"
                          : "border border-amber-400/40 bg-[#161616] text-amber-300"
                      }`}
                    >
                      {b.badge}
                    </span>
                  )}

                  {/* Top Row: Radio Check & Items pill */}
                  <div className="mb-5 flex items-center justify-between">
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

                  <h3 className="text-[22px] font-extrabold text-white group-hover:text-amber-300 transition-colors">
                    {b.name}
                  </h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-[#909090]">
                    {b.blurb}
                  </p>

                  {/* Included Items Chips */}
                  <div className="mt-4 flex flex-wrap gap-1.5 border-t border-white/10 pt-4">
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
                  <div className="mt-5 rounded-xl border border-amber-400/30 bg-amber-400/[0.06] p-2.5 text-[12px] flex items-center gap-2">
                    <Percent className="h-4 w-4 text-amber-400 shrink-0" />
                    <div>
                      <span className="font-bold text-amber-300">
                        {b.discountPercent}% Special Discount
                      </span>{" "}
                      <span className="font-mono text-white/60">({b.discountCode})</span>
                    </div>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="mt-6 flex items-baseline gap-2.5">
                    <span className="text-[28px] font-extrabold text-amber-400">
                      {formatUSD(b.discountedPrice)}
                    </span>
                    <span className="text-[14px] text-white/50 line-through">
                      {formatUSD(b.standardPrice)}
                    </span>
                    <span className="ml-auto text-[11.5px] font-bold text-emerald-400">
                      Save {formatUSD(b.standardPrice - b.discountedPrice)}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* =========================================================================
              Interactive "What's Inside & Gift Personalization" Drawer Card
             ========================================================================= */}
          <Reveal delay={0.15} className="mt-10">
            <div className="rounded-[28px] border border-white/12 bg-[#161616] p-6 sm:p-9 shadow-2xl backdrop-blur-xl">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-[12px] font-extrabold uppercase tracking-wider text-amber-400">
                    <Package className="h-3.5 w-3.5" />
                    Box Contents & Special Discount
                  </span>
                  <h3 className="mt-1 text-[22px] font-extrabold text-white">
                    What&apos;s inside: {selectedBox.name}
                  </h3>
                </div>

                <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-[13px]">
                  <Percent className="h-4 w-4 text-emerald-400" />
                  <span className="font-bold text-emerald-300">
                    {selectedBox.discountPercent}% Off Applied ({selectedBox.discountCode})
                  </span>
                </div>
              </div>

              {/* Items Grid */}
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {selectedBox.items.map((item) => (
                  <div
                    key={item.slug}
                    className="flex items-center gap-3.5 rounded-2xl border border-white/10 bg-[#121212] p-3.5 transition-colors hover:border-white/20"
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-neutral-900">
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
                        {formatUSD(item.unitPrice * item.qty)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Gift Note Input Box */}
              <div className="mt-6 rounded-2xl border border-white/10 bg-[#121212] p-4 sm:p-5">
                <label className="flex items-center gap-2 text-[13px] font-bold text-white">
                  <Mail className="h-4 w-4 text-amber-400" />
                  <span>Complimentary Hand-Written Letterpress Card Note (Optional)</span>
                </label>
                <textarea
                  value={giftNote}
                  onChange={(e) => setGiftNote(e.target.value)}
                  maxLength={250}
                  placeholder="e.g. Wishing you vibrant health and gourmet crunches this festive season! — With love, Sarah"
                  rows={2}
                  className="mt-2.5 w-full rounded-xl border border-white/15 bg-black/40 p-3 text-[13px] text-white placeholder:text-white/30 focus:border-amber-400 focus:outline-none transition-colors resize-none"
                />
                <div className="mt-1 flex justify-between text-[11.5px] text-[#777777]">
                  <span>We transcribe this note with ink on handmade cotton paper.</span>
                  <span>{giftNote.length} / 250</span>
                </div>
              </div>

              {/* Bottom Action Bar */}
              <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6 border-t border-white/10 pt-6">
                <div>
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-[28px] font-extrabold text-amber-400">
                      {formatUSD(selectedBox.discountedPrice)}
                    </span>
                    <span className="text-[15px] text-white/50 line-through">
                      {formatUSD(selectedBox.standardPrice)}
                    </span>
                    <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11.5px] font-bold text-emerald-300">
                      Save {formatUSD(discountSavings)}
                    </span>
                  </div>
                  <p className="mt-1 text-[12px] text-[#8e8e8e]">
                    Total MRP savings: {formatUSD(totalMrpSavings)} &middot;{" "}
                    {selectedBox.discountedPrice >= 49 ? (
                      <span className="text-emerald-400 font-semibold">
                        Free Worldwide Express Shipping
                      </span>
                    ) : (
                      "Standard shipping applied"
                    )}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddGiftBox}
                  disabled={isAdding}
                  className="flex items-center justify-center gap-3 rounded-full bg-white px-9 py-4 text-[14.5px] font-bold text-black transition-all hover:bg-amber-400 hover:text-black active:bg-amber-300 active:scale-[0.98] shadow-xl shadow-white/5"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>
                    Add {selectedBox.name} to bag &middot; {formatUSD(selectedBox.discountedPrice)}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* How it works */}
      <section className="pb-20 lg:pb-28">
        <div className="container-x">
          <StaggerGroup className="grid overflow-hidden rounded-[24px] border border-white/10 bg-[#141414] sm:grid-cols-3">
            {steps.map((s, i) => (
              <StaggerItem
                key={s.title}
                className={`px-7 py-9 ${
                  i > 0
                    ? "border-t border-white/10 sm:border-l sm:border-t-0"
                    : ""
                }`}
              >
                <s.icon className="mb-4 h-5 w-5 text-amber-400" />
                <h3 className="mb-2 text-[16px] font-bold text-white">{s.title}</h3>
                <p className="text-[13.5px] leading-relaxed text-[#909090]">
                  {s.body}
                </p>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>
    </>
  );
}

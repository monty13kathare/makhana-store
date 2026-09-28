"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatUSD } from "@/lib/products";
import { Reveal, EASE } from "../motion-primitives";
import CustomDropdown from "@/components/ui/CustomDropdown";

type Variant = {
  label: string;
  price: number;
  mrp: number;
};

type ComboItem = {
  id: string;
  title: string;
  badge: string;
  image: string;
  slug: string;
  variants: Variant[];
};

const comboItems: ComboItem[] = [
  {
    id: "variety-combo",
    title: "Ultimate 4-Flavour Variety Combo",
    badge: "35% OFF",
    image: "/img/combo-variety-pack.jpg",
    slug: "classic-himalayan-salt",
    variants: [
      { label: "Ziplock Pouch (4x60g)", price: 28, mrp: 43 },
      { label: "Keepsake Jars (4x150g)", price: 42, mrp: 65 },
    ],
  },
  {
    id: "peri-salt-combo",
    title: "Peri Peri + Salt & Pepper Combo",
    badge: "38% OFF",
    image: "/img/makhana-prod-pouch.png",
    slug: "peri-peri-roast",
    variants: [
      { label: "Ziplock Pouch • 60g / Pack of 2", price: 18, mrp: 29 },
      { label: "Ziplock Pouch • 200g / Pack of 2", price: 24, mrp: 39 },
    ],
  },
  {
    id: "all-in-one-combo",
    title: "All In One Luxury Gift Box",
    badge: "39% OFF",
    image: "/img/makhana-prod-canister.png",
    slug: "truffle-black-pepper",
    variants: [
      { label: "Grand Sampler Pack (6 Tins)", price: 61, mrp: 102 },
      { label: "Signature Pack (4 Tins)", price: 45, mrp: 74 },
    ],
  },
  {
    id: "peri-pudina-combo",
    title: "Peri Peri + Truffle Signature Set",
    badge: "38% OFF",
    image: "/img/makhana-prod-jar.png",
    slug: "peri-peri-roast",
    variants: [
      { label: "Gourmet Jars • Pack of 2", price: 22, mrp: 35 },
      { label: "Gourmet Jars • Pack of 4", price: 38, mrp: 62 },
    ],
  },
];

function ComboCard({ item }: { item: ComboItem }) {
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [added, setAdded] = useState(false);
  const { add, openCart, openAddedModal } = useCart();
  const router = useRouter();

  const currentVariant = item.variants[selectedVariant];

  const handleAddToCart = () => {
    add(item.slug, 1, false);
    setAdded(true);
    openAddedModal({
      slug: item.slug,
      name: `${item.title} (${currentVariant.label})`,
      price: currentVariant.price,
      mrp: currentVariant.mrp,
      image: item.image,
      badge: item.badge,
      weight: currentVariant.label,
    });
    setTimeout(() => setAdded(false), 1800);
  };

  const handleBuyNow = () => {
    add(item.slug, 1);
    router.push("/checkout");
  };

  const savingsPercent = Math.round(
    ((currentVariant.mrp - currentVariant.price) / currentVariant.mrp) * 100
  );

  return (
    <div className="group flex flex-col justify-between rounded-[22px] border border-white/10 bg-[#161616] p-4 sm:p-5 transition-all duration-300 hover:border-amber-400/40 hover:bg-[#1a1a1a] shadow-lg hover:shadow-2xl hover:shadow-black/60 h-full">
      {/* Top Image + Discount Badge */}
      <div>
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[16px] bg-[#1f1f1f] flex items-center justify-center p-3">
          {/* Discount Pill Badge - Luxury Amber Theme */}
          <span className="absolute top-2.5 left-2.5 z-10 rounded-full border border-amber-400/40 bg-black/80 px-2.5 py-0.5 text-[10.5px] font-bold text-amber-300 backdrop-blur-md shadow-md tracking-wider">
            {item.badge}
          </span>

          <div className="relative h-full w-full">
            <Image
              src={item.image}
              alt={item.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-contain p-1 transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </div>

        {/* Title */}
        <h3 className="mt-4 font-heading font-medium text-[16px] sm:text-[17px] text-white tracking-tight leading-snug line-clamp-1 group-hover:text-amber-300 transition-colors">
          {item.title}
        </h3>

        {/* Variant Dropdown Selector */}
        <div className="mt-3 relative z-30">
          <CustomDropdown
            options={item.variants.map((v, idx) => ({
              value: idx,
              label: v.label,
            }))}
            value={selectedVariant}
            onChange={(val) => setSelectedVariant(Number(val))}
          />
        </div>

        {/* Price Display */}
        <div className="mt-3.5 flex items-baseline gap-2">
          <span className="font-heading font-medium text-[20px] text-white">
            {formatUSD(currentVariant.price)}
          </span>
          <span className="text-[13px] text-white/40 line-through">
            {formatUSD(currentVariant.mrp)}
          </span>
          <span className="text-[11px] font-semibold text-amber-400/90">
            Save {savingsPercent}%
          </span>
        </div>
      </div>

      {/* Action Buttons in Project Theme */}
      <div className="mt-5 grid grid-cols-2 gap-2">
        <button
          onClick={handleAddToCart}
          className={`rounded-full border py-2.5 text-[12px] font-semibold transition-all active:scale-95 flex items-center justify-center gap-1.5 ${
            added
              ? "border-amber-400 bg-amber-400/20 text-amber-300"
              : "border-white/20 bg-white/5 text-white hover:border-amber-400/50 hover:text-amber-300 hover:bg-amber-400/10"
          }`}
        >
          {added ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span>Added</span>
            </>
          ) : (
            <span>Add to Cart</span>
          )}
        </button>

        <button
          onClick={handleBuyNow}
          className="rounded-full bg-white py-2.5 text-[12px] font-semibold text-black transition-all hover:bg-amber-400 hover:text-black hover:shadow-[0_4px_16px_rgba(235,175,70,0.3)] active:scale-95 text-center"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}

export default function FlavourCombos() {
  return (
    <section className="py-16 lg:py-24 relative overflow-hidden bg-[#0d0d0d]">
      {/* Background warm ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[550px] w-[550px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(229,169,60,0.07)_0%,transparent_70%)] blur-3xl" />

      <div className="container-x relative z-10">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <Reveal>
            <h2 className="text-[32px] sm:text-[42px] lg:text-[46px] font-heading font-medium tracking-tight text-white">
              Mix Your Favourite Flavours
            </h2>
            <p className="mt-2.5 text-[14.5px] sm:text-[15.5px] text-[#8a8a8a]">
              All our roasted &amp; raw makhana curated into signature gift boxes &amp; variety combos
            </p>
          </Reveal>
        </div>

        {/* Responsive Cards Grid / Track (Clean without arrow buttons) */}
        <div className="flex gap-5 sm:gap-6 overflow-x-auto scroll-smooth scrollbar-none pb-4 pt-2 snap-x snap-mandatory lg:grid lg:grid-cols-4 lg:overflow-visible">
          {comboItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, ease: EASE, delay: i * 0.08 }}
              className="min-w-[270px] sm:min-w-[300px] lg:min-w-0 snap-start flex-1"
            >
              <ComboCard item={item} />
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA Button */}
        <div className="mt-10 sm:mt-12 flex justify-center">
          <Link
            href="/gifting"
            className="group inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-8 py-3.5 text-[14px] font-semibold text-amber-300 transition-all hover:bg-amber-400 hover:text-black hover:shadow-[0_8px_24px_rgba(235,175,70,0.25)] active:scale-95"
          >
            <span>View All Combos</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}

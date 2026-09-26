"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { products } from "@/lib/products";
import ProductCard from "../ProductCard";
import { Reveal } from "../motion-primitives";

export default function Flavours() {
  const collection = products.slice(0, 3);

  return (
    <section id="collection" className="py-16 lg:py-24">
      <div className="container-x">
        {/* Section Heading */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <Reveal className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-amber-300">
              <Sparkles className="h-3 w-3" />
              Artisanal Craft
            </span>
            <h2 className="mt-3 text-[32px] font-bold tracking-tight text-white sm:text-[42px]">
              Our Signature Makhana Collection
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-[#8e8e8e]">
              Hand-graded single-origin lotus seeds, slow-roasted in pure A2 ghee,
              dusted with artisanal seasonings, and crafted into modern superfoods.
            </p>
          </Reveal>

          <Link
            href="/shop"
            className="group inline-flex items-center gap-2 self-start md:self-auto rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-[13px] font-semibold text-white transition-all hover:border-amber-400/40 hover:bg-amber-400/10 hover:text-amber-400"
          >
            Explore all {products.length} products
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Product Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
          {collection.map((p, i) => (
            <div key={p.slug} className="h-full flex flex-col">
              <ProductCard product={p} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { products } from "@/lib/products";
import ProductCard from "../ProductCard";
import { Reveal } from "../motion-primitives";

export default function Flavours() {
  const collection = products.slice(0, 4);

  return (
    <section id="collection" className="relative bg-[#0a0a0a] pt-28 sm:pt-36 lg:pt-40 pb-16 lg:pb-24">
      <div className="container-x">
        {/* Section Heading */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <Reveal className="max-w-2xl">
            <h2 className="text-[32px] font-bold tracking-tight text-white sm:text-[42px]">
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

        {/* Product Cards Grid - 4 Columns */}
        <div className="grid gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
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


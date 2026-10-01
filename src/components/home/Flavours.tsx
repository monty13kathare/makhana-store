"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { products } from "@/lib/products";
import ProductCard from "../ProductCard";
import { Reveal } from "../motion-primitives";

export default function Flavours() {
  const collection = products.slice(0, 4);

  return (
    <section id="collection" className="relative bg-[#0a0a0a] pt-12 sm:pt-36 lg:pt-40 pb-12 sm:pb-16 lg:pb-24">
      <div className="container-x">
        {/* Section Heading */}
        <div className="mb-6 sm:mb-12 flex flex-row items-end justify-between gap-4 sm:gap-6">
          <Reveal className="max-w-2xl">
            <h2 className="text-[24px] xs:text-[26px] font-bold leading-tight tracking-tight text-white sm:text-[42px]">
              Our Signature Makhana Collection
            </h2>
            <p className="mt-2 sm:mt-3 hidden sm:block text-[15px] leading-relaxed text-[#8e8e8e]">
              Hand-graded single-origin lotus seeds, slow-roasted in pure A2 ghee,
              dusted with artisanal seasonings, and crafted into modern superfoods.
            </p>
          </Reveal>

          {/* Compact "See all" on phones, full pill from sm up */}
          <Link
            href="/shop"
            className="group inline-flex min-h-11 shrink-0 items-center gap-1 text-[13px] sm:min-h-0 font-semibold text-gold sm:gap-2 sm:rounded-full sm:border sm:border-white/15 sm:bg-white/5 sm:px-5 sm:py-2.5 sm:text-white sm:transition-all sm:hover:border-amber-400/40 sm:hover:bg-amber-400/10 sm:hover:text-amber-400"
          >
            <span className="sm:hidden">See all</span>
            <span className="hidden sm:inline">Explore all {products.length} products</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Swipe row on phones, grid from sm up */}
        <div className="swipe-row gap-3.5 pb-2 sm:mx-0 sm:grid sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
          {collection.map((p, i) => (
            <div key={p.slug} className="flex h-full w-[78vw] max-w-[320px] shrink-0 snap-start flex-col sm:w-auto sm:max-w-none">
              <ProductCard product={p} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


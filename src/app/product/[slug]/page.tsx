import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, getProducts } from "@/lib/api/server";
import { ErrorState } from "@/components/ui/DataState";
import ProductClient from "./ProductClient";

// ISR: product pages are cached and refreshed at most every minute.
export const revalidate = 60;

/** Prerender known products when the API is reachable at build time; others render on demand. */
export async function generateStaticParams() {
  const products = await getProducts();
  return (products ?? []).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { product } = await getProduct(slug);
  if (!product) return { title: "Product" };

  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { product, notFound: missing } = await getProduct(slug);
  if (missing) notFound();

  if (!product) {
    return (
      <section className="pt-[96px] pb-16 sm:pt-[140px] sm:pb-24">
        <div className="container-x max-w-xl">
          <ErrorState
            title="This product is unavailable right now"
            message="We couldn't reach the store. Please refresh in a moment."
          />
          <div className="mt-5 text-center">
            <Link href="/shop" className="text-[13.5px] font-semibold text-amber-400 hover:underline">
              Back to the shop
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return <ProductClient product={product} related={product.related} />;
}

import type { Product } from "@/lib/api/types";

/** Label of the base size (e.g. "200g"), sent with cart lines so each size is its own line. */
export function baseVariantLabel(product: Pick<Product, "variants" | "weight">): string | undefined {
  return product.variants.find((v) => v.isBase)?.label ?? product.variants[0]?.label;
}

export function stockLabel(product: Pick<Product, "inStock" | "lowStock">): string {
  if (!product.inStock) return "Out of stock";
  if (product.lowStock) return "Low stock · order soon";
  return "In stock";
}

export function percentOff(price: number, mrp: number): number {
  return mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
}

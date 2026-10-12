/**
 * Server-side reads for Server Components. Responses are cached with ISR
 * (`next.revalidate`) and every helper fails soft: when the API is down
 * (including during `next build`) it logs and returns `null`, so pages render
 * an explicit "unavailable" state instead of crashing the build.
 */
import { cache } from "react";
import { apiBaseUrl } from "./base-url";
import type {
  Bundle,
  BundleKind,
  FaqItem,
  Product,
  ProductDetail,
  Review,
  ReviewCategory,
  ReviewSummary,
  ShippingZone,
  StoreConfig,
} from "./types";

/** Seconds a cached response is served before it is refreshed in the background. */
export const REVALIDATE = {
  catalog: 60,
  content: 300,
  reviews: 120,
} as const;

type ServerResult<T> = { ok: true; data: T } | { ok: false; status: number };

async function serverGet<T>(
  path: string,
  revalidate: number,
  tags: string[],
): Promise<ServerResult<T>> {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const url = apiBaseUrl() + normalized;
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate, tags },
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) {
      if (res.status !== 404) console.error(`[api] GET ${path} -> ${res.status}`);
      return { ok: false, status: res.status };
    }
    const body = (await res.json()) as { data: T };
    return { ok: true, data: body.data };
  } catch (e) {
    console.error(`[api] GET ${path} failed:`, e instanceof Error ? e.message : e);
    return { ok: false, status: 0 };
  }
}

async function orNull<T>(p: Promise<ServerResult<T>>): Promise<T | null> {
  const r = await p;
  return r.ok ? r.data : null;
}

export function getProducts(): Promise<Product[] | null> {
  return orNull(serverGet<Product[]>("/store/products?sort=popular", REVALIDATE.catalog, ["products"]));
}

/** `notFound: true` only when the API answered 404; `null` data otherwise means unavailable. */
export const getProduct = cache(async function getProduct(
  slug: string,
): Promise<{ product: ProductDetail | null; notFound: boolean }> {
  const r = await serverGet<ProductDetail>(
    `/store/products/${encodeURIComponent(slug)}`,
    REVALIDATE.catalog,
    ["products", `product:${slug}`],
  );
  if (r.ok) return { product: r.data, notFound: false };
  return { product: null, notFound: r.status === 404 };
});

export function getBundles(kind: BundleKind): Promise<Bundle[] | null> {
  return orNull(serverGet<Bundle[]>(`/store/bundles?kind=${kind}`, REVALIDATE.catalog, ["bundles"]));
}

export function getShippingZones(): Promise<ShippingZone[] | null> {
  return orNull(serverGet<ShippingZone[]>("/store/shipping/zones", REVALIDATE.content, ["shipping"]));
}

export function getStoreConfig(): Promise<StoreConfig | null> {
  return orNull(serverGet<StoreConfig>("/store/config", REVALIDATE.content, ["config"]));
}

export function getReviewSummary(): Promise<ReviewSummary | null> {
  return orNull(serverGet<ReviewSummary>("/store/reviews/summary", REVALIDATE.reviews, ["reviews"]));
}

export function getReviews(category: ReviewCategory, limit = 3): Promise<Review[] | null> {
  const q = new URLSearchParams({ category, limit: String(limit) });
  return orNull(serverGet<Review[]>(`/store/reviews?${q}`, REVALIDATE.reviews, ["reviews"]));
}

function isFaqItem(v: unknown): v is FaqItem {
  if (typeof v !== "object" || v === null) return false;
  const r = v as Record<string, unknown>;
  return typeof r.q === "string" && typeof r.a === "string";
}

/** The `faq` content block's items; `null` when unavailable. */
export async function getFaq(): Promise<FaqItem[] | null> {
  const block = await orNull(
    serverGet<{ data: unknown }>("/store/content/faq", REVALIDATE.content, ["content"]),
  );
  if (!block) return null;
  const data = block.data as { items?: unknown } | null;
  const items = Array.isArray(data?.items) ? data.items.filter(isFaqItem) : [];
  return items.map((it, i) => ({
    id: typeof it.id === "string" ? it.id : String(i + 1).padStart(2, "0"),
    q: it.q,
    a: it.a,
    category: typeof it.category === "string" ? it.category : "General",
  }));
}

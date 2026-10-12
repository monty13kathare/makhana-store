import type { CartLineInput, CartProblem, QuoteLine } from "@/lib/api/types";

export const MAX_QTY = 99;
/** The API accepts at most 30 lines per cart. */
export const MAX_LINES = 30;

export type CartLine = CartLineInput;

/**
 * Stable identity of a cart line. Matches the API's `problems[].key` format:
 * `p:<slug>:<variant>` for products, `b:<slug>` for bundles.
 */
export function lineKey(line: Pick<CartLine, "slug" | "variant" | "bundle">): string {
  if (line.bundle) return `b:${line.bundle}`;
  return `p:${line.slug ?? ""}:${line.variant ?? ""}`;
}

function clampQty(n: unknown): number {
  const q = typeof n === "number" && Number.isFinite(n) ? Math.floor(n) : 1;
  return Math.max(1, Math.min(MAX_QTY, q));
}

function nonEmpty(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

/**
 * Reads lines from storage or the API, accepting the legacy `{ slug, qty }`
 * shape, dropping junk and merging duplicates.
 */
export function normalizeLines(raw: unknown): CartLine[] {
  if (!Array.isArray(raw)) return [];
  const byKey = new Map<string, CartLine>();
  for (const item of raw) {
    if (typeof item !== "object" || item === null) continue;
    const r = item as Record<string, unknown>;
    const bundle = nonEmpty(r.bundle);
    const slug = nonEmpty(r.slug);
    if (!bundle && !slug) continue;
    const line: CartLine = bundle
      ? { bundle, qty: clampQty(r.qty) }
      : { slug, variant: nonEmpty(r.variant), qty: clampQty(r.qty) };
    if (!line.variant) delete line.variant;
    const key = lineKey(line);
    const prev = byKey.get(key);
    if (prev) prev.qty = Math.min(MAX_QTY, prev.qty + line.qty);
    else byKey.set(key, line);
    if (byKey.size >= MAX_LINES) break;
  }
  return [...byKey.values()];
}

/** Lines in the exact shape the API expects (no undefined keys). */
export function toApiLines(lines: CartLine[]): CartLineInput[] {
  return lines.map((l) =>
    l.bundle
      ? { bundle: l.bundle, qty: l.qty }
      : l.variant
        ? { slug: l.slug, variant: l.variant, qty: l.qty }
        : { slug: l.slug, qty: l.qty },
  );
}

export function linesSignature(lines: CartLine[]): string {
  return lines.map((l) => `${lineKey(l)}*${l.qty}`).join("|");
}

/**
 * Pairs local lines with quote lines. The quote omits unknown products and
 * fills in the base variant when none was sent, so lines are matched by key,
 * then (for variant-less lines) by slug.
 */
export function matchQuoteLines(lines: CartLine[], quoteLines: QuoteLine[]): Map<string, QuoteLine> {
  const out = new Map<string, QuoteLine>();
  const used = new Set<QuoteLine>();
  const qKey = (q: QuoteLine) => (q.kind === "bundle" ? `b:${q.slug}` : `p:${q.slug}:${q.variant ?? ""}`);

  for (const l of lines) {
    const key = lineKey(l);
    const exact = quoteLines.find((q) => !used.has(q) && qKey(q) === key);
    if (exact) {
      out.set(key, exact);
      used.add(exact);
    }
  }
  for (const l of lines) {
    const key = lineKey(l);
    if (out.has(key) || l.bundle || l.variant) continue;
    const loose = quoteLines.find((q) => !used.has(q) && q.kind === "product" && q.slug === l.slug);
    if (loose) {
      out.set(key, loose);
      used.add(loose);
    }
  }
  return out;
}

/** Problem for a line. Problem keys use the variant as sent (empty for base). */
export function problemFor(line: CartLine, problems: CartProblem[]): CartProblem | undefined {
  const key = lineKey(line);
  return (
    problems.find((p) => p.key === key) ??
    problems.find((p) =>
      line.bundle ? p.bundle === line.bundle : !p.bundle && p.slug === line.slug && (p.variant ?? "") === (line.variant ?? ""),
    )
  );
}

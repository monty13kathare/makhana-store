import type { CartProblem } from "./types";

/** Error codes produced by the client itself (never sent by the API). */
export type ClientErrorCode = "network_error" | "timeout" | "http_error" | "unauthenticated";

const STOCK_CODES = new Set([
  "insufficient_stock",
  "out_of_stock",
  "product_unavailable",
  "variant_unavailable",
  "bundle_unavailable",
]);

const COUPON_CODES = new Set([
  "invalid_coupon",
  "coupon_expired",
  "coupon_min_order",
  "coupon_exhausted",
  "coupon_not_started",
]);

/**
 * A failed API call. Switch on `code` (stable), never on `message`.
 * `message` is safe to show to shoppers.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: unknown;
  readonly requestId: string | null;

  constructor(opts: {
    status: number;
    code: string;
    message: string;
    details?: unknown;
    requestId?: string | null;
  }) {
    super(opts.message);
    this.name = "ApiError";
    this.status = opts.status;
    this.code = opts.code;
    this.details = opts.details;
    this.requestId = opts.requestId ?? null;
  }

  /** True for failures where we never got an answer (offline, DNS, timeout). */
  get isNetwork(): boolean {
    return this.code === "network_error" || this.code === "timeout";
  }

  get isStockProblem(): boolean {
    return STOCK_CODES.has(this.code);
  }

  get isCouponProblem(): boolean {
    return COUPON_CODES.has(this.code);
  }

  /** `details.fields` of a `validation_failed` error, keyed by dotted path. */
  get fields(): Record<string, string> {
    return fieldErrors(this.details);
  }

  /** `details.problems` of a 409 stock error. */
  get problems(): CartProblem[] {
    return problemsOf(this.details);
  }
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** First message per dotted field path, e.g. `{ "shippingAddress.zip": "Required" }`. */
export function fieldErrors(details: unknown): Record<string, string> {
  if (!isRecord(details) || !isRecord(details.fields)) return {};
  const out: Record<string, string> = {};
  for (const [path, msgs] of Object.entries(details.fields)) {
    if (Array.isArray(msgs) && typeof msgs[0] === "string") out[path] = msgs[0];
    else if (typeof msgs === "string") out[path] = msgs;
  }
  return out;
}

export function problemsOf(details: unknown): CartProblem[] {
  if (!isRecord(details) || !Array.isArray(details.problems)) return [];
  return details.problems.filter(
    (p): p is CartProblem =>
      isRecord(p) &&
      typeof p.key === "string" &&
      typeof p.code === "string" &&
      typeof p.message === "string",
  );
}

export function isApiError(e: unknown): e is ApiError {
  return e instanceof ApiError;
}

export function isAbortError(e: unknown): boolean {
  return e instanceof DOMException && e.name === "AbortError";
}

/** A message for any thrown value, suitable for an error banner. */
export function errorMessage(e: unknown, fallback = "Something went wrong. Please try again."): string {
  if (e instanceof ApiError) return e.message || fallback;
  return fallback;
}

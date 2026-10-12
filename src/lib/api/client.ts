import { apiBaseUrl } from "./base-url";
import { ApiError } from "./errors";
import { getAccessToken, refreshSession, tokenNeedsRefresh } from "./session";

type Primitive = string | number | boolean;
export type Query = Record<string, Primitive | null | undefined>;

export type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  query?: Query;
  body?: unknown;
  /**
   * `true`: a member endpoint; send the Bearer token (refreshing first if needed).
   * `"optional"`: send the token when there is a session (guest-or-member endpoints).
   * `false` (default): public.
   */
  auth?: boolean | "optional";
  headers?: Record<string, string>;
  signal?: AbortSignal;
  /** Per-attempt timeout. Defaults to 15s. */
  timeoutMs?: number;
  /** How to read a 2xx body. Defaults to JSON. */
  responseType?: "json" | "text";
};

const DEFAULT_TIMEOUT = 15_000;

function buildUrl(path: string, query?: Query): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(apiBaseUrl() + normalized);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

/** Combines the caller's signal with a timeout, without relying on AbortSignal.any. */
function withTimeout(signal: AbortSignal | undefined, ms: number) {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, ms);
  const onAbort = () => controller.abort();
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener("abort", onAbort, { once: true });
  }
  return {
    signal: controller.signal,
    timedOut: () => timedOut,
    done: () => {
      clearTimeout(timer);
      signal?.removeEventListener("abort", onAbort);
    },
  };
}

async function toApiError(res: Response): Promise<ApiError> {
  let parsed: unknown = null;
  try {
    parsed = await res.json();
  } catch {
    // Non-JSON error page (proxy, crash). Fall through to a generic error.
  }
  if (
    typeof parsed === "object" &&
    parsed !== null &&
    "error" in parsed &&
    typeof parsed.error === "object" &&
    parsed.error !== null
  ) {
    const err = parsed.error as Record<string, unknown>;
    return new ApiError({
      status: res.status,
      code: typeof err.code === "string" ? err.code : "http_error",
      message:
        typeof err.message === "string" ? err.message : "Something went wrong. Please try again.",
      details: err.details,
      requestId: typeof err.requestId === "string" ? err.requestId : null,
    });
  }
  return new ApiError({
    status: res.status,
    code: "http_error",
    message:
      res.status >= 500
        ? "The store is having trouble right now. Please try again in a moment."
        : "Something went wrong. Please try again.",
  });
}

async function attempt(path: string, opts: RequestOptions, token: string | null): Promise<Response> {
  const headers: Record<string, string> = { Accept: "application/json", ...opts.headers };
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  const t = withTimeout(opts.signal, opts.timeoutMs ?? DEFAULT_TIMEOUT);
  try {
    return await fetch(buildUrl(path, opts.query), {
      method: opts.method ?? "GET",
      headers,
      body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
      credentials: "include",
      signal: t.signal,
      cache: "no-store",
    });
  } catch (err: unknown) {
    if (opts.signal?.aborted) throw new DOMException("Aborted", "AbortError");
    if (t.timedOut()) {
      throw new ApiError({
        status: 0,
        code: "timeout",
        message: "The store took too long to respond. Please try again.",
      });
    }
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[API Client Network Error] Request to ${buildUrl(path, opts.query)} failed:`, err);
    }
    throw new ApiError({
      status: 0,
      code: "network_error",
      message: "We couldn't reach the store. Check your connection and try again.",
    });
  } finally {
    t.done();
  }
}

async function tokenFor(auth: RequestOptions["auth"]): Promise<string | null> {
  if (!auth) return null;
  if (tokenNeedsRefresh()) {
    try {
      const fresh = await refreshSession();
      if (fresh) return fresh;
    } catch {
      // Refresh endpoint unreachable: use the token we still hold (if any).
    }
  }
  return getAccessToken();
}

/**
 * Low-level request. Returns the parsed JSON body (the `{ data, meta }`
 * envelope) or text, and `undefined` for 204. Throws `ApiError`.
 * Member requests that fail with `401 token_expired` are refreshed once
 * (deduplicated across concurrent calls) and retried.
 */
export async function apiRequest<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  let token = await tokenFor(opts.auth);
  if (opts.auth === true && !token) {
    throw new ApiError({ status: 401, code: "unauthenticated", message: "Please sign in to continue." });
  }

  let res = await attempt(path, opts, token);

  if (res.status === 401 && opts.auth) {
    const err = await toApiError(res.clone());
    if (err.code === "token_expired" || err.code === "invalid_token") {
      token = await refreshSession().catch(() => null);
      if (token) res = await attempt(path, opts, token);
      else if (opts.auth === "optional") res = await attempt(path, opts, null);
    }
  }

  if (!res.ok) throw await toApiError(res);
  if (res.status === 204) return undefined as T;
  if (opts.responseType === "text") return (await res.text()) as T;
  return (await res.json()) as T;
}

/** Unwraps `{ data }`. */
export async function apiData<T>(path: string, opts?: RequestOptions): Promise<T> {
  const body = await apiRequest<{ data: T }>(path, opts);
  return body.data;
}

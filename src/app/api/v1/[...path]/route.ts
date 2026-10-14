import type { NextRequest } from "next/server";
import { backendApiUrl, PROXY_PATH } from "@/lib/api/base-url";

/**
 * Same-origin proxy for the storefront API: `/api/v1/*` on this site is
 * forwarded to `${API_URL}/*`.
 *
 * A Route Handler instead of a `rewrites()` entry because rewrites are fixed
 * when the server starts (and baked into the build output), while this reads
 * `API_URL` on every request.
 */

const UPSTREAM_TIMEOUT_MS = 30_000;

/** Hop-by-hop headers (RFC 9110 §7.6.1) plus ones fetch recomputes itself. */
const STRIPPED_REQUEST_HEADERS = [
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "host",
  "content-length",
  // Let fetch negotiate compression; it decodes the body for us.
  "accept-encoding",
];

const STRIPPED_RESPONSE_HEADERS = new Set([
  "connection",
  "keep-alive",
  "transfer-encoding",
  "upgrade",
  "trailer",
  // fetch has already decompressed the body, so these no longer describe it.
  "content-encoding",
  "content-length",
  // Re-added below, one cookie at a time.
  "set-cookie",
]);

function errorResponse(status: number, code: string, message: string) {
  return Response.json({ error: { code, message } }, { status, headers: { "Cache-Control": "no-store" } });
}

/** `/api/v1/store/products` -> `https://backend/api/v1/store/products?...`, or null if unsafe. */
function upstreamUrl(req: NextRequest, base: string): string | null {
  const rest = req.nextUrl.pathname.slice(PROXY_PATH.length);
  // Encoded dot segments (%2e%2e) would be resolved by the URL parser and
  // could escape the backend's /api/v1 prefix.
  const segments = rest.split("/").map((s) => {
    try {
      return decodeURIComponent(s);
    } catch {
      return s;
    }
  });
  if (segments.some((s) => s === "." || s === ".." || s.includes("/") || s.includes("\\"))) return null;
  return base + rest + req.nextUrl.search;
}

function forwardHeaders(req: NextRequest): Headers {
  const headers = new Headers(req.headers);
  for (const name of STRIPPED_REQUEST_HEADERS) headers.delete(name);

  const host = req.headers.get("host");
  if (host && !headers.has("x-forwarded-host")) headers.set("x-forwarded-host", host);
  if (!headers.has("x-forwarded-proto")) headers.set("x-forwarded-proto", req.nextUrl.protocol.replace(":", ""));
  return headers;
}

/** Drops `Domain=` so cookies set by the backend bind to this site, which is the origin the browser sees. */
function rewriteSetCookie(cookie: string): string {
  return cookie
    .split(";")
    .filter((part) => !/^\s*domain\s*=/i.test(part))
    .join(";");
}

function responseHeaders(upstream: Response): Headers {
  const headers = new Headers();
  upstream.headers.forEach((value, name) => {
    if (!STRIPPED_RESPONSE_HEADERS.has(name.toLowerCase())) headers.append(name, value);
  });
  for (const cookie of upstream.headers.getSetCookie()) headers.append("set-cookie", rewriteSetCookie(cookie));
  return headers;
}

async function proxy(req: NextRequest): Promise<Response> {
  let base: string;
  try {
    base = backendApiUrl();
  } catch (e) {
    console.error("[api proxy] misconfigured:", e instanceof Error ? e.message : e);
    return errorResponse(500, "proxy_misconfigured", "The store is having trouble right now. Please try again in a moment.");
  }

  const target = upstreamUrl(req, base);
  if (!target) return errorResponse(400, "bad_request", "Invalid request path.");

  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  const timeout = AbortSignal.timeout(UPSTREAM_TIMEOUT_MS);

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: req.method,
      headers: forwardHeaders(req),
      body: hasBody ? await req.arrayBuffer() : undefined,
      // Pass redirects through to the browser rather than following them here.
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.any([req.signal, timeout]),
    });
  } catch (e) {
    if (req.signal.aborted) return new Response(null, { status: 499 });
    // Path only: query strings can carry emails and order numbers.
    console.error(
      `[api proxy] ${req.method} ${req.nextUrl.pathname} failed:`,
      e instanceof Error ? (e.cause ?? e.message) : e,
    );
    if (timeout.aborted) {
      return errorResponse(504, "timeout", "The store took too long to respond. Please try again.");
    }
    return errorResponse(502, "bad_gateway", "We couldn't reach the store. Please try again in a moment.");
  }

  const noBody = req.method === "HEAD" || upstream.status === 204 || upstream.status === 304;
  return new Response(noBody ? null : upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders(upstream),
  });
}

export const GET = proxy;
export const HEAD = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;

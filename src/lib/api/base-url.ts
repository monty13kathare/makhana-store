const DEV_DEFAULT = "http://localhost:4000/api/v1";

function trimSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

/**
 * Base URL of the REST API, including `/api/v1`.
 *
 * - Browser: `NEXT_PUBLIC_API_URL` (inlined at build time).
 * - Server (RSC, route handlers): `API_URL`, which may be a private address,
 *   falling back to `NEXT_PUBLIC_API_URL`.
 */
export function apiBaseUrl(): string {
  if (typeof window === "undefined") {
    return trimSlash(process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || DEV_DEFAULT);
  }
  return trimSlash(process.env.NEXT_PUBLIC_API_URL || DEV_DEFAULT);
}

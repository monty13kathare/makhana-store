const DEV_DEFAULT = "http://localhost:4000/api/v1";

function trimSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

/**
 * Base URL of the REST API, including `/api/v1`.
 *
 * - Browser: `NEXT_PUBLIC_API_URL` (inlined at build time). A relative value
 *   such as `/api/v1` goes through this site's rewrite proxy (next.config.ts).
 * - Server (RSC, route handlers): `API_URL`, which may be a private address,
 *   falling back to `NEXT_PUBLIC_API_URL` when that is absolute.
 */
export function apiBaseUrl(): string {
  const publicUrl = process.env.NEXT_PUBLIC_API_URL;
  if (typeof window === "undefined") {
    const absolutePublic = publicUrl && !publicUrl.startsWith("/") ? publicUrl : undefined;
    return trimSlash(process.env.API_URL || absolutePublic || DEV_DEFAULT);
  }
  if (publicUrl?.startsWith("/")) return trimSlash(window.location.origin + publicUrl);
  return trimSlash(publicUrl || DEV_DEFAULT);
}

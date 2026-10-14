const DEV_DEFAULT = "http://localhost:4000/api/v1";

/**
 * Path on this site that forwards to the backend
 * (src/app/api/v1/[...path]/route.ts).
 */
export const PROXY_PATH = "/api/v1";

function trimSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

/**
 * The backend's base URL, including `/api/v1`. Server only.
 *
 * `API_URL` is read on every call rather than at build time, so pointing the
 * site at another backend only needs a change to `.env` (or the host's
 * environment) and a restart, never a rebuild. In production a missing or
 * malformed value throws instead of silently calling localhost.
 */
export function backendApiUrl(): string {
  const raw = process.env.API_URL?.trim();
  if (!raw) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("API_URL is not set. Point it at the backend, e.g. https://api.example.com/api/v1");
    }
    return DEV_DEFAULT;
  }
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`API_URL is not a valid absolute URL: "${raw}"`);
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(`API_URL must use http or https: "${raw}"`);
  }
  return trimSlash(url.origin + url.pathname);
}

/**
 * Base URL for API requests made from the current environment.
 *
 * - Browser: this site's own `/api/v1`, which the proxy route forwards to
 *   `API_URL`. Same origin, so the backend's CORS settings don't matter and
 *   the refresh cookie stays first-party.
 * - Server (RSC, route handlers): `API_URL` directly, skipping the extra hop.
 */
export function apiBaseUrl(): string {
  if (typeof window === "undefined") return backendApiUrl();
  return window.location.origin + PROXY_PATH;
}

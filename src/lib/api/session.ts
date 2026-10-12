/**
 * Member session: the access token lives in memory only (never localStorage).
 * The refresh token is an httpOnly cookie scoped to /api/v1/store/auth, so the
 * browser sends it automatically with `credentials: "include"`.
 */
import { apiBaseUrl } from "./base-url";
import { ApiError } from "./errors";
import type { CustomerTokens } from "./types";

let accessToken: string | null = null;
let expiresAt = 0;
let refreshing: Promise<string | null> | null = null;

type Listener = () => void;
const expiredListeners = new Set<Listener>();

export function setSession(tokens: Pick<CustomerTokens, "accessToken" | "expiresIn">): void {
  accessToken = tokens.accessToken;
  expiresAt = Date.now() + tokens.expiresIn * 1000;
}

export function clearSession(): void {
  accessToken = null;
  expiresAt = 0;
}

export function getAccessToken(): string | null {
  return accessToken;
}

/** True when the token is missing or expires within `skewMs`. */
export function tokenNeedsRefresh(skewMs = 30_000): boolean {
  return !accessToken || Date.now() > expiresAt - skewMs;
}

/** Called when a refresh fails because the session is gone (logged out elsewhere, revoked, expired). */
export function onSessionExpired(listener: Listener): () => void {
  expiredListeners.add(listener);
  return () => expiredListeners.delete(listener);
}

async function doRefresh(): Promise<string | null> {
  let res: Response;
  try {
    res = await fetch(`${apiBaseUrl()}/store/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: "{}",
      signal: AbortSignal.timeout(10_000),
    });
  } catch (e) {
    const timeout = e instanceof DOMException && e.name === "TimeoutError";
    throw new ApiError({
      status: 0,
      code: timeout ? "timeout" : "network_error",
      message: "We couldn't reach the store to restore your session.",
    });
  }

  if (res.ok) {
    const body = (await res.json()) as { data: CustomerTokens };
    setSession(body.data);
    return body.data.accessToken;
  }

  // 4xx: there is no usable session. 5xx: keep whatever we had and report.
  if (res.status >= 400 && res.status < 500) {
    const hadSession = accessToken !== null;
    clearSession();
    if (hadSession) expiredListeners.forEach((l) => l());
    return null;
  }
  throw new ApiError({
    status: res.status,
    code: "http_error",
    message: "The store couldn't restore your session. Please try again.",
  });
}

/**
 * Exchanges the refresh cookie for a new access token. Concurrent callers share
 * one in-flight request, so the rotating refresh token is only spent once.
 * Resolves to `null` when there is no session.
 */
export function refreshSession(): Promise<string | null> {
  if (!refreshing) {
    refreshing = doRefresh().finally(() => {
      refreshing = null;
    });
  }
  return refreshing;
}

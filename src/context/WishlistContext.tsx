"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import { me } from "@/lib/api/store";
import { errorMessage } from "@/lib/api/errors";
import { readJson, writeJson } from "@/lib/storage";
import { useAuth } from "./AuthContext";

type WishlistContextType = {
  likedSlugs: string[];
  isLiked: (slug: string) => boolean;
  /** Optimistic toggle; returns the new liked state. Reverts if the API refuses. */
  toggleLike: (slug: string) => boolean;
  error: string | null;
};

const WishlistContext = createContext<WishlistContextType | null>(null);

const STORAGE_KEY = "makhana_wishlist_slugs";

type State = { slugs: string[]; hydrated: boolean; error: string | null };
type Action =
  | { type: "set"; slugs: string[] }
  | { type: "hydrate"; slugs: string[] }
  | { type: "toggle"; slug: string; liked: boolean }
  | { type: "error"; message: string | null };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "hydrate":
      return { ...state, slugs: action.slugs, hydrated: true };
    case "set":
      return { ...state, slugs: action.slugs, error: null };
    case "toggle":
      return {
        ...state,
        slugs: action.liked
          ? state.slugs.includes(action.slug)
            ? state.slugs
            : [action.slug, ...state.slugs]
          : state.slugs.filter((s) => s !== action.slug),
      };
    case "error":
      return { ...state, error: action.message };
    default:
      return state;
  }
}

function parseSlugs(raw: unknown): string[] {
  return Array.isArray(raw) ? raw.filter((s): s is string => typeof s === "string" && s.length > 0) : [];
}

/**
 * Guests keep their likes in localStorage. Members use the API; the guest list
 * is merged into the account once, right after sign-in.
 */
export function WishlistProvider({ children }: { children: ReactNode }) {
  const { status, authEvent } = useAuth();
  const [state, dispatch] = useReducer(reducer, { slugs: [], hydrated: false, error: null });
  const slugsRef = useRef<string[]>([]);
  useEffect(() => {
    slugsRef.current = state.slugs;
  });
  const isMember = status === "authenticated";

  useEffect(() => {
    dispatch({ type: "hydrate", slugs: parseSlugs(readJson(STORAGE_KEY)) });
  }, []);

  // Guests persist locally; members' lists live on the server.
  useEffect(() => {
    if (state.hydrated && status === "guest") writeJson(STORAGE_KEY, state.slugs);
  }, [state.slugs, state.hydrated, status]);

  useEffect(() => {
    if (!authEvent || !state.hydrated) return;
    if (authEvent.type === "signedOut") {
      dispatch({ type: "set", slugs: parseSlugs(readJson(STORAGE_KEY)) });
      return;
    }
    let cancelled = false;
    const run =
      authEvent.type === "signedIn" && slugsRef.current.length > 0
        ? me.mergeWishlist(slugsRef.current)
        : me.wishlist();
    run
      .then((slugs) => {
        if (cancelled) return;
        dispatch({ type: "set", slugs });
        // The guest list now lives in the account.
        if (authEvent.type === "signedIn") writeJson(STORAGE_KEY, []);
      })
      .catch((e: unknown) => {
        console.error("[wishlist] sync failed", e);
        if (!cancelled) dispatch({ type: "error", message: errorMessage(e, "We couldn't load your favourites.") });
      });
    return () => {
      cancelled = true;
    };
  }, [authEvent, state.hydrated]);

  const isLiked = useCallback((slug: string) => state.slugs.includes(slug), [state.slugs]);

  const toggleLike = useCallback(
    (slug: string): boolean => {
      const nextLiked = !slugsRef.current.includes(slug);
      dispatch({ type: "toggle", slug, liked: nextLiked });
      if (isMember) {
        (nextLiked ? me.like(slug) : me.unlike(slug))
          .then((slugs) => dispatch({ type: "set", slugs }))
          .catch((e: unknown) => {
            console.error("[wishlist] update failed", e);
            dispatch({ type: "toggle", slug, liked: !nextLiked });
            dispatch({ type: "error", message: errorMessage(e, "We couldn't update your favourites.") });
          });
      }
      return nextLiked;
    },
    [isMember],
  );

  return (
    <WishlistContext.Provider value={{ likedSlugs: state.slugs, isLiked, toggleLike, error: state.error }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextType {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    return { likedSlugs: [], isLiked: () => false, toggleLike: () => false, error: null };
  }
  return ctx;
}

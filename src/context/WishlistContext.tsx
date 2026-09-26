"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type WishlistContextType = {
  likedSlugs: string[];
  isLiked: (slug: string) => boolean;
  toggleLike: (slug: string) => boolean;
};

const WishlistContext = createContext<WishlistContextType | null>(null);

const STORAGE_KEY = "makhana_wishlist_slugs";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [likedSlugs, setLikedSlugs] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setLikedSlugs(JSON.parse(stored));
      }
    } catch {
      // Ignore storage error
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(likedSlugs));
    } catch {
      // Ignore storage error
    }
  }, [likedSlugs, hydrated]);

  const isLiked = (slug: string) => likedSlugs.includes(slug);

  const toggleLike = (slug: string): boolean => {
    const nextLiked = !likedSlugs.includes(slug);
    setLikedSlugs((prev) =>
      nextLiked ? [...prev, slug] : prev.filter((s) => s !== slug)
    );
    return nextLiked;
  };

  return (
    <WishlistContext.Provider value={{ likedSlugs, isLiked, toggleLike }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    return {
      likedSlugs: [],
      isLiked: () => false,
      toggleLike: () => false,
    };
  }
  return ctx;
}

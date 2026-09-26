"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import { products, type Product } from "@/lib/products";

export type CartLine = { slug: string; qty: number };

export type Coupon = {
  code: string;
  discountType: "percent" | "fixed" | "freeship";
  value: number; // e.g. 20 for 20%, 5 for $5
  minOrder?: number;
  description: string;
};

export const AVAILABLE_COUPONS: Coupon[] = [
  {
    code: "ROAST20",
    discountType: "percent",
    value: 20,
    description: "20% OFF on all signature fox nuts",
  },
  {
    code: "WELCOME10",
    discountType: "fixed",
    value: 5,
    description: "$5 OFF on your first gourmet order",
  },
  {
    code: "VIPGOLD",
    discountType: "fixed",
    value: 10,
    minOrder: 30,
    description: "$10 OFF on orders over $30",
  },
  {
    code: "FREESHIP",
    discountType: "freeship",
    value: 0,
    description: "Free Worldwide Express Delivery",
  },
  {
    code: "TRIO15",
    discountType: "percent",
    value: 15,
    description: "15% Special Gift Discount on The Trio Box",
  },
  {
    code: "FESTIVAL25",
    discountType: "percent",
    value: 25,
    description: "25% Festive Season Celebration Discount",
  },
  {
    code: "CORP35",
    discountType: "percent",
    value: 35,
    description: "35% Luxury Corporate Gifting Privilege",
  },
];

type State = { lines: CartLine[] };

type Action =
  | { type: "add"; slug: string; qty?: number }
  | { type: "addMultiple"; items: { slug: string; qty: number }[] }
  | { type: "remove"; slug: string }
  | { type: "setQty"; slug: string; qty: number }
  | { type: "clear" }
  | { type: "hydrate"; lines: CartLine[] };

const STORAGE_KEY = "makhana-premium-cart";
const COUPON_STORAGE_KEY = "makhana-applied-coupon";

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "hydrate":
      return { lines: action.lines };
    case "add": {
      const qty = action.qty ?? 1;
      const existing = state.lines.find((l) => l.slug === action.slug);
      if (existing) {
        return {
          lines: state.lines.map((l) =>
            l.slug === action.slug
              ? { ...l, qty: Math.min(l.qty + qty, 99) }
              : l,
          ),
        };
      }
      return { lines: [...state.lines, { slug: action.slug, qty }] };
    }
    case "addMultiple": {
      let newLines = [...state.lines];
      for (const item of action.items) {
        const qty = item.qty ?? 1;
        const existing = newLines.find((l) => l.slug === item.slug);
        if (existing) {
          newLines = newLines.map((l) =>
            l.slug === item.slug
              ? { ...l, qty: Math.min(l.qty + qty, 99) }
              : l,
          );
        } else {
          newLines.push({ slug: item.slug, qty });
        }
      }
      return { lines: newLines };
    }
    case "remove":
      return { lines: state.lines.filter((l) => l.slug !== action.slug) };
    case "setQty":
      if (action.qty <= 0) {
        return { lines: state.lines.filter((l) => l.slug !== action.slug) };
      }
      return {
        lines: state.lines.map((l) =>
          l.slug === action.slug ? { ...l, qty: Math.min(action.qty, 99) } : l,
        ),
      };
    case "clear":
      return { lines: [] };
    default:
      return state;
  }
}

type CartContextValue = {
  lines: CartLine[];
  detailed: { product: Product; qty: number }[];
  count: number;
  subtotal: number;
  savings: number;
  shipping: number;
  discountAmount: number;
  appliedCoupon: Coupon | null;
  total: number;
  availableCoupons: Coupon[];
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  add: (slug: string, qty?: number) => void;
  addBundle: (items: { slug: string; qty: number }[], couponCode?: string) => void;
  remove: (slug: string) => void;
  setQty: (slug: string, qty: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const FREE_SHIPPING_OVER = 49;
const SHIPPING_FEE = 5;

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { lines: [] });
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // Restore cart & coupon from localStorage on first mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          dispatch({ type: "hydrate", lines: parsed });
        }
      }

      const savedCoupon = localStorage.getItem(COUPON_STORAGE_KEY);
      if (savedCoupon) {
        setAppliedCoupon(JSON.parse(savedCoupon));
      }
    } catch {
      // Private browsing / blocked storage
    }
    setHydrated(true);
  }, []);

  // Persist cart
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.lines));
    } catch {
      // Ignore
    }
  }, [state.lines, hydrated]);

  // Persist coupon
  useEffect(() => {
    if (!hydrated) return;
    try {
      if (appliedCoupon) {
        localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem(COUPON_STORAGE_KEY);
      }
    } catch {
      // Ignore
    }
  }, [appliedCoupon, hydrated]);

  // Lock body scroll while the cart drawer is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const detailed = useMemo(() => {
    return state.lines
      .map((l) => {
        const product = products.find((p) => p.slug === l.slug);
        return product ? { product, qty: l.qty } : null;
      })
      .filter((x): x is { product: Product; qty: number } => x !== null);
  }, [state.lines]);

  const count = useMemo(() => detailed.reduce((n, l) => n + l.qty, 0), [detailed]);

  const subtotal = useMemo(
    () => detailed.reduce((n, l) => n + l.product.price * l.qty, 0),
    [detailed],
  );

  const savings = useMemo(
    () => detailed.reduce((n, l) => n + (l.product.mrp - l.product.price) * l.qty, 0),
    [detailed],
  );

  // Compute promo coupon discount
  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discountType === "percent") {
      return Math.round(subtotal * (appliedCoupon.value / 100) * 100) / 100;
    }
    if (appliedCoupon.discountType === "fixed") {
      return Math.min(appliedCoupon.value, subtotal);
    }
    return 0;
  }, [appliedCoupon, subtotal]);

  // Compute final shipping fee
  const shipping = useMemo(() => {
    if (appliedCoupon?.discountType === "freeship") return 0;
    return subtotal === 0 || subtotal >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FEE;
  }, [appliedCoupon, subtotal]);

  const total = useMemo(
    () => Math.max(0, subtotal - discountAmount + shipping),
    [subtotal, discountAmount, shipping],
  );

  const applyCoupon = (code: string): { success: boolean; message: string } => {
    const clean = code.trim().toUpperCase();
    const found = AVAILABLE_COUPONS.find((c) => c.code === clean);

    if (!found) {
      return {
        success: false,
        message: `Promo code "${clean}" is invalid or expired.`,
      };
    }

    if (found.minOrder && subtotal < found.minOrder) {
      return {
        success: false,
        message: `Code "${clean}" requires a minimum order of $${found.minOrder}.`,
      };
    }

    setAppliedCoupon(found);
    return {
      success: true,
      message: `Coupon "${found.code}" applied! ${found.description}`,
    };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const value = useMemo<CartContextValue>(
    () => ({
      lines: state.lines,
      detailed,
      count,
      subtotal,
      savings,
      shipping,
      discountAmount,
      appliedCoupon,
      total,
      availableCoupons: AVAILABLE_COUPONS,
      applyCoupon,
      removeCoupon,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      add: (slug, qty) => {
        dispatch({ type: "add", slug, qty });
        setIsOpen(true);
      },
      addBundle: (items, couponCode) => {
        dispatch({ type: "addMultiple", items });
        if (couponCode) {
          const clean = couponCode.trim().toUpperCase();
          const found = AVAILABLE_COUPONS.find((c) => c.code === clean);
          if (found) {
            setAppliedCoupon(found);
          }
        }
        setIsOpen(true);
      },
      remove: (slug) => dispatch({ type: "remove", slug }),
      setQty: (slug, qty) => dispatch({ type: "setQty", slug, qty }),
      clear: () => {
        dispatch({ type: "clear" });
        setAppliedCoupon(null);
      },
    }),
    [
      state.lines,
      detailed,
      count,
      subtotal,
      savings,
      shipping,
      discountAmount,
      appliedCoupon,
      total,
      isOpen,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

export { FREE_SHIPPING_OVER, SHIPPING_FEE };

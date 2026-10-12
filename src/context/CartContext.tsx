"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cart as cartApi } from "@/lib/api/store";
import { errorMessage, isAbortError } from "@/lib/api/errors";
import type { CartProblem, CartQuote, PaymentMethod, PublicCoupon, QuoteLine, SavedCart } from "@/lib/api/types";
import {
  lineKey,
  linesSignature,
  matchQuoteLines,
  MAX_LINES,
  MAX_QTY,
  normalizeLines,
  problemFor,
  toApiLines,
  type CartLine,
} from "@/lib/cart-lines";
import { readJson, removeKey, writeJson } from "@/lib/storage";
import { useAuth } from "./AuthContext";
import { useStoreConfig } from "./StoreConfigContext";

export type { CartLine } from "@/lib/cart-lines";
export { lineKey } from "@/lib/cart-lines";

/* ── Storage ──────────────────────────────────────────────────────────── */

const STORAGE_KEY = "makhana-premium-cart";
const META_KEY = "makhana-premium-cart-meta";
const EXTRA_KEY = "makhana-premium-cart-extra";
const LEGACY_COUPON_KEY = "makhana-applied-coupon";

/** Display data remembered per line so the bag renders instantly, before the quote. */
export type LineMeta = {
  name: string;
  image: string;
  price: number;
  mrp: number;
  /** e.g. "200g" for products, "3 flavours" for boxes */
  detail?: string;
};

/* ── Reducer ──────────────────────────────────────────────────────────── */

export type QuoteStatus = "idle" | "loading" | "ready" | "error";

type State = {
  hydrated: boolean;
  lines: CartLine[];
  meta: Record<string, LineMeta>;
  couponCode: string | null;
  giftNote: string;
  quote: CartQuote | null;
  /** Key (lines + coupon + context) the current quote was computed for. */
  quotedKey: string;
  quoteStatus: QuoteStatus;
  quoteError: string | null;
  checkoutProblems: CartProblem[];
  syncError: string | null;
};

const INITIAL: State = {
  hydrated: false,
  lines: [],
  meta: {},
  couponCode: null,
  giftNote: "",
  quote: null,
  quotedKey: "",
  quoteStatus: "idle",
  quoteError: null,
  checkoutProblems: [],
  syncError: null,
};

type Action =
  | { type: "hydrate"; lines: CartLine[]; meta: Record<string, LineMeta>; couponCode: string | null; giftNote: string }
  | { type: "replace"; lines: CartLine[]; couponCode: string | null; giftNote: string }
  | { type: "add"; line: CartLine; meta?: LineMeta }
  | { type: "mergeMeta"; meta: Record<string, LineMeta> }
  | { type: "setQty"; key: string; qty: number }
  | { type: "remove"; key: string }
  | { type: "subtract"; lines: CartLine[] }
  | { type: "clear" }
  | { type: "setCoupon"; code: string | null }
  | { type: "setGiftNote"; note: string }
  | { type: "quoteStart" }
  | { type: "quoteOk"; quote: CartQuote; key: string }
  | { type: "quoteFail"; message: string }
  | { type: "quoteReset" }
  | { type: "setProblems"; problems: CartProblem[] }
  | { type: "syncError"; message: string | null };

function addLine(lines: CartLine[], line: CartLine): CartLine[] {
  const key = lineKey(line);
  if (lines.some((l) => lineKey(l) === key)) {
    return lines.map((l) => (lineKey(l) === key ? { ...l, qty: Math.min(MAX_QTY, l.qty + line.qty) } : l));
  }
  return lines.length >= MAX_LINES ? lines : [...lines, line];
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "hydrate":
      return {
        ...state,
        hydrated: true,
        lines: action.lines,
        meta: action.meta,
        couponCode: action.couponCode,
        giftNote: action.giftNote,
      };
    case "replace":
      return { ...state, lines: action.lines, couponCode: action.couponCode, giftNote: action.giftNote, syncError: null };
    case "add":
      return {
        ...state,
        lines: addLine(state.lines, action.line),
        meta: action.meta ? { ...state.meta, [lineKey(action.line)]: action.meta } : state.meta,
      };
    case "mergeMeta":
      return { ...state, meta: { ...state.meta, ...action.meta } };
    case "setQty":
      if (action.qty <= 0) return { ...state, lines: state.lines.filter((l) => lineKey(l) !== action.key) };
      return {
        ...state,
        lines: state.lines.map((l) => (lineKey(l) === action.key ? { ...l, qty: Math.min(MAX_QTY, action.qty) } : l)),
      };
    case "remove":
      return { ...state, lines: state.lines.filter((l) => lineKey(l) !== action.key) };
    case "subtract": {
      const minus = new Map(action.lines.map((l) => [lineKey(l), l.qty]));
      return {
        ...state,
        lines: state.lines
          .map((l) => ({ ...l, qty: l.qty - (minus.get(lineKey(l)) ?? 0) }))
          .filter((l) => l.qty > 0),
      };
    }
    case "clear":
      return { ...state, lines: [], couponCode: null, giftNote: "", checkoutProblems: [] };
    case "setCoupon":
      return { ...state, couponCode: action.code };
    case "setGiftNote":
      return { ...state, giftNote: action.note.slice(0, 500) };
    case "quoteStart":
      return state.quoteStatus === "loading" ? state : { ...state, quoteStatus: "loading" };
    case "quoteOk": {
      const meta = { ...state.meta };
      for (const [key, ql] of matchQuoteLines(state.lines, action.quote.lines)) {
        meta[key] = { ...metaFromQuote(ql), detail: state.meta[key]?.detail ?? ql.variant };
      }
      return {
        ...state,
        quote: action.quote,
        quotedKey: action.key,
        quoteStatus: "ready",
        quoteError: null,
        checkoutProblems: [],
        meta,
      };
    }
    case "quoteFail":
      return { ...state, quoteStatus: "error", quoteError: action.message };
    case "quoteReset":
      return { ...state, quote: null, quotedKey: "", quoteStatus: "idle", quoteError: null };
    case "setProblems":
      return { ...state, checkoutProblems: action.problems };
    case "syncError":
      return { ...state, syncError: action.message };
    default:
      return state;
  }
}

/* ── Public types ─────────────────────────────────────────────────────── */

export type AddedModalProduct = {
  slug: string;
  name: string;
  price: number;
  image: string;
  mrp?: number;
  badge?: string;
  description?: string;
  tagline?: string;
  weight?: string;
};

export type DetailedLine = {
  key: string;
  line: CartLine;
  kind: "product" | "bundle";
  slug: string;
  variant?: string;
  name: string;
  image: string;
  /** Unit price (server price once quoted). */
  price: number;
  mrp: number;
  qty: number;
  lineTotal: number;
  detail?: string;
  contents?: QuoteLine["contents"];
  available: boolean;
  problem?: CartProblem;
};

type CartContextValue = {
  lines: CartLine[];
  detailed: DetailedLine[];
  count: number;
  /** Latest server quote (may lag one debounce behind optimistic quantities). */
  quote: CartQuote | null;
  quoteStatus: QuoteStatus;
  quoteError: string | null;
  /** True while the shown totals don't yet reflect the latest quantities. */
  isQuoting: boolean;
  retryQuote: () => void;

  subtotal: number;
  savings: number;
  shipping: number;
  codFee: number;
  discountAmount: number;
  total: number;
  freeShippingOver: number | null;
  amountToFreeShipping: number;
  problems: CartProblem[];

  couponCode: string | null;
  appliedCoupon: { code: string; description?: string; message: string } | null;
  /** The entered code no longer applies (e.g. below its minimum order). */
  couponNotice: string | null;
  availableCoupons: PublicCoupon[];
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;

  giftNote: string;
  setGiftNote: (note: string) => void;

  /** Destination + method so the quote shows zone shipping and COD fees. */
  setQuoteContext: (ctx: { country?: string; paymentMethod?: PaymentMethod }) => void;
  /** Problems returned by a failed checkout (shown on the matching lines). */
  setCheckoutProblems: (problems: CartProblem[]) => void;

  /** Saving the bag to the member's account failed. */
  syncError: string | null;

  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addedProduct: AddedModalProduct | null;
  isAddedModalOpen: boolean;
  openAddedModal: (product: AddedModalProduct) => void;
  closeAddedModal: () => void;

  addProduct: (
    product: { slug: string; name: string; image: string; price: number; mrp: number; weight?: string },
    opts?: { variant?: string; qty?: number; openDrawer?: boolean },
  ) => void;
  addBundle: (
    bundle: { slug: string; name: string; image: string; price: number; mrp: number; count?: string },
    opts?: { qty?: number; openDrawer?: boolean },
  ) => void;
  addLines: (lines: CartLine[], meta?: QuoteLine[]) => void;
  qtyOf: (line: Pick<CartLine, "slug" | "variant" | "bundle">) => number;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  /** Removes ordered quantities (keeps anything merged in since). */
  subtract: (lines: CartLine[]) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const QUOTE_DEBOUNCE = 350;
const SAVE_DEBOUNCE = 700;

function humanize(slug: string): string {
  return slug.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function metaFromQuote(q: QuoteLine): LineMeta {
  return { name: q.name, image: q.image, price: q.price, mrp: q.mrp, detail: q.variant };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { config } = useStoreConfig();
  const { status: authStatus, authEvent } = useAuth();

  const [state, dispatch] = useReducer(reducer, INITIAL);
  const { hydrated, lines, meta, couponCode, giftNote, quote } = state;

  const [quoteNonce, setQuoteNonce] = useState(0);
  const [quoteCtx, setQuoteCtx] = useState<{ country?: string; paymentMethod?: PaymentMethod }>({});
  const [coupons, setCoupons] = useState<PublicCoupon[]>([]);

  /** Latest state for async callbacks (written after commit, read in handlers/effects). */
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  });
  const memberSynced = useRef(false);
  const lastSavedSig = useRef<string | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [addedProduct, setAddedProduct] = useState<AddedModalProduct | null>(null);
  const [isAddedModalOpen, setIsAddedModalOpen] = useState(false);

  /* Restore the guest bag (migrating the old `{ slug, qty }` format). */
  useEffect(() => {
    const storedMeta = readJson(META_KEY);
    const extra = readJson(EXTRA_KEY) as { couponCode?: unknown; giftNote?: unknown } | null;
    // Coupons used to be stored as a whole object; the code is all we need now.
    const legacy = readJson(LEGACY_COUPON_KEY) as { code?: unknown } | null;
    removeKey(LEGACY_COUPON_KEY);
    dispatch({
      type: "hydrate",
      lines: normalizeLines(readJson(STORAGE_KEY)),
      meta: storedMeta && typeof storedMeta === "object" ? (storedMeta as Record<string, LineMeta>) : {},
      couponCode:
        typeof extra?.couponCode === "string"
          ? extra.couponCode
          : legacy && typeof legacy.code === "string"
            ? legacy.code
            : null,
      giftNote: typeof extra?.giftNote === "string" ? extra.giftNote : "",
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeJson(STORAGE_KEY, toApiLines(lines));
    const keys = new Set(lines.map(lineKey));
    writeJson(META_KEY, Object.fromEntries(Object.entries(meta).filter(([k]) => keys.has(k))));
    writeJson(EXTRA_KEY, { couponCode, giftNote });
  }, [lines, meta, couponCode, giftNote, hydrated]);

  /* Public offers for the coupon list. */
  useEffect(() => {
    cartApi
      .coupons()
      .then(setCoupons)
      .catch((e: unknown) => console.warn("[cart] coupons unavailable", e));
  }, []);

  /* ── Quote (debounced, latest-wins) ─────────────────────────────────── */

  const sig = linesSignature(lines);
  const quoteKey = `${sig}#${couponCode ?? ""}#${quoteCtx.country ?? ""}#${quoteCtx.paymentMethod ?? ""}`;

  useEffect(() => {
    if (!hydrated) return;
    if (lines.length === 0) {
      dispatch({ type: "quoteReset" });
      return;
    }
    const controller = new AbortController();
    dispatch({ type: "quoteStart" });
    const timer = setTimeout(() => {
      cartApi
        .quote(
          {
            items: toApiLines(lines),
            ...(couponCode ? { couponCode } : {}),
            ...(quoteCtx.country ? { country: quoteCtx.country } : {}),
            ...(quoteCtx.paymentMethod ? { paymentMethod: quoteCtx.paymentMethod } : {}),
          },
          { signal: controller.signal },
        )
        .then((q) => dispatch({ type: "quoteOk", quote: q, key: quoteKey }))
        .catch((e: unknown) => {
          if (isAbortError(e)) return;
          console.error("[cart] quote failed", e);
          dispatch({ type: "quoteFail", message: errorMessage(e, "We couldn't update your bag totals.") });
        });
    }, QUOTE_DEBOUNCE);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
    // quoteKey captures lines, coupon and context; quoteNonce forces a retry.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quoteKey, hydrated, quoteNonce]);

  /* ── Member sync ────────────────────────────────────────────────────── */

  const applySaved = useCallback((saved: SavedCart) => {
    const savedLines = normalizeLines(saved.items);
    dispatch({
      type: "replace",
      lines: savedLines,
      couponCode: saved.couponCode ?? null,
      giftNote: saved.giftNote ?? "",
    });
    lastSavedSig.current = `${linesSignature(savedLines)}#${saved.couponCode ?? ""}#${saved.giftNote ?? ""}`;
    memberSynced.current = true;
  }, []);

  useEffect(() => {
    if (!authEvent || !hydrated) return;
    if (authEvent.type === "signedOut") {
      memberSynced.current = false;
      lastSavedSig.current = null;
      dispatch({ type: "clear" });
      dispatch({ type: "syncError", message: null });
      return;
    }
    let cancelled = false;
    const current = stateRef.current;
    const body = {
      items: toApiLines(current.lines),
      ...(current.couponCode ? { couponCode: current.couponCode } : {}),
      ...(current.giftNote ? { giftNote: current.giftNote } : {}),
    };
    // Sign-in merges the guest bag into the account; a restored session trusts the saved bag.
    const run = authEvent.type === "signedIn" ? cartApi.mergeSaved(body) : cartApi.getSaved();
    run
      .then((saved) => {
        if (!cancelled) applySaved(saved);
      })
      .catch((e: unknown) => {
        console.error("[cart] member cart sync failed", e);
        if (cancelled) return;
        // Keep the local bag and save it from here on.
        memberSynced.current = true;
        dispatch({
          type: "syncError",
          message: errorMessage(e, "We couldn't load the bag saved to your account."),
        });
      });
    return () => {
      cancelled = true;
    };
  }, [authEvent, hydrated, applySaved]);

  /* Save every change for members (debounced). */
  const saveSig = `${sig}#${couponCode ?? ""}#${giftNote}`;
  useEffect(() => {
    if (authStatus !== "authenticated" || !memberSynced.current) return;
    if (saveSig === lastSavedSig.current) return;
    const timer = setTimeout(() => {
      cartApi
        .putSaved({
          items: toApiLines(lines),
          ...(couponCode ? { couponCode } : {}),
          ...(giftNote ? { giftNote } : {}),
        })
        .then(() => {
          lastSavedSig.current = saveSig;
          dispatch({ type: "syncError", message: null });
        })
        .catch((e: unknown) => {
          console.error("[cart] saving bag failed", e);
          dispatch({ type: "syncError", message: errorMessage(e, "We couldn't save your bag to your account.") });
        });
    }, SAVE_DEBOUNCE);
    return () => clearTimeout(timer);
    // saveSig captures lines, coupon and note.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saveSig, authStatus]);

  /* Lock body scroll while the drawer is open. */
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  /* ── Derived ────────────────────────────────────────────────────────── */

  const problems = useMemo(
    () => (state.checkoutProblems.length ? state.checkoutProblems : (quote?.problems ?? [])),
    [state.checkoutProblems, quote],
  );

  const detailed = useMemo<DetailedLine[]>(() => {
    const matched = quote ? matchQuoteLines(lines, quote.lines) : new Map<string, QuoteLine>();
    return lines.map((line) => {
      const key = lineKey(line);
      const q = matched.get(key);
      const m = meta[key];
      const problem = problemFor(line, problems);
      const price = q?.price ?? m?.price ?? 0;
      const slug = line.bundle ?? line.slug ?? "";
      return {
        key,
        line,
        kind: line.bundle ? "bundle" : "product",
        slug,
        variant: line.variant ?? q?.variant,
        name: q?.name ?? m?.name ?? humanize(slug),
        image: q?.image ?? m?.image ?? "/img/hero-makhana.jpg",
        price,
        mrp: q?.mrp ?? m?.mrp ?? price,
        qty: line.qty,
        lineTotal: Math.round(price * line.qty * 100) / 100,
        detail: line.variant ?? q?.variant ?? m?.detail,
        contents: q?.contents,
        available: problem ? false : (q?.available ?? true),
        problem,
      };
    });
  }, [lines, quote, meta, problems]);

  const count = useMemo(() => lines.reduce((n, l) => n + l.qty, 0), [lines]);
  const isQuoting = lines.length > 0 && state.quotedKey !== quoteKey;

  const totals = quote?.totals;
  const localSubtotal = Math.round(detailed.reduce((n, l) => n + l.lineTotal, 0) * 100) / 100;
  const subtotal = totals && !isQuoting ? totals.subtotal : localSubtotal;
  const freeShippingOver = quote ? (quote.shipping.freeOver ?? quote.freeShippingOver) : config.freeShippingOver;
  const amountToFreeShipping =
    quote && !isQuoting
      ? (quote.shipping.amountToFreeShipping ?? quote.amountToFreeShipping)
      : freeShippingOver === null
        ? 0
        : Math.max(0, freeShippingOver - subtotal);

  const appliedCoupon =
    quote?.coupon?.applied && couponCode
      ? { code: quote.coupon.code, description: quote.coupon.description, message: quote.coupon.message }
      : null;
  const couponNotice = couponCode && quote?.coupon && !quote.coupon.applied ? quote.coupon.message : null;

  /* ── Actions ────────────────────────────────────────────────────────── */

  const addProduct = useCallback<CartContextValue["addProduct"]>((product, opts = {}) => {
    const line: CartLine = opts.variant
      ? { slug: product.slug, variant: opts.variant, qty: opts.qty ?? 1 }
      : { slug: product.slug, qty: opts.qty ?? 1 };
    dispatch({
      type: "add",
      line,
      meta: {
        name: product.name,
        image: product.image,
        price: product.price,
        mrp: product.mrp,
        detail: opts.variant ?? product.weight,
      },
    });
    if (opts.openDrawer) setIsOpen(true);
  }, []);

  const addBundle = useCallback<CartContextValue["addBundle"]>((bundle, opts = {}) => {
    dispatch({
      type: "add",
      line: { bundle: bundle.slug, qty: opts.qty ?? 1 },
      meta: { name: bundle.name, image: bundle.image, price: bundle.price, mrp: bundle.mrp, detail: bundle.count },
    });
    if (opts.openDrawer) setIsOpen(true);
  }, []);

  const addLines = useCallback((newLines: CartLine[], quoteLines?: QuoteLine[]) => {
    const normalized = normalizeLines(newLines);
    if (quoteLines) {
      const metaUpdates: Record<string, LineMeta> = {};
      for (const [key, ql] of matchQuoteLines(normalized, quoteLines)) metaUpdates[key] = metaFromQuote(ql);
      dispatch({ type: "mergeMeta", meta: metaUpdates });
    }
    for (const line of normalized) dispatch({ type: "add", line });
  }, []);

  const applyCoupon = useCallback(
    async (code: string) => {
      const clean = code.trim().toUpperCase();
      if (!clean) return { success: false, message: "Enter a coupon code." };
      const current = stateRef.current;
      if (current.lines.length === 0) return { success: false, message: "Add something to your bag first." };
      try {
        const q = await cartApi.quote({
          items: toApiLines(current.lines),
          couponCode: clean,
          ...(quoteCtx.country ? { country: quoteCtx.country } : {}),
          ...(quoteCtx.paymentMethod ? { paymentMethod: quoteCtx.paymentMethod } : {}),
        });
        if (q.coupon?.applied) {
          dispatch({ type: "setCoupon", code: q.coupon.code });
          return { success: true, message: q.coupon.message };
        }
        return { success: false, message: q.coupon?.message ?? `Promo code "${clean}" is invalid or expired.` };
      } catch (e) {
        return { success: false, message: errorMessage(e, "We couldn't check that code. Please try again.") };
      }
    },
    [quoteCtx],
  );

  const setQuoteContext = useCallback((ctx: { country?: string; paymentMethod?: PaymentMethod }) => {
    setQuoteCtx((prev) => (prev.country === ctx.country && prev.paymentMethod === ctx.paymentMethod ? prev : ctx));
  }, []);

  const setCheckoutProblems = useCallback(
    (p: CartProblem[]) => dispatch({ type: "setProblems", problems: p }),
    [],
  );

  const value: CartContextValue = {
    lines,
    detailed,
    count,
    quote,
    quoteStatus: state.quoteStatus,
    quoteError: state.quoteError,
    isQuoting,
    retryQuote: () => setQuoteNonce((n) => n + 1),

    subtotal,
    savings: totals?.savings ?? 0,
    shipping: totals?.shipping ?? 0,
    codFee: totals?.codFee ?? 0,
    discountAmount: totals?.discount ?? 0,
    total: totals?.total ?? subtotal,
    freeShippingOver,
    amountToFreeShipping,
    problems,

    couponCode,
    appliedCoupon,
    couponNotice,
    availableCoupons: coupons,
    applyCoupon,
    removeCoupon: () => dispatch({ type: "setCoupon", code: null }),

    giftNote,
    setGiftNote: (note: string) => dispatch({ type: "setGiftNote", note }),

    setQuoteContext,
    setCheckoutProblems,
    syncError: state.syncError,

    isOpen,
    openCart: () => setIsOpen(true),
    closeCart: () => setIsOpen(false),
    addedProduct,
    isAddedModalOpen,
    openAddedModal: (product: AddedModalProduct) => {
      setAddedProduct(product);
      setIsAddedModalOpen(true);
    },
    closeAddedModal: () => setIsAddedModalOpen(false),

    addProduct,
    addBundle,
    addLines,
    qtyOf: (line) => lines.find((l) => lineKey(l) === lineKey(line))?.qty ?? 0,
    setQty: (key, qty) => dispatch({ type: "setQty", key, qty }),
    remove: (key) => dispatch({ type: "remove", key }),
    subtract: (ordered) => dispatch({ type: "subtract", lines: ordered }),
    clear: () => dispatch({ type: "clear" }),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

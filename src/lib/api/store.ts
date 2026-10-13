/**
 * Typed storefront endpoints for the browser. Every function throws `ApiError`.
 * Server components use `./server.ts` instead (caching + graceful failure).
 */
import { apiData, apiRequest } from "./client";
import type {
  AddressInput,
  Bundle,
  BundleKind,
  CartQuote,
  CheckoutInput,
  ContactInput,
  ContentBlock,
  HelpfulResult,
  Member,
  MemberPatch,
  NewsletterInput,
  OpData,
  OrderGroup,
  OrdersMeta,
  OtpChallenge,
  OtpVerifyResult,
  PaymentStatusInfo,
  PlaceOrderResult,
  Preferences,
  Product,
  ProductDetail,
  ProductSort,
  PublicCoupon,
  QuoteBody,
  RazorpayCheckout,
  ReorderResult,
  Review,
  ReviewCategory,
  ReviewInput,
  ReviewSubmitted,
  ReviewSummary,
  SavedAddress,
  SavedCart,
  SavedCartBody,
  ShippingEstimate,
  ShippingZone,
  StoreConfig,
  StoreOrder,
  Heat,
} from "./types";

const enc = encodeURIComponent;
type Opts = { signal?: AbortSignal };

/* ── Auth ─────────────────────────────────────────────────────────────── */

export const auth = {
  requestOtp: (identifier: string, backupEmail?: string) =>
    apiData<OtpChallenge>("/store/auth/otp/request", {
      method: "POST",
      body: { identifier, ...(backupEmail ? { backupEmail } : {}) },
    }),
  verifyOtp: (body: { challengeId: string; code: string; name?: string }) =>
    apiData<OtpVerifyResult>("/store/auth/otp/verify", { method: "POST", body }),
  logout: () => apiRequest<void>("/store/auth/logout", { method: "POST", body: {} }),
};

/* ── Catalog ──────────────────────────────────────────────────────────── */

export const catalog = {
  products: (q: { heat?: Heat | "All"; sort?: ProductSort } = {}, o: Opts = {}) =>
    apiData<Product[]>("/store/products", {
      query: { heat: q.heat === "All" ? undefined : q.heat, sort: q.sort },
      signal: o.signal,
    }),
  product: (slug: string) => apiData<ProductDetail>(`/store/products/${enc(slug)}`),
  bundles: (kind?: BundleKind) => apiData<Bundle[]>("/store/bundles", { query: { kind } }),
  zones: () => apiData<ShippingZone[]>("/store/shipping/zones"),
  estimate: (q: { country?: string; zip?: string; subtotal?: number }, o: Opts = {}) =>
    apiData<ShippingEstimate>("/store/shipping/estimate", { query: q, signal: o.signal }),
  config: () => apiData<StoreConfig>("/store/config"),
  content: (key: string) => apiData<ContentBlock>(`/store/content/${enc(key)}`),
};

/* ── Cart & checkout ──────────────────────────────────────────────────── */

export const cart = {
  coupons: () => apiData<PublicCoupon[]>("/store/coupons"),
  quote: (body: QuoteBody, o: Opts = {}) =>
    apiData<CartQuote>("/store/cart/quote", { method: "POST", body, signal: o.signal, timeoutMs: 10_000 }),
  getSaved: () => apiData<SavedCart>("/store/me/cart", { auth: true }),
  putSaved: (body: SavedCartBody) =>
    apiData<SavedCart>("/store/me/cart", { method: "PUT", body, auth: true }),
  mergeSaved: (body: SavedCartBody) =>
    apiData<SavedCart>("/store/me/cart/merge", { method: "POST", body, auth: true }),
};

export const orders = {
  place: (body: CheckoutInput, idempotencyKey: string) =>
    apiData<PlaceOrderResult>("/store/orders", {
      method: "POST",
      body,
      auth: "optional",
      headers: { "Idempotency-Key": idempotencyKey },
      timeoutMs: 30_000,
    }),
  startPayment: (orderId: string, email?: string) =>
    apiData<RazorpayCheckout>(`/store/orders/${enc(orderId)}/payment`, {
      method: "POST",
      body: email ? { email } : {},
      auth: "optional",
      timeoutMs: 30_000,
    }),
  verifyPayment: (
    orderId: string,
    body: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string },
  ) =>
    apiData<StoreOrder>(`/store/orders/${enc(orderId)}/payment/verify`, {
      method: "POST",
      body,
      auth: "optional",
      timeoutMs: 30_000,
    }),
  paymentStatus: (orderId: string, email?: string) =>
    apiData<PaymentStatusInfo>(`/store/orders/${enc(orderId)}/payment`, {
      query: { email },
      auth: "optional",
    }),
  lookup: (number: string, email: string) =>
    apiData<StoreOrder>("/store/orders/lookup", { query: { number, email } }),
};

/* ── Member account ───────────────────────────────────────────────────── */

export const me = {
  get: () => apiData<Member>("/store/me", { auth: true }),
  update: (body: MemberPatch) => apiData<Member>("/store/me", { method: "PATCH", body, auth: true }),
  setPreferences: (body: Preferences) =>
    apiData<Member>("/store/me/preferences", { method: "PUT", body, auth: true }),

  addresses: () => apiData<SavedAddress[]>("/store/me/addresses", { auth: true }),
  addAddress: (body: AddressInput) =>
    apiData<SavedAddress>("/store/me/addresses", { method: "POST", body, auth: true }),
  updateAddress: (id: string, body: AddressInput) =>
    apiData<SavedAddress>(`/store/me/addresses/${enc(id)}`, { method: "PUT", body, auth: true }),
  deleteAddress: (id: string) =>
    apiRequest<void>(`/store/me/addresses/${enc(id)}`, { method: "DELETE", auth: true }),
  setDefaultAddress: (id: string) =>
    apiData<SavedAddress[]>(`/store/me/addresses/${enc(id)}/default`, { method: "POST", auth: true }),

  orders: async (q: { group?: OrderGroup; page?: number; pageSize?: number } = {}, o: Opts = {}) => {
    const body = await apiRequest<{ data: StoreOrder[]; meta: OrdersMeta }>("/store/me/orders", {
      query: q,
      auth: true,
      signal: o.signal,
    });
    return body;
  },
  order: (id: string) => apiData<StoreOrder>(`/store/me/orders/${enc(id)}`, { auth: true }),
  cancelOrder: (id: string, reason?: string) =>
    apiData<StoreOrder>(`/store/me/orders/${enc(id)}/cancel`, {
      method: "POST",
      body: reason ? { reason } : {},
      auth: true,
    }),
  reorder: (id: string) =>
    apiData<ReorderResult>(`/store/me/orders/${enc(id)}/reorder`, { method: "POST", auth: true }),
  invoiceHtml: (id: string) =>
    apiRequest<string>(`/store/me/orders/${enc(id)}/invoice`, {
      auth: true,
      responseType: "text",
      headers: { Accept: "text/html" },
    }),

  wishlist: () => apiData<string[]>("/store/me/wishlist", { auth: true }),
  like: (slug: string) => apiData<string[]>(`/store/me/wishlist/${enc(slug)}`, { method: "PUT", auth: true }),
  unlike: (slug: string) =>
    apiData<string[]>(`/store/me/wishlist/${enc(slug)}`, { method: "DELETE", auth: true }),
  mergeWishlist: (slugs: string[]) =>
    apiData<string[]>("/store/me/wishlist/merge", { method: "POST", body: { slugs }, auth: true }),
};

/* ── Reviews, contact, newsletter ─────────────────────────────────────── */

export const reviews = {
  list: (q: { category?: ReviewCategory; product?: string; bundle?: string; limit?: number } = {}) =>
    apiData<Review[]>("/store/reviews", { query: q }),
  summary: () => apiData<ReviewSummary>("/store/reviews/summary"),
  submit: (body: ReviewInput) =>
    apiData<ReviewSubmitted>("/store/reviews", { method: "POST", body, auth: "optional" }),
  helpful: (id: string) =>
    apiData<HelpfulResult>(`/store/reviews/${enc(id)}/helpful`, { method: "POST", auth: "optional" }),
};

export const contact = {
  send: (body: ContactInput) =>
    apiData<OpData<"postStoreContact">>("/store/contact", { method: "POST", body }),
  subscribe: (body: NewsletterInput) =>
    apiData<OpData<"postStoreNewsletter">>("/store/newsletter", { method: "POST", body }),
  /** Token from the link in every newsletter email. 404 `invalid_token` for an unknown link. */
  unsubscribe: (token: string) =>
    apiData<OpData<"postStoreNewsletterUnsubscribe">>("/store/newsletter/unsubscribe", { method: "POST", body: { token } }),
};

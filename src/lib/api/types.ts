/**
 * Friendly aliases over the generated OpenAPI types (`schema.d.ts`).
 * Regenerate the schema with `npm run api:types` whenever the backend changes.
 */
import type { components, operations } from "./schema";

type Schemas = components["schemas"];

type JsonOf<R> = R extends { content: { "application/json": infer J } } ? J : never;
type SuccessJson<O> = O extends { responses: infer R }
  ? R extends { 200: infer S }
    ? JsonOf<S>
    : R extends { 201: infer S }
      ? JsonOf<S>
      : never
  : never;

/** The `data` member of an operation's success envelope. */
export type OpData<K extends keyof operations> =
  SuccessJson<operations[K]> extends { data: infer D } ? D : never;
/** The `meta` member of a list operation's success envelope. */
export type OpMeta<K extends keyof operations> =
  SuccessJson<operations[K]> extends { meta: infer M } ? M : never;
/** JSON request body of an operation. */
export type OpBody<K extends keyof operations> = operations[K] extends {
  requestBody?: { content: { "application/json": infer B } };
}
  ? B
  : never;
/** Query parameters of an operation. */
export type OpQuery<K extends keyof operations> = operations[K] extends {
  parameters: { query?: infer Q };
}
  ? NonNullable<Q>
  : never;

export type Product = Schemas["StoreProduct"];
export type ProductVariant = Product["variants"][number];
export type ProductDetail = OpData<"getStoreProductsSlug">;
export type Heat = Product["heat"];
export type ProductSort = NonNullable<OpQuery<"getStoreProducts">["sort"]>;

export type Bundle = Schemas["Bundle"];
export type BundleKind = Bundle["kind"];

export type ShippingZone = Schemas["ShippingZone"];
export type ShippingEstimate = OpData<"getStoreShippingEstimate">;

export type StoreConfig = Schemas["StorefrontConfig"];
export type PaymentMethod = StoreConfig["payments"]["methods"][number];

export type PublicCoupon = Schemas["PublicCoupon"];

export type CartLineInput = Schemas["CartLineInput"];
export type CartQuote = Schemas["CartQuote"];
export type QuoteLine = CartQuote["lines"][number];
export type CartProblem = CartQuote["problems"][number];
export type QuoteBody = OpBody<"postStoreCartQuote">;
export type SavedCart = Schemas["SavedCart"];
export type SavedCartBody = OpBody<"putStoreMeCart">;

export type CheckoutInput = Schemas["CheckoutInput"];
export type PlaceOrderResult = OpData<"postStoreOrders">;
export type StoreOrder = Schemas["StoreOrderOutput"];
export type OrderItem = Schemas["OrderItem"];
export type OrderStatus = StoreOrder["status"];
export type OrderGroup = NonNullable<OpQuery<"getStoreMeOrders">["group"]>;
export type OrdersMeta = OpMeta<"getStoreMeOrders">;
export type ReorderResult = OpData<"postStoreMeOrdersIdReorder">;
export type RazorpayCheckout = Schemas["RazorpayCheckout"];
export type PaymentStatusInfo = OpData<"getStoreOrdersIdPayment">;

export type Member = Schemas["MemberOutput"];
export type SavedAddress = Schemas["SavedAddress"];
export type AddressInput = Schemas["AddressInput"];
export type MemberPatch = OpBody<"patchStoreMe">;
export type Preferences = OpBody<"putStoreMePreferences">;

export type OtpChallenge = OpData<"postStoreAuthOtpRequest">;
export type OtpVerifyResult = OpData<"postStoreAuthOtpVerify">;
export type CustomerTokens = Schemas["CustomerTokens"];

export type Review = Schemas["Review"];
export type ReviewCategory = NonNullable<OpQuery<"getStoreReviews">["category"]>;
export type ReviewSummary = OpData<"getStoreReviewsSummary">;
export type ReviewInput = OpBody<"postStoreReviews">;
export type ReviewSubmitted = OpData<"postStoreReviews">;
export type HelpfulResult = OpData<"postStoreReviewsIdHelpful">;

export type ContentBlock = Schemas["ContentBlock"];
export type ContactInput = OpBody<"postStoreContact">;
export type NewsletterInput = OpBody<"postStoreNewsletter">;

/** Shape of the `faq` content block's `data` (validated at runtime in `parseFaq`). */
export type FaqItem = { id: string; q: string; a: string; category: string };

export const REVIEW_CATEGORIES: readonly ReviewCategory[] = [
  "Gourmet Flavours",
  "Packaging & Delivery",
  "Ingredients & Craft",
] as const;

import Hero from "@/components/home/Hero";
import Flavours from "@/components/home/Flavours";
import BrandPillars from "@/components/home/BrandPillars";
import IndulgeBenefits from "@/components/home/IndulgeBenefits";
import FlavourCombos from "@/components/home/FlavourCombos";
import Gifting from "@/components/home/Gifting";
import GlobalDelivery from "@/components/home/GlobalDelivery";
import Testimonials, { type FlavourOption } from "@/components/home/Testimonials";
import Faq from "@/components/home/Faq";
import {
  getBundles,
  getFaq,
  getProducts,
  getReviews,
  getReviewSummary,
  getShippingZones,
} from "@/lib/api/server";
import { REVIEW_CATEGORIES } from "@/lib/api/types";

// ISR: the home page is regenerated in the background at most every minute.
export const revalidate = 60;

export default async function Home() {
  const [products, combos, giftBoxes, zones, faq, summary, latest, ...reviewLists] = await Promise.all([
    getProducts(),
    getBundles("combo"),
    getBundles("gift_box"),
    getShippingZones(),
    getFaq(),
    getReviewSummary(),
    getReviews(undefined, 1),
    ...REVIEW_CATEGORIES.map((c) => getReviews(c, 3)),
  ]);

  // Lead with the category of the most recently approved review, so a review
  // approved in the admin is on the first slide, not two clicks away.
  const slides = REVIEW_CATEGORIES.map((category, i) => ({ category, reviews: reviewLists[i] ?? null }));
  const newest = latest?.[0]?.category;
  if (newest) slides.sort((a, b) => Number(b.category === newest) - Number(a.category === newest));
  const flavourOptions: FlavourOption[] = [
    ...(products ?? []).map((p) => ({ label: p.name, productSlug: p.slug })),
    ...(giftBoxes ?? []).map((b) => ({ label: b.name, bundleSlug: b.slug })),
  ];

  return (
    <>
      <Hero />
      <Flavours products={products} />
      <FlavourCombos combos={combos} />
      <BrandPillars />
      <IndulgeBenefits />
      <Gifting />
      <GlobalDelivery zones={zones} />
      <Testimonials slides={slides} summary={summary} flavourOptions={flavourOptions} />
      <Faq items={faq} />
    </>
  );
}

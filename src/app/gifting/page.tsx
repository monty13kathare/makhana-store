import type { Metadata } from "next";
import { getBundles } from "@/lib/api/server";
import GiftingClient from "./GiftingClient";

export const metadata: Metadata = {
  title: "Gifting",
  description: "Handcrafted makhana gift boxes with a hand-written note, sent in satin ribbon.",
};

export const revalidate = 60;

export default async function GiftingPage() {
  const bundles = await getBundles("gift_box");
  return <GiftingClient bundles={bundles} />;
}

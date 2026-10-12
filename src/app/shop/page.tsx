import type { Metadata } from "next";
import { getProducts } from "@/lib/api/server";
import ShopClient from "./ShopClient";

export const metadata: Metadata = {
  title: "Shop all flavours",
  description:
    "Small-batch roasted makhana flavours — classic, peri peri, truffle, chaat and more.",
};

// Incremental static regeneration: the listing refreshes at most every minute.
export const revalidate = 60;

export default async function ShopPage() {
  const products = await getProducts();
  return <ShopClient initialProducts={products} />;
}

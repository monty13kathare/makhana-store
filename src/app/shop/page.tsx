import type { Metadata } from "next";
import ShopClient from "./ShopClient";

export const metadata: Metadata = {
  title: "Shop all flavours",
  description:
    "Eight small-batch roasted makhana flavours — classic, peri peri, cheese & herb, jaggery caramel and more.",
};

export default function ShopPage() {
  return <ShopClient />;
}

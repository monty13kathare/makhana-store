import type { Metadata } from "next";
import { getShippingZones } from "@/lib/api/server";
import ShippingClient from "./ShippingClient";

export const metadata: Metadata = {
  title: "Worldwide shipping",
  description: "Delivery times, shipping costs and cash-on-delivery availability for every region we ship to.",
};

export const revalidate = 300;

export default async function ShippingPage() {
  const zones = await getShippingZones();
  return <ShippingClient zones={zones} />;
}

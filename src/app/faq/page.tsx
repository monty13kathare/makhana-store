import type { Metadata } from "next";
import Faq from "@/components/home/Faq";
import { getFaq } from "@/lib/api/server";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers on makhana, shelf life, nutrition, shipping and bulk orders.",
};

export const revalidate = 300;

export default async function FaqPage() {
  const items = await getFaq();
  return (
    <div className="pt-[92px]">
      <Faq items={items} />
    </div>
  );
}

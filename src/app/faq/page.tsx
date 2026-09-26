import type { Metadata } from "next";
import Faq from "@/components/home/Faq";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers on makhana, shelf life, nutrition, shipping and bulk orders.",
};

export default function FaqPage() {
  return (
    <div className="pt-[92px]">
      <Faq />
    </div>
  );
}

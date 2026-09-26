import Hero from "@/components/home/Hero";
import Flavours from "@/components/home/Flavours";
import BrandPillars from "@/components/home/BrandPillars";
import IndulgeBenefits from "@/components/home/IndulgeBenefits";
import Gifting from "@/components/home/Gifting";
import GlobalDelivery from "@/components/home/GlobalDelivery";
import Testimonials from "@/components/home/Testimonials";
import Faq from "@/components/home/Faq";

export default function Home() {
  return (
    <>
      <Hero />
      <Flavours />
      <BrandPillars />
      <IndulgeBenefits />
      <Gifting />
      <GlobalDelivery />
      <Testimonials />
      <Faq />
    </>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion-primitives";

export const metadata: Metadata = {
  title: "Our story",
  description:
    "How Makhana went from a family pond in Mithila to small-batch roasts shipped across the world.",
};

const milestones = [
  { year: "2019", title: "One pond", body: "We started with the family plot in Darbhanga and a single iron kadhai." },
  { year: "2021", title: "Forty growers", body: "A collective formed, paying growers above the mandi rate, every season." },
  { year: "2023", title: "Our own roastery", body: "A small certified unit so we could control the roast end to end." },
  { year: "2026", title: "Global reach", body: "Shipping worldwide with signature flavours, still roasting small batches at a time." },
];

export default function AboutPage() {
  return (
    <>
      <section className="pt-[92px] pb-8 sm:pt-[116px] sm:pb-16 lg:pt-[140px] lg:pb-20">
        <div className="container-x">
          <Reveal className="max-w-[56ch]">
            <p className="mb-3 text-[11.5px] font-semibold uppercase tracking-[0.22em] text-gold">
              Our story
            </p>
            <h1 className="text-[28px] xs:text-[30px] font-extrabold leading-[1.08] tracking-[-0.025em] sm:text-[48px]">
              From a pond in Mithila to{" "}
              <span className="font-display italic text-gold">your desk drawer</span>
            </h1>
            <p className="mt-3 text-[14.5px] leading-relaxed text-muted sm:mt-5 sm:text-[15px]">
              Makhana has been farmed in Bihar for centuries, almost entirely by
              hand. Divers go down into chest-deep water to collect the pods, the
              seeds are sun-dried, graded by size, then popped over an open flame
              in seconds. It is skilled, punishing work that has never paid well.
            </p>
            <p className="mt-3 text-[14.5px] leading-relaxed text-muted sm:mt-4 sm:text-[15px]">
              We built our brand to change one part of that: pay the growers properly,
              roast the crop ourselves, and sell it fresh instead of letting it sit
              in a warehouse for a year.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Image band */}
      <section className="pb-12 sm:pb-20 lg:pb-24">
        <div className="container-x">
          {/* Phones: swipeable row. The group (not each image) watches the
              viewport so images that start off-screen to the right still reveal. */}
          <StaggerGroup className="swipe-row gap-3 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0">
            {[
              { src: "/img/farm-harvest.jpg", alt: "Harvesting lotus pods" },
              { src: "/img/roasting-fire.jpg", alt: "Roasting over an open flame" },
              { src: "/img/lifestyle-snack.jpg", alt: "A bowl of roasted makhana" },
            ].map((img) => (
              <StaggerItem
                key={img.src}
                className="w-[72%] max-w-[300px] shrink-0 snap-start sm:w-auto sm:max-w-none"
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-[18px] border border-white/10 sm:rounded-[20px]">
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes="(max-width: 640px) 72vw, 33vw"
                    className="object-cover"
                  />
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* Sourcing */}
      <section id="sourcing" className="pb-12 sm:pb-20 lg:pb-28">
        <div className="container-x">
          <Reveal className="mb-5 max-w-[48ch] sm:mb-10">
            <h2 className="text-[24px] font-extrabold leading-[1.14] tracking-[-0.02em] sm:text-[36px]">
              How we got{" "}
              <span className="font-display italic text-gold">here</span>
            </h2>
          </Reveal>

          <StaggerGroup className="grid grid-cols-2 gap-px overflow-hidden rounded-[20px] border border-white/10 bg-white/10 sm:rounded-[24px] lg:grid-cols-4">
            {milestones.map((m) => (
              <StaggerItem key={m.year} className="bg-ink-soft px-4 py-5 sm:px-7 sm:py-9">
                <p className="mb-1.5 text-[12.5px] font-bold text-gold sm:mb-3 sm:text-[13px]">{m.year}</p>
                <h3 className="mb-1 text-[15px] font-bold sm:mb-2 sm:text-[17px]">{m.title}</h3>
                <p className="text-[12.5px] leading-relaxed text-dim sm:text-[13.5px]">{m.body}</p>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>
    </>
  );
}

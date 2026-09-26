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
      <section className="pt-[116px] pb-16 lg:pt-[140px] lg:pb-20">
        <div className="container-x">
          <Reveal className="max-w-[56ch]">
            <p className="mb-3 text-[11.5px] font-semibold uppercase tracking-[0.22em] text-gold">
              Our story
            </p>
            <h1 className="text-[34px] font-extrabold leading-[1.08] tracking-[-0.025em] sm:text-[48px]">
              From a pond in Mithila to{" "}
              <span className="font-display italic text-gold">your desk drawer</span>
            </h1>
            <p className="mt-5 text-[15px] leading-relaxed text-muted">
              Makhana has been farmed in Bihar for centuries, almost entirely by
              hand. Divers go down into chest-deep water to collect the pods, the
              seeds are sun-dried, graded by size, then popped over an open flame
              in seconds. It is skilled, punishing work that has never paid well.
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-muted">
              We built our brand to change one part of that: pay the growers properly,
              roast the crop ourselves, and sell it fresh instead of letting it sit
              in a warehouse for a year.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Image band */}
      <section className="pb-20 lg:pb-24">
        <div className="container-x">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { src: "/img/farm-harvest.jpg", alt: "Harvesting lotus pods" },
              { src: "/img/roasting-fire.jpg", alt: "Roasting over an open flame" },
              { src: "/img/lifestyle-snack.jpg", alt: "A bowl of roasted makhana" },
            ].map((img, i) => (
              <Reveal key={img.src} delay={i * 0.1}>
                <div className="relative aspect-[4/5] overflow-hidden rounded-[20px] border border-white/10">
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Sourcing */}
      <section id="sourcing" className="pb-20 lg:pb-28">
        <div className="container-x">
          <Reveal className="mb-10 max-w-[48ch]">
            <h2 className="text-[26px] font-extrabold leading-[1.14] tracking-[-0.02em] sm:text-[36px]">
              How we got{" "}
              <span className="font-display italic text-gold">here</span>
            </h2>
          </Reveal>

          <StaggerGroup className="grid gap-px overflow-hidden rounded-[24px] border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {milestones.map((m) => (
              <StaggerItem key={m.year} className="bg-ink-soft px-7 py-9">
                <p className="mb-3 text-[13px] font-bold text-gold">{m.year}</p>
                <h3 className="mb-2 text-[17px] font-bold">{m.title}</h3>
                <p className="text-[13.5px] leading-relaxed text-dim">{m.body}</p>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>
    </>
  );
}

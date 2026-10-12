"use client";

import { motion } from "framer-motion";
import { Globe, Package, Plane, ShieldCheck, Truck } from "lucide-react";
import { EASE, Reveal, StaggerGroup, StaggerItem } from "@/components/motion-primitives";
import { ErrorState } from "@/components/ui/DataState";
import type { ShippingZone } from "@/lib/api/types";
import { formatMoney } from "@/lib/format";

function titleCase(s: string) {
  return s.length <= 3 ? s.toUpperCase() : s.replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Rows for the zones table, from GET /store/shipping/zones. */
function toRows(zones: ShippingZone[]) {
  return zones.map((z) => {
    const time =
      z.etaMinDays === z.etaMaxDays
        ? `${z.etaMinDays} working days`
        : `${z.etaMinDays}–${z.etaMaxDays} working days`;
    const fee = z.fee === 0 ? "Free" : formatMoney(z.fee);
    const cost = z.freeOver != null && z.fee > 0 ? `${fee} · free over ${formatMoney(z.freeOver)}` : fee;
    // Long names only (skip ISO codes) for the countries hint.
    const names = z.countries.filter((c) => c.length > 3).slice(0, 6).map(titleCase);
    const where = z.isDefault && names.length === 0 ? "Every other destination we ship to." : names.join(", ");
    const cod = z.codAvailable
      ? `Cash on delivery available${z.codFee > 0 ? ` (+${formatMoney(z.codFee)})` : ""}.`
      : "";
    return {
      region: z.name,
      time,
      cost,
      note: [z.note, where && !z.note ? `${where}${where.endsWith(".") ? "" : "."}` : "", cod].filter(Boolean).join(" "),
    };
  });
}

const promises = [
  { icon: Package, title: "Nitrogen-sealed", body: "Packs are flushed before they fly, so the snap survives the trip." },
  { icon: ShieldCheck, title: "Customs handled", body: "We file the paperwork and declare accurately — no surprise holds." },
  { icon: Plane, title: "Air freight only", body: "Nothing travels by sea. Freshness beats a cheaper shipping line." },
  { icon: Truck, title: "Tracked end to end", body: "One tracking link from our unit to your doorstep." },
];

export default function ShippingClient({ zones }: { zones: ShippingZone[] | null }) {
  const rows = zones ? toRows(zones) : [];
  return (
    <>
      <section className="pt-[92px] pb-7 sm:pt-[116px] sm:pb-14 lg:pt-[140px] lg:pb-16">
        <div className="container-x">
          <Reveal className="max-w-[56ch]">
            <p className="mb-3 text-[11.5px] font-semibold uppercase tracking-[0.22em] text-gold">
              Worldwide shipment
            </p>
            <h1 className="text-[28px] xs:text-[30px] font-extrabold leading-[1.08] tracking-[-0.025em] sm:text-[48px]">
              We ship the{" "}
              <span className="font-display italic text-gold">whole harvest</span>{" "}
              worldwide
            </h1>
            <p className="mt-3 text-[14.5px] leading-relaxed text-muted sm:mt-5 sm:text-[15px]">
              Every order leaves our Darbhanga unit nitrogen-sealed and travels by
              air. Below is what to expect, wherever you are.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Zones */}
      <section className="pb-8 sm:pb-16 lg:pb-20">
        <div className="container-x">
          {zones === null && (
            <ErrorState
              className="mb-4"
              title="Shipping rates are unavailable right now"
              message="Your exact shipping cost and delivery window are always shown at checkout."
            />
          )}
          <div className="overflow-hidden rounded-[20px] border border-white/10 bg-surface sm:rounded-[24px]">
            <div className="hidden grid-cols-[1.2fr_1fr_1fr_1.6fr] gap-6 border-b border-white/10 px-7 py-4 text-[11.5px] font-bold uppercase tracking-wider text-dim lg:grid">
              <span>Region</span>
              <span>Transit</span>
              <span>Cost</span>
              <span>Notes</span>
            </div>

            {rows.map((z, i) => (
              <motion.div
                key={z.region}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, ease: EASE, delay: i * 0.07 }}
                className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 border-b border-white/10 px-4 py-4 last:border-b-0 sm:gap-y-2 sm:px-7 sm:py-6 lg:grid-cols-[1.2fr_1fr_1fr_1.6fr] lg:items-center lg:gap-6"
              >
                <span className="col-span-2 flex items-center gap-2.5 text-[15px] font-bold lg:col-span-1">
                  <Globe className="h-4 w-4 shrink-0 text-gold" />
                  {z.region}
                </span>
                <span className="pl-[26px] text-[13.5px] text-white/85 lg:pl-0">{z.time}</span>
                <span className="text-right text-[13.5px] font-semibold text-gold lg:text-left">
                  {z.cost}
                </span>
                <span className="col-span-2 pl-[26px] text-[12.5px] text-dim sm:text-[13px] lg:col-span-1 lg:pl-0">{z.note}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Promises */}
      <section className="pb-12 sm:pb-20 lg:pb-28">
        <div className="container-x">
          <StaggerGroup className="grid grid-cols-2 gap-px overflow-hidden rounded-[20px] border border-white/10 bg-white/10 sm:rounded-[24px] lg:grid-cols-4">
            {promises.map((p) => (
              <StaggerItem key={p.title} className="bg-ink-soft px-4 py-5 sm:px-7 sm:py-9">
                <p.icon className="mb-2.5 h-5 w-5 text-gold sm:mb-4" />
                <h3 className="mb-1 text-[14.5px] font-bold sm:mb-2 sm:text-[16px]">{p.title}</h3>
                <p className="text-[12.5px] leading-relaxed text-dim sm:text-[13.5px]">
                  {p.body}
                </p>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>
    </>
  );
}

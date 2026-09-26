"use client";

const items = [
  "Hand-picked in Mithila",
  "Roasted in A2 ghee",
  "No palm oil",
  "Gluten free",
  "9.7g protein per 100g",
  "Sealed within 48 hours",
  "Free shipping over ₹499",
];

export default function Marquee() {
  return (
    <div className="border-y border-white/10 bg-surface py-4">
      <div className="flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
        {/* Two identical tracks so the loop is seamless at -50% */}
        <div className="animate-marquee flex shrink-0 items-center gap-10 pr-10">
          {[...items, ...items].map((t, i) => (
            <span
              key={i}
              className="flex shrink-0 items-center gap-10 whitespace-nowrap text-[12.5px] font-semibold uppercase tracking-[0.18em] text-muted"
            >
              {t}
              <span className="h-1 w-1 rounded-full bg-gold" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

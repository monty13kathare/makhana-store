"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Clock, Mail, MapPin, Phone } from "lucide-react";
import { EASE, Reveal } from "@/components/motion-primitives";
import CustomDropdown from "@/components/ui/CustomDropdown";

const details = [
  { icon: Mail, label: "Email", value: "hello@yourbrand.com" },
  { icon: Phone, label: "Phone", value: "+91 98200 00000" },
  { icon: MapPin, label: "Roastery", value: "Darbhanga, Bihar 846004" },
  { icon: Clock, label: "Hours", value: "Mon–Sat, 10am to 7pm" },
];

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "General",
    message: "",
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // No backend wired up — this demonstrates the success state only.
    setSent(true);
    setForm({ name: "", email: "", subject: "General", message: "" });
    setTimeout(() => setSent(false), 4000);
  };

  const field =
    "w-full rounded-xl border border-white/12 bg-ink px-4 py-3 text-[14px] outline-none transition-colors placeholder:text-dim focus:border-white/40";

  return (
    <section className="pt-[116px] pb-20 lg:pt-[140px] lg:pb-28">
      <div className="container-x">
        <Reveal className="mb-12 max-w-[52ch]">
          <p className="mb-3 text-[11.5px] font-semibold uppercase tracking-[0.22em] text-gold">
            Contact
          </p>
          <h1 className="text-[34px] font-extrabold leading-[1.08] tracking-[-0.025em] sm:text-[46px]">
            Talk to{" "}
            <span className="font-display italic text-gold">a human</span>
          </h1>
          <p className="mt-5 text-[14.5px] leading-relaxed text-muted">
            Wholesale, bulk gifting, a late delivery or just a flavour idea — we
            read everything and usually reply within a day.
          </p>
        </Reveal>

        <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
          {/* Details */}
          <Reveal>
            <ul className="flex flex-col gap-3">
              {details.map((d) => (
                <li
                  key={d.label}
                  className="flex items-start gap-4 rounded-[18px] border border-white/10 bg-surface px-5 py-4"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/12 bg-white/5">
                    <d.icon className="h-[17px] w-[17px] text-gold" />
                  </span>
                  <div>
                    <p className="text-[11.5px] uppercase tracking-wider text-dim">
                      {d.label}
                    </p>
                    <p className="mt-0.5 text-[14.5px] font-semibold">
                      {d.value}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Form */}
          <Reveal delay={0.12}>
            <form
              onSubmit={submit}
              className="rounded-[22px] border border-white/10 bg-surface p-6 sm:p-8"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-[12.5px] font-semibold text-muted">
                    Your name
                  </span>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ananya Rao"
                    className={field}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-[12.5px] font-semibold text-muted">
                    Email
                  </span>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@email.com"
                    className={field}
                  />
                </label>
              </div>

              <div className="mt-4 block relative z-20">
                <span className="mb-2 block text-[12.5px] font-semibold text-muted">
                  Subject
                </span>
                <CustomDropdown
                  options={[
                    "General",
                    "Bulk / corporate gifting",
                    "Order support",
                    "Wholesale enquiry",
                  ]}
                  value={form.subject}
                  onChange={(val) => setForm({ ...form, subject: String(val) })}
                  triggerClassName="py-3 px-4 rounded-full border-border bg-ink/40 text-[13.5px]"
                />
              </div>

              <label className="mt-4 block">
                <span className="mb-2 block text-[12.5px] font-semibold text-muted">
                  Message
                </span>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell us what you need…"
                  className={`${field} resize-none`}
                />
              </label>

              <motion.button
                type="submit"
                whileTap={{ scale: 0.98 }}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-white py-3.5 text-[14.5px] font-semibold text-ink transition-all hover:bg-amber-400 hover:text-black active:bg-amber-300 shadow-md"
              >
                {sent ? (
                  <>
                    <Check className="h-4 w-4" /> Message sent
                  </>
                ) : (
                  "Send message"
                )}
              </motion.button>

              {sent && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ease: EASE }}
                  className="mt-3 text-center text-[12.5px] text-gold"
                >
                  Thanks — we will get back to you within one working day.
                </motion.p>
              )}
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** The one money formatter: prices formatted in INR (₹). */
export function formatMoney(amount: number): string {
  return money.format(amount);
}

const monthYear = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" });
const shortDate = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
const dayMonth = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
const weekdayDate = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" });
const dateTime = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

function toDate(value: string | Date): Date | null {
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** "Member since May 2025" */
export function formatMemberSince(iso: string): string {
  const d = toDate(iso);
  return d ? `Member since ${monthYear.format(d)}` : "Member";
}

/** "Sep 24, 2026" */
export function formatDate(iso: string): string {
  const d = toDate(iso);
  return d ? shortDate.format(d) : "—";
}

/** "Sep 24" */
export function formatDayMonth(iso: string): string {
  const d = toDate(iso);
  return d ? dayMonth.format(d) : "—";
}

/** "Sep 24, 4:30 PM" */
export function formatDateTime(iso: string): string {
  const d = toDate(iso);
  return d ? dateTime.format(d) : "—";
}

/**
 * Delivery window. API dates are calendar days ("2026-10-15"), so they are
 * parsed as local dates to avoid a UTC off-by-one.
 */
export function formatDeliveryWindow(from: string, to: string): string {
  const parse = (s: string) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : toDate(s);
  };
  const a = parse(from);
  const b = parse(to);
  if (!a || !b) return "—";
  if (a.getTime() === b.getTime()) return weekdayDate.format(a);
  return `${dayMonth.format(a)} – ${dayMonth.format(b)}`;
}

export function pluralize(n: number, one: string, many = `${one}s`): string {
  return `${n} ${n === 1 ? one : many}`;
}

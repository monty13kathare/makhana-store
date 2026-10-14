const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Normalises what the shopper typed into a sign-in identifier the API accepts.
 * Sign-in codes are sent by email only for now, so anything else is rejected.
 */
export function toIdentifier(raw: string): string | null {
  const clean = raw.trim().toLowerCase();
  return EMAIL_RE.test(clean) ? clean : null;
}

/** "ar•••••••••@gmail.com" or "arjun@gmail.com" -> "ar•••@gmail.com". */
export function maskEmail(value: string): string {
  const [local = "", domain = ""] = value.trim().split("@");
  const visible = local.replace(/[•*·]+/gu, "").slice(0, 2);
  return domain ? `${visible}•••@${domain}` : value;
}

/** Shopper-facing line for the code step, e.g. "We've sent a 6-digit code to ar•••@gmail.com." */
export function otpSentMessage(sentTo: string | null | undefined): string {
  return sentTo
    ? `We've sent a 6-digit code to ${maskEmail(sentTo)}.`
    : "Enter the 6-digit code we sent to your email.";
}

/* --------------------------------------------------------------------------
   Outline payment-method icons (24px grid, 1.6 stroke, currentColor).
   Shared by the cart and checkout payment pickers so both read the same.
   -------------------------------------------------------------------------- */

type IconProps = { className?: string };

function Svg({ className = "", children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

/** Phone with a confirmed check and a bank building. */
export function NetBankingIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M14 10.5V4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" />
      <path d="M6.2 8.2l1.6 1.6 3-3" />
      <path d="M11 14.5l5-2.5 5 2.5" />
      <path d="M12.5 15v4M16 15v4M19.5 15v4" />
      <path d="M11 20.5h10" />
    </Svg>
  );
}

/** Two stacked cards with a chip and number dots. */
export function CardIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M6 7.5V6a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v7.5a2 2 0 0 1-2 2h-.5" />
      <rect x="3" y="8.5" width="15" height="11.5" rx="2" />
      <rect x="5.5" y="11.5" width="3" height="2.4" rx="0.5" />
      <path d="M5.5 17.2h1M8.2 17.2h1M10.9 17.2h1M13.6 17.2h1" />
    </Svg>
  );
}

/** Circular transfer arrows around the UPI double chevron. */
export function UpiIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M20.2 9.5A8.5 8.5 0 0 0 5 6.4" />
      <path d="M4.6 2.8v3.9h3.9" />
      <path d="M3.8 14.5A8.5 8.5 0 0 0 19 17.6" />
      <path d="M19.4 21.2v-3.9h-3.9" />
      <path d="M9.6 8.2l2.6 3.8-2.6 3.8" />
      <path d="M12.8 8.2l2.6 3.8-2.6 3.8" />
    </Svg>
  );
}

/** Delivery person in a cap, holding a parcel. */
export function CodIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M8.6 5.6a3.4 3.4 0 0 1 6.8 0" />
      <path d="M7.6 5.6h8.8" />
      <path d="M8.9 6.6a3.1 3.1 0 0 0 6.2 0" />
      <path d="M4.5 21v-1.2A5.6 5.6 0 0 1 10.1 14.2h3.8a5.6 5.6 0 0 1 5.6 5.6V21" />
      <rect x="8.5" y="15.8" width="7" height="5.2" rx="0.8" />
      <path d="M12 15.8v2.2" />
    </Svg>
  );
}

/** PayPal-style double "P" mark. */
export function PayPalIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M7.2 19.5L9.8 3.5h5.4a4.3 4.3 0 0 1 0 8.6h-3.6l-1.2 7.4z" />
      <path d="M17.6 7.6a4.3 4.3 0 0 1-2.9 7.4h-2.4l-1 6" />
    </Svg>
  );
}

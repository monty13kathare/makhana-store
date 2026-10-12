import { AlertTriangle, Loader2, PackageOpen } from "lucide-react";
import type { ReactNode } from "react";

/** Explicit, accessible loading / empty / error states in the storefront's dark style. */
export function LoadingState({ label = "Loading…", className = "" }: { label?: string; className?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-center justify-center gap-2.5 rounded-[18px] border border-white/10 bg-[#161616] px-5 py-10 text-[13.5px] text-white/60 ${className}`}
    >
      <Loader2 className="h-4 w-4 animate-spin text-amber-400" aria-hidden />
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({
  title,
  message,
  action,
  className = "",
}: {
  title: string;
  message?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-[18px] border border-white/10 bg-[#161616] px-6 py-10 text-center ${className}`}>
      <PackageOpen className="mx-auto mb-3 h-8 w-8 text-white/25" aria-hidden />
      <p className="text-[15px] font-bold text-white">{title}</p>
      {message && <p className="mt-1.5 text-[13px] text-[#8a8a8a]">{message}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = "This section is unavailable right now",
  message = "We couldn't reach the store. Please refresh in a moment.",
  onRetry,
  className = "",
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={`rounded-[18px] border border-red-500/20 bg-red-500/[0.05] px-6 py-8 text-center ${className}`}
    >
      <AlertTriangle className="mx-auto mb-3 h-7 w-7 text-red-400" aria-hidden />
      <p className="text-[15px] font-bold text-white">{title}</p>
      <p className="mt-1.5 text-[13px] text-[#9a9a9a]">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 min-h-[44px] rounded-full border border-white/15 bg-white/5 px-5 text-[13px] font-semibold text-white transition-colors hover:bg-white/10"
        >
          Try again
        </button>
      )}
    </div>
  );
}

/** Inline error line for forms and panels. */
export function InlineError({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <p id={id} role="alert" className="mt-1.5 text-xs text-red-400">
      {children}
    </p>
  );
}

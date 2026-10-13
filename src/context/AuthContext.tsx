"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { auth, me } from "@/lib/api/store";
import { ApiError, isApiError } from "@/lib/api/errors";
import { clearSession, onSessionExpired, refreshSession, setSession } from "@/lib/api/session";
import type { Member, MemberPatch, OtpChallenge } from "@/lib/api/types";

export type User = Member;
export type UserAddress = Member["addresses"][number];

export type AuthModalOptions = {
  title?: string;
  message?: string;
  redirectUrl?: string;
  product?: {
    name: string;
    image: string;
    price: number;
  };
  prefill?: {
    phone?: string;
    email?: string;
    name?: string;
  };
  actionText?: string;
};

/** Development-only code echo (`devCode`). Never present in production. */
export type OtpNotice = {
  code: string;
  /** The separate code emailed as a backup to an SMS sign-in. */
  backupCode?: string;
  identifier: string;
  createdAt: number;
};

export type AuthStatus = "loading" | "authenticated" | "guest";

/** Lets other providers react to sign-in/out (cart merge, wishlist sync). */
export type AuthEvent = { type: "restored" | "signedIn" | "signedOut"; seq: number };

export type StartLoginResult =
  | { ok: true; challenge: OtpChallenge }
  | { ok: false; code: string; message: string };

export type VerifyResult =
  | { ok: true; isNewCustomer: boolean; member: Member }
  | { ok: false; code: string; message: string };

type AuthValue = {
  user: User | null;
  status: AuthStatus;
  authEvent: AuthEvent | null;
  /** Phone or email captured on login, carried to the OTP screen */
  pendingPhone: string | null;
  pendingIdentifier: string | null;
  otpChallenge: OtpChallenge | null;
  /** Simulated SMS banner; driven only by the API's `devCode`. */
  activeOtpNotice: OtpNotice | null;
  isAuthModalOpen: boolean;
  modalOptions: AuthModalOptions;
  openAuthModal: (options?: AuthModalOptions) => void;
  closeAuthModal: () => void;
  requireAuth: (callback: () => void, options?: AuthModalOptions) => boolean;
  startLogin: (identifier: string) => Promise<StartLoginResult>;
  verify: (code: string, newUserName?: string) => Promise<VerifyResult>;
  /** PATCH /store/me. Throws ApiError (e.g. 409 `email_taken`, 422 validation). */
  updateUser: (data: MemberPatch) => Promise<Member>;
  /** Replace the cached member after another endpoint returned it. */
  setUser: (member: Member) => void;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  clearOtpNotice: () => void;
};

const AuthContext = createContext<AuthValue | null>(null);

function failure(e: unknown): { ok: false; code: string; message: string } {
  if (isApiError(e)) return { ok: false, code: e.code, message: e.message };
  return { ok: false, code: "unknown", message: "Something went wrong. Please try again." };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUserState] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [authEvent, setAuthEvent] = useState<AuthEvent | null>(null);
  const [pendingIdentifier, setPendingIdentifier] = useState<string | null>(null);
  const [otpChallenge, setOtpChallenge] = useState<OtpChallenge | null>(null);
  const [activeOtpNotice, setActiveOtpNotice] = useState<OtpNotice | null>(null);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [modalOptions, setModalOptions] = useState<AuthModalOptions>({});

  const userRef = useRef<User | null>(null);
  const pendingAction = useRef<(() => void) | null>(null);
  const modalOptionsRef = useRef<AuthModalOptions>({});
  const challengeRef = useRef<OtpChallenge | null>(null);
  const restoreRef = useRef<Promise<void> | null>(null);
  const seq = useRef(0);

  const emit = useCallback((type: AuthEvent["type"]) => {
    seq.current += 1;
    setAuthEvent({ type, seq: seq.current });
  }, []);

  const applyUser = useCallback((m: User | null) => {
    userRef.current = m;
    setUserState(m);
    setStatus(m ? "authenticated" : "guest");
  }, []);

  // Restore the session on load: refresh cookie -> access token -> profile.
  useEffect(() => {
    let cancelled = false;
    const restore = (async () => {
      try {
        const token = await refreshSession();
        if (cancelled) return;
        if (!token) {
          applyUser(null);
          return;
        }
        const member = await me.get();
        if (cancelled) return;
        applyUser(member);
        emit("restored");
      } catch (e) {
        if (cancelled) return;
        console.warn("[auth] session restore failed", e);
        clearSession();
        applyUser(null);
      }
    })();
    restoreRef.current = restore;
    return () => {
      cancelled = true;
    };
  }, [applyUser, emit]);

  // A refresh failed mid-session (revoked, expired, signed out elsewhere).
  useEffect(
    () =>
      onSessionExpired(() => {
        if (!userRef.current) return;
        applyUser(null);
        emit("signedOut");
      }),
    [applyUser, emit],
  );

  const openAuthModal = useCallback((options?: AuthModalOptions) => {
    modalOptionsRef.current = options || {};
    setModalOptions(options || {});
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    pendingAction.current = null;
  }, []);

  const requireAuth = useCallback(
    (callback: () => void, options?: AuthModalOptions): boolean => {
      if (userRef.current) {
        callback();
        return true;
      }
      const ask = () => {
        if (userRef.current) {
          callback();
          return;
        }
        pendingAction.current = callback;
        openAuthModal(options);
      };
      if (status === "loading" && restoreRef.current) void restoreRef.current.then(ask);
      else ask();
      return false;
    },
    [openAuthModal, status],
  );

  const startLogin = useCallback(async (identifier: string): Promise<StartLoginResult> => {
    const clean = identifier.trim();
    setPendingIdentifier(clean);
    setActiveOtpNotice(null);
    try {
      // Checkout knows the email too: for a phone sign-in, also email a backup code there.
      const email = modalOptionsRef.current.prefill?.email?.trim();
      const backupEmail = !clean.includes("@") && email?.includes("@") ? email : undefined;
      const challenge = await auth.requestOtp(clean, backupEmail);
      challengeRef.current = challenge;
      setOtpChallenge(challenge);
      if (challenge.devCode) {
        setActiveOtpNotice({ code: challenge.devCode, backupCode: challenge.devBackupCode, identifier: clean, createdAt: Date.now() });
      }
      return { ok: true, challenge };
    } catch (e) {
      return failure(e);
    }
  }, []);

  const verify = useCallback(
    async (inputCode: string, newUserName?: string): Promise<VerifyResult> => {
      const challenge = challengeRef.current;
      if (!challenge) {
        return { ok: false, code: "no_challenge", message: "Please request a new code first." };
      }
      const prefill = modalOptionsRef.current.prefill;
      const name = newUserName?.trim() || prefill?.name?.trim() || undefined;
      try {
        const res = await auth.verifyOtp({
          challengeId: challenge.challengeId,
          code: inputCode.trim(),
          ...(name && name.length >= 2 ? { name } : {}),
        });
        setSession(res);
        let member: Member = res.customer;

        // Carry the checkout email onto a phone-only account.
        if (prefill?.email && !member.email) {
          try {
            member = await me.update({ email: prefill.email.trim() });
          } catch (e) {
            // email_taken / invalid: keep the account as is; checkout still sends the email.
            console.warn("[auth] could not attach checkout email", e);
          }
        }
        // Signed in with the backup email code: keep the checkout mobile as the contact number.
        if (prefill?.phone && !member.phone) {
          try {
            member = await me.update({ phone: prefill.phone.trim() });
          } catch (e) {
            console.warn("[auth] could not attach checkout phone", e);
          }
        }

        applyUser(member);
        challengeRef.current = null;
        setOtpChallenge(null);
        setPendingIdentifier(null);
        setActiveOtpNotice(null);
        setIsAuthModalOpen(false);
        emit("signedIn");

        const action = pendingAction.current;
        pendingAction.current = null;
        if (action) action();

        return { ok: true, isNewCustomer: res.isNewCustomer, member };
      } catch (e) {
        return failure(e);
      }
    },
    [applyUser, emit],
  );

  const updateUser = useCallback(
    async (data: MemberPatch) => {
      const member = await me.update(data);
      applyUser(member);
      return member;
    },
    [applyUser],
  );

  const setUser = useCallback((member: Member) => applyUser(member), [applyUser]);

  const refreshUser = useCallback(async () => {
    try {
      applyUser(await me.get());
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        applyUser(null);
        emit("signedOut");
      } else throw e;
    }
  }, [applyUser, emit]);

  const logout = useCallback(async () => {
    try {
      await auth.logout();
    } catch (e) {
      // The local session is dropped regardless; the cookie expires on its own.
      console.warn("[auth] logout request failed", e);
    }
    clearSession();
    applyUser(null);
    setPendingIdentifier(null);
    setActiveOtpNotice(null);
    emit("signedOut");
    router.push("/");
  }, [applyUser, emit, router]);

  const clearOtpNotice = useCallback(() => setActiveOtpNotice(null), []);

  const value = useMemo<AuthValue>(
    () => ({
      user,
      status,
      authEvent,
      pendingPhone: pendingIdentifier,
      pendingIdentifier,
      otpChallenge,
      activeOtpNotice,
      isAuthModalOpen,
      modalOptions,
      openAuthModal,
      closeAuthModal,
      requireAuth,
      startLogin,
      verify,
      updateUser,
      setUser,
      refreshUser,
      logout,
      clearOtpNotice,
    }),
    [
      user,
      status,
      authEvent,
      pendingIdentifier,
      otpChallenge,
      activeOtpNotice,
      isAuthModalOpen,
      modalOptions,
      openAuthModal,
      closeAuthModal,
      requireAuth,
      startLogin,
      verify,
      updateUser,
      setUser,
      refreshUser,
      logout,
      clearOtpNotice,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

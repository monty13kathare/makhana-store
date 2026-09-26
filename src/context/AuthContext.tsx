"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type UserAddress = {
  id: string;
  tag: string;
  recipient: string;
  line1: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  isDefault?: boolean;
};

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  memberTier: string;
  joinedDate: string;
  addresses?: UserAddress[];
};

export type AuthModalOptions = {
  title?: string;
  message?: string;
  redirectUrl?: string;
  product?: {
    name: string;
    image: string;
    price: number;
  };
};

export type OtpNotice = {
  code: string;
  identifier: string;
  createdAt: number;
};

type AuthValue = {
  user: User | null;
  /** Phone or email captured on login, carried to OTP screen */
  pendingPhone: string | null;
  pendingIdentifier: string | null;
  /** Active OTP simulation banner for realistic SMS/Email delivery */
  activeOtpNotice: OtpNotice | null;
  isAuthModalOpen: boolean;
  modalOptions: AuthModalOptions;
  openAuthModal: (options?: AuthModalOptions) => void;
  closeAuthModal: () => void;
  requireAuth: (callback: () => void, options?: AuthModalOptions) => boolean;
  startLogin: (identifier: string) => string;
  verify: (code: string, newUserName?: string) => boolean;
  updateUser: (data: Partial<User>) => void;
  logout: () => void;
  clearOtpNotice: () => void;
};

const SESSION_KEY = "makhana_auth_session";
const REGISTERED_USERS_KEY = "makhana_auth_directory";

/** Pre-seeded accounts in registry for realistic return-user recognition */
const INITIAL_USERS: Record<string, User> = {
  "+15553892041": {
    id: "usr_elena_8921",
    name: "Elena Rostova",
    email: "elena.rostova@luxury.co",
    phone: "+1 (555) 389-2041",
    avatar: "/img/avatar-1.jpg",
    memberTier: "Gold Connoisseur",
    joinedDate: "Member since May 2025",
    addresses: [
      {
        id: "addr-1",
        tag: "Home (Default)",
        recipient: "Elena Rostova",
        line1: "742 Evergreen Terrace, Apt 4B",
        city: "Brooklyn",
        state: "NY",
        zip: "11201",
        country: "United States",
        phone: "+1 (555) 389-2041",
        isDefault: true,
      },
      {
        id: "addr-2",
        tag: "Studio / Office",
        recipient: "Elena Rostova",
        line1: "185 Broadway, Floor 8",
        city: "New York",
        state: "NY",
        zip: "10007",
        country: "United States",
        phone: "+1 (555) 389-2041",
        isDefault: false,
      },
    ],
  },
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Guests start as null (authentic production e-commerce model)
  const [user, setUser] = useState<User | null>(null);
  const [pendingIdentifier, setPendingIdentifier] = useState<string | null>(null);
  const [activeOtpNotice, setActiveOtpNotice] = useState<OtpNotice | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Modal State & pending action queue
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [modalOptions, setModalOptions] = useState<AuthModalOptions>({});
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // 1. Hydrate active session & user registry from localStorage
  useEffect(() => {
    try {
      // Ensure user directory exists
      const existingDir = localStorage.getItem(REGISTERED_USERS_KEY);
      if (!existingDir) {
        localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(INITIAL_USERS));
      }

      // Check current session
      const savedSession = localStorage.getItem(SESSION_KEY);
      if (savedSession) {
        setUser(JSON.parse(savedSession));
      }
    } catch {
      // Storage unavailable or disabled in browser
    }
    setHydrated(true);
  }, []);

  // 2. Persist active session
  useEffect(() => {
    if (!hydrated) return;
    try {
      if (user) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(SESSION_KEY);
      }
    } catch {
      // Ignore quota / disabled storage
    }
  }, [user, hydrated]);

  const openAuthModal = (options?: AuthModalOptions) => {
    setModalOptions(options || {});
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setPendingAction(null);
  };

  const requireAuth = (callback: () => void, options?: AuthModalOptions): boolean => {
    if (user) {
      callback();
      return true;
    }
    setPendingAction(() => callback);
    openAuthModal(options);
    return false;
  };

  /**
   * Generates a secure 6-digit OTP, simualtes instant SMS/Email dispatch,
   * and displays a realistic verification notice.
   */
  const startLogin = (identifier: string): string => {
    const cleanId = identifier.trim();
    setPendingIdentifier(cleanId);

    // Generate production-style 6-digit random code
    const generated = Math.floor(100000 + Math.random() * 900000).toString();
    const notice: OtpNotice = {
      code: generated,
      identifier: cleanId,
      createdAt: Date.now(),
    };
    setActiveOtpNotice(notice);

    return generated;
  };

  /**
   * Verifies the entered OTP and logs in / creates the user profile.
   */
  const verify = (inputCode: string, newUserName?: string): boolean => {
    const trimmed = inputCode.trim();
    const expected = activeOtpNotice?.code;

    // Production check: matches active dispatched OTP, or common dev fallback 123456 / 1234
    const isValid =
      (expected && trimmed === expected) ||
      trimmed === "123456" ||
      trimmed === "1234";

    if (!isValid) {
      return false;
    }

    const id = pendingIdentifier || "user";
    const normalizedKey = id.replace(/\D/g, "") || id.toLowerCase();

    // Look up in directory or create a new user profile
    let directory: Record<string, User> = {};
    try {
      const raw = localStorage.getItem(REGISTERED_USERS_KEY);
      if (raw) directory = JSON.parse(raw);
    } catch {
      // Ignore
    }

    let authenticatedUser: User;

    if (directory[normalizedKey]) {
      authenticatedUser = directory[normalizedKey];
    } else {
      // Create new member account
      const isEmail = id.includes("@");
      const defaultName = newUserName?.trim()
        ? newUserName.trim()
        : isEmail
        ? id.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
        : `Member ${id.slice(-4)}`;

      authenticatedUser = {
        id: "usr_" + Math.random().toString(36).substring(2, 9),
        name: defaultName,
        email: isEmail ? id : `${normalizedKey}@makhana.vip`,
        phone: isEmail ? "+1 (555) 019-2834" : id,
        avatar: "/img/avatar-1.jpg",
        memberTier: "Gold Connoisseur",
        joinedDate: `Member since ${new Date().toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        })}`,
        addresses: [],
      };

      // Save to directory
      directory[normalizedKey] = authenticatedUser;
      try {
        localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(directory));
      } catch {
        // Ignore
      }
    }

    setUser(authenticatedUser);
    setPendingIdentifier(null);
    setActiveOtpNotice(null);
    setIsAuthModalOpen(false);

    // Execute pending callback (e.g. cart add / buy now)
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }

    return true;
  };

  const updateUser = (data: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...data };

      // Update in directory as well
      try {
        const raw = localStorage.getItem(REGISTERED_USERS_KEY);
        if (raw) {
          const directory: Record<string, User> = JSON.parse(raw);
          const key = prev.phone.replace(/\D/g, "") || prev.email;
          directory[key] = updated;
          localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(directory));
        }
      } catch {
        // Ignore
      }

      return updated;
    });
  };

  const logout = () => {
    setUser(null);
    setPendingIdentifier(null);
    setActiveOtpNotice(null);
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {
      // Ignore
    }
  };

  const value = useMemo<AuthValue>(
    () => ({
      user,
      pendingPhone: pendingIdentifier,
      pendingIdentifier,
      activeOtpNotice,
      isAuthModalOpen,
      modalOptions,
      openAuthModal,
      closeAuthModal,
      requireAuth,
      startLogin,
      verify,
      updateUser,
      logout,
      clearOtpNotice: () => setActiveOtpNotice(null),
    }),
    [user, pendingIdentifier, activeOtpNotice, isAuthModalOpen, modalOptions, pendingAction],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

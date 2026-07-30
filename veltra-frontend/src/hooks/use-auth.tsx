"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { getAuthUser, logout as apiLogout, getStravaConnectUrl } from "@/lib/api/auth";
import type { User } from "@/lib/api/types";

type AuthState = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  state: AuthState;
  user: User | null;
  signIn: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>("loading");
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function loadUser() {
      const realUser = await getAuthUser();
      if (realUser) {
        localStorage.setItem("veltra_user", JSON.stringify(realUser));
        setUser(realUser);
        setState("authenticated");
        return;
      }

      const stored = localStorage.getItem("veltra_user");
      if (stored) {
        setUser(JSON.parse(stored));
        setState("authenticated");
        return;
      }

      setState("unauthenticated");
    }
    loadUser();
  }, []);

  const signIn = useCallback(() => {
    window.location.href = getStravaConnectUrl();
  }, []);

  const signOut = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // Ignore logout errors
    }
    localStorage.removeItem("veltra_user");
    setUser(null);
    setState("unauthenticated");
  }, []);

  return (
    <AuthContext.Provider value={{ state, user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { AuthUser } from "@/types/auth";

const STORAGE_KEY = "taskboard_auth";
const CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID as string;

interface AuthContextValue {
  user: AuthUser | null;
  signIn: () => void;
  signOut: () => void;
  /** Called by AuthCallbackPage after the OAuth exchange is complete. */
  setUser: (user: AuthUser) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const DEV_MOCK_USER: AuthUser | null =
  import.meta.env.DEV && import.meta.env.VITE_DEV_MOCK_USER === "true"
    ? {
        login: import.meta.env.VITE_GITHUB_OWNER ?? "dev-user",
        avatarUrl: `https://github.com/${import.meta.env.VITE_GITHUB_OWNER ?? "ghost"}.png?size=32`,
        token: "dev-mock-token",
      }
    : null;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (DEV_MOCK_USER) return DEV_MOCK_USER;
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const signIn = useCallback(() => {
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      scope: "repo",
    });
    window.location.href = `https://github.com/login/oauth/authorize?${params.toString()}`;
  }, []);

  const signOut = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react/only-export-components -- hook is intentionally co-located with its provider
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }
  return ctx;
}

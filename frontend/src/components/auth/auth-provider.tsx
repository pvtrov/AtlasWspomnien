"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getCurrentUser,
  type AuthUser,
  type LoginRequest,
  type RegisterRequest,
  loginUser,
  registerUser,
} from "@/services/api-client";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  currentUser: AuthUser | null;
  status: AuthStatus;
  login: (payload: LoginRequest) => Promise<AuthUser>;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshCurrentUser: () => Promise<AuthUser | null>;
};

const AUTH_TOKEN_STORAGE_KEY = "aitsi.auth.access_token";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  async function refreshCurrentUser(): Promise<AuthUser | null> {
    const token = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);

    if (!token) {
      setCurrentUser(null);
      setStatus("unauthenticated");
      return null;
    }

    try {
      const user = await getCurrentUser(token);
      setCurrentUser(user);
      setStatus("authenticated");
      return user;
    } catch {
      window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
      setCurrentUser(null);
      setStatus("unauthenticated");
      return null;
    }
  }

  useEffect(() => {
    void refreshCurrentUser();
  }, []);

  async function login(payload: LoginRequest): Promise<AuthUser> {
    const response = await loginUser(payload);
    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, response.access_token);
    setCurrentUser(response.user);
    setStatus("authenticated");
    return response.user;
  }

  async function register(payload: RegisterRequest): Promise<void> {
    await registerUser(payload);
  }

  function logout(): void {
    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    setCurrentUser(null);
    setStatus("unauthenticated");
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      status,
      login,
      register,
      logout,
      refreshCurrentUser,
    }),
    [currentUser, status],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}

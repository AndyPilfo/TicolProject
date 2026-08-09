import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import type { User, UserSettings } from "../types";

type AuthContextValue = {
  token: string | null;
  user: User | null;
  ready: boolean;
  setSession: (token: string, user: User) => void;
  refreshSession: () => Promise<void>;
  saveUserSettings: (partial: Partial<UserSettings>) => Promise<UserSettings | null>;
  changePassword: (body: { currentPassword: string; newPassword: string }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const LS_TOKEN = "lawkey.token";
const LS_USER = "lawkey.user";

function readStoredUser() {
  try {
    const raw = localStorage.getItem(LS_USER);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function persistSession(token: string | null, user: User | null) {
  if (token) localStorage.setItem(LS_TOKEN, token);
  else localStorage.removeItem(LS_TOKEN);

  if (user) localStorage.setItem(LS_USER, JSON.stringify(user));
  else localStorage.removeItem(LS_USER);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => localStorage.getItem(LS_TOKEN));
  const [user, setUserState] = useState<User | null>(() => readStoredUser());
  const [ready, setReady] = useState(false);

  const setSession = useCallback((nextToken: string, nextUser: User) => {
    setTokenState(nextToken);
    setUserState(nextUser);
    api.setToken(nextToken);
    persistSession(nextToken, nextUser);
    setReady(true);
  }, []);

  const logout = useCallback(async () => {
    setTokenState(null);
    setUserState(null);
    api.setToken(null);
    persistSession(null, null);
    setReady(true);
  }, []);

  const refreshSession = useCallback(async () => {
    if (!token) {
      setReady(true);
      return;
    }

    try {
      const response = await api.me();
      setUserState(response.user);
      persistSession(token, response.user);
    } catch {
      await logout();
      return;
    } finally {
      setReady(true);
    }
  }, [logout, token]);

  const saveUserSettings = useCallback(
    async (partial: Partial<UserSettings>) => {
      if (!token || !user) return null;

      const response = await api.updateSettings(partial);
      const nextUser: User = { ...user, settings: response.settings };
      setUserState(nextUser);
      persistSession(token, nextUser);
      return response.settings;
    },
    [token, user]
  );

  const changePassword = useCallback(
    async (body: { currentPassword: string; newPassword: string }) => {
      await api.changePassword(body);
    },
    []
  );

  useEffect(() => {
    api.setToken(token);
  }, [token]);

  useEffect(() => {
    api.setUnauthorizedHandler(() => {
      void logout();
    });
    return () => api.setUnauthorizedHandler(null);
  }, [logout]);

  useEffect(() => {
    if (!token) {
      setReady(true);
      return;
    }

    void refreshSession();
  }, [refreshSession, token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      ready,
      setSession,
      refreshSession,
      saveUserSettings,
      changePassword,
      logout
    }),
    [changePassword, logout, ready, refreshSession, saveUserSettings, setSession, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

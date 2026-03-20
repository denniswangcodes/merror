import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, setTokens, clearTokens } from '../lib/api';
import type { PublicUser, AuthTokens } from '@merror/shared';

interface AuthContextType {
  user: PublicUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const me = await authApi.me() as PublicUser;
      setUser(me);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authApi.login(email, password) as AuthTokens;
    await setTokens(data.accessToken, data.refreshToken);
    setUser(data.user);
  };

  const signup = async (email: string, password: string, username: string, displayName?: string) => {
    const data = await authApi.signup(email, password, username, displayName) as AuthTokens;
    await setTokens(data.accessToken, data.refreshToken);
    setUser(data.user as PublicUser);
  };

  const logout = async () => {
    try { await authApi.logout(); } catch { /* noop */ }
    await clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

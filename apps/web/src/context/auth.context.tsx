'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { PublicUser, AuthTokens } from '@merror/shared';
import { authApi, setTokens, clearTokens } from '../lib/api';

interface AuthContextValue {
  user: PublicUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: {
    email: string;
    password: string;
    username: string;
    displayName?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const me = await authApi.me();
      setUser(me);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const result = await authApi.login({ email, password }) as AuthTokens;
    setTokens(result.accessToken, result.refreshToken);
    setUser(result.user);
  };

  const signup = async (data: {
    email: string;
    password: string;
    username: string;
    displayName?: string;
  }) => {
    const result = await authApi.signup(data) as AuthTokens;
    setTokens(result.accessToken, result.refreshToken);
    setUser(result.user);
  };

  const logout = async () => {
    try { await authApi.logout(); } catch { /* noop */ }
    clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

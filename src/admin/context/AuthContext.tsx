import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  authLogin,
  authLogout,
  authRefresh,
  setOnUnauthorized,
  type UserPublic,
} from '../services/api';

interface AuthContextValue {
  user: UserPublic | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<UserPublic | null>>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserPublic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const initialized = useRef(false);

  const logout = useCallback(async () => {
    await authLogout();
    setUser(null);
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Register unauthorized callback for auto-logout on expired tokens
    setOnUnauthorized(() => {
      setUser(null);
    });

    // Attempt silent restore via refresh cookie
    authRefresh()
      .then((u) => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, [logout]);

  const login = useCallback(async (username: string, password: string) => {
    const u = await authLogin(username, password);
    setUser(u);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

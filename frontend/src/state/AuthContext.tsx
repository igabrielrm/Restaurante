import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { logoutBackend } from '../api';
import type { Rol, Usuario } from '../types';

interface AuthContextValue {
  user: Usuario | null;
  rol: Rol | null;
  setUser: (user: Usuario) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = 'restaurante-user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<Usuario | null>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Usuario) : null;
  });

  const value = useMemo<AuthContextValue>(() => ({
    user,
    rol: user?.rol ?? null,
    setUser: (nextUser) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
      setUserState(nextUser);
    },
    logout: () => {
      void logoutBackend().catch(() => undefined);
      localStorage.removeItem(STORAGE_KEY);
      setUserState(null);
    },
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}

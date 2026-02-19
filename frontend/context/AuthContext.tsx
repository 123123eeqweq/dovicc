'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCurrentUser, logout as apiLogout, setGlobal401Handler } from '@/lib/api';
import { toast } from '@/lib/toast';

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  isEmailActivated?: boolean;
}

type AuthIntent =
  | { type: 'ADD_COMPANY' }
  | { type: 'ADD_REVIEW'; companySlug?: string }
  | { type: 'REACT_REVIEW'; reviewId: string; value: 1 | -1 }
  | { type: 'REPORT_REVIEW'; reviewId: string }
  | { type: 'VIEW_PROFILE' }
  | { type: 'ADMIN_PANEL' }
  | null;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  intent: AuthIntent;
  setIntent: (intent: AuthIntent) => void;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
  requireAuth: <T>(action: () => T | Promise<T>, intentType: AuthIntent) => Promise<T | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [intent, setIntent] = useState<AuthIntent>(null);

  const checkAuth = async () => {
    try {
      const data = await getCurrentUser();
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    setGlobal401Handler((intent) => {
      setIntent(intent as AuthIntent);
      toast.info('Будь ласка, увійдіть для виконання цієї дії');
    });
  }, [setIntent]);

  const logout = async () => {
    try {
      await apiLogout();
      setUser(null);
      setIntent(null);
      toast.success('Ви вийшли з системи');
    } catch (err) {
      toast.error('Помилка при виході');
    }
  };

  const requireAuth = async <T,>(
    action: () => T | Promise<T>,
    intentType: AuthIntent
  ): Promise<T | null> => {
    if (user) {
      return await action();
    } else {
      setIntent(intentType);
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        intent,
        setIntent,
        checkAuth,
        logout,
        requireAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

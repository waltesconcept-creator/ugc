'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Profile, CreatorDetails, UserRole } from '@/lib/types';

export interface UserAccount {
  id: string;
  email?: string;
  phone?: string;
  role: 'creator' | 'business' | 'guest';
  profile: Profile;
  details?: CreatorDetails;
  country: string;
  categories?: string[];
  createdAt: string;
}

export interface RegisterPayload {
  displayName: string;
  username: string;
  contactType: 'email' | 'phone';
  contactValue: string;
  country: string;
  location?: string;
  role: 'creator' | 'business' | 'guest';
  categories?: string[];
  bio?: string;
  avatarUrl?: string;
  startingPrice?: number;
}

interface AuthContextType {
  currentUser: UserAccount | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  openAuth: (mode?: 'login' | 'register') => void;
  closeAuth: () => void;
  login: (identifier: string) => Promise<{ success: boolean; error?: string }>;
  register: (payload: RegisterPayload) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'kre8tor_auth_session_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('register');

  // Load saved session on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id && parsed.profile && parsed.profile.displayName) {
          setCurrentUser(parsed);
        } else {
          // Clean up legacy or invalid session
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved auth session:', e);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
    }
  }, []);

  const openAuth = (mode: 'login' | 'register' = 'register') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuth = () => {
    setIsAuthModalOpen(false);
  };

  const login = async (identifier: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Login failed' };
      }

      setCurrentUser(data.user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
      setIsAuthModalOpen(false);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Network error during login' };
    }
  };

  const register = async (payload: RegisterPayload): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Registration failed' };
      }

      setCurrentUser(data.user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
      setIsAuthModalOpen(false);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Network error during registration' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isAuthModalOpen,
        authModalMode,
        openAuth,
        closeAuth,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

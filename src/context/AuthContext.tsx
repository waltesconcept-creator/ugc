'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Profile, CreatorDetails, UserRole, ServicePackage } from '@/lib/types';

export interface UserAccount {
  id: string;
  email?: string;
  phone?: string;
  passwordHash?: string;
  role: 'creator' | 'business' | 'guest';
  profile: Profile;
  details?: CreatorDetails;
  services?: ServicePackage[];
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
  password?: string;
}

interface AuthContextType {
  currentUser: UserAccount | null;
  savedAccounts: UserAccount[];
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register' | 'forgot';
  openAuth: (mode?: 'login' | 'register' | 'forgot') => void;
  closeAuth: () => void;
  login: (identifier: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (payload: RegisterPayload) => Promise<{ success: boolean; error?: string }>;
  switchRole: (newRole: 'creator' | 'business' | 'guest') => Promise<{ success: boolean; error?: string }>;
  switchAccount: (userId: string) => void;
  removeAccount: (userId: string) => void;
  forgotPassword: (
    action: 'request_code' | 'verify_and_reset',
    identifier: string,
    code?: string,
    newPassword?: string
  ) => Promise<{ success: boolean; code?: string; error?: string; message?: string }>;
  updateUserProfile: (data: Partial<{
    displayName: string;
    bio: string;
    location: string;
    country: string;
    startingPrice: number;
    categories: string[];
    services: ServicePackage[];
    instagramHandle?: string;
    tiktokHandle?: string;
    youtubeHandle?: string;
    website?: string;
  }>) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'creator_auth_session_v2';
const ACCOUNTS_STORAGE_KEY = 'creator_saved_accounts_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [savedAccounts, setSavedAccounts] = useState<UserAccount[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'forgot'>('register');

  // Load saved session and accounts pool on mount
  useEffect(() => {
    try {
      // 1. Saved session
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id && parsed.profile && parsed.profile.displayName) {
          setCurrentUser(parsed);
        }
      }

      // 2. Accounts pool
      const accountsSaved = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
      if (accountsSaved) {
        const parsedAccounts = JSON.parse(accountsSaved);
        if (Array.isArray(parsedAccounts)) {
          setSavedAccounts(parsedAccounts);
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved auth session:', e);
    }
  }, []);

  const saveToAccountsPool = (user: UserAccount) => {
    setSavedAccounts((prev) => {
      const next = [user, ...prev.filter((a) => a.id !== user.id)];
      try {
        localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const openAuth = (mode: 'login' | 'register' | 'forgot' = 'register') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuth = () => {
    setIsAuthModalOpen(false);
  };

  const login = async (identifier: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Login failed' };
      }

      setCurrentUser(data.user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
      saveToAccountsPool(data.user);
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
      saveToAccountsPool(data.user);
      setIsAuthModalOpen(false);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Network error during registration' };
    }
  };

  const switchRole = async (newRole: 'creator' | 'business' | 'guest'): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: 'Not logged in' };

    try {
      const res = await fetch('/api/auth/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, newRole }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Failed to switch role' };
      }

      setCurrentUser(data.user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
      saveToAccountsPool(data.user);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Network error switching role' };
    }
  };

  const switchAccount = (userId: string) => {
    const target = savedAccounts.find((a) => a.id === userId);
    if (target) {
      setCurrentUser(target);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(target));
    }
  };

  const removeAccount = (userId: string) => {
    setSavedAccounts((prev) => {
      const next = prev.filter((a) => a.id !== userId);
      try {
        localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });

    if (currentUser?.id === userId) {
      const remaining = savedAccounts.filter((a) => a.id !== userId);
      if (remaining.length > 0) {
        setCurrentUser(remaining[0]);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining[0]));
      } else {
        logout();
      }
    }
  };

  const forgotPassword = async (
    action: 'request_code' | 'verify_and_reset',
    identifier: string,
    code?: string,
    newPassword?: string
  ): Promise<{ success: boolean; code?: string; error?: string; message?: string }> => {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, identifier, code, newPassword }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Failed password reset request' };
      }

      if (action === 'verify_and_reset' && data.user) {
        setCurrentUser(data.user);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
        saveToAccountsPool(data.user);
      }

      return {
        success: true,
        code: data.code,
        message: data.message,
      };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Network error during password reset' };
    }
  };

  const updateUserProfile = async (data: Partial<{
    displayName: string;
    bio: string;
    location: string;
    country: string;
    startingPrice: number;
    categories: string[];
    services: ServicePackage[];
    instagramHandle?: string;
    tiktokHandle?: string;
    youtubeHandle?: string;
    website?: string;
  }>): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: 'Not authenticated' };

    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          ...data,
        }),
      });
      const resData = await res.json();

      if (!res.ok || !resData.success) {
        return { success: false, error: resData.error || 'Failed to update profile' };
      }

      setCurrentUser(resData.user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(resData.user));
      saveToAccountsPool(resData.user);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Network error updating profile' };
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
        savedAccounts,
        isAuthenticated: !!currentUser,
        isAuthModalOpen,
        authModalMode,
        openAuth,
        closeAuth,
        login,
        register,
        switchRole,
        switchAccount,
        removeAccount,
        forgotPassword,
        updateUserProfile,
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

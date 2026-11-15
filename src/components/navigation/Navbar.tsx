'use client';

import React, { useState, useRef, useEffect } from 'react';
import type { UserRole } from '@/lib/types';
import { Kre8torLogo } from '@/components/common/Kre8torLogo';
import { useAuth } from '@/context/AuthContext';
import {
  Video,
  Compass,
  Plus,
  MessageCircle,
  User,
  ChevronDown,
  Sparkles,
  Shield,
  Briefcase,
  Palette,
  Bell,
  LogIn,
  LogOut,
  UserCheck,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  unreadCount?: number;
  onOpenNotifications?: () => void;
  onOpenCreate?: () => void;
}

const ROLE_OPTIONS: { value: UserRole; label: string; icon: React.ReactNode }[] = [
  { value: 'creator', label: 'Creator', icon: <Palette className="w-4 h-4 text-orange-400" /> },
  { value: 'business', label: 'Business', icon: <Briefcase className="w-4 h-4 text-amber-400" /> },
  { value: 'admin', label: 'Admin', icon: <Shield className="w-4 h-4 text-emerald-400" /> },
  { value: 'guest', label: 'Guest', icon: <User className="w-4 h-4 text-neutral-400" /> },
];

const DESKTOP_TABS = [
  { key: 'feed', label: 'Watch Feed' },
  { key: 'explore', label: 'Explore Topics' },
  { key: 'profile', label: 'Creator Portfolio' },
  { key: 'projects', label: 'Project Tracker' },
  { key: 'messages', label: 'Messages' },
  { key: 'admin', label: 'Admin' },
];

const MOBILE_TABS = [
  { key: 'feed', label: 'Home', icon: Video },
  { key: 'explore', label: 'Explore', icon: Compass },
  { key: 'create', label: 'Create', icon: Plus },
  { key: 'messages', label: 'Messages', icon: MessageCircle },
  { key: 'profile', label: 'Profile', icon: User },
];

const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentRole,
  setCurrentRole,
  unreadCount = 1,
  onOpenNotifications,
  onOpenCreate,
}) => {
  const { currentUser, isAuthenticated, openAuth, logout } = useAuth();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setRoleDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentRoleOption = ROLE_OPTIONS.find((r) => r.value === currentRole) || ROLE_OPTIONS[0];

  return (
    <>
      {/* ───── Top Header (all screens) ───── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-neutral-950/95 backdrop-blur-md border-b border-neutral-850">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-14 px-3 sm:px-6">
          {/* Brand Logo (KRE8TOR in Modern Futuristic Typography & Emblem) */}
          <button
            onClick={() => setActiveTab('feed')}
            className="flex items-center gap-2 shrink-0 group select-none text-left"
          >
            <Kre8torLogo size="md" />
          </button>

          {/* Desktop Nav Pills */}
          <nav className="hidden lg:flex items-center gap-1 bg-neutral-900/90 rounded-full px-1.5 py-1 border border-neutral-800">
            {DESKTOP_TABS.filter(
              (t) => t.key !== 'admin' || currentRole === 'admin'
            ).map((tab) => {
              const isActive =
                activeTab === tab.key ||
                (tab.key === 'profile' && activeTab === 'creator_profile') ||
                (tab.key === 'projects' && activeTab === 'bookings');
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative px-4 py-1.5 text-xs font-bold rounded-full transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/30'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                  }`}
                >
                  {tab.label}
                  {tab.key === 'messages' && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-orange-500 text-[10px] font-extrabold text-white px-1 shadow">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Side Actions: Notifications, Auth / User Profile, Role Simulator & Create CTA */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Notification bell (Mobile + Desktop) */}
            <button
              onClick={() => (onOpenNotifications ? onOpenNotifications() : setActiveTab('messages'))}
              title="Notifications"
              className="relative flex items-center justify-center w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              )}
            </button>

            {/* Real User Account Button or Sign Up Pill */}
            {isAuthenticated && currentUser ? (
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1 pr-2.5 rounded-full bg-neutral-900 border border-neutral-800 hover:border-orange-500 transition-colors text-xs font-semibold"
                >
                  <img
                    src={currentUser.profile.avatarUrl}
                    alt={currentUser.profile.displayName}
                    className="w-7 h-7 rounded-full object-cover border border-orange-500/50"
                  />
                  <span className="text-white max-w-[80px] sm:max-w-[110px] truncate hidden sm:inline">
                    {currentUser.profile.displayName}
                  </span>
                  <ChevronDown className="w-3 h-3 text-neutral-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden py-1.5 z-[60] animate-fade-in text-xs">
                    <div className="px-3 py-2 border-b border-neutral-850">
                      <p className="font-bold text-white truncate">{currentUser.profile.displayName}</p>
                      <p className="text-[10px] text-orange-400 truncate">@{currentUser.profile.username}</p>
                    </div>
                    <button
                      onClick={() => {
                        setActiveTab('profile');
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-neutral-300 hover:bg-neutral-900 hover:text-white text-left font-medium"
                    >
                      <User className="w-3.5 h-3.5 text-neutral-400" />
                      <span>My Profile & Rates</span>
                    </button>
                    <button
                      onClick={() => {
                        if (onOpenCreate) onOpenCreate();
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-neutral-300 hover:bg-neutral-900 hover:text-white text-left font-medium"
                    >
                      <Plus className="w-3.5 h-3.5 text-orange-400" />
                      <span>Upload Video / Post</span>
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-rose-400 hover:bg-neutral-900 text-left font-medium border-t border-neutral-850"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => openAuth('register')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold shadow-md shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Join / Sign In</span>
              </button>
            )}

            {/* Role Switcher Pill */}
            <div ref={dropdownRef} className="relative hidden sm:block">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-colors text-xs font-medium"
              >
                {currentRoleOption.icon}
                <span className="font-bold text-white capitalize text-[11px]">
                  {currentRoleOption.label}
                </span>
                <ChevronDown
                  className={`w-3 h-3 text-neutral-400 transition-transform duration-200 ${
                    roleDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden py-1.5 z-[60] animate-fade-in text-xs">
                  <div className="px-3 py-1 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                    Simulate Role:
                  </div>
                  {ROLE_OPTIONS.map((role) => (
                    <button
                      key={role.value}
                      onClick={() => {
                        setCurrentRole(role.value);
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold transition-colors ${
                        currentRole === role.value
                          ? 'bg-orange-500/15 text-orange-400 font-bold'
                          : 'text-neutral-300 hover:bg-neutral-800'
                      }`}
                    >
                      {role.icon}
                      <span>{role.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Create UGC Post CTA (desktop) */}
            <button
              onClick={() => (onOpenCreate ? onOpenCreate() : setActiveTab('create'))}
              className="hidden lg:flex items-center gap-1.5 px-4 py-2 rounded-full bg-neutral-900 border border-orange-500/40 text-orange-400 text-xs font-bold hover:bg-orange-500 hover:text-white transition-all hover:scale-105 active:scale-95 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Upload Content</span>
            </button>
          </div>
        </div>
      </header>

      {/* ───── Mobile Bottom Navigation Bar (Circular Plus in Center) ───── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-neutral-950/95 backdrop-blur-lg border-t border-neutral-800/90 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-16 px-2">
          {MOBILE_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key || (tab.key === 'profile' && activeTab === 'creator_profile') || (tab.key === 'create' && activeTab === 'creator_onboard');
            const isCreate = tab.key === 'create';
            const isMessages = tab.key === 'messages';

            return (
              <button
                key={tab.key}
                onClick={() => (isCreate && onOpenCreate ? onOpenCreate() : setActiveTab(tab.key))}
                className={`relative flex flex-col items-center justify-center min-w-[48px] min-h-[48px] rounded-2xl transition-all duration-200 ${
                  isCreate
                    ? ''
                    : isActive
                    ? 'text-orange-500'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                {isCreate ? (
                  /* Round circular elevated center plus button */
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/40 text-white transform -translate-y-2 border-2 border-neutral-950 hover:scale-110 active:scale-95 transition-all">
                    <Plus className="w-6 h-6 stroke-[3] text-white" />
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      {tab.key === 'profile' && currentUser?.profile?.avatarUrl ? (
                        <img
                          src={currentUser.profile.avatarUrl}
                          alt="Profile"
                          className={`w-5 h-5 rounded-full object-cover border ${
                            isActive ? 'border-orange-500 scale-110' : 'border-neutral-700'
                          }`}
                        />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                      {isMessages && unreadCount > 0 && (
                        <span className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] flex items-center justify-center rounded-full bg-orange-500 text-[9px] font-bold text-white px-0.5">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] mt-0.5 font-medium">{tab.label}</span>
                    {isActive && (
                      <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-orange-500" />
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Spacer for fixed top header */}
      <div className="h-14" />
    </>
  );
};

export { Navbar };
export default Navbar;

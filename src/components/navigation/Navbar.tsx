'use client';

import React, { useState, useRef, useEffect } from 'react';
import type { UserRole } from '@/lib/types';
import {
  Video,
  Compass,
  PlusSquare,
  MessageCircle,
  User,
  ChevronDown,
  Sparkles,
  Shield,
  Briefcase,
  Palette,
  LogOut,
  Menu,
  X,
  Bell,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  unreadCount?: number;
}

const ROLE_OPTIONS: { value: UserRole; label: string; icon: React.ReactNode }[] = [
  { value: 'creator', label: 'Creator', icon: <Palette className="w-4 h-4" /> },
  { value: 'business', label: 'Business', icon: <Briefcase className="w-4 h-4" /> },
  { value: 'admin', label: 'Admin', icon: <Shield className="w-4 h-4" /> },
  { value: 'guest', label: 'Guest', icon: <User className="w-4 h-4" /> },
];

const DESKTOP_TABS = [
  { key: 'feed', label: 'Watch Feed' },
  { key: 'explore', label: 'Explore' },
  { key: 'profile', label: 'Creator Portfolio' },
  { key: 'projects', label: 'Projects' },
  { key: 'messages', label: 'Messages' },
  { key: 'admin', label: 'Admin' },
];

const MOBILE_TABS = [
  { key: 'feed', label: 'Home', icon: Video },
  { key: 'explore', label: 'Explore', icon: Compass },
  { key: 'create', label: 'Create', icon: PlusSquare },
  { key: 'messages', label: 'Messages', icon: MessageCircle },
  { key: 'profile', label: 'Profile', icon: User },
];

const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentRole,
  setCurrentRole,
  unreadCount = 0,
}) => {
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setRoleDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentRoleOption = ROLE_OPTIONS.find((r) => r.value === currentRole) || ROLE_OPTIONS[0];

  return (
    <>
      {/* ───── Top Header (all screens) ───── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800/60">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-14 px-3 sm:px-6">
          {/* Logo */}
          <button
            onClick={() => setActiveTab('feed')}
            className="flex items-center gap-2 shrink-0"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="hidden sm:inline text-lg font-bold text-white tracking-tight">
              Creator<span className="text-rose-400">Network</span>
            </span>
          </button>

          {/* Desktop nav pills */}
          <nav className="hidden lg:flex items-center gap-1 bg-neutral-900/70 rounded-full px-1.5 py-1">
            {DESKTOP_TABS.filter(
              (t) => t.key !== 'admin' || currentRole === 'admin'
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
                  activeTab === tab.key
                    ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/20'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                }`}
              >
                {tab.label}
                {tab.key === 'messages' && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white px-1">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Notification bell (mobile) */}
            <button className="lg:hidden relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-neutral-800/60 transition-colors">
              <Bell className="w-5 h-5 text-neutral-400" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
              )}
            </button>

            {/* Role switcher */}
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-colors text-sm"
              >
                {currentRoleOption.icon}
                <span className="hidden sm:inline text-neutral-300 font-medium">
                  {currentRoleOption.label}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-neutral-500 transition-transform duration-200 ${
                    roleDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl shadow-black/40 overflow-hidden py-1 z-[60]">
                  {ROLE_OPTIONS.map((role) => (
                    <button
                      key={role.value}
                      onClick={() => {
                        setCurrentRole(role.value);
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                        currentRole === role.value
                          ? 'bg-rose-500/10 text-rose-400'
                          : 'text-neutral-300 hover:bg-neutral-800'
                      }`}
                    >
                      {role.icon}
                      {role.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Join CTA (desktop) */}
            <button className="hidden lg:flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm font-semibold shadow-lg shadow-rose-500/20 hover:shadow-rose-500/40 transition-shadow">
              <Sparkles className="w-3.5 h-3.5" />
              Join as Creator
            </button>
          </div>
        </div>
      </header>

      {/* ───── Mobile Bottom Nav ───── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-neutral-950/95 backdrop-blur-md border-t border-neutral-800/60 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-16 px-2">
          {MOBILE_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            const isCreate = tab.key === 'create';
            const isMessages = tab.key === 'messages';

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex flex-col items-center justify-center min-w-[48px] min-h-[48px] rounded-2xl transition-all duration-200 ${
                  isCreate
                    ? ''
                    : isActive
                    ? 'text-white'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                {isCreate ? (
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-500/30">
                    <PlusSquare className="w-5 h-5 text-white" />
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <Icon className="w-5 h-5" />
                      {isMessages && unreadCount > 0 && (
                        <span className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] flex items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white px-0.5">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] mt-0.5 font-medium">{tab.label}</span>
                    {isActive && (
                      <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-rose-500" />
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

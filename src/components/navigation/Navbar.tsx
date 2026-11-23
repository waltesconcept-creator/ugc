'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import type { UserRole } from '@/lib/types';
import { Kre8torLogo } from '@/components/common/Kre8torLogo';
import { useAuth } from '@/context/AuthContext';
import { AccountSwitcherDrawer } from '@/components/auth/AccountSwitcherDrawer';
import {
  Plus,
  MessageCircle,
  User,
  ChevronDown,
  Shield,
  Briefcase,
  Store,
  Home,
  Search,
  PlusSquare,
  Heart,
  Send,
  LogOut,
  Users,
  ArrowRightLeft,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  unreadCount?: number;
  onOpenNotifications?: () => void;
  onOpenCreate?: () => void;
  onOpenCreatorStudio?: () => void;
  onOpenBusinessStudio?: () => void;
}

const DESKTOP_TABS = [
  { key: 'feed', label: 'Watch' },
  { key: 'explore', label: 'Explore' },
  { key: 'profile', label: 'Portfolio' },
  { key: 'projects', label: 'Projects' },
  { key: 'messages', label: 'Messages' },
  { key: 'admin', label: 'Admin' },
];

const MOBILE_TABS = [
  { key: 'feed', label: 'Home', icon: Home },
  { key: 'explore', label: 'Explore', icon: Search },
  { key: 'create', label: 'Create', icon: PlusSquare },
  { key: 'messages', label: 'Messages', icon: MessageCircle },
  { key: 'profile', label: 'Profile', icon: User },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentRole,
  setCurrentRole,
  unreadCount = 1,
  onOpenNotifications,
  onOpenCreate,
  onOpenCreatorStudio,
  onOpenBusinessStudio,
}) => {
  const { currentUser, isAuthenticated, openAuth, logout, switchRole } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [accountDrawerOpen, setAccountDrawerOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleProfileButtonClick = () => {
    // On mobile viewports (< 640px), open the mobile-optimized Account Drawer directly for flawless touch UX
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      setAccountDrawerOpen(true);
    } else {
      setUserMenuOpen((prev) => !prev);
    }
  };

  const handleRoleToggle = async () => {
    const nextRole = currentRole === 'creator' ? 'business' : 'creator';
    setCurrentRole(nextRole);
    if (switchRole) {
      await switchRole(nextRole);
    }
    if (nextRole === 'business' && onOpenBusinessStudio) {
      onOpenBusinessStudio();
    } else if (nextRole === 'creator' && onOpenCreatorStudio) {
      onOpenCreatorStudio();
    }
    setUserMenuOpen(false);
  };

  return (
    <>
      {/* ───── Top Header (All Screens) ───── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md border-b border-[#262626]">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-14 px-3 sm:px-6">
          {/* Brand Wordmark (Clean Creator Typography) */}
          <button
            onClick={() => setActiveTab('feed')}
            className="flex items-center gap-2 shrink-0 select-none text-left"
            title="Creator Home"
          >
            <Kre8torLogo size="md" />
          </button>

          {/* Desktop Nav Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#121212] rounded-full px-1.5 py-1 border border-[#262626]">
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
                  className={`relative px-4 py-1.5 text-xs font-semibold rounded-full transition-colors ${
                    isActive
                      ? 'bg-white text-black font-bold'
                      : 'text-[#a8a8a8] hover:text-white hover:bg-[#1f1f1f]'
                  }`}
                >
                  {tab.label}
                  {tab.key === 'messages' && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] flex items-center justify-center rounded-full bg-[#0095f6] text-[9px] font-bold text-white px-1">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2">
            {/* Notifications / Activity */}
            <button
              onClick={() => (onOpenNotifications ? onOpenNotifications() : setActiveTab('messages'))}
              title="Activity"
              className="relative flex items-center justify-center w-9 h-9 rounded-full bg-[#121212] border border-[#262626] text-[#a8a8a8] hover:text-white hover:border-[#3a3a3a] transition-colors"
            >
              <Heart className="w-4 h-4 text-[#cfcfcf]" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#0095f6]" />
              )}
            </button>

            {/* Direct Messages */}
            <button
              onClick={() => setActiveTab('messages')}
              title="Messages"
              className="relative flex items-center justify-center w-9 h-9 rounded-full bg-[#121212] border border-[#262626] text-[#a8a8a8] hover:text-white hover:border-[#3a3a3a] transition-colors"
            >
              <Send className="w-4 h-4 text-[#cfcfcf]" />
            </button>

            {/* User Profile Avatar / Menu (Visible on BOTH Mobile & Desktop) */}
            {isAuthenticated && currentUser && currentUser.profile ? (
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={handleProfileButtonClick}
                  className="flex items-center gap-1.5 p-1 pr-2 rounded-full bg-[#121212] border border-[#262626] hover:border-[#3a3a3a] transition-colors text-xs font-semibold"
                  title="Account Menu"
                >
                  <img
                    src={currentUser.profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop'}
                    alt={currentUser.profile.displayName || 'User'}
                    className="w-7 h-7 rounded-full object-cover border border-[#262626]"
                  />
                  <span className="text-white max-w-[80px] sm:max-w-[110px] truncate hidden sm:inline text-xs font-medium">
                    {currentUser.profile.displayName || 'Profile'}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu (Accessible on Mobile and Desktop) */}
                {userMenuOpen && (
                  <>
                    {/* Transparent Full-Screen Dismissal Backdrop */}
                    <div
                      className="fixed inset-0 z-[95]"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-[#121212] border border-[#262626] rounded-2xl shadow-2xl overflow-hidden py-1.5 z-[100] animate-fade-in text-xs">
                    {/* User Identity Header */}
                    <div className="px-3.5 py-2.5 border-b border-[#262626] bg-[#181818]/50">
                      <p className="font-bold text-white truncate text-xs">
                        {currentUser.profile.displayName || 'Creator'}
                      </p>
                      <p className="text-[11px] text-[#a8a8a8] truncate">
                        @{currentUser.profile.username || 'user'}
                      </p>
                      <span className="inline-block mt-1 text-[9px] font-semibold text-[#0095f6] bg-[#0095f6]/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {currentUser.role || currentRole} Account
                      </span>
                    </div>

                    {/* View Profile */}
                    <button
                      onClick={() => {
                        setActiveTab('profile');
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[#e0e0e0] hover:bg-[#1e1e1e] hover:text-white text-left font-medium transition-colors"
                    >
                      <User className="w-4 h-4 text-[#a8a8a8]" />
                      <span>View Profile & Rates</span>
                    </button>

                    {/* Creator Studio & Wallet */}
                    {onOpenCreatorStudio && (
                      <button
                        onClick={() => {
                          onOpenCreatorStudio();
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[#e0e0e0] hover:bg-[#1e1e1e] hover:text-white text-left font-medium transition-colors"
                      >
                        <Briefcase className="w-4 h-4 text-[#0095f6]" />
                        <span>Creator Studio & Wallet</span>
                      </button>
                    )}

                    {/* Brand Studio & Products */}
                    {onOpenBusinessStudio && (
                      <button
                        onClick={() => {
                          onOpenBusinessStudio();
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[#e0e0e0] hover:bg-[#1e1e1e] hover:text-white text-left font-medium transition-colors"
                      >
                        <Store className="w-4 h-4 text-emerald-400" />
                        <span>Brand Studio (Products)</span>
                      </button>
                    )}

                    {/* 1-Tap Toggle Role (Creator <-> Business) */}
                    <button
                      onClick={handleRoleToggle}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[#e0e0e0] hover:bg-[#1e1e1e] hover:text-white text-left font-medium transition-colors border-t border-[#262626]"
                    >
                      <ArrowRightLeft className="w-4 h-4 text-[#a8a8a8]" />
                      <span>
                        Switch to {currentRole === 'creator' ? 'Business' : 'Creator'}
                      </span>
                    </button>

                    {/* Open Full Switch Accounts Drawer */}
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        setAccountDrawerOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[#e0e0e0] hover:bg-[#1e1e1e] hover:text-white text-left font-medium transition-colors"
                    >
                      <Users className="w-4 h-4 text-[#a8a8a8]" />
                      <span>Switch Accounts...</span>
                    </button>

                    {/* Sign Out */}
                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-rose-400 hover:bg-[#1e1e1e] text-left font-medium border-t border-[#262626] transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link
                  href="/login"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#cfcfcf] hover:text-white transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/join"
                  className="px-3.5 py-1.5 rounded-lg bg-[#0095f6] hover:bg-[#1877f2] text-white text-xs font-semibold transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Desktop Upload Button */}
            <button
              onClick={() => (onOpenCreate ? onOpenCreate() : setActiveTab('create'))}
              className="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#262626] hover:bg-[#333333] text-white text-xs font-semibold transition-colors border border-[#333333]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create</span>
            </button>
          </div>
        </div>
      </header>

      {/* ───── Mobile Bottom Navigation Bar ───── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-lg border-t border-[#262626] pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-14 px-2">
          {MOBILE_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive =
              activeTab === tab.key ||
              (tab.key === 'profile' && activeTab === 'creator_profile') ||
              (tab.key === 'create' && activeTab === 'creator_onboard');
            const isCreate = tab.key === 'create';
            const isMessages = tab.key === 'messages';
            const isProfile = tab.key === 'profile';

            return (
              <button
                key={tab.key}
                onClick={() => {
                  if (isCreate) {
                    if (onOpenCreate) onOpenCreate();
                    else setActiveTab('create');
                  } else if (isProfile) {
                    // If user is already on profile, tapping it opens the account switcher drawer
                    if (activeTab === 'profile' || activeTab === 'creator_profile') {
                      setAccountDrawerOpen(true);
                    } else {
                      setActiveTab(tab.key);
                    }
                  } else {
                    setActiveTab(tab.key);
                  }
                }}
                className={`relative flex flex-col items-center justify-center min-w-[48px] min-h-[48px] transition-colors ${
                  isCreate
                    ? ''
                    : isActive
                    ? 'text-white'
                    : 'text-[#737373] hover:text-[#a8a8a8]'
                }`}
              >
                {isCreate ? (
                  /* Clean Elevated White Plus Button */
                  <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center border-2 border-black hover:scale-105 active:scale-95 transition-all shadow-md">
                    <Plus className="w-5 h-5 stroke-[2.5] text-black" />
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      {isProfile && currentUser?.profile?.avatarUrl ? (
                        <img
                          src={currentUser.profile.avatarUrl}
                          alt="Profile"
                          className={`w-6 h-6 rounded-full object-cover border ${
                            isActive ? 'border-white scale-105' : 'border-[#333333]'
                          }`}
                        />
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                      {isMessages && unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1.5 min-w-[14px] h-[14px] flex items-center justify-center rounded-full bg-[#0095f6] text-[8px] font-bold text-white px-0.5">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ───── Account Switcher Drawer (Mobile & Desktop) ───── */}
      <AccountSwitcherDrawer
        isOpen={accountDrawerOpen}
        onClose={() => setAccountDrawerOpen(false)}
        onViewProfile={() => setActiveTab('profile')}
        onOpenCreatorStudio={onOpenCreatorStudio}
        onOpenBusinessStudio={onOpenBusinessStudio}
      />

      {/* Spacer for Fixed Header */}
      <div className="h-14" />
    </>
  );
};

export default Navbar;
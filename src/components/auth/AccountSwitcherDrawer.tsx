'use client';

import React from 'react';
import { useAuth, UserAccount } from '@/context/AuthContext';
import {
  X,
  Check,
  Plus,
  Briefcase,
  Store,
  User,
  LogOut,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface AccountSwitcherDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onViewProfile?: () => void;
  onOpenCreatorStudio?: () => void;
  onOpenBusinessStudio?: () => void;
}

export const AccountSwitcherDrawer: React.FC<AccountSwitcherDrawerProps> = ({
  isOpen,
  onClose,
  onViewProfile,
  onOpenCreatorStudio,
  onOpenBusinessStudio,
}) => {
  const {
    currentUser,
    savedAccounts,
    switchRole,
    switchAccount,
    removeAccount,
    openAuth,
    logout,
  } = useAuth();

  if (!isOpen) return null;

  const currentRole = currentUser?.role || 'creator';

  const handleRoleToggle = async () => {
    const nextRole = currentRole === 'creator' ? 'business' : 'creator';
    await switchRole(nextRole);
    if (nextRole === 'business' && onOpenBusinessStudio) {
      onOpenBusinessStudio();
    } else if (nextRole === 'creator' && onOpenCreatorStudio) {
      onOpenCreatorStudio();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[160] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-sm bg-[#121212] border-t sm:border border-[#262626] rounded-t-3xl sm:rounded-2xl p-5 z-10 shadow-2xl">
        {/* Grab Handle for Mobile */}
        <div className="sm:hidden w-10 h-1 bg-neutral-700 rounded-full mx-auto mb-4" />

        <div className="flex items-center justify-between pb-3 border-b border-[#262626] mb-4">
          <h3 className="text-sm font-bold text-white">Switch Accounts</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#181818] border border-[#262626] text-neutral-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 1. Current Active Account Card */}
        {currentUser && (
          <div className="p-3 rounded-xl bg-[#181818] border border-[#262626] mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={
                    currentUser.profile?.avatarUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop'
                  }
                  alt=""
                  className="w-11 h-11 rounded-full object-cover border border-neutral-700"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-white truncate">
                      {currentUser.profile?.displayName}
                    </p>
                    <Check className="w-3.5 h-3.5 text-[#0095f6] shrink-0" />
                  </div>
                  <p className="text-[11px] text-neutral-400 truncate">
                    @{currentUser.profile?.username}
                  </p>
                  <span className="inline-block mt-0.5 text-[9px] font-semibold text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded-full uppercase">
                    {currentRole} Account
                  </span>
                </div>
              </div>
            </div>

            {/* Actions: View Profile, Studio & 1-Tap Role Toggle */}
            <div className="mt-3 pt-3 border-t border-[#262626] space-y-1.5">
              {onViewProfile && (
                <button
                  onClick={() => {
                    onViewProfile();
                    onClose();
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#1e1e1e] hover:bg-[#282828] text-white text-xs font-semibold flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <User className="w-4 h-4 text-neutral-300" />
                    <span>View Profile & Rates</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                </button>
              )}
              {onOpenCreatorStudio && (
                <button
                  onClick={() => {
                    onOpenCreatorStudio();
                    onClose();
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#1e1e1e] hover:bg-[#282828] text-white text-xs font-semibold flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Briefcase className="w-4 h-4 text-[#0095f6]" />
                    <span>Creator Studio & Wallet</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                </button>
              )}
              {onOpenBusinessStudio && (
                <button
                  onClick={() => {
                    onOpenBusinessStudio();
                    onClose();
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#1e1e1e] hover:bg-[#282828] text-white text-xs font-semibold flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Store className="w-4 h-4 text-emerald-400" />
                    <span>Brand Studio (Products & Samples)</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                </button>
              )}
              <button
                onClick={handleRoleToggle}
                className="w-full py-2.5 px-3 rounded-xl bg-[#262626] hover:bg-[#333333] text-white text-xs font-semibold flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  {currentRole === 'creator' ? (
                    <>
                      <Store className="w-4 h-4 text-emerald-400" />
                      <span>Switch to Business Account</span>
                    </>
                  ) : (
                    <>
                      <Briefcase className="w-4 h-4 text-[#0095f6]" />
                      <span>Switch to Creator Account</span>
                    </>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-400" />
              </button>
            </div>
          </div>
        )}

        {/* 2. Other Saved Accounts on this Device */}
        {savedAccounts.filter((a) => a.id !== currentUser?.id).length > 0 && (
          <div className="mb-4">
            <p className="text-[11px] font-medium text-neutral-400 mb-2">
              Other Accounts on this Device
            </p>
            <div className="space-y-1.5">
              {savedAccounts
                .filter((a) => a.id !== currentUser?.id)
                .map((acc) => (
                  <div
                    key={acc.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#181818] border border-[#262626] hover:border-neutral-600 transition-colors cursor-pointer"
                    onClick={() => {
                      switchAccount(acc.id);
                      onClose();
                    }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={acc.profile?.avatarUrl}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">
                          {acc.profile?.displayName}
                        </p>
                        <p className="text-[10px] text-neutral-400 truncate">
                          @{acc.profile?.username} &bull; {acc.role}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] text-[#0095f6] font-semibold">
                      Switch
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* 3. Actions: Add Account & Sign Out */}
        <div className="space-y-2 pt-2 border-t border-[#262626]">
          <button
            onClick={() => {
              onClose();
              openAuth('login');
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-[#181818] hover:bg-[#262626] text-white text-xs font-semibold flex items-center justify-center gap-2 border border-[#262626] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Existing or New Account</span>
          </button>

          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="w-full py-2 text-rose-400 hover:text-rose-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out of Current Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountSwitcherDrawer;

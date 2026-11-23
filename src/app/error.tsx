'use client';

import React, { useEffect } from 'react';
import { RotateCw, Home } from 'lucide-react';
import { Kre8torLogo } from '@/components/common/Kre8torLogo';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Creator app error boundary caught:', error);
  }, [error]);

  const handleResetSession = () => {
    try {
      localStorage.removeItem('kre8tor_auth_session_v1');
    } catch {}
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="mb-6">
        <Kre8torLogo size="lg" />
      </div>

      <div className="max-w-md w-full bg-[#121212] border border-[#262626] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-4">
        <div className="w-12 h-12 rounded-full bg-[#1a1a1a] border border-[#333333] text-white flex items-center justify-center mx-auto text-xl font-bold">
          !
        </div>

        <h2 className="text-lg font-bold text-white">Something interrupted your connection</h2>
        <p className="text-xs text-neutral-400 leading-relaxed">
          The server is updating or a network transition occurred. Tap below to reload seamlessly.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#0095f6] hover:bg-[#1877f2] text-white text-xs font-semibold shadow-md active:scale-95 transition-all"
          >
            <RotateCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <button
            onClick={handleResetSession}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#1e1e1e] hover:bg-[#262626] text-neutral-300 text-xs font-semibold border border-[#333333] active:scale-95 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Reload Creator</span>
          </button>
        </div>
      </div>
    </div>
  );
}

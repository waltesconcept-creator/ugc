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
    console.error('KRE8TOR app error boundary caught:', error);
  }, [error]);

  const handleResetSession = () => {
    try {
      localStorage.removeItem('kre8tor_auth_session_v1');
    } catch {}
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="mb-6">
        <Kre8torLogo size="lg" />
      </div>

      <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
        <div className="w-12 h-12 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 flex items-center justify-center mx-auto text-xl font-bold">
          !
        </div>

        <h2 className="text-lg font-bold text-white">Something interrupted your connection</h2>
        <p className="text-xs text-neutral-400 leading-relaxed">
          The server is updating or a network transition occurred. Tap below to reload seamlessly.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold shadow-lg shadow-orange-500/20 active:scale-95 transition-transform"
          >
            <RotateCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <button
            onClick={handleResetSession}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold border border-neutral-700 active:scale-95 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Reload KRE8TOR</span>
          </button>
        </div>
      </div>
    </div>
  );
}

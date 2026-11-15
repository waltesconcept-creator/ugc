import Link from 'next/link';
import { Kre8torLogo } from '@/components/common/Kre8torLogo';
import { ArrowLeft, Sparkles, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6 text-center relative selection:bg-orange-500 selection:text-white">
      {/* Background ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-md w-full bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-4">
        <div className="flex justify-center mb-2">
          <Kre8torLogo size="lg" />
        </div>

        <div className="w-12 h-12 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 flex items-center justify-center mx-auto text-xl font-bold">
          404
        </div>

        <h2 className="text-xl font-extrabold text-white">Page Not Found</h2>
        <p className="text-xs text-neutral-400 leading-relaxed">
          The link you requested is not available. Tap below to return to the live KRE8TOR feed or create your creator account.
        </p>

        <div className="flex flex-col sm:flex-row gap-2.5 pt-3">
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold shadow-lg shadow-orange-500/20 active:scale-95 transition-transform"
          >
            <Home className="w-4 h-4" />
            <span>Go to Home Feed</span>
          </Link>

          <Link
            href="/join"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold border border-neutral-700 active:scale-95 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span>Join KRE8TOR</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

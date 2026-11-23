import Link from 'next/link';
import { Kre8torLogo } from '@/components/common/Kre8torLogo';
import { ArrowLeft, Sparkles, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col items-center justify-center p-6 text-center relative selection:bg-[#0095f6] selection:text-white">
      <div className="relative z-10 max-w-md w-full bg-[#121212] border border-[#262626] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-4">
        <div className="flex justify-center mb-2">
          <Kre8torLogo size="lg" />
        </div>

        <div className="w-12 h-12 rounded-full bg-[#1a1a1a] border border-[#333333] text-neutral-300 flex items-center justify-center mx-auto text-xl font-bold">
          404
        </div>

        <h2 className="text-xl font-bold text-white">Page Not Found</h2>
        <p className="text-xs text-neutral-400 leading-relaxed">
          The link you requested is not available. Tap below to return to the live Creator feed or create your account.
        </p>

        <div className="flex flex-col sm:flex-row gap-2.5 pt-3">
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#0095f6] hover:bg-[#1877f2] text-white text-xs font-semibold shadow-md active:scale-95 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Go to Home Feed</span>
          </Link>

          <Link
            href="/join"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#1e1e1e] hover:bg-[#262626] text-neutral-200 text-xs font-semibold border border-[#333333] active:scale-95 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-[#0095f6]" />
            <span>Join Creator</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

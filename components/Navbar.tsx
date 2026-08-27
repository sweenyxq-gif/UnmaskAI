'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, ShieldCheck, Layers, Wand2 } from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-2xl transition-all">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-violet-500 p-[1px] shadow-glow transition-transform duration-300 group-hover:scale-105">
            <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-zinc-950">
              <Sparkles className="h-4 w-4 text-cyan-400 transition-transform group-hover:rotate-12" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-white">
                Unmask<span className="text-cyan-400">AI</span>
              </span>
              <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-400 border border-cyan-500/20">
                Gemini Remover
              </span>
            </div>
          </div>
        </Link>

        {/* Navigation links */}
        <nav className="hidden sm:flex items-center gap-1 bg-zinc-900/60 p-1 rounded-xl border border-zinc-800/60">
          <Link
            href="/"
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              pathname === '/'
                ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/50'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            Studio
          </Link>
          <Link
            href="/batch"
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              pathname === '/batch'
                ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/50'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Layers className="h-3.5 w-3.5 text-cyan-400" />
            <span>Batch Mode</span>
          </Link>
        </nav>

        {/* Privacy badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 text-[11px] font-medium text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>100% In-Browser</span>
          </div>
        </div>
      </div>
    </header>
  );
};

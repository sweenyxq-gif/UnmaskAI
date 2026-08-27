import React from 'react';
import Link from 'next/link';
import { Shield, Sparkles, Lock, Cpu, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-surface-border bg-surface/80 mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white">
                Unmask<span className="text-cyanGlow">AI</span>
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Browser-native visible AI watermark remover toolkit. Zero server uploads, instant mathematical reverse alpha blending.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-zinc-400">
              <Lock className="h-3 w-3 text-emerald-400" />
              <span>Zero telemetry. Images never leave your device.</span>
            </div>
          </div>

          {/* AI Generator Tools */}
          <div>
            <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider mb-3">
              Model Tools
            </h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <Link href="/gemini-watermark-remover" className="hover:text-cyanGlow transition-colors flex items-center gap-1">
                  Gemini Watermark Remover
                  <ArrowUpRight className="h-3 w-3 opacity-60" />
                </Link>
              </li>
              <li>
                <Link href="/veo-watermark-remover" className="hover:text-cyanGlow transition-colors flex items-center gap-1">
                  Google Veo Remover
                  <ArrowUpRight className="h-3 w-3 opacity-60" />
                </Link>
              </li>
              <li>
                <Link href="/sora-watermark-remover" className="hover:text-cyanGlow transition-colors flex items-center gap-1">
                  OpenAI Sora Cleaner
                  <ArrowUpRight className="h-3 w-3 opacity-60" />
                </Link>
              </li>
              <li>
                <Link href="/imagen-watermark-remover" className="hover:text-cyanGlow transition-colors flex items-center gap-1">
                  Imagen 3 Watermark Remover
                  <ArrowUpRight className="h-3 w-3 opacity-60" />
                </Link>
              </li>
              <li>
                <Link href="/capcut-watermark-remover" className="hover:text-cyanGlow transition-colors flex items-center gap-1">
                  CapCut Template Overlay
                  <ArrowUpRight className="h-3 w-3 opacity-60" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider mb-3">
              Capabilities
            </h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <Link href="/batch" className="hover:text-white transition-colors">
                  Batch Multi-Image Queue
                </Link>
              </li>
              <li>
                <span className="text-zinc-400">Reverse Alpha Blending Engine</span>
              </li>
              <li>
                <span className="text-zinc-400">Edge Inpaint Smoothing</span>
              </li>
              <li>
                <span className="text-zinc-400">PNG / JPG / WebP Lossless Export</span>
              </li>
              <li>
                <span className="text-zinc-400">Split-Screen Zoom Loupe</span>
              </li>
            </ul>
          </div>

          {/* Legal / Ethics */}
          <div>
            <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider mb-3">
              Ethical Usage & Policy
            </h4>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Unmask AI is designed exclusively for cleaning visible aesthetic overlays on media you own or have permission to edit. It does not alter invisible cryptographic tracking (such as SynthID).
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-surface-border/60 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 gap-4">
          <p>© {new Date().getFullYear()} Unmask AI. Built for creators and developers.</p>
          <div className="flex items-center gap-4">
            <span className="text-zinc-400">Powered by HTML5 Canvas & Web Workers</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

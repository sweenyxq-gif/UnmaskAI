import React from 'react';
import { WatermarkStudio } from '@/components/WatermarkStudio';
import { FeatureGrid } from '@/components/FeatureGrid';
import { SeoContentSection } from '@/components/SeoContentSection';
import { Sparkles, ShieldCheck, Zap } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Google Gemini Watermark Remover | 100% In-Browser Reverse Alpha Engine',
  description: 'Remove visible sparkle watermarks from Google Gemini AI images with mathematical precision. 100% private in-browser reverse alpha blending.',
};

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12">
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3.5 py-1 text-xs font-medium text-cyan-300 shadow-glow">
          <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
          <span>Google Gemini AI Watermark Remover</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
          Erase Gemini Watermarks.{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 bg-clip-text text-transparent">
            Mathematically Lossless.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-2xl mx-auto">
          Reverse alpha blending mathematically solves for the original pixels hidden beneath the Google Gemini sparkle overlay. 100% private, runs entirely inside your browser.
        </p>

        {/* Quick highlight tags */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          <span className="rounded-lg bg-zinc-900/80 border border-zinc-800 px-3 py-1 text-xs font-medium text-zinc-300">
            ✨ Gemini Sparkle (48px & 96px)
          </span>
          <span className="rounded-lg bg-zinc-900/80 border border-zinc-800 px-3 py-1 text-xs font-medium text-zinc-300">
            ⚡ 100% Reverse Alpha Formula
          </span>
          <span className="rounded-lg bg-zinc-900/80 border border-zinc-800 px-3 py-1 text-xs font-medium text-zinc-300">
            🔒 Zero Server Uploads
          </span>
        </div>
      </div>

      {/* Main Interactive Studio */}
      <section className="rounded-3xl border border-zinc-800/80 bg-zinc-950/70 p-4 sm:p-8 backdrop-blur-2xl shadow-2xl">
        <WatermarkStudio initialPreset="gemini" />
      </section>

      {/* Technical Features & Superiority Grid */}
      <FeatureGrid />

      {/* SEO & FAQ Section */}
      <SeoContentSection />
    </div>
  );
}

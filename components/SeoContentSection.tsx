'use client';

import React, { useState } from 'react';
import { ChevronDown, Check, X, ShieldAlert, BookOpen, HelpCircle } from 'lucide-react';
import { ToolSeoConfig } from '@/lib/seo-data';

interface SeoContentSectionProps {
  config?: ToolSeoConfig;
}

export const SeoContentSection: React.FC<SeoContentSectionProps> = ({ config }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const defaultFaqs = [
    {
      q: 'How does Unmask AI remove visible watermarks without blurring the image?',
      a: 'Standard object-remover apps smudge the area using blurry inpainting. Unmask AI knows the exact geometric opacity mask (alpha map) and overlay color used by Gemini and other generators. It solves the optical compositing formula in reverse: Original = (Watermarked - alpha * Overlay) / (1 - alpha).'
    },
    {
      q: 'Are my images stored or analyzed on any remote servers?',
      a: 'No. The entire engine runs in your browser via HTML5 Canvas and typed pixel arrays. Your files never leave your computer or phone.'
    },
    {
      q: 'Does Unmask AI remove SynthID or metadata watermarks?',
      a: 'No. Unmask AI only cleans visible corner aesthetic overlays on visual assets you own or are authorized to edit. We do not bypass cryptographic or forensic watermarking.'
    },
    {
      q: 'Can I export in lossless PNG or compressed WebP/JPG?',
      a: 'Yes, you can choose PNG, WebP, or JPEG with quality settings before downloading.'
    }
  ];

  const faqs = config?.faqs || defaultFaqs;

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: config?.title || 'Unmask AI - Visible AI Watermark Remover',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Any (Web Browser)',
    offers: {
      '@type': 'Offer',
      price: '0.00',
      priceCurrency: 'USD',
    },
    description: config?.description || 'Browser-based visible AI watermark remover using reverse alpha blending.',
  };

  return (
    <div className="space-y-12 pt-16 border-t border-surface-border/60">
      {/* Schema Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Comparison Table */}
      <div className="space-y-4">
        <div className="text-center space-y-1">
          <h3 className="text-lg font-bold text-white">
            Unmask AI vs. Traditional Inpainting Removers
          </h3>
          <p className="text-xs text-zinc-400">
            Why mathematical reverse alpha blending yields superior image clarity
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-surface-border bg-surface">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-surface-border bg-surface-muted/50 text-zinc-400 font-semibold">
              <tr>
                <th className="p-3.5">Feature</th>
                <th className="p-3.5 text-cyanGlow font-bold">Unmask AI (Reverse Alpha)</th>
                <th className="p-3.5 text-zinc-400">Generic AI Object Erasers</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/60 text-zinc-300">
              <tr>
                <td className="p-3.5 font-medium">Underlying Pixel Recovery</td>
                <td className="p-3.5 text-emerald-400 font-medium flex items-center gap-1.5">
                  <Check className="h-4 w-4" /> Exact Mathematical Inversion
                </td>
                <td className="p-3.5 text-zinc-500 flex items-center gap-1.5">
                  <X className="h-4 w-4 text-rose-500" /> Blurry AI Generative Hallucination
                </td>
              </tr>
              <tr>
                <td className="p-3.5 font-medium">Processing Privacy</td>
                <td className="p-3.5 text-emerald-400 font-medium">100% Local Browser Canvas</td>
                <td className="p-3.5 text-zinc-400">Uploads to Cloud Servers</td>
              </tr>
              <tr>
                <td className="p-3.5 font-medium">Processing Latency</td>
                <td className="p-3.5 text-cyanGlow font-mono font-medium">&lt; 50 Milliseconds</td>
                <td className="p-3.5 text-zinc-400">5 – 15 Seconds (Queue wait)</td>
              </tr>
              <tr>
                <td className="p-3.5 font-medium">Resolution & Detail Retention</td>
                <td className="p-3.5 text-emerald-400 font-medium">Lossless Original Fidelity</td>
                <td className="p-3.5 text-zinc-400">Smudged / Inpainted artifacting</td>
              </tr>
              <tr>
                <td className="p-3.5 font-medium">Batch Queueing</td>
                <td className="p-3.5 text-emerald-400 font-medium">Included with 1-click ZIP</td>
                <td className="p-3.5 text-zinc-400">Often Paid Paywall</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Deep Technical Explanation */}
      <div className="rounded-2xl border border-surface-border bg-surface-muted/40 p-6 space-y-3">
        <div className="flex items-center gap-2 text-cyanGlow">
          <BookOpen className="h-4 w-4" />
          <h4 className="text-sm font-semibold text-white">How the Mathematics Work</h4>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">
          {config?.technicalExplanation ||
            'When an AI generator stamps a visible watermark over a visual canvas, it composites each pixel using alpha transparency: C_watermarked = (1 - α) * C_original + α * C_watermark. Because Google and other platforms apply fixed 48px/96px sparkle SVG masks with known peak opacities, Unmask AI solves for C_original directly in raw RGBA byte arrays.'}
        </p>
      </div>

      {/* FAQs Accordion */}
      <div className="space-y-4 max-w-3xl mx-auto">
        <div className="text-center space-y-1 mb-6">
          <div className="inline-flex items-center gap-1.5 text-cyanGlow text-xs font-semibold uppercase tracking-wider">
            <HelpCircle className="h-3.5 w-3.5" /> Frequently Asked Questions
          </div>
          <h3 className="text-lg font-bold text-white">Got questions? We have answers.</h3>
        </div>

        <div className="space-y-2">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-surface-border bg-surface overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left text-xs font-semibold text-zinc-200 hover:text-white"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-zinc-400 transition-transform ${
                      isOpen ? 'rotate-180 text-cyanGlow' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-zinc-400 leading-relaxed border-t border-surface-border/40 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

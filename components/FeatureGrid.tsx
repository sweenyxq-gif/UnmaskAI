import React from 'react';
import { Cpu, ShieldCheck, Zap, Layers, Sparkles, Sliders } from 'lucide-react';

export const FeatureGrid: React.FC = () => {
  const features = [
    {
      icon: <Zap className="h-5 w-5 text-cyanGlow" />,
      title: 'Reverse Alpha Mathematics',
      desc: 'Instead of destructive AI content-aware fills that guess blurry textures, we invert the exact opacity formula to restore authentic underlying pixel data.',
    },
    {
      icon: <ShieldCheck className="h-5 w-5 text-emeraldGlow" />,
      title: '100% Client-Side Privacy',
      desc: 'All computations execute in your browser via HTML5 Canvas. Your images are never uploaded to any remote server or cloud bucket.',
    },
    {
      icon: <Layers className="h-5 w-5 text-brand-400" />,
      title: 'Multi-Generator Intelligence',
      desc: 'Dedicated pre-calibrated profiles for Google Gemini sparkle (48px/96px), Google Veo stills, OpenAI Sora, and Google Imagen 3.',
    },
    {
      icon: <Cpu className="h-5 w-5 text-amber-400" />,
      title: 'Adaptive Gradient Inpainting',
      desc: 'Hybrid Navier-Stokes smoothing intelligently resolves high-opacity core pixels and eliminates JPEG compression noise.',
    },
    {
      icon: <Sparkles className="h-5 w-5 text-pink-400" />,
      title: 'High-FPS Interactive Split Slider',
      desc: 'Compare before and after transformations in real-time with an interactive 3.5x pixel-level inspection magnifier loupe.',
    },
    {
      icon: <Sliders className="h-5 w-5 text-indigo-400" />,
      title: 'Batch ZIP Queue',
      desc: 'Clean complete sets of AI images or video frame sequences at once, with instant one-click lossless ZIP packaging.',
    },
  ];

  return (
    <div className="space-y-6 pt-10">
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
          Engineered for Clean, Lossless AI Media
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400">
          The difference between standard generative inpainting and mathematical de-blending is total authenticity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((f, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-surface-border bg-surface/60 p-5 space-y-3 hover:border-zinc-700 transition-colors backdrop-blur-sm"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-muted border border-surface-border shadow-inner">
              {f.icon}
            </div>
            <h3 className="text-sm font-semibold text-zinc-100">{f.title}</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

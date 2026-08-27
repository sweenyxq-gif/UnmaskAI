'use client';

import React, { useState } from 'react';
import { generateSampleImage } from '@/lib/engine/samples';
import { Sparkles, Loader2, Play } from 'lucide-react';

interface SamplePickerProps {
  onSelectSample: (dataUrl: string, sampleName: string, presetKey: string) => void;
}

export const SamplePicker: React.FC<SamplePickerProps> = ({ onSelectSample }) => {
  const [loadingSample, setLoadingSample] = useState<string | null>(null);

  const samples = [
    {
      id: 'gemini-neon',
      name: 'Gemini Neon Cyber',
      desc: 'Synthwave with 4-point sparkle',
      preset: 'gemini',
      badgeColor: 'border-purple-500/30 text-purple-400 bg-purple-950/30',
    },
    {
      id: 'imagen-nature',
      name: 'Imagen 3 Mountains',
      desc: 'Scenic landscape with corner star',
      preset: 'imagen',
      badgeColor: 'border-emerald-500/30 text-emerald-400 bg-emerald-950/30',
    },
    {
      id: 'veo-cyberpunk',
      name: 'Veo Video Still',
      desc: 'Dark portrait with Veo badge',
      preset: 'veo',
      badgeColor: 'border-cyan-500/30 text-cyan-400 bg-cyan-950/30',
    },
  ];

  const handlePick = async (sample: typeof samples[0]) => {
    try {
      setLoadingSample(sample.id);
      const dataUrl = await generateSampleImage(sample.id as any);
      onSelectSample(dataUrl, `${sample.id}.png`, sample.preset);
    } finally {
      setLoadingSample(null);
    }
  };

  return (
    <div className="rounded-2xl border border-surface-border bg-surface/50 p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-cyanGlow" />
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Or test with Instant 1-Click AI Samples
          </span>
        </div>
        <span className="text-[11px] text-zinc-400 hidden sm:inline">No file needed to test</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {samples.map((sample) => {
          const isLoading = loadingSample === sample.id;
          return (
            <button
              key={sample.id}
              type="button"
              onClick={() => handlePick(sample)}
              disabled={isLoading}
              className="group flex items-center justify-between p-2.5 rounded-xl border border-surface-border bg-surface-muted/40 hover:bg-surface-muted hover:border-zinc-700 transition-all text-left"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-zinc-100 group-hover:text-cyanGlow transition-colors">
                    {sample.name}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400">{sample.desc}</p>
              </div>

              <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-surface border border-surface-border group-hover:border-cyanGlow/50 group-hover:text-cyanGlow text-zinc-400">
                {isLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Play className="h-3 w-3 fill-current ml-0.5" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

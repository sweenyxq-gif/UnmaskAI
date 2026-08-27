'use client';

import React from 'react';
import { Sliders, RotateCcw, Crosshair } from 'lucide-react';
import { ProcessOptions } from '@/lib/engine/reverseAlpha';

interface ManualAdjustmentPanelProps {
  options: ProcessOptions;
  onChangeOptions: (updated: Partial<ProcessOptions>) => void;
  onReset: () => void;
}

export const ManualAdjustmentPanel: React.FC<ManualAdjustmentPanelProps> = ({
  options,
  onChangeOptions,
  onReset,
}) => {
  const corners: Array<{ id: ProcessOptions['corner']; label: string }> = [
    { id: 'bottom-right', label: 'Bottom Right' },
    { id: 'bottom-left', label: 'Bottom Left' },
    { id: 'top-right', label: 'Top Right' },
    { id: 'top-left', label: 'Top Left' },
  ];

  return (
    <div className="rounded-2xl border border-surface-border bg-surface-muted/60 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="h-4 w-4 text-cyanGlow" />
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Fine-Tuning & Custom Calibration
          </span>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Reset Defaults</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Corner Selection */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-zinc-400">Watermark Location</label>
          <div className="grid grid-cols-2 gap-1.5">
            {corners.map((c) => {
              const isSelected = (options.corner || 'bottom-right') === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onChangeOptions({ corner: c.id })}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border text-center transition-all ${
                    isSelected
                      ? 'bg-cyanGlow/20 text-cyanGlow border-cyanGlow/40 shadow-cyan'
                      : 'bg-surface border-surface-border text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Alpha Multiplier Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px]">
            <span className="font-medium text-zinc-400">Alpha Removal Strength</span>
            <span className="font-mono text-cyanGlow">
              {Math.round((options.alphaMultiplier ?? 1.0) * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0.5"
            max="1.5"
            step="0.05"
            value={options.alphaMultiplier ?? 1.0}
            onChange={(e) => onChangeOptions({ alphaMultiplier: parseFloat(e.target.value) })}
            className="w-full h-1.5 bg-surface-border rounded-lg appearance-none cursor-pointer accent-cyanGlow"
          />
          <p className="text-[10px] text-zinc-400">
            Increase if faint watermark residue remains; decrease if background over-darkens.
          </p>
        </div>

        {/* Inpaint Smoothing Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px]">
            <span className="font-medium text-zinc-400">Edge Inpaint Smoothing</span>
            <span className="font-mono text-emeraldGlow">
              {Math.round((options.inpaintIntensity ?? 0.85) * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0.0"
            max="1.0"
            step="0.05"
            value={options.inpaintIntensity ?? 0.85}
            onChange={(e) => onChangeOptions({ inpaintIntensity: parseFloat(e.target.value) })}
            className="w-full h-1.5 bg-surface-border rounded-lg appearance-none cursor-pointer accent-emeraldGlow"
          />
          <p className="text-[10px] text-zinc-400">
            Blends surrounding color gradients over high-opacity core star pixels.
          </p>
        </div>
      </div>
    </div>
  );
};

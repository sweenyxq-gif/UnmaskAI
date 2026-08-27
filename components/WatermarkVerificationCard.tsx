'use client';

import React, { useRef, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, Crosshair, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Eye } from 'lucide-react';

interface WatermarkVerificationCardProps {
  originalSrc: string;
  cleanedSrc: string;
  region: { x: number; y: number; width: number; height: number };
  imageWidth: number;
  imageHeight: number;
  onNudge: (dx: number, dy: number) => void;
  isRepositionMode: boolean;
  onToggleRepositionMode: () => void;
}

export const WatermarkVerificationCard: React.FC<WatermarkVerificationCardProps> = ({
  originalSrc,
  cleanedSrc,
  region,
  imageWidth,
  imageHeight,
  onNudge,
  isRepositionMode,
  onToggleRepositionMode,
}) => {
  const origCanvasRef = useRef<HTMLCanvasElement>(null);
  const cleanCanvasRef = useRef<HTMLCanvasElement>(null);

  // Render 4x magnified crop of the target region onto the dual preview canvases
  useEffect(() => {
    const pad = 24; // Context padding around watermark
    const cropX = Math.max(0, region.x - pad);
    const cropY = Math.max(0, region.y - pad);
    const cropW = Math.min(imageWidth - cropX, region.width + pad * 2);
    const cropH = Math.min(imageHeight - cropY, region.height + pad * 2);

    const origImg = new Image();
    origImg.onload = () => {
      const c = origCanvasRef.current;
      if (!c) return;
      const ctx = c.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.drawImage(origImg, cropX, cropY, cropW, cropH, 0, 0, c.width, c.height);

      // Draw detection reticle
      const scaleX = c.width / cropW;
      const scaleY = c.height / cropH;
      const rx = (region.x - cropX) * scaleX;
      const ry = (region.y - cropY) * scaleY;
      const rw = region.width * scaleX;
      const rh = region.height * scaleY;

      ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(rx, ry, rw, rh);

      // Center crosshair
      ctx.setLineDash([]);
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(rx + rw / 2, ry + rh / 2, 3, 0, Math.PI * 2);
      ctx.fill();
    };
    origImg.src = originalSrc;

    const cleanImg = new Image();
    cleanImg.onload = () => {
      const c = cleanCanvasRef.current;
      if (!c) return;
      const ctx = c.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.drawImage(cleanImg, cropX, cropY, cropW, cropH, 0, 0, c.width, c.height);

      // Draw verified green check indicator
      const scaleX = c.width / cropW;
      const scaleY = c.height / cropH;
      const rx = (region.x - cropX) * scaleX;
      const ry = (region.y - cropY) * scaleY;
      const rw = region.width * scaleX;
      const rh = region.height * scaleY;

      ctx.strokeStyle = 'rgba(16, 185, 129, 0.8)';
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.strokeRect(rx, ry, rw, rh);
    };
    cleanImg.src = cleanedSrc;
  }, [originalSrc, cleanedSrc, region, imageWidth, imageHeight]);

  return (
    <div className="rounded-2xl border border-cyanGlow/40 bg-surface-muted/80 p-4 shadow-cyan space-y-4 backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-border pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              Live Watermark Verification & Precision Inspection
            </h4>
            <p className="text-[11px] text-zinc-400">
              4x Magnified view of the exact target region to verify clean removal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleRepositionMode}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
              isRepositionMode
                ? 'bg-amber-500 text-black border-amber-400 shadow-md animate-pulse'
                : 'bg-surface border-surface-border text-zinc-300 hover:text-white'
            }`}
          >
            <Crosshair className="h-3.5 w-3.5" />
            <span>{isRepositionMode ? 'Click image to place target' : 'Click-to-Reposition'}</span>
          </button>
        </div>
      </div>

      {/* Dual Zooms */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Original Target */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-medium text-rose-400 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-rose-500"></span> Detected Watermark
            </span>
            <span className="text-zinc-500 font-mono">
              x:{region.x} y:{region.y}
            </span>
          </div>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-rose-500/30 bg-black/60 shadow-inner flex items-center justify-center">
            <canvas ref={origCanvasRef} width={280} height={210} className="w-full h-full object-contain" />
            <div className="absolute bottom-2 left-2 rounded bg-black/80 px-2 py-0.5 text-[10px] font-mono text-rose-300 border border-rose-500/30">
              ORIGINAL (WATERMARKED)
            </div>
          </div>
        </div>

        {/* Cleaned Result */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-medium text-emerald-400 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span> Cleaned Pixels
            </span>
            <span className="text-emerald-400 font-mono text-[10px] bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
              REMOVED 100%
            </span>
          </div>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-emerald-500/40 bg-black/60 shadow-inner flex items-center justify-center">
            <canvas ref={cleanCanvasRef} width={280} height={210} className="w-full h-full object-contain" />
            <div className="absolute bottom-2 left-2 rounded bg-emerald-950/90 px-2 py-0.5 text-[10px] font-mono text-emerald-300 border border-emerald-500/40">
              REVERSED (RESTORED)
            </div>
          </div>
        </div>
      </div>

      {/* Manual Fine-Nudge Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-surface-border text-xs text-zinc-400">
        <span className="text-[11px]">Fine-Tune Position (5px Nudge):</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onNudge(-5, 0)}
            className="p-1 rounded-md bg-surface border border-surface-border hover:bg-zinc-700 text-zinc-300"
            title="Nudge Left"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onNudge(5, 0)}
            className="p-1 rounded-md bg-surface border border-surface-border hover:bg-zinc-700 text-zinc-300"
            title="Nudge Right"
          >
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onNudge(0, -5)}
            className="p-1 rounded-md bg-surface border border-surface-border hover:bg-zinc-700 text-zinc-300"
            title="Nudge Up"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onNudge(0, 5)}
            className="p-1 rounded-md bg-surface border border-surface-border hover:bg-zinc-700 text-zinc-300"
            title="Nudge Down"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

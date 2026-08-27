'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ZoomIn, ZoomOut, Split, Crosshair } from 'lucide-react';

interface ImageCompareSliderProps {
  originalSrc: string;
  cleanedSrc: string;
  watermarkRegion?: { x: number; y: number; width: number; height: number };
  isRepositionMode?: boolean;
  onCanvasClick?: (imageRelX: number, imageRelY: number) => void;
}

export const ImageCompareSlider: React.FC<ImageCompareSliderProps> = ({
  originalSrc,
  cleanedSrc,
  watermarkRegion,
  isRepositionMode = false,
  onCanvasClick,
}) => {
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [showLoupe, setShowLoupe] = useState(false);
  const [loupePos, setLoupePos] = useState({ x: 0, y: 0, relX: 0.85, relY: 0.85 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pos = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(pos);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setLoupePos({
        x,
        y,
        relX: Math.max(0, Math.min(1, x / rect.width)),
        relY: Math.max(0, Math.min(1, y / rect.height)),
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isRepositionMode) return;
    setIsDragging(true);
    handleMove(e.clientX);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isRepositionMode && onCanvasClick && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width;
      const relY = (e.clientY - rect.top) / rect.height;
      onCanvasClick(relX, relY);
    }
  };

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  return (
    <div className="space-y-3">
      {/* Visual Controls Header */}
      <div className="flex items-center justify-between px-1 text-xs">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-medium text-zinc-400">
            <span className="h-2 w-2 rounded-full bg-red-400"></span>
            Original (Watermarked)
          </span>
          <span className="text-zinc-600">/</span>
          <span className="flex items-center gap-1.5 font-medium text-cyanGlow">
            <span className="h-2 w-2 rounded-full bg-cyanGlow"></span>
            Cleaned (Unmasked)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isRepositionMode && (
            <span className="text-amber-400 font-semibold flex items-center gap-1 text-[11px] bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/40">
              <Crosshair className="h-3.5 w-3.5 animate-spin" /> Click image to place removal target
            </span>
          )}

          <button
            type="button"
            onClick={() => setShowLoupe(!showLoupe)}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
              showLoupe
                ? 'bg-cyanGlow/20 text-cyanGlow border border-cyanGlow/40 shadow-cyan'
                : 'bg-surface-muted text-zinc-400 hover:text-zinc-200 border border-surface-border'
            }`}
          >
            {showLoupe ? <ZoomOut className="h-3.5 w-3.5" /> : <ZoomIn className="h-3.5 w-3.5" />}
            <span>{showLoupe ? 'Hide Loupe' : '3x Pixel Zoom'}</span>
          </button>
        </div>
      </div>

      {/* Main Split Slider Area */}
      <div
        ref={containerRef}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        className={`relative aspect-auto max-h-[640px] w-full overflow-hidden rounded-2xl border border-surface-border bg-surface select-none shadow-2xl group ${
          isRepositionMode ? 'cursor-crosshair' : 'cursor-col-resize'
        }`}
      >
        {/* Cleaned Image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cleanedSrc}
          alt="Cleaned AI visual"
          className="h-full w-full object-contain pointer-events-none mx-auto block"
        />

        {/* Original Watermarked Image */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={originalSrc}
            alt="Original watermarked visual"
            className="h-full w-full object-contain mx-auto block"
          />
        </div>

        {/* Slider Divider Line */}
        {!isRepositionMode && (
          <div
            className="absolute top-0 bottom-0 z-20 w-0.5 bg-gradient-to-b from-cyanGlow via-white to-brand-500 shadow-[0_0_12px_rgba(6,182,212,0.8)]"
            style={{ left: `${sliderPos}%` }}
            onMouseDown={handleMouseDown}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-9 w-9 rounded-full bg-zinc-900 border-2 border-white/90 shadow-2xl flex items-center justify-center cursor-grab active:cursor-grabbing hover:scale-110 transition-transform">
              <Split className="h-4 w-4 text-cyanGlow rotate-90" />
            </div>
          </div>
        )}

        {/* Dynamic Zoom Loupe Lens */}
        {showLoupe && (
          <div
            className="pointer-events-none absolute z-30 h-48 w-48 rounded-full border-2 border-cyanGlow bg-surface shadow-[0_0_25px_rgba(6,182,212,0.5)] overflow-hidden -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${loupePos.x}px`,
              top: `${loupePos.y}px`,
            }}
          >
            <div
              className="absolute w-[800px] h-[800px]"
              style={{
                left: `${-loupePos.relX * 800 + 96}px`,
                top: `${-loupePos.relY * 800 + 96}px`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cleanedSrc}
                alt="Zoomed pixel details"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/80 px-2 py-0.5 rounded text-[10px] font-mono text-cyanGlow border border-cyanGlow/30">
              3.5x Magnified
            </div>
          </div>
        )}

        {/* Labels Overlay */}
        <div className="absolute top-4 left-4 pointer-events-none rounded-lg bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-medium text-zinc-300 border border-white/10">
          Before (Watermark)
        </div>
        <div className="absolute top-4 right-4 pointer-events-none rounded-lg bg-cyan-950/70 backdrop-blur-md px-2.5 py-1 text-[11px] font-medium text-cyan-300 border border-cyan-500/30 shadow-cyan">
          After (Restored)
        </div>
      </div>
    </div>
  );
};

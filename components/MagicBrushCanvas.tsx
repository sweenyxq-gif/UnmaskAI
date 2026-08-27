'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Paintbrush, Eraser, RotateCcw, Sparkles, Wand2, Check, Sliders } from 'lucide-react';
import { inpaintCustomMask } from '@/lib/engine/harmonicInpaint';
import { detectAutonomousWatermark } from '@/lib/engine/autonomousDetector';

interface MagicBrushCanvasProps {
  sourceImageData: ImageData;
  onApplyInpaintedResult: (cleanedImageData: ImageData) => void;
}

export const MagicBrushCanvas: React.FC<MagicBrushCanvasProps> = ({
  sourceImageData,
  onApplyInpaintedResult,
}) => {
  const [brushSize, setBrushSize] = useState<number>(28);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [hasMask, setHasMask] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize canvas with image data
  useEffect(() => {
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!canvas || !maskCanvas) return;

    canvas.width = sourceImageData.width;
    canvas.height = sourceImageData.height;
    maskCanvas.width = sourceImageData.width;
    maskCanvas.height = sourceImageData.height;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.putImageData(sourceImageData, 0, 0);
    }

    const maskCtx = maskCanvas.getContext('2d');
    if (maskCtx) {
      maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
    }
    setHasMask(false);
  }, [sourceImageData]);

  // Run autonomous anomaly scan and paint its mask onto the canvas
  const handleAutonomousScan = useCallback(() => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const maskCtx = maskCanvas.getContext('2d');
    if (!maskCtx) return;

    // Detect watermark anomaly using our custom Laplacian engine
    const anomaly = detectAutonomousWatermark(sourceImageData, 1.0);

    maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
    maskCtx.fillStyle = 'rgba(6, 182, 212, 0.65)';
    maskCtx.beginPath();
    maskCtx.ellipse(
      anomaly.x + anomaly.width / 2,
      anomaly.y + anomaly.height / 2,
      anomaly.width / 2 + 6,
      anomaly.height / 2 + 6,
      0,
      0,
      Math.PI * 2
    );
    maskCtx.fill();

    setHasMask(true);
  }, [sourceImageData]);

  // Execute inpainting on the current mask
  const handleExecuteInpaint = () => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const maskCtx = maskCanvas.getContext('2d');
    if (!maskCtx) return;

    setIsProcessing(true);
    try {
      const maskData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
      const alphaArray = new Uint8ClampedArray(maskCanvas.width * maskCanvas.height);

      for (let i = 0; i < alphaArray.length; i++) {
        alphaArray[i] = maskData.data[i * 4 + 3]; // Alpha channel of brush
      }

      // Run our PDE Harmonic Inpainting engine
      const cleaned = inpaintCustomMask(sourceImageData, alphaArray, false);
      onApplyInpaintedResult(cleaned);

      // Redraw cleaned image on canvas
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) ctx.putImageData(cleaned, 0, 0);

      // Clear mask
      maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
      setHasMask(false);
    } finally {
      setIsProcessing(false);
    }
  };

  // Drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing && e.type !== 'mousedown') return;
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const rect = maskCanvas.getBoundingClientRect();

    const scaleX = maskCanvas.width / rect.width;
    const scaleY = maskCanvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const ctx = maskCanvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = 'rgba(6, 182, 212, 0.65)';
    ctx.beginPath();
    ctx.arc(x, y, brushSize * (scaleX || 1) * 0.5, 0, Math.PI * 2);
    ctx.fill();

    setHasMask(true);
  };

  const handleClearMask = () => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const ctx = maskCanvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
    }
    setHasMask(false);
  };

  return (
    <div className="space-y-4 rounded-2xl border border-surface-border bg-surface p-4">
      {/* Magic Brush Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-border pb-3 text-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleAutonomousScan}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold bg-brand-600 hover:bg-brand-500 text-white shadow-glow transition-all"
          >
            <Sparkles className="h-4 w-4 text-cyanGlow" />
            <span>Autonomous Anomaly Auto-Scan</span>
          </button>

          <div className="flex items-center gap-2 text-zinc-300">
            <Paintbrush className="h-4 w-4 text-cyanGlow" />
            <span>Brush Size:</span>
            <input
              type="range"
              min="10"
              max="80"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-24 h-1.5 bg-surface-border rounded-lg appearance-none cursor-pointer accent-cyanGlow"
            />
            <span className="font-mono text-cyanGlow">{brushSize}px</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleClearMask}
            disabled={!hasMask}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-surface-border text-zinc-400 hover:text-white disabled:opacity-40 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Clear Mask</span>
          </button>

          <button
            type="button"
            onClick={handleExecuteInpaint}
            disabled={!hasMask || isProcessing}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-bold bg-gradient-to-r from-emerald-600 to-cyanGlow hover:opacity-95 text-white shadow-cyan disabled:opacity-40 transition-all"
          >
            <Wand2 className="h-4 w-4" />
            <span>{isProcessing ? 'Synthesizing...' : 'Clean Highlighted Area'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Brush Canvas Viewport */}
      <div className="relative aspect-auto max-h-[640px] w-full overflow-hidden rounded-xl border border-surface-border bg-black select-none flex items-center justify-center cursor-crosshair">
        <canvas ref={canvasRef} className="max-h-[640px] w-full object-contain mx-auto block" />
        <canvas
          ref={maskCanvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="absolute inset-0 max-h-[640px] w-full object-contain mx-auto block z-20"
        />

        <div className="absolute top-3 left-3 pointer-events-none rounded-lg bg-black/75 backdrop-blur-md px-2.5 py-1 text-[11px] font-medium text-cyan-300 border border-cyan-500/30">
          Paint over any custom watermark, logo, or artifact to clean
        </div>
      </div>

      <p className="text-center text-[11px] text-zinc-400">
        Click &apos;Autonomous Anomaly Auto-Scan&apos; to let our custom gradient algorithm detect it, or use the brush to highlight any watermark.
      </p>
    </div>
  );
};

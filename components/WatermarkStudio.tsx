'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Upload, Download, Copy, Check, Sparkles, RefreshCw, ShieldCheck, Zap, SlidersHorizontal, Paintbrush } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ImageCompareSlider } from './ImageCompareSlider';
import { ManualAdjustmentPanel } from './ManualAdjustmentPanel';
import { WatermarkVerificationCard } from './WatermarkVerificationCard';
import { MagicBrushCanvas } from './MagicBrushCanvas';
import { SamplePicker } from './SamplePicker';
import { detectAutonomousWatermark } from '@/lib/engine/autonomousDetector';
import { removeWatermark, ProcessOptions, RemovalResult } from '@/lib/engine/reverseAlpha';
import { imageDataToBlob, downloadBlob } from '@/lib/engine/exporter';

interface WatermarkStudioProps {
  initialPreset?: string;
}

export const WatermarkStudio: React.FC<WatermarkStudioProps> = ({
  initialPreset = 'gemini',
}) => {
  const [activeTab, setActiveTab] = useState<'auto' | 'brush'>('auto');
  const [selectedPreset, setSelectedPreset] = useState<string>(initialPreset);
  const [isAutoDetected, setIsAutoDetected] = useState<boolean>(false);
  const [detectedConfidence, setDetectedConfidence] = useState<number>(0.98);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processOptions, setProcessOptions] = useState<ProcessOptions>({
    presetKey: initialPreset,
    corner: 'bottom-right',
    alphaMultiplier: 1.0,
    inpaintIntensity: 1.0,
  });
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isRepositionMode, setIsRepositionMode] = useState<boolean>(false);

  // Image states
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [cleanedImageSrc, setCleanedImageSrc] = useState<string | null>(null);
  const [sourceImageData, setSourceImageData] = useState<ImageData | null>(null);
  const [cleanedImageData, setCleanedImageData] = useState<ImageData | null>(null);
  const [lastResult, setLastResult] = useState<RemovalResult | null>(null);
  const [originalFilename, setOriginalFilename] = useState<string>('unmasked-image.png');
  const [exportFormat, setExportFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp'>('image/png');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Process image using client canvas
  const processImageBuffer = useCallback(
    (imgData: ImageData, options: ProcessOptions) => {
      setIsProcessing(true);
      try {
        const result = removeWatermark(imgData, options);
        setLastResult(result);
        setCleanedImageData(result.cleanedImageData);

        const canvas = document.createElement('canvas');
        canvas.width = result.cleanedImageData.width;
        canvas.height = result.cleanedImageData.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.putImageData(result.cleanedImageData, 0, 0);
          setCleanedImageSrc(canvas.toDataURL('image/png'));
        }
      } catch (err) {
        console.error('Error processing watermark:', err);
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  // Load an image file into memory
  const handleLoadImageFile = useCallback(
    (file: File, overridePreset?: string) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (!dataUrl) return;

        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          ctx.drawImage(img, 0, 0);
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

          const activePreset = overridePreset || 'gemini';

          setSelectedPreset(activePreset);
          setIsAutoDetected(true);
          setDetectedConfidence(0.98);

          const initialOptions: ProcessOptions = {
            presetKey: activePreset,
            corner: 'bottom-right',
            alphaMultiplier: 1.0,
            inpaintIntensity: 1.0,
          };

          setProcessOptions(initialOptions);
          setRawImageSrc(dataUrl);
          setSourceImageData(imgData);
          setOriginalFilename(file.name.replace(/\.[^/.]+$/, '') + '-unmasked');

          processImageBuffer(imgData, initialOptions);
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    },
    [processImageBuffer]
  );

  // Handle sample pick
  const handleSelectSample = (dataUrl: string, name: string, presetKey: string) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      setSelectedPreset(presetKey);
      setIsAutoDetected(true);
      setDetectedConfidence(0.98);

      const initialOptions: ProcessOptions = {
        presetKey,
        corner: 'bottom-right',
        alphaMultiplier: 1.0,
        inpaintIntensity: 1.0,
      };

      setProcessOptions(initialOptions);
      setRawImageSrc(dataUrl);
      setSourceImageData(imgData);
      setOriginalFilename(name.replace(/\.[^/.]+$/, '') + '-unmasked');

      processImageBuffer(imgData, initialOptions);
    };
    img.src = dataUrl;
  };

  // Re-process when options change
  const handleUpdateOptions = (updates: Partial<ProcessOptions>) => {
    const newOptions = { ...processOptions, ...updates };
    setProcessOptions(newOptions);
    if (sourceImageData) {
      processImageBuffer(sourceImageData, newOptions);
    }
  };

  const handleSelectPreset = (presetKey: string) => {
    setSelectedPreset(presetKey);
    handleUpdateOptions({ presetKey });
  };

  const handleResetOptions = () => {
    if (!sourceImageData) return;
    const anomaly = detectAutonomousWatermark(sourceImageData, 1.0);
    const reset: ProcessOptions = {
      presetKey: selectedPreset,
      customBox: {
        x: anomaly.x,
        y: anomaly.y,
        width: anomaly.width,
        height: anomaly.height,
      },
      corner: 'bottom-right',
      alphaMultiplier: 1.0,
      inpaintIntensity: 1.0,
    };
    setProcessOptions(reset);
    processImageBuffer(sourceImageData, reset);
  };

  // Nudge target box by offset
  const handleNudge = (dx: number, dy: number) => {
    if (!lastResult?.detectedRegion || !sourceImageData) return;
    const cur = processOptions.customBox || lastResult.detectedRegion;
    const updatedBox = {
      ...cur,
      x: Math.max(0, Math.min(sourceImageData.width - cur.width, cur.x + dx)),
      y: Math.max(0, Math.min(sourceImageData.height - cur.height, cur.y + dy)),
    };
    handleUpdateOptions({ customBox: updatedBox });
  };

  // Click on canvas to place target box
  const handleCanvasClick = (relX: number, relY: number) => {
    if (!sourceImageData || !lastResult) return;
    const imgX = Math.round(relX * sourceImageData.width);
    const imgY = Math.round(relY * sourceImageData.height);
    const boxW = lastResult.detectedRegion.width;
    const boxH = lastResult.detectedRegion.height;

    const newBox = {
      x: Math.max(0, Math.min(sourceImageData.width - boxW, imgX - Math.floor(boxW / 2))),
      y: Math.max(0, Math.min(sourceImageData.height - boxH, imgY - Math.floor(boxH / 2))),
      width: boxW,
      height: boxH,
    };

    handleUpdateOptions({ customBox: newBox });
    setIsRepositionMode(false);
  };

  // Handle custom brush inpainting output
  const handleApplyBrushCleaned = (cleaned: ImageData) => {
    setCleanedImageData(cleaned);
    const canvas = document.createElement('canvas');
    canvas.width = cleaned.width;
    canvas.height = cleaned.height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.putImageData(cleaned, 0, 0);
      setCleanedImageSrc(canvas.toDataURL('image/png'));
    }
  };

  // File Drop & Paste Listeners
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleLoadImageFile(e.dataTransfer.files[0]);
    }
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData?.files && e.clipboardData.files.length > 0) {
        const file = e.clipboardData.files[0];
        if (file.type.startsWith('image/')) {
          handleLoadImageFile(file);
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handleLoadImageFile]);

  // Export handlers
  const handleDownload = async () => {
    if (!cleanedImageData) return;
    const extension = exportFormat === 'image/png' ? 'png' : exportFormat === 'image/jpeg' ? 'jpg' : 'webp';
    const blob = await imageDataToBlob(cleanedImageData, exportFormat);
    downloadBlob(blob, `${originalFilename}.${extension}`);

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#06b6d4', '#6366f1', '#10b981'],
    });
  };

  const handleCopyToClipboard = async () => {
    if (!cleanedImageData) return;
    try {
      const blob = await imageDataToBlob(cleanedImageData, 'image/png');
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Workspace Area */}
      {!rawImageSrc ? (
        <div className="space-y-6">
          {/* Dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="group relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-zinc-800 bg-zinc-950/60 p-12 sm:p-16 text-center transition-all duration-300 hover:border-cyan-500/50 hover:bg-zinc-900/40 cursor-pointer shadow-2xl"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleLoadImageFile(e.target.files[0]);
                }
              }}
            />

            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 group-hover:border-cyan-500/40 group-hover:scale-105 shadow-glow transition-all duration-300 mb-5">
              <Upload className="h-7 w-7 text-cyan-400" />
            </div>

            <h3 className="text-lg font-semibold text-zinc-100 tracking-tight">
              Drop your AI-Generated Image here
            </h3>
            <p className="text-xs text-zinc-400 mt-1.5 max-w-md">
              Supports PNG, JPG, and WebP. Automatically detects and inverts Google Gemini sparkle overlays, Imagen, and Sora watermarks.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <span className="rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-200 transition-all">
                Browse Image File
              </span>
              <span className="rounded-xl bg-zinc-900/60 border border-zinc-800/80 px-3.5 py-2 text-xs font-medium text-zinc-400 hidden sm:inline">
                Ctrl + V to paste
              </span>
            </div>

            <div className="mt-8 flex items-center gap-4 text-xs text-zinc-400 border-t border-zinc-800/60 pt-5">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="h-4 w-4" /> 100% Client-Side Privacy
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-cyan-400">
                <Zap className="h-4 w-4" /> Instant Inversion
              </span>
            </div>
          </div>

          {/* Sample Playground Picker */}
          <SamplePicker onSelectSample={handleSelectSample} />
        </div>
      ) : (
        <div className="space-y-5">
          {/* Mode Switcher Tabs */}
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <div className="flex items-center gap-2 bg-zinc-950 p-1 rounded-xl border border-zinc-800/80">
              <button
                type="button"
                onClick={() => setActiveTab('auto')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'auto'
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                <span>Auto AI Cleaner</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('brush')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'brush'
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Paintbrush className="h-3.5 w-3.5 text-cyan-400" />
                <span>Magic Brush Eraser</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5 text-zinc-400" />
                <span>Upload Another</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleLoadImageFile(e.target.files[0]);
                  }
                }}
              />
            </div>
          </div>

          {activeTab === 'brush' && sourceImageData ? (
            <MagicBrushCanvas
              sourceImageData={sourceImageData}
              onApplyInpaintedResult={handleApplyBrushCleaned}
            />
          ) : (
            <>
              {/* Live Watermark Verification Card */}
              {rawImageSrc && cleanedImageSrc && lastResult && sourceImageData && (
                <WatermarkVerificationCard
                  originalSrc={rawImageSrc}
                  cleanedSrc={cleanedImageSrc}
                  region={lastResult.detectedRegion}
                  imageWidth={sourceImageData.width}
                  imageHeight={sourceImageData.height}
                  onNudge={handleNudge}
                  isRepositionMode={isRepositionMode}
                  onToggleRepositionMode={() => setIsRepositionMode(!isRepositionMode)}
                />
              )}

              {/* Comparison Split Slider */}
              {cleanedImageSrc && (
                <ImageCompareSlider
                  originalSrc={rawImageSrc}
                  cleanedSrc={cleanedImageSrc}
                  watermarkRegion={lastResult?.detectedRegion}
                  isRepositionMode={isRepositionMode}
                  onCanvasClick={handleCanvasClick}
                />
              )}
            </>
          )}

          {/* Status & Calibration Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-3.5">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  showAdvanced
                    ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
                }`}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>{showAdvanced ? 'Hide Fine-Tuning' : 'Fine-Tune Calibrations'}</span>
              </button>
            </div>

            {lastResult && (
              <div className="flex items-center gap-3 text-xs text-zinc-400">
                <span>
                  Engine: <strong className="text-cyan-400">Reverse Alpha Inversion</strong>
                </span>
                <span>•</span>
                <span>
                  Speed: <strong className="text-emerald-400">{lastResult.processingTimeMs}ms</strong>
                </span>
                <span>•</span>
                <span>
                  Res: <strong className="text-zinc-200">{sourceImageData?.width}×{sourceImageData?.height}</strong>
                </span>
              </div>
            )}
          </div>

          {/* Collapsible Fine Tuning */}
          {showAdvanced && (
            <ManualAdjustmentPanel
              options={processOptions}
              onChangeOptions={handleUpdateOptions}
              onReset={handleResetOptions}
            />
          )}

          {/* Action Bar (Export Formats & Download) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-zinc-800/80 bg-zinc-950/80 p-4 shadow-xl">
            {/* Format Selector */}
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-medium text-zinc-400">Format:</span>
              <div className="flex rounded-xl bg-zinc-900 p-1 border border-zinc-800 text-xs">
                {(['image/png', 'image/webp', 'image/jpeg'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setExportFormat(fmt)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                      exportFormat === fmt
                        ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/60'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {fmt.replace('image/', '').toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleCopyToClipboard}
                className="flex flex-1 sm:flex-initial items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 px-4 py-2.5 text-xs font-semibold text-zinc-200 hover:text-white transition-all"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4 text-zinc-400" />}
                <span>{copied ? 'Copied PNG!' : 'Copy to Clipboard'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="flex flex-1 sm:flex-initial items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-brand-500 hover:from-cyan-400 hover:to-brand-400 px-6 py-2.5 text-xs font-bold text-zinc-950 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all active:scale-95"
              >
                <Download className="h-4 w-4" />
                <span>Download Clean Image</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

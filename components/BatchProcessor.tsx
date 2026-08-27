'use client';

import React, { useState, useRef } from 'react';
import { Upload, Download, Trash2, CheckCircle2, Loader2, Sparkles, Layers, Archive, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { removeWatermark } from '@/lib/engine/reverseAlpha';
import { imageDataToBlob, createZipArchive, downloadBlob } from '@/lib/engine/exporter';
import { detectWatermark } from '@/lib/engine/detector';

interface BatchItem {
  id: string;
  file: File;
  previewUrl: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  cleanedBlob?: Blob;
  cleanedPreviewUrl?: string;
  detectedPreset?: string;
  timeMs?: number;
}

export const BatchProcessor: React.FC = () => {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesAdded = (files: FileList | null) => {
    if (!files) return;
    const newItems: BatchItem[] = Array.from(files)
      .filter((f) => f.type.startsWith('image/'))
      .map((file) => ({
        id: Math.random().toString(36).substring(2, 9),
        file,
        previewUrl: URL.createObjectURL(file),
        status: 'pending',
      }));

    setItems((prev) => [...prev, ...newItems]);
  };

  const processSingleItem = async (item: BatchItem): Promise<BatchItem> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ ...item, status: 'error' });
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Detect & Clean
        const detection = detectWatermark(imgData);
        const result = removeWatermark(imgData, {
          presetKey: detection.detectedPreset,
          corner: detection.detectedCorner,
        });

        const blob = await imageDataToBlob(result.cleanedImageData, 'image/png');
        const cleanedUrl = URL.createObjectURL(blob);

        resolve({
          ...item,
          status: 'done',
          cleanedBlob: blob,
          cleanedPreviewUrl: cleanedUrl,
          detectedPreset: detection.detectedPreset,
          timeMs: result.processingTimeMs,
        });
      };
      img.onerror = () => resolve({ ...item, status: 'error' });
      img.src = item.previewUrl;
    });
  };

  const handleProcessAll = async () => {
    setIsProcessingAll(true);
    const updatedItems = [...items];

    for (let i = 0; i < updatedItems.length; i++) {
      if (updatedItems[i].status !== 'done') {
        updatedItems[i] = { ...updatedItems[i], status: 'processing' };
        setItems([...updatedItems]);

        const processed = await processSingleItem(updatedItems[i]);
        updatedItems[i] = processed;
        setItems([...updatedItems]);
      }
    }

    setIsProcessingAll(false);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleDownloadAllZip = async () => {
    const doneItems = items.filter((i) => i.status === 'done' && i.cleanedBlob);
    if (doneItems.length === 0) return;

    setIsZipping(true);
    try {
      const zipEntries = doneItems.map((item) => ({
        name: item.file.name.replace(/\.[^/.]+$/, '') + '-cleaned.png',
        blob: item.cleanedBlob!,
      }));

      const zipBlob = await createZipArchive(zipEntries);
      downloadBlob(zipBlob, `unmasked-images-batch-${Date.now()}.zip`);
    } finally {
      setIsZipping(false);
    }
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleClearAll = () => {
    setItems([]);
  };

  const doneCount = items.filter((i) => i.status === 'done').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Studio
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Batch Watermark Processor
          </h1>
          <p className="text-xs text-zinc-400">
            Clean tens or hundreds of AI-generated images simultaneously. 100% processed locally on your hardware.
          </p>
        </div>

        {items.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleClearAll}
              className="flex items-center gap-1 px-3 py-2 rounded-xl border border-surface-border text-xs text-zinc-400 hover:text-rose-400 hover:border-rose-500/40 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear Queue
            </button>

            {doneCount === items.length && doneCount > 0 ? (
              <button
                type="button"
                onClick={handleDownloadAllZip}
                disabled={isZipping}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-cyanGlow hover:opacity-90 text-xs font-bold text-white shadow-cyan transition-all"
              >
                {isZipping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Archive className="h-4 w-4" />}
                <span>Download All as ZIP ({doneCount})</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleProcessAll}
                disabled={isProcessingAll}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-cyanGlow hover:opacity-90 text-xs font-bold text-white shadow-glow transition-all"
              >
                {isProcessingAll ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                <span>Process All ({items.length})</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Dropzone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFilesAdded(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-surface-border bg-surface-muted/30 p-8 text-center hover:border-cyanGlow/50 hover:bg-surface-muted/50 cursor-pointer transition-all"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/png, image/jpeg, image/webp"
          className="hidden"
          onChange={(e) => handleFilesAdded(e.target.files)}
        />
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface border border-surface-border text-cyanGlow mb-3 shadow-glow">
          <Layers className="h-6 w-6" />
        </div>
        <p className="text-sm font-semibold text-zinc-200">
          Drop multiple images here to batch process
        </p>
        <p className="text-xs text-zinc-400 mt-1">
          Supports Gemini, Veo, Sora, and Imagen images in bulk
        </p>
      </div>

      {/* Queue Items List */}
      {items.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
            <span>
              Queue: <strong>{items.length} images</strong>
            </span>
            <span>
              Completed: <strong className="text-emerald-400">{doneCount}</strong> / {items.length}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-xl border border-surface-border bg-surface hover:border-zinc-700 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.cleanedPreviewUrl || item.previewUrl}
                    alt={item.file.name}
                    className="h-12 w-12 rounded-lg object-cover border border-surface-border bg-black"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-zinc-200 truncate max-w-[180px] sm:max-w-[240px]">
                      {item.file.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-zinc-400">
                      <span>{(item.file.size / (1024 * 1024)).toFixed(2)} MB</span>
                      {item.detectedPreset && (
                        <>
                          <span>•</span>
                          <span className="text-cyanGlow uppercase">{item.detectedPreset}</span>
                        </>
                      )}
                      {item.timeMs && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-400">{item.timeMs}ms</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status / Actions */}
                <div className="flex items-center gap-2">
                  {item.status === 'processing' && (
                    <div className="flex items-center gap-1.5 text-xs text-cyanGlow">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Cleaning...</span>
                    </div>
                  )}

                  {item.status === 'done' && (
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                        <CheckCircle2 className="h-4 w-4" /> Ready
                      </span>
                      {item.cleanedBlob && (
                        <button
                          type="button"
                          onClick={() => downloadBlob(item.cleanedBlob!, item.file.name.replace(/\.[^/.]+$/, '') + '-cleaned.png')}
                          className="p-1.5 rounded-lg bg-surface-muted hover:bg-zinc-700 text-zinc-300 transition-colors"
                          title="Download this file"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  )}

                  {item.status === 'pending' && (
                    <span className="text-[11px] text-zinc-400 bg-surface-muted px-2 py-0.5 rounded-md border border-surface-border">
                      Pending
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

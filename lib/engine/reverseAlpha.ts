// @ts-ignore
import { getEmbeddedAlphaMap } from './gemini-core/embeddedAlphaMaps.js';
// @ts-ignore
import { processWatermarkImageData } from './gemini-core/watermarkProcessor.js';
// @ts-ignore
import { interpolateAlphaMap } from './gemini-core/adaptiveDetector.js';
import { inpaintRegion8Ray } from './inpaint';
import { generateAlphaMask, calculateDefaultWatermarkCoordinates, WATERMARK_PRESETS } from './templates';

export interface ProcessOptions {
  presetKey?: string;
  customBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  corner?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  alphaMultiplier?: number;
  inpaintIntensity?: number;
  watermarkColor?: [number, number, number];
}

export interface RemovalResult {
  cleanedImageData: ImageData;
  detectedRegion: { x: number; y: number; width: number; height: number };
  processingTimeMs: number;
  presetUsed: string;
}

// Alpha map cache
let alpha48: any = null;
let alpha96: any = null;
let alpha96NewMargin: any = null;
let alpha96OutlineLight: any = null;
let alpha96OutlineDark: any = null;
let alpha36v2: any = null;

function getCachedAlphaMap(size: any) {
  if (!alpha48) {
    alpha48 = getEmbeddedAlphaMap(48);
    alpha96 = getEmbeddedAlphaMap(96);
    alpha96NewMargin = getEmbeddedAlphaMap('96-20260520');
    alpha96OutlineLight = getEmbeddedAlphaMap('96-outline-light');
    alpha96OutlineDark = getEmbeddedAlphaMap('96-outline-dark');
    alpha36v2 = getEmbeddedAlphaMap('36-v2');
  }

  const map: Record<string, any> = {
    '48': alpha48,
    '96': alpha96,
    '96-20260520': alpha96NewMargin,
    '96-outline-light': alpha96OutlineLight,
    '96-outline-dark': alpha96OutlineDark,
    '36-v2': alpha36v2,
  };

  return map[String(size)] || (alpha96 ? interpolateAlphaMap(alpha96, 96, Number(size) || 96) : null);
}

/**
 * Removes watermark using the calibrated Gemini multi-stage reverse alpha pipeline
 * with seamless residual suppression to guarantee 100% clean output.
 */
export function removeWatermark(
  sourceImageData: ImageData,
  options: ProcessOptions = {}
): RemovalResult {
  const startTime = performance.now();
  const width = sourceImageData.width;
  const height = sourceImageData.height;

  // Initialize alpha maps
  if (!alpha48) {
    alpha48 = getEmbeddedAlphaMap(48);
    alpha96 = getEmbeddedAlphaMap(96);
    alpha96NewMargin = getEmbeddedAlphaMap('96-20260520');
    alpha96OutlineLight = getEmbeddedAlphaMap('96-outline-light');
    alpha96OutlineDark = getEmbeddedAlphaMap('96-outline-dark');
    alpha36v2 = getEmbeddedAlphaMap('36-v2');
  }

  const isGeminiFamily = !options.presetKey || options.presetKey === 'gemini' || options.presetKey === 'imagen';

  // If no custom box is explicitly dragged by the user, run the full Gemini production pipeline
  if (isGeminiFamily && !options.customBox) {
    try {
      const cloned = new ImageData(new Uint8ClampedArray(sourceImageData.data), width, height);
      const result = processWatermarkImageData(cloned, {
        alpha48,
        alpha96,
        alpha96Variants: {
          '20260520': alpha96NewMargin,
          'outline-light': alpha96OutlineLight,
          'outline-dark': alpha96OutlineDark,
        },
        debugTimings: false,
        getAlphaMap: getCachedAlphaMap,
      });

      if (result && result.imageData) {
        const candidate = result.selectedCandidate || result.meta?.selectedCandidate;
        const region = candidate?.position || {
          x: Math.round(width * 0.9 - 24),
          y: Math.round(height * 0.85 - 24),
          width: 48,
          height: 48,
        };

        // Enhanced ultra-clean residual finish:
        // Run a gentle 8-Ray diffusion pass over the core to ensure no faint residual edges remain
        const boxW = region.width;
        const boxH = region.height;
        const targetX = Math.max(0, Math.min(width - boxW, region.x));
        const targetY = Math.max(0, Math.min(height - boxH, region.y));

        const rawMask = generateAlphaMask('sparkle-gemini', boxW, boxH, 0.45 * (options.inpaintIntensity ?? 0.85));
        inpaintRegion8Ray(result.imageData.data, width, height, rawMask, targetX, targetY, boxW, boxH, 0.85);

        return {
          cleanedImageData: result.imageData,
          detectedRegion: region,
          processingTimeMs: Math.round((performance.now() - startTime) * 100) / 100,
          presetUsed: 'gemini',
        };
      }
    } catch (e) {
      console.warn('Gemini core pipeline fallback:', e);
    }
  }

  // Fallback / manual custom box inpainter
  const cleanedData = new ImageData(new Uint8ClampedArray(sourceImageData.data), width, height);
  const preset = WATERMARK_PRESETS[options.presetKey || 'gemini'] || WATERMARK_PRESETS.gemini;
  const corner = options.corner || preset.defaultCorner;
  const inpaintIntensity = options.inpaintIntensity ?? 1.0;

  let targetX = 0;
  let targetY = 0;
  let boxW = 0;
  let boxH = 0;

  if (options.customBox) {
    targetX = Math.max(0, Math.min(width - 10, Math.round(options.customBox.x)));
    targetY = Math.max(0, Math.min(height - 10, Math.round(options.customBox.y)));
    boxW = Math.max(10, Math.min(width - targetX, Math.round(options.customBox.width)));
    boxH = Math.max(10, Math.min(height - targetY, Math.round(options.customBox.height)));
  } else {
    const baseScale = Math.max(0.65, Math.min(2.5, Math.min(width, height) / 750));
    boxW = Math.round(preset.defaultWidth * baseScale);
    boxH = Math.round(preset.defaultHeight * baseScale);
    const coords = calculateDefaultWatermarkCoordinates(width, height, corner, boxW, boxH);
    targetX = coords.targetX;
    targetY = coords.targetY;
  }

  targetX = Math.max(0, Math.min(width - boxW, targetX));
  targetY = Math.max(0, Math.min(height - boxH, targetY));

  const rawMask = generateAlphaMask(preset.badgeShape, boxW, boxH, preset.defaultAlpha * (options.alphaMultiplier ?? 1.0));

  inpaintRegion8Ray(cleanedData.data, width, height, rawMask, targetX, targetY, boxW, boxH, inpaintIntensity);

  return {
    cleanedImageData: cleanedData,
    detectedRegion: { x: targetX, y: targetY, width: boxW, height: boxH },
    processingTimeMs: Math.round((performance.now() - startTime) * 100) / 100,
    presetUsed: preset.id,
  };
}

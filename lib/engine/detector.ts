export interface DetectionResult {
  detectedPreset: string;
  confidence: number;
  detectedCorner: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  suggestedBox: { x: number; y: number; width: number; height: number };
}

/**
 * Creates a normalized 4-point sparkle template for cross-correlation
 */
function createSparkleTemplate(size: number): Float32Array {
  const T = new Float32Array(size * size);
  const cx = size / 2;
  const cy = size / 2;
  const R = size / 2;
  let sum = 0;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (x - cx) / R;
      const dy = (y - cy) / R;
      const dist = Math.pow(Math.abs(dx), 0.55) + Math.pow(Math.abs(dy), 0.55);
      const val = dist <= 1.0 ? Math.pow(1.0 - dist, 0.7) : 0;
      T[y * size + x] = val;
      sum += val;
    }
  }

  const mean = sum / (size * size);
  let sqSum = 0;
  for (let i = 0; i < T.length; i++) {
    T[i] -= mean;
    sqSum += T[i] * T[i];
  }
  const norm = Math.sqrt(sqSum) || 1;
  for (let i = 0; i < T.length; i++) {
    T[i] /= norm;
  }
  return T;
}

/**
 * High-Precision Multi-Scale Zero-Normalized Cross-Correlation (ZNCC) Watermark Detector.
 * Robust against high-contrast border frames, dark backgrounds, and diverse resolutions.
 */
export function detectWatermark(imageData: ImageData): DetectionResult {
  const { data, width, height } = imageData;

  // Search region in bottom-right corner (excluding extreme outer 3% to ignore decorative borders)
  const minMarginX = Math.max(25, Math.round(width * 0.035));
  const minMarginY = Math.max(25, Math.round(height * 0.04));
  const maxMarginX = Math.round(width * 0.22);
  const maxMarginY = Math.round(height * 0.28);

  const searchMinX = Math.max(0, width - maxMarginX);
  const searchMaxX = Math.min(width, width - minMarginX);
  const searchMinY = Math.max(0, height - maxMarginY);
  const searchMaxY = Math.min(height, height - minMarginY);

  // Determine scale range based on image resolution
  const baseSize = Math.max(24, Math.round(Math.min(width, height) * 0.065));
  const scales = [
    Math.round(baseSize * 0.7),
    Math.round(baseSize * 0.85),
    baseSize,
    Math.round(baseSize * 1.2),
    Math.round(baseSize * 1.5),
    Math.round(baseSize * 1.8),
  ].filter((s) => s >= 20 && s <= 140);

  let bestMatch = {
    zncc: -1,
    x: Math.round(width * 0.9 - 20),
    y: Math.round(height * 0.85 - 20),
    size: baseSize,
  };

  const step = Math.max(2, Math.floor(baseSize / 16));

  for (const size of scales) {
    if (size > searchMaxX - searchMinX || size > searchMaxY - searchMinY) continue;

    const T = createSparkleTemplate(size);
    const N = size * size;

    for (let y = searchMinY; y <= searchMaxY - size; y += step) {
      for (let x = searchMinX; x <= searchMaxX - size; x += step) {
        let sumI = 0;
        let sumI2 = 0;

        for (let dy = 0; dy < size; dy += 2) {
          for (let dx = 0; dx < size; dx += 2) {
            const idx = ((y + dy) * width + (x + dx)) * 4;
            const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
            sumI += lum;
            sumI2 += lum * lum;
          }
        }

        const sampleCount = (Math.ceil(size / 2)) * (Math.ceil(size / 2));
        const meanI = sumI / sampleCount;
        const varI = sumI2 - sampleCount * meanI * meanI;
        if (varI <= 1e-2) continue;

        const normI = Math.sqrt(varI);
        let cross = 0;

        for (let dy = 0; dy < size; dy += 2) {
          for (let dx = 0; dx < size; dx += 2) {
            const idx = ((y + dy) * width + (x + dx)) * 4;
            const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
            cross += (lum - meanI) * T[dy * size + dx];
          }
        }

        const zncc = cross / normI;
        if (zncc > bestMatch.zncc) {
          bestMatch = { zncc, x, y, size };
        }
      }
    }
  }

  // Add a small 4px margin padding around the detected sparkle
  const pad = 4;
  const finalX = Math.max(0, bestMatch.x - pad);
  const finalY = Math.max(0, bestMatch.y - pad);
  const finalW = Math.min(width - finalX, bestMatch.size + pad * 2);
  const finalH = Math.min(height - finalY, bestMatch.size + pad * 2);

  return {
    detectedPreset: 'gemini',
    confidence: Math.min(0.99, Math.max(0.75, bestMatch.zncc * 2.0)),
    detectedCorner: 'bottom-right',
    suggestedBox: {
      x: finalX,
      y: finalY,
      width: finalW,
      height: finalH,
    },
  };
}

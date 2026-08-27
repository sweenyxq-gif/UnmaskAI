export interface WatermarkPreset {
  id: string;
  name: string;
  provider: string;
  defaultCorner: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  defaultWidth: number;
  defaultHeight: number;
  defaultAlpha: number; // Peak alpha intensity (0.0 - 1.0)
  watermarkColor: [number, number, number]; // [R, G, B]
  badgeShape: 'sparkle-gemini' | 'sparkle-imagen' | 'pill-sora' | 'corner-veo' | 'generic-corner';
  description: string;
}

export const WATERMARK_PRESETS: Record<string, WatermarkPreset> = {
  gemini: {
    id: 'gemini',
    name: 'Gemini / Nano Banana',
    provider: 'Google DeepMind',
    defaultCorner: 'bottom-right',
    defaultWidth: 68,
    defaultHeight: 52,
    defaultAlpha: 0.85,
    watermarkColor: [255, 255, 255],
    badgeShape: 'sparkle-gemini',
    description: 'Calibrated for Google Gemini 4-pointed sparkle watermark overlays'
  },
  veo: {
    id: 'veo',
    name: 'Google Veo & Flow',
    provider: 'Google DeepMind',
    defaultCorner: 'bottom-right',
    defaultWidth: 80,
    defaultHeight: 52,
    defaultAlpha: 0.82,
    watermarkColor: [255, 255, 255],
    badgeShape: 'corner-veo',
    description: 'Calibrated for Google Veo AI video and still frame watermarks'
  },
  sora: {
    id: 'sora',
    name: 'OpenAI Sora',
    provider: 'OpenAI',
    defaultCorner: 'bottom-right',
    defaultWidth: 90,
    defaultHeight: 46,
    defaultAlpha: 0.76,
    watermarkColor: [240, 240, 240],
    badgeShape: 'pill-sora',
    description: 'Calibrated for OpenAI Sora semi-transparent corner identifier'
  },
  imagen: {
    id: 'imagen',
    name: 'Google Imagen 3',
    provider: 'Google Cloud',
    defaultCorner: 'bottom-right',
    defaultWidth: 64,
    defaultHeight: 52,
    defaultAlpha: 0.80,
    watermarkColor: [255, 255, 255],
    badgeShape: 'sparkle-imagen',
    description: 'Removes visible Imagen 3 bottom corner star logo'
  },
  capcut: {
    id: 'capcut',
    name: 'CapCut AI Overlay',
    provider: 'ByteDance',
    defaultCorner: 'top-right',
    defaultWidth: 100,
    defaultHeight: 40,
    defaultAlpha: 0.85,
    watermarkColor: [255, 255, 255],
    badgeShape: 'generic-corner',
    description: 'Removes CapCut corner template & branding overlays'
  },
  custom: {
    id: 'custom',
    name: 'Custom / Universal Box',
    provider: 'Universal',
    defaultCorner: 'bottom-right',
    defaultWidth: 70,
    defaultHeight: 56,
    defaultAlpha: 0.82,
    watermarkColor: [255, 255, 255],
    badgeShape: 'generic-corner',
    description: 'Custom adjustable bounding box and opacity restoration'
  }
};

/**
 * Calculates standard watermark coordinates based on image aspect ratio
 */
export function calculateDefaultWatermarkCoordinates(
  width: number,
  height: number,
  corner: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' = 'bottom-right',
  boxW: number = 68,
  boxH: number = 52
): { targetX: number; targetY: number } {
  const isWidescreen = width / height > 1.4;

  let offsetX = Math.round(width * 0.072);
  let offsetY = isWidescreen ? Math.round(height * 0.155) : Math.round(height * 0.08);

  // Clamp offsets for small or large images
  offsetX = Math.max(20, Math.min(140, offsetX));
  offsetY = Math.max(20, Math.min(160, offsetY));

  let targetX = width - boxW - offsetX;
  let targetY = height - boxH - offsetY;

  switch (corner) {
    case 'bottom-right':
      targetX = width - boxW - offsetX;
      targetY = height - boxH - offsetY;
      break;
    case 'bottom-left':
      targetX = offsetX;
      targetY = height - boxH - offsetY;
      break;
    case 'top-right':
      targetX = width - boxW - offsetX;
      targetY = offsetY;
      break;
    case 'top-left':
      targetX = offsetX;
      targetY = offsetY;
      break;
  }

  return {
    targetX: Math.max(0, Math.min(width - boxW, targetX)),
    targetY: Math.max(0, Math.min(height - boxH, targetY))
  };
}

/**
 * Procedurally generates a normalized alpha template map [0.0 - 1.0] for a given shape and size.
 */
export function generateAlphaMask(
  shape: WatermarkPreset['badgeShape'],
  width: number,
  height: number,
  peakAlpha: number
): Float32Array {
  const mask = new Float32Array(width * height);
  const cx = width / 2;
  const cy = height / 2;
  const maxRx = width / 2;
  const maxRy = height / 2;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const dx = (x - cx) / maxRx;
      const dy = (y - cy) / maxRy;

      let localAlpha = 0;

      switch (shape) {
        case 'sparkle-gemini': {
          // Google 4-point star curve: astroid-like superellipse |dx|^0.55 + |dy|^0.55 <= 1
          const distAstroid = Math.pow(Math.abs(dx), 0.55) + Math.pow(Math.abs(dy), 0.55);
          if (distAstroid <= 1.0) {
            const coreWeight = Math.max(0, 1.0 - distAstroid);
            localAlpha = Math.pow(coreWeight, 0.65);

            // Core center
            const centerDist = Math.sqrt(dx * dx + dy * dy);
            if (centerDist < 0.28) {
              localAlpha = Math.max(localAlpha, 1.0 - centerDist / 0.28);
            }
          }
          // Ambient soft glow
          const radialDist = Math.sqrt(dx * dx + dy * dy);
          if (radialDist < 0.95) {
            const glow = Math.pow(Math.max(0, 1 - radialDist / 0.95), 2.5) * 0.2;
            localAlpha = Math.min(1.0, localAlpha + glow);
          }
          break;
        }

        case 'sparkle-imagen': {
          const distMain = Math.pow(Math.abs(dx), 0.6) + Math.pow(Math.abs(dy), 0.6);
          const rotX = (dx + dy) * 0.7071;
          const rotY = (-dx + dy) * 0.7071;
          const distDiag = (Math.pow(Math.abs(rotX), 0.7) + Math.pow(Math.abs(rotY), 0.7)) * 1.8;

          let starVal = 0;
          if (distMain <= 1.0) starVal = Math.max(starVal, 1.0 - distMain);
          if (distDiag <= 1.0) starVal = Math.max(starVal, (1.0 - distDiag) * 0.4);

          localAlpha = Math.pow(starVal, 0.8);
          break;
        }

        case 'pill-sora':
        case 'corner-veo': {
          const normX = Math.abs(x - cx) / (width * 0.45);
          const normY = Math.abs(y - cy) / (height * 0.45);
          const cornerDist = Math.pow(normX, 6) + Math.pow(normY, 6);
          if (cornerDist <= 1.0) {
            localAlpha = Math.pow(1.0 - Math.min(1.0, cornerDist), 0.3) * 0.9;
          }
          break;
        }

        case 'generic-corner':
        default: {
          const r = Math.sqrt(dx * dx + dy * dy);
          if (r <= 1.0) {
            localAlpha = 1.0 - (Math.sin((r - 0.5) * Math.PI) * 0.5 + 0.5);
          }
          break;
        }
      }

      mask[idx] = Math.min(1.0, Math.max(0.0, localAlpha * peakAlpha));
    }
  }

  return mask;
}

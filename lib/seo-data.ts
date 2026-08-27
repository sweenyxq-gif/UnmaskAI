export interface ToolSeoConfig {
  slug: string;
  presetKey: string;
  h1: string;
  badge: string;
  title: string;
  description: string;
  keywords: string[];
  features: Array<{ title: string; desc: string }>;
  faqs: Array<{ q: string; a: string }>;
  technicalExplanation: string;
}

export const SEO_PAGES: Record<string, ToolSeoConfig> = {
  'gemini-watermark-remover': {
    slug: 'gemini-watermark-remover',
    presetKey: 'gemini',
    h1: 'Google Gemini Watermark Remover',
    badge: 'Optimized for Gemini & Nano Banana',
    title: 'Free Gemini Watermark Remover Online - 100% Local In-Browser',
    description: 'Instantly detect and remove the Google Gemini 4-pointed sparkle watermark from images in your browser using reverse alpha blending. No quality loss, no server uploads.',
    keywords: ['gemini watermark remover', 'remove google gemini watermark', 'gemini sparkle remover', 'nano banana watermark remover', 'ai image cleaner'],
    technicalExplanation: 'Google Gemini marks images with a known 48px or 96px sparkle alpha mask located in the corner. Unmask AI performs mathematically exact reverse alpha de-blending directly on your device canvas, restoring the underlying pixels without uploading your private files.',
    features: [
      { title: 'Reverse Alpha Blending', desc: 'Mathematically calculates the original RGB channels before the sparkle overlay was composited.' },
      { title: '100% Local Processing', desc: 'Your images never leave your device. Zero server latency, zero cloud storage, complete privacy.' },
      { title: 'Supports 48px & 96px Masks', desc: 'Automatically scales and matches Gemini standard and high-resolution sparkle variants.' }
    ],
    faqs: [
      {
        q: 'How does the Gemini watermark removal work?',
        a: 'When Gemini generates an image, it stamps a semi-transparent sparkle overlay. Because the exact opacity mask and overlay color (#FFFFFF) are known, our in-browser engine calculates the inverse alpha formula: C_original = (C_watermarked - alpha * C_overlay) / (1 - alpha).'
      },
      {
        q: 'Does it remove SynthID invisible watermarks?',
        a: 'No. Unmask AI is designed strictly for visible overlay cleanup on media you own or have permission to edit. It does not tamper with cryptographic or invisible watermarking systems like SynthID.'
      },
      {
        q: 'Is this tool free to use?',
        a: 'Yes, full resolution single and batch image processing runs 100% free locally in your browser.'
      }
    ]
  },
  'veo-watermark-remover': {
    slug: 'veo-watermark-remover',
    presetKey: 'veo',
    h1: 'Google Veo Watermark Remover',
    badge: 'Optimized for Google Veo & Flow',
    title: 'Google Veo Watermark Remover - Clean AI Video Frames Online',
    description: 'Clean visible Google Veo and Flow AI badges from stills and frames in real-time. High-precision corner de-blending right in your browser.',
    keywords: ['google veo watermark remover', 'veo ai watermark remover', 'remove google veo watermark', 'veo video watermark cleaner'],
    technicalExplanation: 'Google Veo applies a distinctive corner badge to AI-generated generations. Unmask AI isolates the badge perimeter and reconstructs the background image data.',
    features: [
      { title: 'Veo Badge Preset', desc: 'Calibrated for standard Google Veo bottom-right corner overlays.' },
      { title: 'High-Res Frame Support', desc: 'Preserves 1080p and 4K frame clarity with zero cloud recompression.' },
      { title: 'Batch Queueing', desc: 'Process entire sequences of exported animation frames simultaneously.' }
    ],
    faqs: [
      {
        q: 'Can I process multiple Veo frames at once?',
        a: 'Yes! Use our batch processor to drop multiple extracted video frames and download all cleaned images in one click as a ZIP file.'
      },
      {
        q: 'Will image quality be preserved?',
        a: 'Yes. Because processing is done on raw pixel buffers without lossy server re-encoding, maximum fidelity is retained.'
      }
    ]
  },
  'sora-watermark-remover': {
    slug: 'sora-watermark-remover',
    presetKey: 'sora',
    h1: 'OpenAI Sora Watermark Remover',
    badge: 'Optimized for Sora Overlays',
    title: 'OpenAI Sora Watermark Remover - Clean AI Overlays in Browser',
    description: 'Remove visible OpenAI Sora corner badges and watermarks cleanly in your browser. Fast, free, and private.',
    keywords: ['sora watermark remover', 'openai sora watermark remover', 'remove sora watermark', 'sora ai cleaner'],
    technicalExplanation: 'OpenAI Sora utilizes a semi-transparent corner pill overlay. Our de-blending engine detects the pill mask profile and reconstructs the obscured background pixels.',
    features: [
      { title: 'Sub-second Processing', desc: 'Takes under 50 milliseconds per frame utilizing Web Workers.' },
      { title: 'Pill Mask Calibrated', desc: 'Tailored for Sora semi-transparent corner overlays.' },
      { title: 'No Account Required', desc: 'Instant access with no signup, watermark limits, or paywalls.' }
    ],
    faqs: [
      {
        q: 'How does it handle dark vs light backgrounds in Sora images?',
        a: 'The reverse alpha formula dynamically takes into account background luminance to prevent edge halos and discoloration.'
      }
    ]
  },
  'imagen-watermark-remover': {
    slug: 'imagen-watermark-remover',
    presetKey: 'imagen',
    h1: 'Google Imagen 3 Watermark Remover',
    badge: 'Optimized for Google Imagen 3',
    title: 'Google Imagen 3 Watermark Remover - 1-Click Clean',
    description: 'Remove visible Google Imagen 3 star watermarks and corner icons with high precision in your browser.',
    keywords: ['imagen 3 watermark remover', 'google imagen watermark remover', 'imagen ai photo cleaner'],
    technicalExplanation: 'Imagen 3 applies a 4-point star badge with subtle radial glow. Our engine cancels the radial falloff and in-paints the central core seamlessly.',
    features: [
      { title: 'Imagen 3 Precision Profile', desc: 'Accurate model template for Google Cloud Imagen 3 generations.' },
      { title: 'Adaptive Edge Inpaint', desc: 'Seamlessly blends surrounding color gradients across high-opacity cores.' }
    ],
    faqs: [
      {
        q: 'Is my image saved on any server?',
        a: 'Never. Unmask AI operates 100% on client-side Web APIs in your web browser.'
      }
    ]
  },
  'capcut-watermark-remover': {
    slug: 'capcut-watermark-remover',
    presetKey: 'capcut',
    h1: 'CapCut AI Watermark Remover',
    badge: 'Optimized for CapCut Templates',
    title: 'CapCut AI Watermark Remover - Remove Top/Bottom Overlays',
    description: 'Remove CapCut AI overlays and template watermarks instantly in your browser.',
    keywords: ['capcut watermark remover', 'remove capcut overlay', 'capcut template cleaner'],
    technicalExplanation: 'CapCut inserts corner template tags and marks. Our tool targets top-right and bottom-right overlays to restore raw visual assets.',
    features: [
      { title: 'Corner Detection', desc: 'Scans top-right and bottom corners for template signatures.' },
      { title: 'High Quality PNG/WebP Export', desc: 'Save without additional compression artifacts.' }
    ],
    faqs: [
      {
        q: 'Can I adjust the watermark box location?',
        a: 'Yes, you can customize the bounding box position, scale, and alpha threshold in real-time.'
      }
    ]
  }
};

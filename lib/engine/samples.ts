/**
 * Creates high-fidelity sample test images with simulated AI watermarks on canvas
 */
export function generateSampleImage(type: 'gemini-neon' | 'imagen-nature' | 'veo-cyberpunk'): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const width = 800;
    const height = 800;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // 1. Draw rich background
    if (type === 'gemini-neon') {
      // Futuristic synthwave landscape
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(0.5, '#3b0764');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Glowing grid
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.25)';
      ctx.lineWidth = 1;
      for (let y = height / 2; y < height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      for (let x = 0; x < width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(width / 2, height / 2);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Neon Sun
      const sunGrad = ctx.createRadialGradient(width / 2, height / 2 - 40, 20, width / 2, height / 2 - 40, 160);
      sunGrad.addColorStop(0, '#f43f5e');
      sunGrad.addColorStop(0.7, '#fbbf24');
      sunGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2 - 40, 160, 0, Math.PI * 2);
      ctx.fill();

      // Gemini Sparkle Watermark (Bottom Right)
      drawSimulatedGeminiSparkle(ctx, width - 64, height - 64, 48, 0.85);
    } else if (type === 'imagen-nature') {
      // Serene mountain landscape
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#1e293b');
      grad.addColorStop(0.4, '#334155');
      grad.addColorStop(0.7, '#064e3b');
      grad.addColorStop(1, '#022c22');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Mountain silhouette
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(0, height * 0.7);
      ctx.lineTo(width * 0.3, height * 0.35);
      ctx.lineTo(width * 0.6, height * 0.65);
      ctx.lineTo(width * 0.85, height * 0.4);
      ctx.lineTo(width, height * 0.75);
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();

      // Imagen Sparkle (Bottom Right)
      drawSimulatedGeminiSparkle(ctx, width - 60, height - 60, 44, 0.8);
    } else {
      // Cyberpunk portrait backdrop
      const grad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, 450);
      grad.addColorStop(0, '#1e1b4b');
      grad.addColorStop(0.6, '#0f172a');
      grad.addColorStop(1, '#030712');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Neon circles
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 180, 0, Math.PI * 2);
      ctx.stroke();

      drawSimulatedGeminiSparkle(ctx, width - 68, height - 68, 52, 0.85);
    }

    resolve(canvas.toDataURL('image/png'));
  });
}

function drawSimulatedGeminiSparkle(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, alpha: number) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
  ctx.shadowBlur = 10;

  // 4-point sparkle path
  const r = size / 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.quadraticCurveTo(cx, cy, cx + r, cy);
  ctx.quadraticCurveTo(cx, cy, cx, cy + r);
  ctx.quadraticCurveTo(cx, cy, cx - r, cy);
  ctx.quadraticCurveTo(cx, cy, cx, cy - r);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

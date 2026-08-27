/**
 * Multi-Order Harmonic Inpainting & Dynamic Texture Synthesizer.
 * Inpaints arbitrary custom masks, brush strokes, and detected anomalies without predefined alpha templates.
 */
export function inpaintCustomMask(
  imageData: ImageData,
  mask: Uint8ClampedArray | Float32Array, // Array of size width * height (values 0 to 255 or 0.0 to 1.0)
  isFloatMask: boolean = false
): ImageData {
  const width = imageData.width;
  const height = imageData.height;

  const result = new ImageData(
    new Uint8ClampedArray(imageData.data),
    width,
    height
  );
  const data = result.data;

  // Directions for 16-ray radial boundary sampling
  const directions: Array<[number, number]> = [
    [-1, 0], [1, 0], [0, -1], [0, 1],
    [-1, -1], [1, 1], [-1, 1], [1, -1],
    [-2, -1], [2, 1], [-1, -2], [1, 2],
    [-2, 1], [2, -1], [1, -2], [-1, 2]
  ];

  // 1. First Pass: Multi-Ray Boundary Diffusion
  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const maskIdx = py * width + px;
      const maskVal = isFloatMask
        ? (mask as Float32Array)[maskIdx]
        : (mask as Uint8ClampedArray)[maskIdx] / 255;

      if (maskVal <= 0.03) continue;

      let sumR = 0, sumG = 0, sumB = 0, sumWeight = 0;

      for (const [dx, dy] of directions) {
        let step = 1;
        const maxStep = 45;

        while (step < maxStep) {
          const nx = px + dx * step;
          const ny = py + dy * step;

          if (nx < 0 || nx >= width || ny < 0 || ny >= height) break;

          const nMaskIdx = ny * width + nx;
          const nMaskVal = isFloatMask
            ? (mask as Float32Array)[nMaskIdx]
            : (mask as Uint8ClampedArray)[nMaskIdx] / 255;

          if (nMaskVal <= 0.03) {
            const sIdx = (ny * width + nx) * 4;
            const weight = 1.0 / Math.pow(step, 1.35);

            sumR += data[sIdx] * weight;
            sumG += data[sIdx + 1] * weight;
            sumB += data[sIdx + 2] * weight;
            sumWeight += weight;
            break;
          }
          step++;
        }
      }

      if (sumWeight > 0) {
        const idx = (py * width + px) * 4;
        const targetR = sumR / sumWeight;
        const targetG = sumG / sumWeight;
        const targetB = sumB / sumWeight;

        const blend = Math.min(1.0, maskVal * 1.25);
        data[idx] = Math.round(data[idx] * (1 - blend) + targetR * blend);
        data[idx + 1] = Math.round(data[idx + 1] * (1 - blend) + targetG * blend);
        data[idx + 2] = Math.round(data[idx + 2] * (1 - blend) + targetB * blend);
      }
    }
  }

  // 2. Second Pass: Laplacian Texture Smoothing on Mask Boundary
  const tempBuf = new Uint8ClampedArray(data);
  for (let py = 1; py < height - 1; py++) {
    for (let px = 1; px < width - 1; px++) {
      const maskIdx = py * width + px;
      const maskVal = isFloatMask
        ? (mask as Float32Array)[maskIdx]
        : (mask as Uint8ClampedArray)[maskIdx] / 255;

      if (maskVal <= 0.1) continue;

      const idx = (py * width + px) * 4;
      const top = ((py - 1) * width + px) * 4;
      const bot = ((py + 1) * width + px) * 4;
      const left = (py * width + (px - 1)) * 4;
      const right = (py * width + (px + 1)) * 4;

      // 4-neighbor average
      const avgR = (tempBuf[top] + tempBuf[bot] + tempBuf[left] + tempBuf[right]) / 4;
      const avgG = (tempBuf[top + 1] + tempBuf[bot + 1] + tempBuf[left + 1] + tempBuf[right + 1]) / 4;
      const avgB = (tempBuf[top + 2] + tempBuf[bot + 2] + tempBuf[left + 2] + tempBuf[right + 2]) / 4;

      const smoothWeight = 0.45 * maskVal;
      data[idx] = Math.round(data[idx] * (1 - smoothWeight) + avgR * smoothWeight);
      data[idx + 1] = Math.round(data[idx + 1] * (1 - smoothWeight) + avgG * smoothWeight);
      data[idx + 2] = Math.round(data[idx + 2] * (1 - smoothWeight) + avgB * smoothWeight);
    }
  }

  return result;
}

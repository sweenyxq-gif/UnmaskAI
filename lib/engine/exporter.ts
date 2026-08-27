import JSZip from 'jszip';

export interface ExportOptions {
  format: 'image/png' | 'image/jpeg' | 'image/webp';
  quality?: number; // 0.1 to 1.0 for jpeg/webp
  filename?: string;
}

/**
 * Converts ImageData to a downloadable Blob
 */
export async function imageDataToBlob(
  imageData: ImageData,
  format: 'image/png' | 'image/jpeg' | 'image/webp' = 'image/png',
  quality: number = 0.95
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');

  ctx.putImageData(imageData, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to convert canvas to blob'));
      },
      format,
      quality
    );
  });
}

/**
 * Triggers a browser download for a given Blob
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/**
 * Packages multiple processed images into a single zip archive
 */
export async function createZipArchive(
  items: Array<{ name: string; blob: Blob }>
): Promise<Blob> {
  const zip = new JSZip();
  const folder = zip.folder('unmasked_images');

  items.forEach((item) => {
    if (folder) {
      folder.file(item.name, item.blob);
    } else {
      zip.file(item.name, item.blob);
    }
  });

  return await zip.generateAsync({ type: 'blob' });
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export interface CropPixels {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Draws the cropped region of `imageSrc` onto a canvas sized to `maxPx`, then encodes it as a
 * JPEG, stepping quality down until the base64 result fits under `maxChars` (or we run out of
 * quality steps — the last attempt is returned regardless).
 */
export async function cropAndCompress(
  imageSrc: string,
  crop: CropPixels,
  { maxPx = 1200, quality = 0.85, maxChars = Infinity }: { maxPx?: number; quality?: number; maxChars?: number } = {},
): Promise<string> {
  const img = await loadImage(imageSrc);
  const scale = Math.min(1, maxPx / Math.max(crop.width, crop.height));
  const w = Math.round(crop.width * scale);
  const h = Math.round(crop.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, crop.x, crop.y, crop.width, crop.height, 0, 0, w, h);

  const qualitySteps = [quality, 0.6, 0.4];
  let result = canvas.toDataURL('image/jpeg', qualitySteps[0]);
  for (let i = 1; i < qualitySteps.length && result.length > maxChars; i++) {
    result = canvas.toDataURL('image/jpeg', qualitySteps[i]);
  }
  return result;
}

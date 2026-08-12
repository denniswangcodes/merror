'use client';

import { useCallback, useState } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import { X, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cropAndCompress, type CropPixels } from '@/lib/image';

interface ImageCropperModalProps {
  imageSrc: string;
  aspect: number;
  cropShape?: 'rect' | 'round';
  maxPx?: number;
  maxChars?: number;
  onCancel: () => void;
  onSave: (dataUrl: string) => void;
}

export function ImageCropperModal({
  imageSrc,
  aspect,
  cropShape = 'rect',
  maxPx = 1200,
  maxChars,
  onCancel,
  onSave,
}: ImageCropperModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedPixels, setCroppedPixels] = useState<CropPixels | null>(null);
  const [saving, setSaving] = useState(false);

  const onCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    setCroppedPixels(areaPixels);
  }, []);

  const handleSave = async () => {
    if (!croppedPixels) return;
    setSaving(true);
    try {
      const dataUrl = await cropAndCompress(imageSrc, croppedPixels, { maxPx, maxChars });
      onSave(dataUrl);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-label="Crop photo">
      <div className="flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="m-0 font-display text-lg font-bold text-text-primary">Adjust photo</h2>
          <button onClick={onCancel} aria-label="Cancel">
            <X className="h-5 w-5 text-text-muted" />
          </button>
        </div>

        <div className="relative h-80 w-full bg-black">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            cropShape={cropShape}
            showGrid={cropShape === 'rect'}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="flex items-center gap-3 px-5 py-4">
          <ZoomIn className="h-4 w-4 shrink-0 text-text-muted" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-accent"
            aria-label="Zoom"
          />
        </div>

        <div className="flex justify-end gap-2 px-5 pb-5">
          <Button variant="secondary" size="sm" onClick={onCancel}>Cancel</Button>
          <Button size="sm" loading={saving} disabled={!croppedPixels} onClick={handleSave}>Save</Button>
        </div>
      </div>
    </div>
  );
}

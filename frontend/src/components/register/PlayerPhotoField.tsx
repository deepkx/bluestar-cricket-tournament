import { useCallback, useEffect, useRef, useState } from 'react';

type Props = {
  label: string;
  file: File | null;
  onChange: (f: File | null) => void;
  existingUrl?: string | null;
  onClearExisting?: () => void;
};

export function PlayerPhotoField({ label, file, onChange, existingUrl, onClearExisting }: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [focus, setFocus] = useState({ x: 50, y: 50 });
  const dragRef = useRef<{ active: boolean; startX: number; startY: number; startFx: number; startFy: number } | null>(
    null,
  );

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setFocus({ x: 50, y: 50 });
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(existingUrl ?? null);
    setFocus({ x: 50, y: 50 });
  }, [file, existingUrl]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!file || !previewUrl) return;
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      dragRef.current = {
        active: true,
        startX: e.clientX,
        startY: e.clientY,
        startFx: focus.x,
        startFy: focus.y,
      };
    },
    [file, previewUrl, focus.x, focus.y],
  );

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d?.active) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    setFocus({
      x: Math.min(100, Math.max(0, d.startFx - dx * 0.25)),
      y: Math.min(100, Math.max(0, d.startFy - dy * 0.25)),
    });
  }, []);

  const onPointerUp = useCallback(() => {
    if (dragRef.current) dragRef.current.active = false;
  }, []);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
      <div className="flex flex-col gap-1">
        <div
          className={`flex h-28 w-28 shrink-0 touch-none items-center justify-center overflow-hidden border border-paper/20 bg-ink-deep/60 ${
            file ? 'cursor-grab active:cursor-grabbing' : ''
          }`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt=""
              className="h-full w-full select-none object-cover"
              style={{ objectPosition: `${focus.x}% ${focus.y}%` }}
              draggable={false}
            />
          ) : (
            <span className="text-xs text-paper/40">Photo</span>
          )}
        </div>
        {file ? (
          <p className="max-w-[7rem] text-center text-[10px] leading-tight text-paper/45">
            Drag photo to reposition before submit
          </p>
        ) : null}
      </div>
      <label className="block flex-1">
        <span className="form-label">{label}</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="form-field py-2 file:mr-3 file:border-0 file:bg-floodlight file:px-3 file:py-1 file:text-sm file:font-semibold file:text-black"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
        {file ? (
          <div className="mt-2 flex flex-wrap gap-2">
            <p className="text-xs text-paper/50">{file.name}</p>
            <button type="button" className="text-xs text-red-300 underline" onClick={() => onChange(null)}>
              Remove
            </button>
          </div>
        ) : null}
        {!file && existingUrl && onClearExisting ? (
          <button type="button" className="mt-2 text-xs text-red-300 underline" onClick={onClearExisting}>
            Remove saved photo
          </button>
        ) : null}
      </label>
    </div>
  );
}

import { useEffect, useState } from 'react';

type Props = {
  label: string;
  file: File | null;
  onChange: (f: File | null) => void;
  existingUrl?: string | null;
};

export function PlayerPhotoField({ label, file, onChange, existingUrl }: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(existingUrl ?? null);
  }, [file, existingUrl]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden border border-paper/20 bg-ink-deep/60">
        {previewUrl ? (
          <img src={previewUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="text-xs text-paper/40">Photo</span>
        )}
      </div>
      <label className="block flex-1">
        <span className="form-label">{label}</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="form-field py-2 file:mr-3 file:border-0 file:bg-floodlight file:px-3 file:py-1 file:text-sm file:font-semibold file:text-black"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
        {file ? <p className="mt-1 text-xs text-paper/50">{file.name}</p> : null}
      </label>
    </div>
  );
}

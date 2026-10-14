import { useCallback, useState } from 'react';
import { Check, Copy, Loader2 } from 'lucide-react';
import { copyDomToClipboard } from '../../utils/copyDomAsImage';

type Props = {
  getTarget: () => HTMLElement | null;
  label: string;
  className?: string;
  disabled?: boolean;
};

export function CopyImageButton({ getTarget, label, className = '', disabled }: Props) {
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle');

  const onClick = useCallback(async () => {
    const node = getTarget();
    if (!node || disabled) return;
    setState('busy');
    try {
      await copyDomToClipboard(node);
      setState('done');
      window.setTimeout(() => setState('idle'), 2200);
    } catch {
      setState('error');
      window.setTimeout(() => setState('idle'), 2800);
    }
  }, [getTarget, disabled]);

  const Icon = state === 'busy' ? Loader2 : state === 'done' ? Check : Copy;
  const hint =
    state === 'done'
      ? 'Copied to clipboard'
      : state === 'error'
        ? 'Copy failed — try again'
        : label;

  return (
    <button
      type="button"
      data-capture-exclude="true"
      disabled={disabled || state === 'busy'}
      onClick={() => void onClick()}
      className={`inline-flex items-center gap-2 rounded-sm border border-paper/20 bg-ink-deep/90 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-paper/80 transition hover:border-floodlight/40 hover:text-floodlight-bright disabled:opacity-50 ${className}`}
      title={hint}
      aria-label={label}
    >
      <Icon className={`h-4 w-4 shrink-0 ${state === 'busy' ? 'animate-spin' : ''}`} aria-hidden />
      <span className="hidden sm:inline">{hint}</span>
    </button>
  );
}

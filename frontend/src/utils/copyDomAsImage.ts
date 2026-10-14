import { toBlob } from 'html-to-image';

const CAPTURE_BG = '#080c0a';
const EXPORT_ATTR = 'data-capture-export';

function findExportRoot(root: HTMLElement): HTMLElement {
  return root.querySelector<HTMLElement>(`[${EXPORT_ATTR}]`) ?? root;
}

/** Temporarily allow overflow so scrollWidth reflects full content (not clipped viewport). */
function measureFullContentSize(el: HTMLElement): { width: number; height: number } {
  const touched: { node: HTMLElement; overflow: string; maxWidth: string; width: string }[] = [];
  const mark = (node: HTMLElement) => {
    touched.push({
      node,
      overflow: node.style.overflow,
      maxWidth: node.style.maxWidth,
      width: node.style.width,
    });
    node.style.overflow = 'visible';
    node.style.maxWidth = 'none';
  };

  mark(el);
  el.querySelectorAll<HTMLElement>('*').forEach(mark);

  const width = Math.ceil(Math.max(el.scrollWidth, el.offsetWidth, el.getBoundingClientRect().width));
  const height = Math.ceil(Math.max(el.scrollHeight, el.offsetHeight, el.getBoundingClientRect().height));

  for (const { node, overflow, maxWidth, width: w } of touched) {
    node.style.overflow = overflow;
    node.style.maxWidth = maxWidth;
    node.style.width = w;
  }

  return { width: Math.max(width, 1), height: Math.max(height, 1) };
}

export async function copyDomToClipboard(root: HTMLElement): Promise<void> {
  const node = findExportRoot(root);
  const { width, height } = measureFullContentSize(node);

  const blob = await toBlob(node, {
    pixelRatio: 2,
    backgroundColor: CAPTURE_BG,
    cacheBust: true,
    width,
    height,
    skipAutoScale: true,
    style: {
      overflow: 'visible',
      width: `${width}px`,
      height: `${height}px`,
      maxWidth: 'none',
    },
    filter: (el) => {
      if (el instanceof HTMLElement && el.dataset.captureExclude === 'true') return false;
      return true;
    },
  });
  if (!blob) throw new Error('Could not render image');

  if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    return;
  }

  const url = URL.createObjectURL(blob);
  try {
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bluestar-fixtures.png';
    a.click();
  } finally {
    URL.revokeObjectURL(url);
  }
}

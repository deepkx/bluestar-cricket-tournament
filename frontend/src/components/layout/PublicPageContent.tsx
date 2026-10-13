import type { ReactNode } from 'react';
import { PitchOvalCrease } from '../ui/PitchOvalCrease';
import { PublicPageSideScenery } from './PublicPageSideScenery';

type Props = {
  children: ReactNode;
  width?: 'md' | 'lg' | 'xl' | '2xl';
  /** Decorative pitch/photo on left & right only; center stays clean */
  sideScenery?: boolean;
  sideSceneryVariant?: 'photos' | 'heroes';
};

const widthClass = {
  md: 'max-w-3xl',
  lg: 'max-w-4xl',
  xl: 'max-w-5xl',
  '2xl': 'max-w-6xl',
} as const;

export function PublicPageContent({
  children,
  width = 'lg',
  sideScenery = false,
  sideSceneryVariant = 'photos',
}: Props) {
  return (
    <div className="relative border-t border-paper/5 bg-ink-deep">
      {sideScenery ? (
        <PublicPageSideScenery fadeToCenter variant={sideSceneryVariant} />
      ) : (
        <>
          <PitchOvalCrease tone="dark" variant="section" className="pointer-events-none opacity-25" />
          <div className="noise-overlay pointer-events-none absolute inset-0 opacity-40" />
        </>
      )}
      <div className={`relative z-10 mx-auto ${widthClass[width]} px-4 py-12 sm:py-16 md:py-20`}>{children}</div>
    </div>
  );
}

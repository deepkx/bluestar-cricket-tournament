type Props = {
  /** dark = white/amber strokes on black; light = on white sections */
  tone?: 'dark' | 'light';
  /** hero fills viewport; section is smaller watermark */
  variant?: 'hero' | 'section';
  className?: string;
};

export function PitchOvalCrease({ tone = 'dark', variant = 'section', className = '' }: Props) {
  const stroke = tone === 'dark' ? 'rgba(255,255,255,0.22)' : 'rgba(163, 113, 13, 0.35)';
  const strokeAccent = tone === 'dark' ? 'rgba(229, 160, 23, 0.35)' : 'rgba(163, 113, 13, 0.5)';
  const pitchFill = tone === 'dark' ? 'rgba(28, 48, 36, 0.35)' : 'rgba(36, 58, 44, 0.12)';
  const opacity = variant === 'hero' ? 1 : 0.85;

  return (
    <svg
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      viewBox="0 0 400 400"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      style={{ opacity }}
    >
      {/* Outfield boundary */}
      <ellipse cx="200" cy="300" rx="175" ry="62" fill="none" stroke={stroke} strokeWidth="1.25" />
      {/* 22-yard pitch */}
      <rect x="168" y="248" width="64" height="104" fill={pitchFill} stroke={strokeAccent} strokeWidth="1" rx="1" />
      {/* Popping crease (batting end) */}
      <line x1="148" y1="268" x2="252" y2="268" stroke={strokeAccent} strokeWidth="1.5" />
      {/* Bowling crease */}
      <line x1="148" y1="332" x2="252" y2="332" stroke={stroke} strokeWidth="1" />
      {/* Return creases */}
      <line x1="168" y1="258" x2="168" y2="342" stroke={stroke} strokeWidth="0.75" strokeOpacity="0.7" />
      <line x1="232" y1="258" x2="232" y2="342" stroke={stroke} strokeWidth="0.75" strokeOpacity="0.7" />
      {/* Outer ring hint (30-yard circle segment) */}
      <ellipse cx="200" cy="300" rx="120" ry="42" fill="none" stroke={stroke} strokeWidth="0.5" strokeOpacity="0.5" />
    </svg>
  );
}

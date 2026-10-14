import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import type { TeamSlotRevealMotion } from './fixturesRevealRandom';

type Props = {
  children: ReactNode;
  active: boolean;
  motionSpec: TeamSlotRevealMotion;
  baseDelay?: number;
  ease: [number, number, number, number];
  className?: string;
};

export function TeamRevealMotion({
  children,
  active,
  motionSpec,
  baseDelay = 0,
  ease,
  className = '',
}: Props) {
  if (!active) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{
        opacity: 0,
        x: motionSpec.x,
        y: motionSpec.y,
        rotate: motionSpec.rotate,
        filter: 'blur(6px)',
      }}
      animate={{
        opacity: 1,
        x: 0,
        y: 0,
        rotate: 0,
        filter: 'blur(0px)',
      }}
      transition={{
        delay: baseDelay + motionSpec.delay,
        duration: motionSpec.duration,
        ease,
      }}
    >
      {children}
    </motion.div>
  );
}

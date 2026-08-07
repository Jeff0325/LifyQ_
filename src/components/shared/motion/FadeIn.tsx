import { type HTMLMotionProps, motion } from 'motion/react';

import { DURATION, EASE } from '@/lib/motion';

export interface FadeInProps extends HTMLMotionProps<'div'> {
  delay?: number;
}

/** Opacity-only entrance — the one animation that stays on even under `prefers-reduced-motion` (docs/19 §6). */
export function FadeIn({ delay = 0, transition, ...props }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: DURATION.base,
        ease: EASE.standard,
        delay,
        ...transition,
      }}
      {...props}
    />
  );
}

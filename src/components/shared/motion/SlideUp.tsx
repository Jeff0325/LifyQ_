import { type HTMLMotionProps, motion } from 'motion/react';

import { DURATION, EASE } from '@/lib/motion';

export interface SlideUpProps extends HTMLMotionProps<'div'> {
  delay?: number;
  /** Starting vertical offset in px. */
  distance?: number;
}

/** Entrance for panels, sheets, and page sections — docs/08_Design_System.md §7. */
export function SlideUp({
  delay = 0,
  distance = 8,
  transition,
  ...props
}: SlideUpProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: distance }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: distance }}
      transition={{
        duration: DURATION.moderate,
        ease: EASE.decelerate,
        delay,
        ...transition,
      }}
      {...props}
    />
  );
}

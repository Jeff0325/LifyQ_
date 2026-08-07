import { type HTMLMotionProps, type Variants, motion } from 'motion/react';

import { DURATION, EASE } from '@/lib/motion';

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.base, ease: EASE.standard },
  },
};

/**
 * Container for a staggered-entrance list (e.g. Tasks/Notes cards on
 * first paint). Wrap each child in `StaggerItem`. See
 * docs/08_Design_System.md §7 and docs/11_Component_Library.md §9.
 */
export function StaggerList(props: HTMLMotionProps<'div'>) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      {...props}
    />
  );
}

export function StaggerItem(props: HTMLMotionProps<'div'>) {
  return <motion.div variants={itemVariants} {...props} />;
}

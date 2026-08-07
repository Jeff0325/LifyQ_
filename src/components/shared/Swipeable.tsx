import { type PanInfo, motion } from 'motion/react';
import type * as React from 'react';

import { cn } from '@/lib/utils';

export interface SwipeableProps {
  children: React.ReactNode;
  /** Revealed behind the content when swiped right-to-left (content moves left). */
  rightAction?: React.ReactNode;
  /** Revealed behind the content when swiped left-to-right (content moves right). */
  leftAction?: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  /** px of drag before a swipe counts as committed. */
  threshold?: number;
  className?: string;
}

/**
 * Horizontal swipe-to-reveal/act primitive — the architecture for future
 * "swipe to complete a Task" / "swipe to dismiss a Reminder" interactions
 * (docs/20_Responsive_Design_Guidelines.md §3). Always springs back to
 * rest after release; committing an action is the caller's responsibility
 * via `onSwipeLeft`/`onSwipeRight`, so this component carries no feature
 * logic of its own. No consumer yet this milestone — see
 * docs/28_Mobile_First_Architecture.md.
 */
export function Swipeable({
  children,
  rightAction,
  leftAction,
  onSwipeLeft,
  onSwipeRight,
  threshold = 72,
  className,
}: SwipeableProps) {
  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    if (info.offset.x <= -threshold) onSwipeLeft?.();
    else if (info.offset.x >= threshold) onSwipeRight?.();
  };

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {leftAction && (
        <div className="inset-y-0 left-0 absolute flex items-center">
          {leftAction}
        </div>
      )}
      {rightAction && (
        <div className="inset-y-0 right-0 absolute flex items-center">
          {rightAction}
        </div>
      )}
      <motion.div
        drag="x"
        dragDirectionLock
        dragConstraints={{
          left: rightAction ? -threshold * 1.4 : 0,
          right: leftAction ? threshold * 1.4 : 0,
        }}
        dragElastic={0.15}
        dragSnapToOrigin
        onDragEnd={handleDragEnd}
        className="relative z-10 touch-pan-y bg-background"
      >
        {children}
      </motion.div>
    </div>
  );
}

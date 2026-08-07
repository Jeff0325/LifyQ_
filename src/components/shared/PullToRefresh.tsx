import { RefreshCw } from 'lucide-react';
import { animate, motion, useMotionValue, useTransform } from 'motion/react';
import * as React from 'react';

import { SPRING } from '@/lib/motion';
import { cn } from '@/lib/utils';

export interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => void | Promise<void>;
  /** px of pull before release triggers a refresh. */
  threshold?: number;
  className?: string;
}

/**
 * Native-feeling pull-to-refresh — the architecture for future list
 * screens (Tasks, Notes, ...) per docs/20_Responsive_Design_Guidelines.md
 * §5. Owns its own scroll container so the pull gesture only engages when
 * genuinely scrolled to the top (`drag={atTop ? 'y' : false}`); otherwise
 * normal scrolling passes through untouched. No consumer wires a real
 * refetch yet — see the demo on the Home placeholder and
 * docs/28_Mobile_First_Architecture.md for the known gap (gesture-only;
 * needs a keyboard/screen-reader-reachable manual refresh alongside it
 * once a real list adopts this).
 */
export function PullToRefresh({
  children,
  onRefresh,
  threshold = 64,
  className,
}: PullToRefreshProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [atTop, setAtTop] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const y = useMotionValue(0);
  const indicatorOpacity = useTransform(y, [0, threshold], [0, 1]);
  const indicatorRotate = useTransform(y, [0, threshold], [0, 180]);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return undefined;
    const onScroll = () => setAtTop(el.scrollTop <= 0);
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const handleDragEnd = () => {
    if (y.get() >= threshold && !refreshing) {
      setRefreshing(true);
      animate(y, threshold * 0.6, SPRING);
      void Promise.resolve(onRefresh()).finally(() => {
        setRefreshing(false);
        animate(y, 0, SPRING);
      });
    } else {
      animate(y, 0, SPRING);
    }
  };

  return (
    <div
      ref={scrollRef}
      className={cn(
        'relative h-full overflow-y-auto overscroll-y-contain',
        className,
      )}
    >
      <motion.div
        aria-hidden="true"
        style={{ opacity: indicatorOpacity }}
        className="inset-x-0 top-0 pt-3 pointer-events-none absolute z-10 flex justify-center"
      >
        <motion.span
          style={{ rotate: indicatorRotate }}
          className="size-8 flex items-center justify-center rounded-full bg-surface text-brand-600 shadow-elevation-2"
        >
          <RefreshCw className={cn('size-4', refreshing && 'animate-spin')} />
        </motion.span>
      </motion.div>
      {refreshing && (
        <span role="status" className="sr-only">
          Refreshing…
        </span>
      )}
      <motion.div
        drag={atTop ? 'y' : false}
        style={{ y }}
        dragConstraints={{ top: 0, bottom: threshold * 1.6 }}
        dragElastic={{ top: 0, bottom: 0.5 }}
        onDragEnd={handleDragEnd}
      >
        {children}
      </motion.div>
    </div>
  );
}

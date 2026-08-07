import { MoreHorizontal, Sparkles, X } from 'lucide-react';
import { motion } from 'motion/react';
import { NavLink } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { MOBILE_TAB_ITEM_IDS, PRIMARY_NAV_ITEMS } from '@/constants/navigation';
import {
  JARVIS_GRADIENT_CLASS,
  MODULE_ACCENT,
  type ModuleId,
} from '@/constants/moduleColors';
import { SPRING } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { useJarvisStore } from '@/stores/useJarvisStore';
import { useUIStore } from '@/stores/useUIStore';
import type { NavItem } from '@/types/nav';

const tabItems = PRIMARY_NAV_ITEMS.filter((item) =>
  MOBILE_TAB_ITEM_IDS.includes(item.id),
);
const moreItems = PRIMARY_NAV_ITEMS.filter(
  (item) => !MOBILE_TAB_ITEM_IDS.includes(item.id),
);

function TabButton({ item }: { item: NavItem }) {
  const Icon = item.icon;
  const accent = MODULE_ACCENT[item.id as ModuleId];
  // min 44px touch target — docs/19_Accessibility_Guidelines.md §7. Each tab
  // shares the row equally (flex-1) with a 44px floor, rather than a fixed
  // min-width, so 5 tabs never force the row wider than the viewport.
  const base =
    'relative flex min-w-11 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-1.5 text-caption font-medium transition-colors duration-base ease-standard';

  if (!item.enabled) {
    return (
      <div
        className={cn(base, 'text-foreground-disabled')}
        aria-disabled="true"
      >
        <Icon aria-hidden="true" className="size-5" />
        <span className="max-w-full truncate">{item.label}</span>
      </div>
    );
  }

  return (
    <NavLink
      to={item.href}
      end={item.href === '/'}
      className={({ isActive }) =>
        cn(
          base,
          isActive
            ? accent.icon
            : 'text-foreground-secondary hover:text-foreground',
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.span
              layoutId="bottom-nav-active-pill"
              transition={SPRING}
              className={cn('inset-0 absolute rounded-xl', accent.iconBg)}
            />
          )}
          <Icon aria-hidden="true" className="size-5 relative z-10" />
          <span className="relative z-10 max-w-full truncate">
            {item.label}
          </span>
        </>
      )}
    </NavLink>
  );
}

/**
 * The distinctive, dead-center Jarvis button (docs/39 addendum) — not a
 * mapped `NavItem`/`NavLink` like the tabs around it, since tapping it
 * opens the floating companion (`useJarvisStore.openPanel`) rather than
 * navigating to a route. Elevated above the bar line, larger and
 * brand-gradient-filled, so it visually reads as the app's primary action
 * rather than a sixth peer tab.
 */
function JarvisTabButton() {
  const openPanel = useJarvisStore((state) => state.openPanel);

  return (
    <div className="min-w-11 flex flex-1 flex-col items-center justify-end">
      <button
        type="button"
        onClick={openPanel}
        aria-label="Open Jarvis"
        className={cn(
          '-mt-6 size-14 duration-base ease-standard flex items-center justify-center rounded-full text-foreground-on-brand shadow-elevation-3 transition-transform active:scale-95',
          JARVIS_GRADIENT_CLASS,
        )}
      >
        <Sparkles aria-hidden="true" className="size-6" />
      </button>
      <span className="mt-1 font-medium max-w-full truncate text-caption text-foreground-secondary">
        Jarvis
      </span>
    </div>
  );
}

/**
 * Mobile/tablet-portrait navigation — fixed bottom tab bar (max 5 slots)
 * plus a "More" disclosure for the remaining pillars. Hidden at `lg` and
 * above in favor of Sidebar. See docs/10_Navigation_Architecture.md §2.1.
 */
export function BottomNav() {
  const moreOpen = useUIStore((state) => state.mobileMoreOpen);
  const setMoreOpen = useUIStore((state) => state.setMobileMoreOpen);
  const midpoint = Math.ceil(tabItems.length / 2);
  const leftTabs = tabItems.slice(0, midpoint);
  const rightTabs = tabItems.slice(midpoint);

  return (
    <div className="inset-x-0 bottom-0 lg:hidden fixed z-40">
      {moreOpen && (
        <div
          id="mobile-more-panel"
          role="menu"
          aria-label="More destinations"
          className="mx-3 mb-2 p-2 backdrop-blur-xl rounded-2xl border border-border bg-surface-overlay shadow-elevation-4"
        >
          <div className="px-2 pb-1 pt-1 flex items-center justify-between">
            <span className="font-medium tracking-wide text-caption text-foreground-secondary uppercase">
              More
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={() => setMoreOpen(false)}
            >
              <X aria-hidden="true" className="size-4" />
              <VisuallyHidden>Close</VisuallyHidden>
            </Button>
          </div>
          <ul className="gap-1 grid grid-cols-3">
            {moreItems.map((item) => {
              const Icon = item.icon;
              const accent = MODULE_ACCENT[item.id as ModuleId];
              const itemClasses =
                'flex flex-col items-center gap-1 rounded-xl px-2 py-3 text-caption font-medium';

              if (!item.enabled) {
                return (
                  <li key={item.id}>
                    <div
                      className={cn(itemClasses, 'text-foreground-disabled')}
                      aria-disabled="true"
                    >
                      <Icon aria-hidden="true" className="size-5" />
                      {item.label}
                      <Badge variant="neutral" className="mt-0.5">
                        Soon
                      </Badge>
                    </div>
                  </li>
                );
              }

              return (
                <li key={item.id}>
                  <NavLink
                    to={item.href}
                    end={item.href === '/'}
                    onClick={() => setMoreOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        itemClasses,
                        isActive
                          ? cn(accent.iconBg, accent.icon)
                          : 'text-foreground-secondary hover:bg-surface hover:text-foreground',
                      )
                    }
                  >
                    <Icon
                      aria-hidden="true"
                      className={cn('size-5', accent.icon)}
                    />
                    {item.label}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <nav
        aria-label="Primary"
        className="px-2 pt-1.5 backdrop-blur-xl flex items-stretch justify-around border-t border-border bg-surface-overlay pb-[max(env(safe-area-inset-bottom),0.5rem)]"
      >
        {leftTabs.map((item) => (
          <TabButton key={item.id} item={item} />
        ))}
        <JarvisTabButton />
        {rightTabs.map((item) => (
          <TabButton key={item.id} item={item} />
        ))}
        <button
          type="button"
          aria-expanded={moreOpen}
          aria-controls="mobile-more-panel"
          onClick={() => setMoreOpen(!moreOpen)}
          className={cn(
            'min-w-11 gap-1 px-2 py-1.5 font-medium duration-base ease-standard flex flex-1 flex-col items-center justify-center rounded-xl text-caption transition-colors',
            moreOpen
              ? 'text-brand-600'
              : 'text-foreground-secondary hover:text-foreground',
          )}
        >
          <MoreHorizontal aria-hidden="true" className="size-5" />
          <span className="max-w-full truncate">More</span>
        </button>
      </nav>
    </div>
  );
}

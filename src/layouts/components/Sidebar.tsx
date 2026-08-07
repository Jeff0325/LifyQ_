import { ChevronsLeft, ChevronsRight, LogOut, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { NavLink, useNavigate } from 'react-router-dom';

import { BrandMark } from '@/components/shared/BrandMark';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { ROUTES } from '@/constants/routes';
import { PRIMARY_NAV_ITEMS } from '@/constants/navigation';
import {
  JARVIS_GRADIENT_CLASS,
  MODULE_ACCENT,
  type ModuleId,
} from '@/constants/moduleColors';
import { QUERY_XL, useMediaQuery } from '@/hooks/useMediaQuery';
import { SPRING } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/useAuthStore';
import { useJarvisStore } from '@/stores/useJarvisStore';
import { useUIStore } from '@/stores/useUIStore';
import type { NavItem } from '@/types/nav';

function SidebarLink({
  item,
  collapsed,
}: {
  item: NavItem;
  collapsed: boolean;
}) {
  const Icon = item.icon;
  const accent = MODULE_ACCENT[item.id as ModuleId];

  const rowClasses = cn(
    'relative flex h-10 items-center gap-3 rounded-md px-3 text-body-sm font-medium',
    'transition-colors duration-base ease-standard',
    collapsed && 'justify-center px-0',
  );

  if (!item.enabled) {
    return (
      <div
        className={cn(rowClasses, 'cursor-default text-foreground-disabled')}
        aria-disabled="true"
        title={collapsed ? `${item.label} — coming soon` : undefined}
      >
        <Icon aria-hidden="true" className="shrink-0" />
        <span className={cn('truncate', collapsed && 'sr-only')}>
          {item.label}
        </span>
        {!collapsed && (
          <Badge variant="neutral" className="ml-auto shrink-0">
            Soon
          </Badge>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.href}
      end={item.href === '/'}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        cn(
          rowClasses,
          isActive
            ? accent.icon
            : 'text-foreground-secondary hover:bg-surface-raised hover:text-foreground',
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.span
              layoutId="sidebar-active-pill"
              transition={SPRING}
              className={cn('inset-0 absolute rounded-md', accent.iconBg)}
            />
          )}
          <Icon
            aria-hidden="true"
            className={cn('relative z-10 shrink-0', accent.icon)}
          />
          <span
            className={cn(
              'duration-fast relative z-10 truncate transition-opacity',
              collapsed && 'sr-only',
            )}
          >
            {item.label}
          </span>
        </>
      )}
    </NavLink>
  );
}

/**
 * The distinctive, brand-marked Jarvis row (docs/39 addendum) — not a
 * mapped `NavItem`/`NavLink` like the rows below it, since opening it
 * triggers the floating companion (`useJarvisStore.openPanel`) rather than
 * navigating to a route. Placed first, above every routed destination, so
 * it reads as the primary action rather than a peer pillar.
 */
function JarvisSidebarLink({ collapsed }: { collapsed: boolean }) {
  const openPanel = useJarvisStore((state) => state.openPanel);

  return (
    <button
      type="button"
      onClick={openPanel}
      title={collapsed ? 'Jarvis' : undefined}
      className={cn(
        'h-10 gap-3 px-3 font-medium flex items-center rounded-md text-body-sm',
        JARVIS_GRADIENT_CLASS,
        'text-foreground-on-brand',
        'duration-base ease-standard transition-transform active:scale-[0.98]',
        collapsed && 'px-0 justify-center',
      )}
    >
      <Sparkles aria-hidden="true" className="shrink-0" />
      <span className={cn('truncate', collapsed && 'sr-only')}>Jarvis</span>
    </button>
  );
}

/**
 * Persistent desktop/tablet navigation rail — icon-only "rail" by default at
 * `lg`, expanded by default at `xl`, always user-toggleable. Hidden below
 * `lg` in favor of BottomNav. See docs/10_Navigation_Architecture.md §2.
 */
export function Sidebar() {
  const collapsed = useUIStore((state) => state.sidebarCollapsed);
  const toggleCollapsed = useUIStore((state) => state.toggleSidebarCollapsed);
  const isXl = useMediaQuery(QUERY_XL);
  const navigate = useNavigate();
  const signOut = useAuthStore((state) => state.signOut);

  const handleSignOut = async () => {
    await signOut();
    navigate(ROUTES.login, { replace: true });
  };

  // Rail defaults collapsed at lg–xl, expanded at xl+, but the user's
  // explicit toggle (sidebarCollapsed) always wins once they've touched it.
  const effectiveCollapsed = collapsed || !isXl;

  return (
    <aside
      className={cn(
        'top-0 duration-moderate ease-standard lg:flex sticky hidden h-dvh shrink-0 flex-col border-r border-border bg-surface transition-[width]',
        effectiveCollapsed ? 'w-18' : 'w-60',
      )}
    >
      <div
        className={cn(
          'h-16 gap-2 px-4 flex items-center',
          effectiveCollapsed && 'px-0 justify-center',
        )}
      >
        <BrandMark />
        {!effectiveCollapsed && (
          <span className="font-semibold text-h3 text-foreground">LifyQ</span>
        )}
      </div>

      <nav
        aria-label="Primary"
        className="gap-1 px-3 py-2 flex flex-1 flex-col overflow-y-auto"
      >
        <JarvisSidebarLink collapsed={effectiveCollapsed} />
        {PRIMARY_NAV_ITEMS.map((item) => (
          <SidebarLink
            key={item.id}
            item={item}
            collapsed={effectiveCollapsed}
          />
        ))}
      </nav>

      <div className="gap-1 px-3 py-2 flex flex-col border-t border-border">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            'text-foreground-secondary',
            !effectiveCollapsed && 'gap-3 px-3 w-full justify-start',
          )}
          onClick={toggleCollapsed}
        >
          {effectiveCollapsed ? (
            <ChevronsRight aria-hidden="true" />
          ) : (
            <ChevronsLeft aria-hidden="true" />
          )}
          <VisuallyHidden>
            {effectiveCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          </VisuallyHidden>
          {!effectiveCollapsed && (
            <span aria-hidden="true" className="text-body-sm">
              Collapse
            </span>
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            'text-foreground-secondary',
            !effectiveCollapsed && 'gap-3 px-3 w-full justify-start',
          )}
          onClick={() => void handleSignOut()}
        >
          <LogOut aria-hidden="true" />
          <VisuallyHidden>Sign out</VisuallyHidden>
          {!effectiveCollapsed && (
            <span aria-hidden="true" className="text-body-sm">
              Sign Out
            </span>
          )}
        </Button>
      </div>
    </aside>
  );
}

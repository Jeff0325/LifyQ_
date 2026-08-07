import { Monitor, Moon, Sun } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { cn } from '@/lib/utils';
import {
  type ThemePreference,
  usePreferencesStore,
} from '@/stores/usePreferencesStore';

const OPTIONS: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light theme', icon: Sun },
  { value: 'system', label: 'System theme', icon: Monitor },
  { value: 'dark', label: 'Dark theme', icon: Moon },
];

/**
 * Light / System / Dark segmented control. A reusable layout primitive per
 * docs/08_Design_System.md §2.4 — theme is a first-class, user-controllable
 * preference, not an OS-only inference.
 */
export function ThemeToggle() {
  const theme = usePreferencesStore((state) => state.theme);
  const setTheme = usePreferencesStore((state) => state.setTheme);

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="gap-0.5 p-0.5 inline-flex items-center rounded-md border border-border bg-surface"
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const active = theme === value;
        return (
          <Button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            variant={active ? 'primary' : 'ghost'}
            size="icon"
            className={cn('size-8', !active && 'text-foreground-secondary')}
            onClick={() => setTheme(value)}
          >
            <Icon aria-hidden="true" />
            <VisuallyHidden>{label}</VisuallyHidden>
          </Button>
        );
      })}
    </div>
  );
}

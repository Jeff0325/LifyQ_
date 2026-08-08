import { CalendarCheck, Sparkles, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { BrandMark } from '@/components/shared/BrandMark';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';

const HIGHLIGHTS = [
  {
    icon: Sparkles,
    title: 'One assistant for everything',
    description: 'Jarvis understands your whole life, not just one app.',
  },
  {
    icon: CalendarCheck,
    title: 'A daily planner, not a dashboard',
    description: "See what's happening today and act on it in one tap.",
  },
  {
    icon: Wallet,
    title: 'Bills, habits, health — together',
    description: 'Every part of your life management, one place.',
  },
];

/**
 * The Launch App → Welcome step (docs/22 onboarding architecture) — a
 * public, full-bleed marketing/intro screen between the splash cold-start
 * and mock sign-in. Purely presentational; no state of its own.
 */
export function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="gap-10 flex min-h-dvh w-full flex-col justify-between bg-background px-6 py-10 pt-[max(env(safe-area-inset-top),2.5rem)] pb-[max(env(safe-area-inset-bottom),2.5rem)]">
      <div className="gap-3 flex flex-col items-center text-center">
        <BrandMark className="size-12" />
        <h1 className="font-semibold text-h1 text-foreground">
          Welcome to LifyQ
        </h1>
        <p className="max-w-xs text-body text-foreground-secondary">
          Your life, intelligently organized — with an AI assistant at the
          center of it.
        </p>
      </div>

      <div className="gap-5 flex flex-col">
        {HIGHLIGHTS.map(({ icon: Icon, title, description }) => (
          <div key={title} className="gap-3 flex items-start">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-950">
              <Icon
                aria-hidden="true"
                className="size-5 text-brand-600 dark:text-brand-400"
              />
            </span>
            <div className="gap-0.5 flex flex-col">
              <p className="font-medium text-body-sm text-foreground">
                {title}
              </p>
              <p className="text-caption text-foreground-tertiary">
                {description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="gap-3 flex flex-col">
        <Button
          size="lg"
          className="w-full"
          onClick={() => navigate(ROUTES.login, { state: { mode: 'signup' } })}
        >
          Get Started
        </Button>
        <Button
          variant="ghost"
          size="lg"
          className="w-full"
          onClick={() => navigate(ROUTES.login, { state: { mode: 'login' } })}
        >
          I already have an account
        </Button>
      </div>
    </div>
  );
}

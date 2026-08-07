import { AlertTriangle } from 'lucide-react';
import { Link, useRouteError } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';

/**
 * Route-level error boundary (`errorElement`), per
 * docs/15_Routing_Strategy.md §9 — a branded fallback instead of a raw
 * stack trace for any unhandled render error within a feature route.
 */
export function ErrorPage() {
  const error = useRouteError();
  if (import.meta.env.DEV) {
    console.error(error);
  }

  return (
    <div className="gap-4 py-24 mx-auto flex max-w-[480px] flex-col items-center text-center">
      <div className="size-14 flex items-center justify-center rounded-2xl bg-danger-subtle">
        <AlertTriangle aria-hidden="true" className="size-7 text-danger" />
      </div>
      <h2 className="font-semibold text-h1 text-foreground">
        Something went wrong
      </h2>
      <p className="text-body text-foreground-secondary">
        An unexpected error occurred while loading this page.
      </p>
      <Button asChild variant="primary" size="md">
        <Link to={ROUTES.home}>Back to Dashboard</Link>
      </Button>
    </div>
  );
}

import { Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';

/** Catch-all route — docs/15_Routing_Strategy.md §9. */
export function NotFound() {
  return (
    <EmptyState
      icon={Compass}
      title="Page not found"
      description="That page doesn't exist yet, or the link is out of date."
      className="py-24"
      action={
        <Button asChild variant="primary" size="md">
          <Link to={ROUTES.home}>Back to Dashboard</Link>
        </Button>
      }
    />
  );
}

import { Plus } from 'lucide-react';
import { useState } from 'react';

import { PageContainer } from '@/components/shared/PageContainer';
import { Button } from '@/components/ui/button';
import { GoalFormDialog, GoalsGrid } from '@/features/goals';

export function Goals() {
  const [formOpen, setFormOpen] = useState(false);

  return (
    <PageContainer size="lg" className="gap-4 flex flex-col">
      <div className="gap-3 flex items-center justify-between">
        <h2 className="font-semibold text-h2 text-foreground">Goals</h2>
        <Button onClick={() => setFormOpen(true)} size="sm">
          <Plus aria-hidden="true" />
          New goal
        </Button>
      </div>

      <GoalsGrid onCreate={() => setFormOpen(true)} />

      <GoalFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </PageContainer>
  );
}

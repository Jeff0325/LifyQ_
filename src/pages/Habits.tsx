import { Plus } from 'lucide-react';
import { useState } from 'react';

import { PageContainer } from '@/components/shared/PageContainer';
import { Button } from '@/components/ui/button';
import { HabitFormDialog, HabitsList } from '@/features/habits';

export function Habits() {
  const [formOpen, setFormOpen] = useState(false);

  return (
    <PageContainer size="lg" className="gap-4 flex flex-col">
      <div className="gap-3 flex items-center justify-between">
        <h2 className="font-semibold text-h2 text-foreground">Habits</h2>
        <Button onClick={() => setFormOpen(true)} size="sm">
          <Plus aria-hidden="true" />
          New habit
        </Button>
      </div>

      <HabitsList onCreate={() => setFormOpen(true)} />

      <HabitFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </PageContainer>
  );
}

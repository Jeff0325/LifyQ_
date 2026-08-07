import { Plus } from 'lucide-react';
import { useState } from 'react';

import { PageContainer } from '@/components/shared/PageContainer';
import { Button } from '@/components/ui/button';
import {
  ReminderFilterBar,
  ReminderFormDialog,
  RemindersList,
} from '@/features/reminders';
import {
  DEFAULT_REMINDER_FILTERS,
  type ReminderFilters,
} from '@/features/reminders/types';

export function Reminders() {
  const [filters, setFilters] = useState<ReminderFilters>(
    DEFAULT_REMINDER_FILTERS,
  );
  const [formOpen, setFormOpen] = useState(false);

  return (
    <PageContainer size="lg" className="gap-4 flex flex-col">
      <div className="gap-3 flex items-center justify-between">
        <h2 className="font-semibold text-h2 text-foreground">Reminders</h2>
        <Button onClick={() => setFormOpen(true)} size="sm">
          <Plus aria-hidden="true" />
          New reminder
        </Button>
      </div>

      <ReminderFilterBar filters={filters} onChange={setFilters} />

      <RemindersList filters={filters} onCreate={() => setFormOpen(true)} />

      <ReminderFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </PageContainer>
  );
}

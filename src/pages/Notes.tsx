import { Plus } from 'lucide-react';
import { useState } from 'react';

import { PageContainer } from '@/components/shared/PageContainer';
import { Button } from '@/components/ui/button';
import { NoteFilterBar, NoteFormDialog, NotesGrid } from '@/features/notes';
import { DEFAULT_NOTE_FILTERS, type NoteFilters } from '@/features/notes/types';

export function Notes() {
  const [filters, setFilters] = useState<NoteFilters>(DEFAULT_NOTE_FILTERS);
  const [formOpen, setFormOpen] = useState(false);

  return (
    <PageContainer size="lg" className="gap-4 flex flex-col">
      <div className="gap-3 flex items-center justify-between">
        <h2 className="font-semibold text-h2 text-foreground">Notes</h2>
        <Button onClick={() => setFormOpen(true)} size="sm">
          <Plus aria-hidden="true" />
          New note
        </Button>
      </div>

      <NoteFilterBar filters={filters} onChange={setFilters} />

      <NotesGrid filters={filters} onCreate={() => setFormOpen(true)} />

      <NoteFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </PageContainer>
  );
}

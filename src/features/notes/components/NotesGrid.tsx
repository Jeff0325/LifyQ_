import { NotebookText } from 'lucide-react';
import { useMemo, useState } from 'react';

import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { StaggerItem, StaggerList } from '@/components/shared/motion';
import { Button } from '@/components/ui/button';
import { NoteCard } from '@/features/notes/components/NoteCard';
import { NoteFormDialog } from '@/features/notes/components/NoteFormDialog';
import { NotesSkeleton } from '@/features/notes/components/NotesSkeleton';
import { useNotes } from '@/features/notes/hooks/useNotes';
import type { Note, NoteFilters } from '@/features/notes/types';

function matchesFilters(note: Note, filters: NoteFilters): boolean {
  if (filters.folder !== 'all' && note.folder !== filters.folder) return false;
  if (filters.search.trim()) {
    const needle = filters.search.trim().toLowerCase();
    const haystack = `${note.title} ${note.content} ${note.tags}`.toLowerCase();
    if (!haystack.includes(needle)) return false;
  }
  return true;
}

export interface NotesGridProps {
  filters: NoteFilters;
  onCreate: () => void;
}

export function NotesGrid({ filters, onCreate }: NotesGridProps) {
  const { data: notes, isLoading, isError, refetch } = useNotes();
  const [editingNote, setEditingNote] = useState<Note | undefined>(undefined);

  const visible = useMemo(() => {
    if (!notes) return [];
    return [...notes]
      .filter((note) => matchesFilters(note, filters))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [notes, filters]);

  if (isLoading) return <NotesSkeleton />;

  if (isError) {
    return (
      <ErrorState
        title="Couldn't load your notes"
        onRetry={() => void refetch()}
      />
    );
  }

  if (notes && notes.length === 0) {
    return (
      <EmptyState
        icon={NotebookText}
        title="No notes yet"
        description="Capture an idea, a meeting summary, or anything worth remembering."
        module="notes"
        action={<Button onClick={onCreate}>New note</Button>}
      />
    );
  }

  if (visible.length === 0) {
    return (
      <EmptyState
        icon={NotebookText}
        title="No notes match your filters"
        description="Try a different search or folder."
      />
    );
  }

  return (
    <>
      <StaggerList className="gap-4 sm:grid-cols-2 lg:grid-cols-3 grid grid-cols-1">
        {visible.map((note) => (
          <StaggerItem key={note.id}>
            <NoteCard note={note} onEdit={setEditingNote} />
          </StaggerItem>
        ))}
      </StaggerList>

      <NoteFormDialog
        open={!!editingNote}
        onOpenChange={(open) => !open && setEditingNote(undefined)}
        note={editingNote}
      />
    </>
  );
}

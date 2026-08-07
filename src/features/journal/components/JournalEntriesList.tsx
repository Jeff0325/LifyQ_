import { BookHeart } from 'lucide-react';
import { useMemo, useState } from 'react';

import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { StaggerItem, StaggerList } from '@/components/shared/motion';
import { Button } from '@/components/ui/button';
import { JournalEntryCard } from '@/features/journal/components/JournalEntryCard';
import { JournalEntryFormDialog } from '@/features/journal/components/JournalEntryFormDialog';
import { JournalSkeleton } from '@/features/journal/components/JournalSkeleton';
import { useJournalEntries } from '@/features/journal/hooks/useJournal';
import type { JournalEntry, JournalFilters } from '@/features/journal/types';

function matchesFilters(entry: JournalEntry, filters: JournalFilters): boolean {
  if (filters.mood !== 'all' && entry.mood !== filters.mood) return false;
  if (filters.search.trim()) {
    const needle = filters.search.trim().toLowerCase();
    if (!entry.content.toLowerCase().includes(needle)) return false;
  }
  return true;
}

export interface JournalEntriesListProps {
  filters: JournalFilters;
  onCreate: () => void;
}

export function JournalEntriesList({
  filters,
  onCreate,
}: JournalEntriesListProps) {
  const { data: entries, isLoading, isError, refetch } = useJournalEntries();
  const [editingEntry, setEditingEntry] = useState<JournalEntry | undefined>(
    undefined,
  );

  const visible = useMemo(() => {
    if (!entries) return [];
    return [...entries]
      .filter((entry) => matchesFilters(entry, filters))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [entries, filters]);

  if (isLoading) return <JournalSkeleton />;

  if (isError) {
    return (
      <ErrorState
        title="Couldn't load your journal"
        onRetry={() => void refetch()}
      />
    );
  }

  if (entries && entries.length === 0) {
    return (
      <EmptyState
        icon={BookHeart}
        title="No entries yet"
        description="A place to reflect — a line or two is enough."
        module="journal"
        action={<Button onClick={onCreate}>New entry</Button>}
      />
    );
  }

  if (visible.length === 0) {
    return (
      <EmptyState
        icon={BookHeart}
        title="No entries match your filters"
        description="Try a different search or mood."
      />
    );
  }

  return (
    <>
      <StaggerList className="gap-4 sm:grid-cols-2 lg:grid-cols-3 grid grid-cols-1">
        {visible.map((entry) => (
          <StaggerItem key={entry.id}>
            <JournalEntryCard entry={entry} onEdit={setEditingEntry} />
          </StaggerItem>
        ))}
      </StaggerList>

      <JournalEntryFormDialog
        open={!!editingEntry}
        onOpenChange={(open) => !open && setEditingEntry(undefined)}
        entry={editingEntry}
      />
    </>
  );
}

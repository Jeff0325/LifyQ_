import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDeleteJournalEntry } from '@/features/journal/hooks/useJournal';
import {
  JOURNAL_MOOD_EMOJI,
  JOURNAL_MOOD_LABELS,
  type JournalEntry,
} from '@/features/journal/types';
import { useToast } from '@/hooks/useToast';

export interface JournalEntryCardProps {
  entry: JournalEntry;
  onEdit: (entry: JournalEntry) => void;
}

export function JournalEntryCard({ entry, onEdit }: JournalEntryCardProps) {
  const deleteEntry = useDeleteJournalEntry();
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDelete = async () => {
    await deleteEntry.mutateAsync(entry.id);
    setConfirmOpen(false);
    toast({ variant: 'success', title: 'Entry deleted' });
  };

  return (
    <Card className="min-w-0 gap-2 p-4 flex flex-col">
      <div className="gap-2 flex items-start justify-between">
        <div className="gap-1.5 flex items-center">
          {entry.mood && (
            <span
              role="img"
              aria-label={JOURNAL_MOOD_LABELS[entry.mood]}
              className="text-lg"
            >
              {JOURNAL_MOOD_EMOJI[entry.mood]}
            </span>
          )}
          <span className="font-semibold text-body-sm text-foreground">
            {new Date(`${entry.date}T00:00:00`).toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={`More actions for the entry on ${entry.date}`}
              className="size-8 flex shrink-0 items-center justify-center rounded-md text-foreground-tertiary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <MoreVertical aria-hidden="true" className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => onEdit(entry)}>
              <Pencil aria-hidden="true" className="size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem destructive onSelect={() => setConfirmOpen(true)}>
              <Trash2 aria-hidden="true" className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <p className="line-clamp-4 text-body-sm text-foreground-secondary">
        {entry.content}
      </p>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this entry?"
        description="This can't be undone."
        confirmLabel="Delete"
        destructive
        loading={deleteEntry.isPending}
        onConfirm={handleDelete}
      />
    </Card>
  );
}

import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDeleteNote } from '@/features/notes/hooks/useNotes';
import type { Note, NoteFolder } from '@/features/notes/types';
import { parseTags } from '@/features/notes/utils';
import { useToast } from '@/hooks/useToast';

const FOLDER_LABELS: Record<NoteFolder, string> = {
  general: 'General',
  work: 'Work',
  personal: 'Personal',
  ideas: 'Ideas',
  reference: 'Reference',
};

export interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
}

export function NoteCard({ note, onEdit }: NoteCardProps) {
  const deleteNote = useDeleteNote();
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const tags = parseTags(note.tags);

  const handleDelete = async () => {
    await deleteNote.mutateAsync(note.id);
    setConfirmOpen(false);
    toast({ variant: 'success', title: 'Note deleted' });
  };

  return (
    <Card className="min-w-0 gap-2 p-4 flex flex-col">
      <div className="gap-2 flex items-start justify-between">
        <div className="min-w-0 gap-1 flex flex-col">
          <Badge variant="neutral" className="w-fit">
            {FOLDER_LABELS[note.folder]}
          </Badge>
          <h3 className="font-semibold truncate text-body-sm text-foreground">
            {note.title}
          </h3>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={`More actions for ${note.title}`}
              className="size-8 flex shrink-0 items-center justify-center rounded-md text-foreground-tertiary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <MoreVertical aria-hidden="true" className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => onEdit(note)}>
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

      {note.content && (
        <p className="line-clamp-3 text-body-sm text-foreground-secondary">
          {note.content}
        </p>
      )}

      {tags.length > 0 && (
        <div className="gap-1.5 flex flex-wrap">
          {tags.map((tag) => (
            <Badge key={tag} variant="brand">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this note?"
        description={`"${note.title}" will be removed. This can't be undone.`}
        confirmLabel="Delete"
        destructive
        loading={deleteNote.isPending}
        onConfirm={handleDelete}
      />
    </Card>
  );
}

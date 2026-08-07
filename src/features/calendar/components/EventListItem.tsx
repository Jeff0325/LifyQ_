import { Clock, MapPin, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDeleteEvent } from '@/features/calendar/hooks/useEvents';
import type { CalendarEvent } from '@/features/calendar/types';
import { formatTimeRange } from '@/features/calendar/utils';
import { useToast } from '@/hooks/useToast';

export interface EventListItemProps {
  event: CalendarEvent;
  onEdit: (event: CalendarEvent) => void;
}

export function EventListItem({ event, onEdit }: EventListItemProps) {
  const deleteEvent = useDeleteEvent();
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDelete = async () => {
    await deleteEvent.mutateAsync(event.id);
    setConfirmOpen(false);
    toast({ variant: 'success', title: 'Event deleted' });
  };

  return (
    <>
      <div className="gap-3 py-3 flex items-start border-b border-border-subtle">
        <div
          className="mt-1.5 size-2 shrink-0 rounded-full bg-brand-600"
          aria-hidden="true"
        />
        <button
          type="button"
          onClick={() => onEdit(event)}
          className="min-w-0 flex-1 text-left"
        >
          <p className="font-medium text-body-sm text-foreground">
            {event.title}
          </p>
          <div className="mt-1 gap-3 flex flex-wrap items-center text-caption text-foreground-tertiary">
            <span className="gap-1 inline-flex items-center">
              <Clock aria-hidden="true" className="size-3.5" />
              {formatTimeRange(event)}
            </span>
            {event.location && (
              <span className="gap-1 inline-flex items-center">
                <MapPin aria-hidden="true" className="size-3.5" />
                {event.location}
              </span>
            )}
          </div>
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={`More actions for ${event.title}`}
              className="size-8 flex shrink-0 items-center justify-center rounded-md text-foreground-tertiary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <MoreVertical aria-hidden="true" className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => onEdit(event)}>
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

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this event?"
        description={`"${event.title}" will be removed. This can't be undone.`}
        confirmLabel="Delete"
        destructive
        loading={deleteEvent.isPending}
        onConfirm={handleDelete}
      />
    </>
  );
}

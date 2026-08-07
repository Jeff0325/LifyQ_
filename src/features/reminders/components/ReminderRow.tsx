import { Check, MoreVertical, Pencil, Repeat, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  useDeleteReminder,
  useToggleReminderCompleted,
} from '@/features/reminders/hooks/useReminders';
import {
  REMINDER_RECURRENCE_LABELS,
  type Reminder,
} from '@/features/reminders/types';
import { useToast } from '@/hooks/useToast';
import { todayIso } from '@/lib/date';
import { cn } from '@/lib/utils';

export interface ReminderRowProps {
  reminder: Reminder;
  onEdit: (reminder: Reminder) => void;
}

export function ReminderRow({ reminder, onEdit }: ReminderRowProps) {
  const toggleCompleted = useToggleReminderCompleted();
  const deleteReminder = useDeleteReminder();
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const done = reminder.completed;
  const overdue = !done && reminder.remindAt < todayIso();

  const handleDelete = async () => {
    await deleteReminder.mutateAsync(reminder.id);
    setConfirmOpen(false);
    toast({ variant: 'success', title: 'Reminder deleted' });
  };

  return (
    <div className="gap-3 px-1 py-3 flex items-center border-b border-border-subtle bg-surface">
      <button
        type="button"
        onClick={() => toggleCompleted.mutate({ reminder })}
        aria-pressed={done}
        aria-label={
          done
            ? `Mark ${reminder.title} as not done`
            : `Mark ${reminder.title} as done`
        }
        className={cn(
          'size-8 duration-base ease-standard flex shrink-0 items-center justify-center rounded-full border transition-colors',
          done
            ? 'border-success bg-success text-foreground-on-brand'
            : 'border-border text-foreground-tertiary hover:border-success hover:text-success',
        )}
      >
        <Check aria-hidden="true" className="size-4" />
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'text-body-sm text-foreground',
            done && 'text-foreground-tertiary line-through',
          )}
        >
          {reminder.title}
        </p>
        <div className="mt-1 gap-2 flex flex-wrap items-center">
          <span
            className={cn(
              'text-caption',
              overdue ? 'text-danger' : 'text-foreground-tertiary',
            )}
          >
            {new Date(`${reminder.remindAt}T00:00:00`).toLocaleDateString(
              undefined,
              { month: 'short', day: 'numeric' },
            )}
          </span>
          {reminder.recurring !== 'none' && (
            <span className="gap-1 inline-flex items-center text-caption text-foreground-tertiary">
              <Repeat aria-hidden="true" className="size-3" />
              {REMINDER_RECURRENCE_LABELS[reminder.recurring]}
            </span>
          )}
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`More actions for ${reminder.title}`}
            className="size-8 flex shrink-0 items-center justify-center rounded-md text-foreground-tertiary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <MoreVertical aria-hidden="true" className="size-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => onEdit(reminder)}>
            <Pencil aria-hidden="true" className="size-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem destructive onSelect={() => setConfirmOpen(true)}>
            <Trash2 aria-hidden="true" className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this reminder?"
        description={`"${reminder.title}" will be removed. This can't be undone.`}
        confirmLabel="Delete"
        destructive
        loading={deleteReminder.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}

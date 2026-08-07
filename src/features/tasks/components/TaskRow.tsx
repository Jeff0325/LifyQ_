import { Calendar, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Swipeable } from '@/components/shared/Swipeable';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  useDeleteTask,
  useToggleTaskStatus,
} from '@/features/tasks/hooks/useTasks';
import type { Task, TaskPriority } from '@/features/tasks/types';
import { describeDueDate } from '@/features/tasks/utils';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';

const PRIORITY_BADGE: Record<
  TaskPriority,
  { label: string; variant: 'danger' | 'warning' | 'info' | 'neutral' } | null
> = {
  high: { label: 'High', variant: 'danger' },
  medium: { label: 'Medium', variant: 'warning' },
  low: { label: 'Low', variant: 'info' },
  none: null,
};

const DUE_TONE_CLASS: Record<string, string> = {
  overdue: 'text-danger',
  today: 'text-brand-600',
  soon: 'text-foreground-secondary',
  later: 'text-foreground-tertiary',
};

export interface TaskRowProps {
  task: Task;
  onEdit: (task: Task) => void;
}

/** A single task — checkbox to complete, swipe-to-delete (with a non-gesture overflow-menu equivalent per docs/28 §6), tap to edit. */
export function TaskRow({ task, onEdit }: TaskRowProps) {
  const toggleStatus = useToggleTaskStatus();
  const deleteTask = useDeleteTask();
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const done = task.status === 'done';
  const due = describeDueDate(task.dueDate);
  const priorityBadge = PRIORITY_BADGE[task.priority];

  const handleDelete = async () => {
    await deleteTask.mutateAsync(task.id);
    setConfirmOpen(false);
    toast({ variant: 'success', title: 'Task deleted' });
  };

  return (
    <>
      <Swipeable
        rightAction={
          <div className="px-5 flex h-full items-center bg-danger text-foreground-on-brand">
            <Trash2 aria-hidden="true" className="size-5" />
          </div>
        }
        onSwipeLeft={() => setConfirmOpen(true)}
      >
        <div className="gap-3 px-1 py-3 flex items-start border-b border-border-subtle bg-surface">
          <Checkbox
            checked={done}
            onCheckedChange={() => toggleStatus.mutate({ task })}
            aria-label={done ? 'Mark as not done' : 'Mark as done'}
            className="mt-0.5"
          />
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="min-w-0 flex-1 text-left"
          >
            <p
              className={cn(
                'text-body-sm text-foreground',
                done && 'text-foreground-tertiary line-through',
              )}
            >
              {task.title}
            </p>
            <div className="mt-1 gap-2 flex flex-wrap items-center">
              {priorityBadge && !done && (
                <Badge variant={priorityBadge.variant}>
                  {priorityBadge.label}
                </Badge>
              )}
              {task.dueDate && (
                <span
                  className={cn(
                    'gap-1 inline-flex items-center text-caption',
                    done
                      ? 'text-foreground-tertiary'
                      : DUE_TONE_CLASS[due.tone],
                  )}
                >
                  <Calendar aria-hidden="true" className="size-3.5" />
                  {due.label}
                </span>
              )}
            </div>
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label={`More actions for ${task.title}`}
                className="size-8 flex shrink-0 items-center justify-center rounded-md text-foreground-tertiary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <MoreVertical aria-hidden="true" className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => onEdit(task)}>
                <Pencil aria-hidden="true" className="size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                destructive
                onSelect={() => setConfirmOpen(true)}
              >
                <Trash2 aria-hidden="true" className="size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Swipeable>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this task?"
        description={`"${task.title}" will be removed. This can't be undone.`}
        confirmLabel="Delete"
        destructive
        loading={deleteTask.isPending}
        onConfirm={handleDelete}
      />
    </>
  );
}

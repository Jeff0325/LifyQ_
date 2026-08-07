import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { ResponsiveFormSheet } from '@/components/shared/ResponsiveFormSheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { LowConfidenceNotice } from '@/features/assistant/components/LowConfidenceNotice';
import { useCreateTask, useUpdateTask } from '@/features/tasks/hooks/useTasks';
import {
  TASK_CATEGORIES,
  TASK_PRIORITIES,
  type Task,
  type TaskFormValues,
  taskFormSchema,
} from '@/features/tasks/types';
import { useToast } from '@/hooks/useToast';

const CATEGORY_LABELS: Record<(typeof TASK_CATEGORIES)[number], string> = {
  work: 'Work',
  personal: 'Personal',
  health: 'Health',
  learning: 'Learning',
  errands: 'Errands',
  other: 'Other',
};

const PRIORITY_LABELS: Record<(typeof TASK_PRIORITIES)[number], string> = {
  none: 'None',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

const TASK_FIELD_LABELS: Record<string, string> = {
  title: 'title',
  status: 'status',
  priority: 'priority',
  category: 'category',
  dueDate: 'due date',
};

const DEFAULT_VALUES: TaskFormValues = {
  title: '',
  notes: '',
  status: 'todo',
  priority: 'medium',
  category: 'work',
  dueDate: '',
};

export interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present → editing; absent → creating. */
  task?: Task;
  /** Pre-fills a fresh (non-editing) form — the ICE confirm-before-save seam, docs/34_AI_Architecture.md §3. Ignored when editing an existing task. */
  initialValues?: Partial<TaskFormValues>;
  /** Overrides the default description — e.g. "Jarvis understood this as a task." */
  description?: string;
  /** Field names worth a second look before saving — docs/35_Intelligent_Capture_Engine_Spec.md §7. */
  lowConfidenceFields?: Set<string>;
  /** Called with a short label after a successful save — lets Jarvis close
   * the loop conversationally ("Done — I've added X"). */
  onSaved?: (label: string) => void;
}

/** Create/edit form for a Task — shared shell (`ResponsiveFormSheet`), RHF + Zod validation. */
export function TaskFormDialog({
  open,
  onOpenChange,
  task,
  initialValues,
  description,
  lowConfidenceFields,
  onSaved,
}: TaskFormDialogProps) {
  const isEditing = !!task;
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const { toast } = useToast();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (open) {
      reset(
        task
          ? {
              title: task.title,
              notes: task.notes ?? '',
              status: task.status,
              priority: task.priority,
              category: task.category,
              dueDate: task.dueDate ?? '',
            }
          : initialValues
            ? { ...DEFAULT_VALUES, ...initialValues }
            : DEFAULT_VALUES,
      );
    }
  }, [open, task, initialValues, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (isEditing) {
        await updateTask.mutateAsync({ id: task.id, input: values });
        toast({ variant: 'success', title: 'Task updated' });
      } else {
        await createTask.mutateAsync(values);
        toast({ variant: 'success', title: 'Task created' });
      }
      onSaved?.(values.title);
      onOpenChange(false);
    } catch {
      toast({
        variant: 'danger',
        title: isEditing ? "Couldn't update task" : "Couldn't create task",
        description: 'Please try again.',
      });
    }
  });

  return (
    <ResponsiveFormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Edit task' : 'New task'}
      description={
        description ??
        (isEditing ? undefined : 'Quick to capture, easy to plan around.')
      }
      footer={
        <>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" form="task-form" disabled={isSubmitting}>
            {isEditing ? 'Save changes' : 'Create task'}
          </Button>
        </>
      }
    >
      <form id="task-form" onSubmit={onSubmit} className="gap-4 flex flex-col">
        <LowConfidenceNotice
          fields={lowConfidenceFields}
          labels={TASK_FIELD_LABELS}
        />

        <div className="gap-1.5 flex flex-col">
          <Label htmlFor="task-title">Title</Label>
          <Input
            id="task-title"
            placeholder="Call dentist tomorrow 3pm"
            aria-invalid={!!errors.title}
            {...register('title')}
          />
          {errors.title && (
            <p className="text-caption text-danger">{errors.title.message}</p>
          )}
        </div>

        <div className="gap-1.5 flex flex-col">
          <Label htmlFor="task-notes">Notes</Label>
          <Textarea
            id="task-notes"
            placeholder="Add a description…"
            rows={3}
            {...register('notes')}
          />
        </div>

        <div className="gap-4 grid grid-cols-2">
          <div className="gap-1.5 flex flex-col">
            <Label htmlFor="task-priority">Priority</Label>
            <Controller
              control={control}
              name="priority"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="task-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_PRIORITIES.map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {PRIORITY_LABELS[priority]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="gap-1.5 flex flex-col">
            <Label htmlFor="task-category">Category</Label>
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="task-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {CATEGORY_LABELS[category]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        <div className="gap-1.5 flex flex-col">
          <Label htmlFor="task-due-date">Due date</Label>
          <Input id="task-due-date" type="date" {...register('dueDate')} />
        </div>
      </form>
    </ResponsiveFormSheet>
  );
}

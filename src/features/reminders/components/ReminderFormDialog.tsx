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
import { LowConfidenceNotice } from '@/features/assistant/components/LowConfidenceNotice';
import {
  useCreateReminder,
  useUpdateReminder,
} from '@/features/reminders/hooks/useReminders';
import {
  REMINDER_RECURRENCE_LABELS,
  REMINDER_RECURRENCES,
  type Reminder,
  type ReminderFormValues,
  reminderFormSchema,
} from '@/features/reminders/types';
import { useToast } from '@/hooks/useToast';

const REMINDER_FIELD_LABELS: Record<string, string> = {
  title: 'title',
  remindAt: 'date',
  recurring: 'repeat',
};

const DEFAULT_VALUES: ReminderFormValues = {
  title: '',
  remindAt: '',
  recurring: 'none',
  notes: '',
};

export interface ReminderFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reminder?: Reminder;
  /** Pre-fills a fresh (non-editing) form — the ICE confirm-before-save seam, docs/34_AI_Architecture.md §3. */
  initialValues?: Partial<ReminderFormValues>;
  description?: string;
  lowConfidenceFields?: Set<string>;
  onSaved?: (label: string) => void;
}

export function ReminderFormDialog({
  open,
  onOpenChange,
  reminder,
  initialValues,
  description,
  lowConfidenceFields,
  onSaved,
}: ReminderFormDialogProps) {
  const isEditing = !!reminder;
  const createReminder = useCreateReminder();
  const updateReminder = useUpdateReminder();
  const { toast } = useToast();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReminderFormValues>({
    resolver: zodResolver(reminderFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (open) {
      reset(
        reminder
          ? {
              title: reminder.title,
              remindAt: reminder.remindAt,
              recurring: reminder.recurring,
              notes: reminder.notes ?? '',
            }
          : initialValues
            ? { ...DEFAULT_VALUES, ...initialValues }
            : DEFAULT_VALUES,
      );
    }
  }, [open, reminder, initialValues, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (isEditing) {
        await updateReminder.mutateAsync({ id: reminder.id, input: values });
        toast({ variant: 'success', title: 'Reminder updated' });
      } else {
        await createReminder.mutateAsync(values);
        toast({ variant: 'success', title: 'Reminder created' });
      }
      onSaved?.(values.title);
      onOpenChange(false);
    } catch {
      toast({
        variant: 'danger',
        title: isEditing
          ? "Couldn't update reminder"
          : "Couldn't create reminder",
        description: 'Please try again.',
      });
    }
  });

  return (
    <ResponsiveFormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Edit reminder' : 'New reminder'}
      description={
        description ??
        (isEditing
          ? undefined
          : 'A lightweight nudge, standalone from any task or habit.')
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
          <Button type="submit" form="reminder-form" disabled={isSubmitting}>
            {isEditing ? 'Save changes' : 'Create reminder'}
          </Button>
        </>
      }
    >
      <form
        id="reminder-form"
        onSubmit={onSubmit}
        className="gap-4 flex flex-col"
      >
        <LowConfidenceNotice
          fields={lowConfidenceFields}
          labels={REMINDER_FIELD_LABELS}
        />

        <div className="gap-1.5 flex flex-col">
          <Label htmlFor="reminder-title">Title</Label>
          <Input
            id="reminder-title"
            placeholder="Call the vet"
            aria-invalid={!!errors.title}
            {...register('title')}
          />
          {errors.title && (
            <p className="text-caption text-danger">{errors.title.message}</p>
          )}
        </div>

        <div className="gap-4 grid grid-cols-2">
          <div className="gap-1.5 flex flex-col">
            <Label htmlFor="reminder-date">Remind me on</Label>
            <Input
              id="reminder-date"
              type="date"
              aria-invalid={!!errors.remindAt}
              {...register('remindAt')}
            />
            {errors.remindAt && (
              <p className="text-caption text-danger">
                {errors.remindAt.message}
              </p>
            )}
          </div>
          <div className="gap-1.5 flex flex-col">
            <Label htmlFor="reminder-recurring">Repeat</Label>
            <Controller
              control={control}
              name="recurring"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="reminder-recurring">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REMINDER_RECURRENCES.map((recurrence) => (
                      <SelectItem key={recurrence} value={recurrence}>
                        {REMINDER_RECURRENCE_LABELS[recurrence]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        <div className="gap-1.5 flex flex-col">
          <Label htmlFor="reminder-notes">Notes</Label>
          <Input id="reminder-notes" {...register('notes')} />
        </div>
      </form>
    </ResponsiveFormSheet>
  );
}

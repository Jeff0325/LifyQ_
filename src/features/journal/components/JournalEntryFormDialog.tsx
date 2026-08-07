import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { ResponsiveFormSheet } from '@/components/shared/ResponsiveFormSheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  useCreateJournalEntry,
  useUpdateJournalEntry,
} from '@/features/journal/hooks/useJournal';
import {
  JOURNAL_MOOD_EMOJI,
  JOURNAL_MOOD_LABELS,
  JOURNAL_MOODS,
  type JournalEntry,
  type JournalEntryFormValues,
  journalEntryFormSchema,
} from '@/features/journal/types';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';
import { todayIso } from '@/lib/date';

const DEFAULT_VALUES: JournalEntryFormValues = {
  date: todayIso(),
  content: '',
  mood: undefined,
};

export interface JournalEntryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry?: JournalEntry;
}

export function JournalEntryFormDialog({
  open,
  onOpenChange,
  entry,
}: JournalEntryFormDialogProps) {
  const isEditing = !!entry;
  const createEntry = useCreateJournalEntry();
  const updateEntry = useUpdateJournalEntry();
  const { toast } = useToast();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<JournalEntryFormValues>({
    resolver: zodResolver(journalEntryFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (open) {
      reset(
        entry
          ? { date: entry.date, content: entry.content, mood: entry.mood }
          : DEFAULT_VALUES,
      );
    }
  }, [open, entry, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (isEditing) {
        await updateEntry.mutateAsync({ id: entry.id, input: values });
        toast({ variant: 'success', title: 'Entry updated' });
      } else {
        await createEntry.mutateAsync(values);
        toast({ variant: 'success', title: 'Entry saved' });
      }
      onOpenChange(false);
    } catch {
      toast({
        variant: 'danger',
        title: isEditing ? "Couldn't update entry" : "Couldn't save entry",
        description: 'Please try again.',
      });
    }
  });

  return (
    <ResponsiveFormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Edit entry' : 'New journal entry'}
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
          <Button
            type="submit"
            form="journal-entry-form"
            disabled={isSubmitting}
          >
            {isEditing ? 'Save changes' : 'Save entry'}
          </Button>
        </>
      }
    >
      <form
        id="journal-entry-form"
        onSubmit={onSubmit}
        className="gap-4 flex flex-col"
      >
        <div className="gap-1.5 flex flex-col">
          <Label htmlFor="journal-date">Date</Label>
          <Input
            id="journal-date"
            type="date"
            aria-invalid={!!errors.date}
            {...register('date')}
          />
          {errors.date && (
            <p className="text-caption text-danger">{errors.date.message}</p>
          )}
        </div>

        <div className="gap-1.5 flex flex-col">
          <Label>Mood</Label>
          <Controller
            control={control}
            name="mood"
            render={({ field }) => (
              <div className="gap-2 flex" role="radiogroup" aria-label="Mood">
                {JOURNAL_MOODS.map((mood) => {
                  const selected = field.value === mood;
                  return (
                    <button
                      key={mood}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      aria-label={JOURNAL_MOOD_LABELS[mood]}
                      onClick={() =>
                        field.onChange(selected ? undefined : mood)
                      }
                      className={cn(
                        'size-10 duration-base ease-standard text-lg flex items-center justify-center rounded-full border transition-colors',
                        selected
                          ? 'border-brand-600 bg-brand-50 dark:bg-brand-950'
                          : 'border-border hover:bg-surface-raised',
                      )}
                    >
                      {JOURNAL_MOOD_EMOJI[mood]}
                    </button>
                  );
                })}
              </div>
            )}
          />
        </div>

        <div className="gap-1.5 flex flex-col">
          <Label htmlFor="journal-content">What's on your mind?</Label>
          <Textarea
            id="journal-content"
            rows={6}
            aria-invalid={!!errors.content}
            {...register('content')}
          />
          {errors.content && (
            <p className="text-caption text-danger">{errors.content.message}</p>
          )}
        </div>
      </form>
    </ResponsiveFormSheet>
  );
}

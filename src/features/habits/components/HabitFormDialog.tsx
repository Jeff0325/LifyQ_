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
import {
  useCreateHabit,
  useUpdateHabit,
} from '@/features/habits/hooks/useHabits';
import {
  HABIT_FREQUENCIES,
  type Habit,
  type HabitFormValues,
  habitFormSchema,
} from '@/features/habits/types';
import { useToast } from '@/hooks/useToast';

const FREQUENCY_LABELS: Record<(typeof HABIT_FREQUENCIES)[number], string> = {
  daily: 'Every day',
  weekdays: 'Weekdays',
  weekly: 'Once a week',
};

const DEFAULT_VALUES: HabitFormValues = {
  title: '',
  frequency: 'daily',
  reminderTime: '',
};

export interface HabitFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habit?: Habit;
}

export function HabitFormDialog({
  open,
  onOpenChange,
  habit,
}: HabitFormDialogProps) {
  const isEditing = !!habit;
  const createHabit = useCreateHabit();
  const updateHabit = useUpdateHabit();
  const { toast } = useToast();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<HabitFormValues>({
    resolver: zodResolver(habitFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (open) {
      reset(
        habit
          ? {
              title: habit.title,
              frequency: habit.frequency,
              reminderTime: habit.reminderTime ?? '',
            }
          : DEFAULT_VALUES,
      );
    }
  }, [open, habit, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (isEditing) {
        await updateHabit.mutateAsync({ id: habit.id, input: values });
        toast({ variant: 'success', title: 'Habit updated' });
      } else {
        await createHabit.mutateAsync(values);
        toast({ variant: 'success', title: 'Habit created' });
      }
      onOpenChange(false);
    } catch {
      toast({
        variant: 'danger',
        title: isEditing ? "Couldn't update habit" : "Couldn't create habit",
        description: 'Please try again.',
      });
    }
  });

  return (
    <ResponsiveFormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Edit habit' : 'New habit'}
      description={
        isEditing ? undefined : 'A small, repeatable action worth tracking.'
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
          <Button type="submit" form="habit-form" disabled={isSubmitting}>
            {isEditing ? 'Save changes' : 'Create habit'}
          </Button>
        </>
      }
    >
      <form id="habit-form" onSubmit={onSubmit} className="gap-4 flex flex-col">
        <div className="gap-1.5 flex flex-col">
          <Label htmlFor="habit-title">Title</Label>
          <Input
            id="habit-title"
            placeholder="Morning run"
            aria-invalid={!!errors.title}
            {...register('title')}
          />
          {errors.title && (
            <p className="text-caption text-danger">{errors.title.message}</p>
          )}
        </div>

        <div className="gap-4 grid grid-cols-2">
          <div className="gap-1.5 flex flex-col">
            <Label htmlFor="habit-frequency">Frequency</Label>
            <Controller
              control={control}
              name="frequency"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="habit-frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HABIT_FREQUENCIES.map((frequency) => (
                      <SelectItem key={frequency} value={frequency}>
                        {FREQUENCY_LABELS[frequency]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="gap-1.5 flex flex-col">
            <Label htmlFor="habit-reminder">Reminder time</Label>
            <Input
              id="habit-reminder"
              type="time"
              {...register('reminderTime')}
            />
          </div>
        </div>
      </form>
    </ResponsiveFormSheet>
  );
}

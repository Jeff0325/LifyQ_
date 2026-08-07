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
import { useCreateGoal, useUpdateGoal } from '@/features/goals/hooks/useGoals';
import {
  GOAL_CATEGORIES,
  type Goal,
  type GoalFormValues,
  goalFormSchema,
} from '@/features/goals/types';
import { useToast } from '@/hooks/useToast';

const CATEGORY_LABELS: Record<(typeof GOAL_CATEGORIES)[number], string> = {
  career: 'Career',
  health: 'Health',
  finance: 'Finance',
  personal: 'Personal',
  learning: 'Learning',
  other: 'Other',
};

const DEFAULT_VALUES: GoalFormValues = {
  title: '',
  description: '',
  category: 'personal',
  targetDate: '',
};

export interface GoalFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal?: Goal;
}

export function GoalFormDialog({
  open,
  onOpenChange,
  goal,
}: GoalFormDialogProps) {
  const isEditing = !!goal;
  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();
  const { toast } = useToast();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GoalFormValues>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (open) {
      reset(
        goal
          ? {
              title: goal.title,
              description: goal.description ?? '',
              category: goal.category,
              targetDate: goal.targetDate ?? '',
            }
          : DEFAULT_VALUES,
      );
    }
  }, [open, goal, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (isEditing) {
        await updateGoal.mutateAsync({ id: goal.id, input: values });
        toast({ variant: 'success', title: 'Goal updated' });
      } else {
        await createGoal.mutateAsync(values);
        toast({ variant: 'success', title: 'Goal created' });
      }
      onOpenChange(false);
    } catch {
      toast({
        variant: 'danger',
        title: isEditing ? "Couldn't update goal" : "Couldn't create goal",
        description: 'Please try again.',
      });
    }
  });

  return (
    <ResponsiveFormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Edit goal' : 'New goal'}
      description={
        isEditing ? undefined : 'What outcome are you working toward?'
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
          <Button type="submit" form="goal-form" disabled={isSubmitting}>
            {isEditing ? 'Save changes' : 'Create goal'}
          </Button>
        </>
      }
    >
      <form id="goal-form" onSubmit={onSubmit} className="gap-4 flex flex-col">
        <div className="gap-1.5 flex flex-col">
          <Label htmlFor="goal-title">Title</Label>
          <Input
            id="goal-title"
            placeholder="Run a half-marathon"
            aria-invalid={!!errors.title}
            {...register('title')}
          />
          {errors.title && (
            <p className="text-caption text-danger">{errors.title.message}</p>
          )}
        </div>

        <div className="gap-1.5 flex flex-col">
          <Label htmlFor="goal-description">Description</Label>
          <Textarea
            id="goal-description"
            rows={3}
            {...register('description')}
          />
        </div>

        <div className="gap-4 grid grid-cols-2">
          <div className="gap-1.5 flex flex-col">
            <Label htmlFor="goal-category">Category</Label>
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="goal-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GOAL_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {CATEGORY_LABELS[category]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="gap-1.5 flex flex-col">
            <Label htmlFor="goal-target-date">Target date</Label>
            <Input
              id="goal-target-date"
              type="date"
              {...register('targetDate')}
            />
          </div>
        </div>
      </form>
    </ResponsiveFormSheet>
  );
}

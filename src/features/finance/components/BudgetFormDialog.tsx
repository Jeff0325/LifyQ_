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
  useCreateBudget,
  useUpdateBudget,
} from '@/features/finance/hooks/useFinance';
import {
  BUDGET_PERIODS,
  TRANSACTION_CATEGORIES,
  TRANSACTION_CATEGORY_LABELS,
  type Budget,
  type BudgetFormValues,
  budgetFormSchema,
} from '@/features/finance/types';
import { useToast } from '@/hooks/useToast';

const PERIOD_LABELS: Record<(typeof BUDGET_PERIODS)[number], string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
};

const DEFAULT_VALUES: BudgetFormValues = {
  category: 'groceries',
  limit: 0,
  period: 'monthly',
};

export interface BudgetFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budget?: Budget;
}

export function BudgetFormDialog({
  open,
  onOpenChange,
  budget,
}: BudgetFormDialogProps) {
  const isEditing = !!budget;
  const createBudget = useCreateBudget();
  const updateBudget = useUpdateBudget();
  const { toast } = useToast();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (open) {
      reset(
        budget
          ? {
              category: budget.category,
              limit: budget.limit,
              period: budget.period,
            }
          : DEFAULT_VALUES,
      );
    }
  }, [open, budget, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (isEditing) {
        await updateBudget.mutateAsync({ id: budget.id, input: values });
        toast({ variant: 'success', title: 'Budget updated' });
      } else {
        await createBudget.mutateAsync(values);
        toast({ variant: 'success', title: 'Budget created' });
      }
      onOpenChange(false);
    } catch {
      toast({
        variant: 'danger',
        title: isEditing ? "Couldn't update budget" : "Couldn't create budget",
        description: 'Please try again.',
      });
    }
  });

  return (
    <ResponsiveFormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Edit budget' : 'New budget'}
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
          <Button type="submit" form="budget-form" disabled={isSubmitting}>
            {isEditing ? 'Save changes' : 'Create budget'}
          </Button>
        </>
      }
    >
      <form
        id="budget-form"
        onSubmit={onSubmit}
        className="gap-4 flex flex-col"
      >
        <div className="gap-1.5 flex flex-col">
          <Label htmlFor="budget-category">Category</Label>
          <Controller
            control={control}
            name="category"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="budget-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRANSACTION_CATEGORIES.filter((c) => c !== 'income').map(
                    (category) => (
                      <SelectItem key={category} value={category}>
                        {TRANSACTION_CATEGORY_LABELS[category]}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="gap-4 grid grid-cols-2">
          <div className="gap-1.5 flex flex-col">
            <Label htmlFor="budget-limit">Limit</Label>
            <Input
              id="budget-limit"
              type="number"
              step="0.01"
              aria-invalid={!!errors.limit}
              {...register('limit', { valueAsNumber: true })}
            />
            {errors.limit && (
              <p className="text-caption text-danger">{errors.limit.message}</p>
            )}
          </div>
          <div className="gap-1.5 flex flex-col">
            <Label htmlFor="budget-period">Period</Label>
            <Controller
              control={control}
              name="period"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="budget-period">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BUDGET_PERIODS.map((period) => (
                      <SelectItem key={period} value={period}>
                        {PERIOD_LABELS[period]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
      </form>
    </ResponsiveFormSheet>
  );
}

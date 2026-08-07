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
import { useCreateBill, useUpdateBill } from '@/features/bills/hooks/useBills';
import {
  BILL_CATEGORIES,
  BILL_CATEGORY_LABELS,
  BILL_RECURRENCES,
  type Bill,
  type BillFormValues,
  billFormSchema,
} from '@/features/bills/types';
import { useToast } from '@/hooks/useToast';

const RECURRENCE_LABELS: Record<(typeof BILL_RECURRENCES)[number], string> = {
  one_time: 'One-time',
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
};

const BILL_FIELD_LABELS: Record<string, string> = {
  title: 'title',
  category: 'category',
  amount: 'amount',
  dueDate: 'due date',
  recurrence: 'recurrence',
};

const DEFAULT_VALUES: BillFormValues = {
  title: '',
  category: 'other',
  amount: undefined,
  dueDate: '',
  recurrence: 'monthly',
};

export interface BillFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bill?: Bill;
  /** Pre-fills a fresh (non-editing) form — the ICE confirm-before-save seam, docs/34_AI_Architecture.md §3. */
  initialValues?: Partial<BillFormValues>;
  description?: string;
  lowConfidenceFields?: Set<string>;
  onSaved?: (label: string) => void;
}

export function BillFormDialog({
  open,
  onOpenChange,
  bill,
  initialValues,
  description,
  lowConfidenceFields,
  onSaved,
}: BillFormDialogProps) {
  const isEditing = !!bill;
  const createBill = useCreateBill();
  const updateBill = useUpdateBill();
  const { toast } = useToast();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BillFormValues>({
    resolver: zodResolver(billFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (open) {
      reset(
        bill
          ? {
              title: bill.title,
              category: bill.category,
              amount: bill.amount,
              dueDate: bill.dueDate,
              recurrence: bill.recurrence,
            }
          : initialValues
            ? { ...DEFAULT_VALUES, ...initialValues }
            : DEFAULT_VALUES,
      );
    }
  }, [open, bill, initialValues, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (isEditing) {
        await updateBill.mutateAsync({ id: bill.id, input: values });
        toast({ variant: 'success', title: 'Bill updated' });
      } else {
        await createBill.mutateAsync(values);
        toast({ variant: 'success', title: 'Bill added' });
      }
      onSaved?.(values.title);
      onOpenChange(false);
    } catch {
      toast({
        variant: 'danger',
        title: isEditing ? "Couldn't update bill" : "Couldn't add bill",
        description: 'Please try again.',
      });
    }
  });

  return (
    <ResponsiveFormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Edit bill' : 'New bill'}
      description={description}
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
          <Button type="submit" form="bill-form" disabled={isSubmitting}>
            {isEditing ? 'Save changes' : 'Add bill'}
          </Button>
        </>
      }
    >
      <form id="bill-form" onSubmit={onSubmit} className="gap-4 flex flex-col">
        <LowConfidenceNotice
          fields={lowConfidenceFields}
          labels={BILL_FIELD_LABELS}
        />

        <div className="gap-1.5 flex flex-col">
          <Label htmlFor="bill-title">Title</Label>
          <Input
            id="bill-title"
            placeholder="Electricity"
            aria-invalid={!!errors.title}
            {...register('title')}
          />
          {errors.title && (
            <p className="text-caption text-danger">{errors.title.message}</p>
          )}
        </div>

        <div className="gap-4 grid grid-cols-2">
          <div className="gap-1.5 flex flex-col">
            <Label htmlFor="bill-category">Category</Label>
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="bill-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BILL_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {BILL_CATEGORY_LABELS[category]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="gap-1.5 flex flex-col">
            <Label htmlFor="bill-amount">Amount</Label>
            <Input
              id="bill-amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('amount', {
                setValueAs: (v) => (v === '' ? undefined : Number(v)),
              })}
            />
          </div>
        </div>

        <div className="gap-4 grid grid-cols-2">
          <div className="gap-1.5 flex flex-col">
            <Label htmlFor="bill-due">Due date</Label>
            <Input
              id="bill-due"
              type="date"
              aria-invalid={!!errors.dueDate}
              {...register('dueDate')}
            />
            {errors.dueDate && (
              <p className="text-caption text-danger">
                {errors.dueDate.message}
              </p>
            )}
          </div>
          <div className="gap-1.5 flex flex-col">
            <Label htmlFor="bill-recurrence">Recurrence</Label>
            <Controller
              control={control}
              name="recurrence"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="bill-recurrence">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BILL_RECURRENCES.map((recurrence) => (
                      <SelectItem key={recurrence} value={recurrence}>
                        {RECURRENCE_LABELS[recurrence]}
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

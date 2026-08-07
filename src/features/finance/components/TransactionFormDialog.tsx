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
  useCreateTransaction,
  useUpdateTransaction,
} from '@/features/finance/hooks/useFinance';
import {
  TRANSACTION_CATEGORIES,
  TRANSACTION_CATEGORY_LABELS,
  TRANSACTION_TYPES,
  type Transaction,
  type TransactionFormValues,
  transactionFormSchema,
} from '@/features/finance/types';
import { useToast } from '@/hooks/useToast';
import { todayIso } from '@/lib/date';

const TYPE_LABELS: Record<(typeof TRANSACTION_TYPES)[number], string> = {
  income: 'Income',
  expense: 'Expense',
};

const TRANSACTION_FIELD_LABELS: Record<string, string> = {
  amount: 'amount',
  type: 'type',
  category: 'category',
  date: 'date',
};

const DEFAULT_VALUES: TransactionFormValues = {
  amount: 0,
  type: 'expense',
  category: 'other',
  date: todayIso(),
  note: '',
};

export interface TransactionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: Transaction;
  /** Pre-fills a fresh (non-editing) form — the ICE confirm-before-save seam, docs/34_AI_Architecture.md §3. */
  initialValues?: Partial<TransactionFormValues>;
  description?: string;
  lowConfidenceFields?: Set<string>;
  onSaved?: (label: string) => void;
}

export function TransactionFormDialog({
  open,
  onOpenChange,
  transaction,
  initialValues,
  description,
  lowConfidenceFields,
  onSaved,
}: TransactionFormDialogProps) {
  const isEditing = !!transaction;
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
  const { toast } = useToast();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (open) {
      reset(
        transaction
          ? {
              amount: transaction.amount,
              type: transaction.type,
              category: transaction.category,
              date: transaction.date,
              note: transaction.note ?? '',
            }
          : initialValues
            ? { ...DEFAULT_VALUES, ...initialValues }
            : DEFAULT_VALUES,
      );
    }
  }, [open, transaction, initialValues, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (isEditing) {
        await updateTransaction.mutateAsync({
          id: transaction.id,
          input: values,
        });
        toast({ variant: 'success', title: 'Transaction updated' });
      } else {
        await createTransaction.mutateAsync(values);
        toast({ variant: 'success', title: 'Transaction added' });
      }
      onSaved?.(
        values.note || `${TYPE_LABELS[values.type]} of $${values.amount}`,
      );
      onOpenChange(false);
    } catch {
      toast({
        variant: 'danger',
        title: isEditing
          ? "Couldn't update transaction"
          : "Couldn't add transaction",
        description: 'Please try again.',
      });
    }
  });

  return (
    <ResponsiveFormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Edit transaction' : 'New transaction'}
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
          <Button type="submit" form="transaction-form" disabled={isSubmitting}>
            {isEditing ? 'Save changes' : 'Add transaction'}
          </Button>
        </>
      }
    >
      <form
        id="transaction-form"
        onSubmit={onSubmit}
        className="gap-4 flex flex-col"
      >
        <LowConfidenceNotice
          fields={lowConfidenceFields}
          labels={TRANSACTION_FIELD_LABELS}
        />

        <div className="gap-4 grid grid-cols-2">
          <div className="gap-1.5 flex flex-col">
            <Label htmlFor="transaction-amount">Amount</Label>
            <Input
              id="transaction-amount"
              type="number"
              step="0.01"
              aria-invalid={!!errors.amount}
              {...register('amount', { valueAsNumber: true })}
            />
            {errors.amount && (
              <p className="text-caption text-danger">
                {errors.amount.message}
              </p>
            )}
          </div>
          <div className="gap-1.5 flex flex-col">
            <Label htmlFor="transaction-type">Type</Label>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="transaction-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRANSACTION_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {TYPE_LABELS[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        <div className="gap-4 grid grid-cols-2">
          <div className="gap-1.5 flex flex-col">
            <Label htmlFor="transaction-category">Category</Label>
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="transaction-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRANSACTION_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {TRANSACTION_CATEGORY_LABELS[category]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="gap-1.5 flex flex-col">
            <Label htmlFor="transaction-date">Date</Label>
            <Input id="transaction-date" type="date" {...register('date')} />
          </div>
        </div>

        <div className="gap-1.5 flex flex-col">
          <Label htmlFor="transaction-note">Note</Label>
          <Input
            id="transaction-note"
            placeholder="Optional"
            {...register('note')}
          />
        </div>
      </form>
    </ResponsiveFormSheet>
  );
}

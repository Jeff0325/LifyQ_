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
  useCreateLifeRecord,
  useUpdateLifeRecord,
} from '@/features/life-records/hooks/useLifeRecords';
import {
  LIFE_RECORD_CATEGORIES,
  LIFE_RECORD_CATEGORY_LABELS,
  type LifeRecord,
  type LifeRecordFormValues,
  lifeRecordFormSchema,
} from '@/features/life-records/types';
import { useToast } from '@/hooks/useToast';

const DEFAULT_VALUES: LifeRecordFormValues = {
  title: '',
  category: 'other',
  identifier: '',
  issuedAt: '',
  expiresAt: '',
  issuingAuthority: '',
};

export interface LifeRecordFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record?: LifeRecord;
}

export function LifeRecordFormDialog({
  open,
  onOpenChange,
  record,
}: LifeRecordFormDialogProps) {
  const isEditing = !!record;
  const createRecord = useCreateLifeRecord();
  const updateRecord = useUpdateLifeRecord();
  const { toast } = useToast();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LifeRecordFormValues>({
    resolver: zodResolver(lifeRecordFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (open) {
      reset(
        record
          ? {
              title: record.title,
              category: record.category,
              identifier: record.identifier ?? '',
              issuedAt: record.issuedAt ?? '',
              expiresAt: record.expiresAt ?? '',
              issuingAuthority: record.issuingAuthority ?? '',
            }
          : DEFAULT_VALUES,
      );
    }
  }, [open, record, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (isEditing) {
        await updateRecord.mutateAsync({ id: record.id, input: values });
        toast({ variant: 'success', title: 'Record updated' });
      } else {
        await createRecord.mutateAsync(values);
        toast({ variant: 'success', title: 'Record added' });
      }
      onOpenChange(false);
    } catch {
      toast({
        variant: 'danger',
        title: isEditing ? "Couldn't update record" : "Couldn't add record",
        description: 'Please try again.',
      });
    }
  });

  return (
    <ResponsiveFormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Edit record' : 'New life record'}
      description={
        isEditing
          ? undefined
          : 'Passport, license, insurance — anything worth tracking to renewal.'
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
          <Button type="submit" form="life-record-form" disabled={isSubmitting}>
            {isEditing ? 'Save changes' : 'Add record'}
          </Button>
        </>
      }
    >
      <form
        id="life-record-form"
        onSubmit={onSubmit}
        className="gap-4 flex flex-col"
      >
        <div className="gap-1.5 flex flex-col">
          <Label htmlFor="record-title">Title</Label>
          <Input
            id="record-title"
            placeholder="Passport"
            aria-invalid={!!errors.title}
            {...register('title')}
          />
          {errors.title && (
            <p className="text-caption text-danger">{errors.title.message}</p>
          )}
        </div>

        <div className="gap-4 grid grid-cols-2">
          <div className="gap-1.5 flex flex-col">
            <Label htmlFor="record-category">Category</Label>
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="record-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LIFE_RECORD_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {LIFE_RECORD_CATEGORY_LABELS[category]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="gap-1.5 flex flex-col">
            <Label htmlFor="record-identifier">ID / number</Label>
            <Input id="record-identifier" {...register('identifier')} />
          </div>
        </div>

        <div className="gap-4 grid grid-cols-2">
          <div className="gap-1.5 flex flex-col">
            <Label htmlFor="record-issued">Issued</Label>
            <Input id="record-issued" type="date" {...register('issuedAt')} />
          </div>
          <div className="gap-1.5 flex flex-col">
            <Label htmlFor="record-expires">Expires</Label>
            <Input id="record-expires" type="date" {...register('expiresAt')} />
          </div>
        </div>

        <div className="gap-1.5 flex flex-col">
          <Label htmlFor="record-authority">Issuing authority</Label>
          <Input id="record-authority" {...register('issuingAuthority')} />
        </div>
      </form>
    </ResponsiveFormSheet>
  );
}

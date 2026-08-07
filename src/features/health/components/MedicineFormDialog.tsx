import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { ResponsiveFormSheet } from '@/components/shared/ResponsiveFormSheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LowConfidenceNotice } from '@/features/assistant/components/LowConfidenceNotice';
import {
  useCreateMedicine,
  useUpdateMedicine,
} from '@/features/health/hooks/useHealth';
import {
  type Medicine,
  type MedicineFormValues,
  medicineFormSchema,
} from '@/features/health/types';
import { useToast } from '@/hooks/useToast';

const MEDICINE_FIELD_LABELS: Record<string, string> = {
  name: 'name',
  expiresAt: 'expiry date',
};

const DEFAULT_VALUES: MedicineFormValues = {
  name: '',
  dosage: '',
  prescribedBy: '',
  expiresAt: '',
  refillReminderAt: '',
};

export interface MedicineFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present → editing; absent → creating. */
  medicine?: Medicine;
  /** Pre-fills a fresh (non-editing) form — the ICE confirm-before-save seam, docs/34_AI_Architecture.md §3. Also how ICE's fuzzy-matched "update" proposals (e.g. "took my vitamin D") pre-fill an edit of an existing medicine. */
  initialValues?: Partial<MedicineFormValues>;
  description?: string;
  lowConfidenceFields?: Set<string>;
  onSaved?: (label: string) => void;
}

/**
 * Extracted from `MedicinesSection.tsx` (was inline) so ICE has a
 * single-entity dialog to delegate to, matching every other domain's
 * FormDialog pattern — see docs/34_AI_Architecture.md §3.
 */
export function MedicineFormDialog({
  open,
  onOpenChange,
  medicine,
  initialValues,
  description,
  lowConfidenceFields,
  onSaved,
}: MedicineFormDialogProps) {
  const isEditing = !!medicine;
  const createMedicine = useCreateMedicine();
  const updateMedicine = useUpdateMedicine();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MedicineFormValues>({
    resolver: zodResolver(medicineFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (open) {
      reset(
        medicine
          ? {
              name: medicine.name,
              dosage: medicine.dosage ?? '',
              prescribedBy: medicine.prescribedBy ?? '',
              expiresAt: medicine.expiresAt ?? '',
              refillReminderAt: medicine.refillReminderAt ?? '',
              // Lets ICE's fuzzy-matched "update" proposals (docs/35 §5)
              // override specific fields on top of the matched medicine's
              // own values — e.g. a new expiry date recognized in the
              // capture text — while still editing that exact medicine.
              ...initialValues,
            }
          : initialValues
            ? { ...DEFAULT_VALUES, ...initialValues }
            : DEFAULT_VALUES,
      );
    }
  }, [open, medicine, initialValues, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (isEditing) {
        await updateMedicine.mutateAsync({ id: medicine.id, input: values });
        toast({ variant: 'success', title: 'Medicine updated' });
      } else {
        await createMedicine.mutateAsync(values);
        toast({ variant: 'success', title: 'Medicine added' });
      }
      onSaved?.(values.name);
      onOpenChange(false);
    } catch {
      toast({
        variant: 'danger',
        title: isEditing ? "Couldn't update medicine" : "Couldn't add medicine",
      });
    }
  });

  return (
    <ResponsiveFormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Edit medicine' : 'Add medicine'}
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
          <Button type="submit" form="medicine-form" disabled={isSubmitting}>
            {isEditing ? 'Save changes' : 'Add'}
          </Button>
        </>
      }
    >
      <form
        id="medicine-form"
        onSubmit={onSubmit}
        className="gap-4 flex flex-col"
      >
        <LowConfidenceNotice
          fields={lowConfidenceFields}
          labels={MEDICINE_FIELD_LABELS}
        />

        <div className="gap-1.5 flex flex-col">
          <Label htmlFor="medicine-name">Name</Label>
          <Input
            id="medicine-name"
            aria-invalid={!!errors.name}
            {...register('name')}
          />
          {errors.name && (
            <p className="text-caption text-danger">{errors.name.message}</p>
          )}
        </div>
        <div className="gap-4 grid grid-cols-2">
          <div className="gap-1.5 flex flex-col">
            <Label htmlFor="medicine-dosage">Dosage</Label>
            <Input id="medicine-dosage" {...register('dosage')} />
          </div>
          <div className="gap-1.5 flex flex-col">
            <Label htmlFor="medicine-prescriber">Prescribed by</Label>
            <Input id="medicine-prescriber" {...register('prescribedBy')} />
          </div>
        </div>
        <div className="gap-4 grid grid-cols-2">
          <div className="gap-1.5 flex flex-col">
            <Label htmlFor="medicine-expires">Expires</Label>
            <Input
              id="medicine-expires"
              type="date"
              {...register('expiresAt')}
            />
          </div>
          <div className="gap-1.5 flex flex-col">
            <Label htmlFor="medicine-refill">Refill reminder</Label>
            <Input
              id="medicine-refill"
              type="date"
              {...register('refillReminderAt')}
            />
          </div>
        </div>
      </form>
    </ResponsiveFormSheet>
  );
}

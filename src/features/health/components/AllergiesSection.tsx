import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { ResponsiveFormSheet } from '@/components/shared/ResponsiveFormSheet';
import { Badge } from '@/components/ui/badge';
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
import { Skeleton } from '@/components/ui/skeleton';
import {
  useAllergies,
  useCreateAllergy,
  useDeleteAllergy,
} from '@/features/health/hooks/useHealth';
import {
  ALLERGY_SEVERITIES,
  type Allergy,
  type AllergyFormValues,
  allergyFormSchema,
} from '@/features/health/types';
import { useToast } from '@/hooks/useToast';

const SEVERITY_LABELS: Record<
  NonNullable<Allergy['severity']>,
  { label: string; variant: 'warning' | 'danger' | 'neutral' }
> = {
  mild: { label: 'Mild', variant: 'neutral' },
  moderate: { label: 'Moderate', variant: 'warning' },
  severe: { label: 'Severe', variant: 'danger' },
};

const DEFAULT_VALUES: AllergyFormValues = {
  name: '',
  severity: undefined,
  notes: '',
};

export function AllergiesSection() {
  const { data: allergies, isLoading, isError, refetch } = useAllergies();
  const createAllergy = useCreateAllergy();
  const deleteAllergy = useDeleteAllergy();
  const { toast } = useToast();
  const [formOpen, setFormOpen] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AllergyFormValues>({
    resolver: zodResolver(allergyFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createAllergy.mutateAsync(values);
      toast({ variant: 'success', title: 'Allergy added' });
      reset(DEFAULT_VALUES);
      setFormOpen(false);
    } catch {
      toast({ variant: 'danger', title: "Couldn't add allergy" });
    }
  });

  return (
    <div className="gap-3 flex flex-col">
      <div className="flex items-center justify-end">
        <Button size="sm" onClick={() => setFormOpen(true)}>
          <Plus aria-hidden="true" />
          Add allergy
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-16 w-full rounded-xl" />
      ) : isError ? (
        <ErrorState
          title="Couldn't load allergies"
          onRetry={() => void refetch()}
        />
      ) : !allergies || allergies.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title="No allergies recorded"
          description="Worth having on hand for a doctor visit or emergency."
          module="health"
          action={
            <Button onClick={() => setFormOpen(true)}>Add allergy</Button>
          }
        />
      ) : (
        <div className="gap-2 flex flex-wrap">
          {allergies.map((allergy) => (
            <span
              key={allergy.id}
              className="gap-2 py-1 pl-3 pr-1 flex items-center rounded-full border border-border bg-surface"
            >
              <span className="text-body-sm text-foreground">
                {allergy.name}
              </span>
              {allergy.severity && (
                <Badge variant={SEVERITY_LABELS[allergy.severity].variant}>
                  {SEVERITY_LABELS[allergy.severity].label}
                </Badge>
              )}
              <button
                type="button"
                aria-label={`Remove ${allergy.name}`}
                onClick={async () => {
                  await deleteAllergy.mutateAsync(allergy.id);
                  toast({ variant: 'success', title: 'Allergy removed' });
                }}
                className="size-6 flex shrink-0 items-center justify-center rounded-full text-foreground-tertiary hover:text-danger focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <X aria-hidden="true" className="size-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      <ResponsiveFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        title="Add allergy"
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setFormOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" form="allergy-form" disabled={isSubmitting}>
              Add
            </Button>
          </>
        }
      >
        <form
          id="allergy-form"
          onSubmit={onSubmit}
          className="gap-4 flex flex-col"
        >
          <div className="gap-1.5 flex flex-col">
            <Label htmlFor="allergy-name">Name</Label>
            <Input
              id="allergy-name"
              aria-invalid={!!errors.name}
              {...register('name')}
            />
            {errors.name && (
              <p className="text-caption text-danger">{errors.name.message}</p>
            )}
          </div>
          <div className="gap-1.5 flex flex-col">
            <Label htmlFor="allergy-severity">Severity</Label>
            <Controller
              control={control}
              name="severity"
              render={({ field }) => (
                <Select
                  value={field.value ?? 'none'}
                  onValueChange={(value) =>
                    field.onChange(value === 'none' ? undefined : value)
                  }
                >
                  <SelectTrigger id="allergy-severity">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unspecified</SelectItem>
                    {ALLERGY_SEVERITIES.map((severity) => (
                      <SelectItem key={severity} value={severity}>
                        {SEVERITY_LABELS[severity].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="gap-1.5 flex flex-col">
            <Label htmlFor="allergy-notes">Notes</Label>
            <Input id="allergy-notes" {...register('notes')} />
          </div>
        </form>
      </ResponsiveFormSheet>
    </div>
  );
}

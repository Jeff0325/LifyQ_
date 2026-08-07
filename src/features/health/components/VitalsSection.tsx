import { zodResolver } from '@hookform/resolvers/zod';
import { Activity, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';

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
  useCreateVital,
  useDeleteVital,
  useVitals,
} from '@/features/health/hooks/useHealth';
import {
  VITAL_TYPES,
  type VitalFormValues,
  type VitalReading,
  vitalFormSchema,
} from '@/features/health/types';
import { useToast } from '@/hooks/useToast';

const VITAL_TYPE_LABELS: Record<VitalReading['type'], string> = {
  blood_pressure: 'Blood Pressure',
  weight: 'Weight',
};

const DEFAULT_VALUES: VitalFormValues = {
  type: 'weight',
  date: '',
  unit: 'kg',
};

function describeReading(reading: VitalReading): string {
  if (reading.type === 'blood_pressure') {
    return `${reading.systolic}/${reading.diastolic} ${reading.unit}`;
  }
  return `${reading.value} ${reading.unit}`;
}

function VitalRow({ reading }: { reading: VitalReading }) {
  const deleteVital = useDeleteVital();
  const { toast } = useToast();

  return (
    <div className="gap-3 px-1 py-2 flex items-center border-b border-border-subtle">
      <Badge variant="neutral">{VITAL_TYPE_LABELS[reading.type]}</Badge>
      <span className="flex-1 text-body-sm text-foreground tabular-nums">
        {describeReading(reading)}
      </span>
      <span className="text-caption text-foreground-tertiary">
        {new Date(`${reading.date}T00:00:00`).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
        })}
      </span>
      <button
        type="button"
        aria-label="Remove reading"
        onClick={async () => {
          await deleteVital.mutateAsync(reading.id);
          toast({ variant: 'success', title: 'Reading removed' });
        }}
        className="size-7 flex shrink-0 items-center justify-center rounded-md text-foreground-tertiary hover:text-danger focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <X aria-hidden="true" className="size-3.5" />
      </button>
    </div>
  );
}

export function VitalsSection() {
  const { data: vitals, isLoading, isError, refetch } = useVitals();
  const createVital = useCreateVital();
  const { toast } = useToast();
  const [formOpen, setFormOpen] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VitalFormValues>({
    resolver: zodResolver(vitalFormSchema),
    defaultValues: DEFAULT_VALUES,
  });
  const type = useWatch({ control, name: 'type' });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createVital.mutateAsync(values);
      toast({ variant: 'success', title: 'Reading logged' });
      reset(DEFAULT_VALUES);
      setFormOpen(false);
    } catch {
      toast({ variant: 'danger', title: "Couldn't log reading" });
    }
  });

  const visible = [...(vitals ?? [])].sort((a, b) =>
    b.date.localeCompare(a.date),
  );

  return (
    <div className="gap-3 flex flex-col">
      <div className="flex items-center justify-end">
        <Button size="sm" onClick={() => setFormOpen(true)}>
          <Plus aria-hidden="true" />
          Log reading
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-24 w-full rounded-xl" />
      ) : isError ? (
        <ErrorState
          title="Couldn't load vitals"
          onRetry={() => void refetch()}
        />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No readings yet"
          description="Log a blood pressure or weight reading to track it over time."
          module="health"
          action={
            <Button onClick={() => setFormOpen(true)}>Log reading</Button>
          }
        />
      ) : (
        <div className="flex flex-col">
          {visible.map((reading) => (
            <VitalRow key={reading.id} reading={reading} />
          ))}
        </div>
      )}

      <ResponsiveFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        title="Log a reading"
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
            <Button type="submit" form="vital-form" disabled={isSubmitting}>
              Log
            </Button>
          </>
        }
      >
        <form
          id="vital-form"
          onSubmit={onSubmit}
          className="gap-4 flex flex-col"
        >
          <div className="gap-4 grid grid-cols-2">
            <div className="gap-1.5 flex flex-col">
              <Label htmlFor="vital-type">Type</Label>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="vital-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VITAL_TYPES.map((vitalType) => (
                        <SelectItem key={vitalType} value={vitalType}>
                          {VITAL_TYPE_LABELS[vitalType]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="gap-1.5 flex flex-col">
              <Label htmlFor="vital-date">Date</Label>
              <Input
                id="vital-date"
                type="date"
                aria-invalid={!!errors.date}
                {...register('date')}
              />
            </div>
          </div>

          {type === 'weight' ? (
            <div className="gap-4 grid grid-cols-2">
              <div className="gap-1.5 flex flex-col">
                <Label htmlFor="vital-value">Weight</Label>
                <Input
                  id="vital-value"
                  type="number"
                  step="0.1"
                  {...register('value', {
                    setValueAs: (v) => (v === '' ? undefined : Number(v)),
                  })}
                />
              </div>
              <div className="gap-1.5 flex flex-col">
                <Label htmlFor="vital-unit">Unit</Label>
                <Input id="vital-unit" placeholder="kg" {...register('unit')} />
              </div>
            </div>
          ) : (
            <div className="gap-4 grid grid-cols-3">
              <div className="gap-1.5 flex flex-col">
                <Label htmlFor="vital-systolic">Systolic</Label>
                <Input
                  id="vital-systolic"
                  type="number"
                  {...register('systolic', {
                    setValueAs: (v) => (v === '' ? undefined : Number(v)),
                  })}
                />
              </div>
              <div className="gap-1.5 flex flex-col">
                <Label htmlFor="vital-diastolic">Diastolic</Label>
                <Input
                  id="vital-diastolic"
                  type="number"
                  {...register('diastolic', {
                    setValueAs: (v) => (v === '' ? undefined : Number(v)),
                  })}
                />
              </div>
              <div className="gap-1.5 flex flex-col">
                <Label htmlFor="vital-unit-bp">Unit</Label>
                <Input
                  id="vital-unit-bp"
                  placeholder="mmHg"
                  {...register('unit')}
                />
              </div>
            </div>
          )}
          {errors.value && (
            <p className="text-caption text-danger">{errors.value.message}</p>
          )}
        </form>
      </ResponsiveFormSheet>
    </div>
  );
}

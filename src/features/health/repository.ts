import {
  createSupabaseRepository,
  orUndefined,
} from '@/data/createSupabaseRepository';
import type { Repository } from '@/data/types';
import type {
  Allergy,
  CreateAllergyInput,
  CreateHealthEventInput,
  CreateMedicineInput,
  CreateVitalInput,
  HealthEvent,
  Medicine,
  UpdateAllergyInput,
  UpdateHealthEventInput,
  UpdateMedicineInput,
  UpdateVitalInput,
  VitalReading,
} from '@/features/health/types';

export const medicinesRepository: Repository<
  Medicine,
  CreateMedicineInput,
  UpdateMedicineInput
> = createSupabaseRepository({
  table: 'medicines',
  fromRow: (row): Medicine => ({
    id: row.id as string,
    name: row.name as string,
    dosage: orUndefined(row.dosage as string | null),
    prescribedBy: orUndefined(row.prescribed_by as string | null),
    expiresAt: orUndefined(row.expires_at as string | null),
    refillReminderAt: orUndefined(row.refill_reminder_at as string | null),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }),
  toInsertRow: (input) => ({
    name: input.name,
    dosage: input.dosage,
    prescribed_by: input.prescribedBy,
    expires_at: input.expiresAt || null,
    refill_reminder_at: input.refillReminderAt || null,
  }),
  toUpdateRow: (input) => ({
    ...(input.name !== undefined && { name: input.name }),
    ...(input.dosage !== undefined && { dosage: input.dosage }),
    ...(input.prescribedBy !== undefined && {
      prescribed_by: input.prescribedBy,
    }),
    ...(input.expiresAt !== undefined && {
      expires_at: input.expiresAt || null,
    }),
    ...(input.refillReminderAt !== undefined && {
      refill_reminder_at: input.refillReminderAt || null,
    }),
  }),
});

export const healthEventsRepository: Repository<
  HealthEvent,
  CreateHealthEventInput,
  UpdateHealthEventInput
> = createSupabaseRepository({
  table: 'health_events',
  orderBy: { column: 'date', ascending: true },
  fromRow: (row): HealthEvent => ({
    id: row.id as string,
    type: row.type as HealthEvent['type'],
    title: row.title as string,
    date: row.date as string,
    provider: orUndefined(row.provider as string | null),
    notes: orUndefined(row.notes as string | null),
    nextDueDate: orUndefined(row.next_due_date as string | null),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }),
  toInsertRow: (input) => ({
    type: input.type,
    title: input.title,
    date: input.date,
    provider: input.provider,
    notes: input.notes,
    next_due_date: input.nextDueDate || null,
  }),
  toUpdateRow: (input) => ({
    ...(input.type !== undefined && { type: input.type }),
    ...(input.title !== undefined && { title: input.title }),
    ...(input.date !== undefined && { date: input.date }),
    ...(input.provider !== undefined && { provider: input.provider }),
    ...(input.notes !== undefined && { notes: input.notes }),
    ...(input.nextDueDate !== undefined && {
      next_due_date: input.nextDueDate || null,
    }),
  }),
});

export const vitalsRepository: Repository<
  VitalReading,
  CreateVitalInput,
  UpdateVitalInput
> = createSupabaseRepository({
  table: 'vital_readings',
  orderBy: { column: 'date', ascending: false },
  fromRow: (row): VitalReading => ({
    id: row.id as string,
    type: row.type as VitalReading['type'],
    date: row.date as string,
    systolic: orUndefined(row.systolic as number | null),
    diastolic: orUndefined(row.diastolic as number | null),
    value: (row.value as number | null) === null ? undefined : Number(row.value),
    unit: row.unit as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }),
  toInsertRow: (input) => ({
    type: input.type,
    date: input.date,
    systolic: input.systolic ?? null,
    diastolic: input.diastolic ?? null,
    value: input.value ?? null,
    unit: input.unit,
  }),
  toUpdateRow: (input) => ({
    ...(input.type !== undefined && { type: input.type }),
    ...(input.date !== undefined && { date: input.date }),
    ...(input.systolic !== undefined && { systolic: input.systolic ?? null }),
    ...(input.diastolic !== undefined && {
      diastolic: input.diastolic ?? null,
    }),
    ...(input.value !== undefined && { value: input.value ?? null }),
    ...(input.unit !== undefined && { unit: input.unit }),
  }),
});

export const allergiesRepository: Repository<
  Allergy,
  CreateAllergyInput,
  UpdateAllergyInput
> = createSupabaseRepository({
  table: 'allergies',
  fromRow: (row): Allergy => ({
    id: row.id as string,
    name: row.name as string,
    severity: orUndefined(row.severity as Allergy['severity'] | null),
    notes: orUndefined(row.notes as string | null),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }),
  toInsertRow: (input) => ({
    name: input.name,
    severity: input.severity ?? null,
    notes: input.notes,
  }),
  toUpdateRow: (input) => ({
    ...(input.name !== undefined && { name: input.name }),
    ...(input.severity !== undefined && {
      severity: input.severity ?? null,
    }),
    ...(input.notes !== undefined && { notes: input.notes }),
  }),
});

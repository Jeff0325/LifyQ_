import { z } from 'zod';

import type { BaseEntity } from '@/data/types';

// Four compact entities cover the full requested scope — Medicines and
// Prescriptions share one type (a prescription is a medicine plus a dosage
// schedule); Vaccinations and Doctor Visits share one dated-event type;
// Blood Pressure and Weight share one vitals-reading type. See
// docs/16_Data_Model_Plan.md for the rationale.

export interface Medicine extends BaseEntity {
  name: string;
  dosage?: string;
  prescribedBy?: string;
  expiresAt?: string;
  refillReminderAt?: string;
}

export const medicineFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(140),
  dosage: z.string().trim().max(80).optional(),
  prescribedBy: z.string().trim().max(140).optional(),
  expiresAt: z.string().optional(),
  refillReminderAt: z.string().optional(),
});
export type MedicineFormValues = z.infer<typeof medicineFormSchema>;
export type CreateMedicineInput = MedicineFormValues;
export type UpdateMedicineInput = Partial<MedicineFormValues>;

export const HEALTH_EVENT_TYPES = ['vaccination', 'doctor_visit'] as const;
export type HealthEventType = (typeof HEALTH_EVENT_TYPES)[number];

export interface HealthEvent extends BaseEntity {
  type: HealthEventType;
  title: string;
  date: string;
  provider?: string;
  notes?: string;
  nextDueDate?: string;
}

export const healthEventFormSchema = z.object({
  type: z.enum(HEALTH_EVENT_TYPES),
  title: z.string().trim().min(1, 'Title is required').max(140),
  date: z.string().min(1, 'Date is required'),
  provider: z.string().trim().max(140).optional(),
  notes: z.string().trim().max(2000).optional(),
  nextDueDate: z.string().optional(),
});
export type HealthEventFormValues = z.infer<typeof healthEventFormSchema>;
export type CreateHealthEventInput = HealthEventFormValues;
export type UpdateHealthEventInput = Partial<HealthEventFormValues>;

export const VITAL_TYPES = ['blood_pressure', 'weight'] as const;
export type VitalType = (typeof VITAL_TYPES)[number];

export interface VitalReading extends BaseEntity {
  type: VitalType;
  date: string;
  systolic?: number; // blood_pressure only
  diastolic?: number; // blood_pressure only
  value?: number; // weight only
  unit: string;
}

export const vitalFormSchema = z
  .object({
    type: z.enum(VITAL_TYPES),
    date: z.string().min(1, 'Date is required'),
    systolic: z.number().optional(),
    diastolic: z.number().optional(),
    value: z.number().optional(),
    unit: z.string().trim().min(1).max(20),
  })
  .refine(
    (data) =>
      data.type === 'weight'
        ? data.value !== undefined
        : data.systolic !== undefined && data.diastolic !== undefined,
    { message: 'Enter a value for this reading', path: ['value'] },
  );
export type VitalFormValues = z.infer<typeof vitalFormSchema>;
export type CreateVitalInput = VitalFormValues;
export type UpdateVitalInput = Partial<VitalFormValues>;

export const ALLERGY_SEVERITIES = ['mild', 'moderate', 'severe'] as const;
export type AllergySeverity = (typeof ALLERGY_SEVERITIES)[number];

export interface Allergy extends BaseEntity {
  name: string;
  severity?: AllergySeverity;
  notes?: string;
}

export const allergyFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(140),
  severity: z.enum(ALLERGY_SEVERITIES).optional(),
  notes: z.string().trim().max(500).optional(),
});
export type AllergyFormValues = z.infer<typeof allergyFormSchema>;
export type CreateAllergyInput = AllergyFormValues;
export type UpdateAllergyInput = Partial<AllergyFormValues>;

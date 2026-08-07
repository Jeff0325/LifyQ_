import { z } from 'zod';

import type { BaseEntity } from '@/data/types';

export const LIFE_RECORD_CATEGORIES = [
  'passport',
  'drivers_license',
  'national_id',
  'vehicle_registration',
  'insurance',
  'membership',
  'bank_card',
  'professional_license',
  'visa',
  'other',
] as const;
export type LifeRecordCategory = (typeof LIFE_RECORD_CATEGORIES)[number];

export interface LifeRecord extends BaseEntity {
  title: string;
  category: LifeRecordCategory;
  identifier?: string;
  issuedAt?: string;
  expiresAt?: string;
  issuingAuthority?: string;
}

export const lifeRecordFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(140),
  category: z.enum(LIFE_RECORD_CATEGORIES),
  identifier: z.string().trim().max(80).optional(),
  issuedAt: z.string().optional(),
  expiresAt: z.string().optional(),
  issuingAuthority: z.string().trim().max(140).optional(),
});

export type LifeRecordFormValues = z.infer<typeof lifeRecordFormSchema>;
export type CreateLifeRecordInput = LifeRecordFormValues;
export type UpdateLifeRecordInput = Partial<LifeRecordFormValues>;

export interface LifeRecordFilters {
  search: string;
  category: LifeRecordCategory | 'all';
}

export const DEFAULT_LIFE_RECORD_FILTERS: LifeRecordFilters = {
  search: '',
  category: 'all',
};

export const LIFE_RECORD_CATEGORY_LABELS: Record<LifeRecordCategory, string> = {
  passport: 'Passport',
  drivers_license: "Driver's License",
  national_id: 'National ID',
  vehicle_registration: 'Vehicle Registration',
  insurance: 'Insurance Policy',
  membership: 'Membership Card',
  bank_card: 'Bank Card',
  professional_license: 'Professional License',
  visa: 'Visa',
  other: 'Other',
};

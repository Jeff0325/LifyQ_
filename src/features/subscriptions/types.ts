import { z } from 'zod';

import type { BaseEntity } from '@/data/types';

export const SUBSCRIPTION_CATEGORIES = [
  'entertainment',
  'productivity',
  'ai_tools',
  'domains_hosting',
  'other',
] as const;
export type SubscriptionCategory = (typeof SUBSCRIPTION_CATEGORIES)[number];

export const BILLING_CYCLES = ['monthly', 'yearly'] as const;
export type BillingCycle = (typeof BILLING_CYCLES)[number];

export interface Subscription extends BaseEntity {
  serviceName: string;
  cost: number;
  billingCycle: BillingCycle;
  nextRenewalAt: string;
  category: SubscriptionCategory;
}

export const subscriptionFormSchema = z.object({
  serviceName: z.string().trim().min(1, 'Service name is required').max(140),
  cost: z.number().min(0),
  billingCycle: z.enum(BILLING_CYCLES),
  nextRenewalAt: z.string().min(1, 'Renewal date is required'),
  category: z.enum(SUBSCRIPTION_CATEGORIES),
});

export type SubscriptionFormValues = z.infer<typeof subscriptionFormSchema>;
export type CreateSubscriptionInput = SubscriptionFormValues;
export type UpdateSubscriptionInput = Partial<SubscriptionFormValues>;

export interface SubscriptionFilters {
  search: string;
  category: SubscriptionCategory | 'all';
}

export const DEFAULT_SUBSCRIPTION_FILTERS: SubscriptionFilters = {
  search: '',
  category: 'all',
};

export const SUBSCRIPTION_CATEGORY_LABELS: Record<
  SubscriptionCategory,
  string
> = {
  entertainment: 'Entertainment',
  productivity: 'Productivity',
  ai_tools: 'AI Tools',
  domains_hosting: 'Domains & Hosting',
  other: 'Other',
};

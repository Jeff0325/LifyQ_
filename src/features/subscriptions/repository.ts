import { createSupabaseRepository } from '@/data/createSupabaseRepository';
import type { Repository } from '@/data/types';
import type {
  CreateSubscriptionInput,
  Subscription,
  UpdateSubscriptionInput,
} from '@/features/subscriptions/types';

export type SubscriptionsRepository = Repository<
  Subscription,
  CreateSubscriptionInput,
  UpdateSubscriptionInput
>;

function fromRow(row: Record<string, unknown>): Subscription {
  return {
    id: row.id as string,
    serviceName: row.service_name as string,
    cost: Number(row.cost),
    billingCycle: row.billing_cycle as Subscription['billingCycle'],
    nextRenewalAt: row.next_renewal_at as string,
    category: row.category as Subscription['category'],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export const subscriptionsRepository: SubscriptionsRepository =
  createSupabaseRepository<
    Subscription,
    CreateSubscriptionInput,
    UpdateSubscriptionInput
  >({
    table: 'subscriptions',
    fromRow,
    orderBy: { column: 'next_renewal_at', ascending: true },
    toInsertRow: (input) => ({
      service_name: input.serviceName,
      cost: input.cost,
      billing_cycle: input.billingCycle,
      next_renewal_at: input.nextRenewalAt,
      category: input.category,
    }),
    toUpdateRow: (input) => ({
      ...(input.serviceName !== undefined && {
        service_name: input.serviceName,
      }),
      ...(input.cost !== undefined && { cost: input.cost }),
      ...(input.billingCycle !== undefined && {
        billing_cycle: input.billingCycle,
      }),
      ...(input.nextRenewalAt !== undefined && {
        next_renewal_at: input.nextRenewalAt,
      }),
      ...(input.category !== undefined && { category: input.category }),
    }),
  });

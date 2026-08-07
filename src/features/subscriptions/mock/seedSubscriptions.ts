import type { Subscription } from '@/features/subscriptions/types';

function timestamp(offsetDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString();
}

function isoDate(offsetDays: number): string {
  return timestamp(offsetDays).slice(0, 10);
}

export function seedSubscriptions(): Subscription[] {
  const base = (
    overrides: Partial<Subscription> &
      Pick<Subscription, 'serviceName' | 'cost' | 'category'>,
  ): Subscription =>
    ({
      id: crypto.randomUUID(),
      billingCycle: 'monthly',
      createdAt: timestamp(-200),
      updatedAt: timestamp(-200),
      ...overrides,
    }) as Subscription;

  return [
    base({
      serviceName: 'Netflix',
      cost: 15.49,
      category: 'entertainment',
      nextRenewalAt: isoDate(4),
    }),
    base({
      serviceName: 'Spotify',
      cost: 10.99,
      category: 'entertainment',
      nextRenewalAt: isoDate(11),
    }),
    base({
      serviceName: 'Claude',
      cost: 20,
      category: 'ai_tools',
      nextRenewalAt: isoDate(18),
    }),
    base({
      serviceName: 'Microsoft 365',
      cost: 99,
      category: 'productivity',
      billingCycle: 'yearly',
      nextRenewalAt: isoDate(210),
    }),
    base({
      serviceName: 'lifyq.app domain',
      cost: 14,
      category: 'domains_hosting',
      billingCycle: 'yearly',
      nextRenewalAt: isoDate(90),
    }),
  ];
}

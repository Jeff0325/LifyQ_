import { todayIso } from '@/lib/date';

export type ExpiryStatus = 'expired' | 'expiring_soon' | 'valid' | 'none';

/** "expiring_soon" = within 60 days — the window the Reminder Engine will eventually key off (docs/13 §10.1). */
export function describeExpiry(expiresAt?: string): ExpiryStatus {
  if (!expiresAt) return 'none';
  const today = todayIso();
  if (expiresAt < today) return 'expired';
  const daysUntil =
    (new Date(expiresAt).getTime() - new Date(today).getTime()) / 86_400_000;
  return daysUntil <= 60 ? 'expiring_soon' : 'valid';
}

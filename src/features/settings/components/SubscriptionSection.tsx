import { Check, Sparkles } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAccountBootstrap } from '@/features/settings/hooks/useAccountBootstrap';
import { cn } from '@/lib/utils';

type BillingCycle = 'monthly' | 'yearly';

const PRICING: Record<BillingCycle, { price: string; suffix: string }> = {
  monthly: { price: '₱199', suffix: '/month' },
  yearly: { price: '₱1,990', suffix: '/year' },
};

const YEARLY_SAVINGS = '₱398';

const PREMIUM_BENEFITS = [
  'Unlimited Jarvis conversations',
  'Unlimited Intelligent Capture (ICE)',
  'Voice Mode',
  'Advanced analytics and insights',
  'AI scheduling assistance',
  'Priority support',
  'Early access to new features',
  'OCR & document scanning (Coming Soon)',
  'Cross-device sync (Coming Soon)',
];

/** No real billing yet — plan status is read from Supabase (`account_plans`), ready to swap in Google Play Billing/Apple IAP later without UI changes. */
export function SubscriptionSection() {
  const [cycle, setCycle] = useState<BillingCycle>('monthly');
  const isYearly = cycle === 'yearly';

  const bootstrap = useAccountBootstrap();
  const plan = bootstrap.data?.plan.plan ?? 'free';
  const isPremium = plan === 'premium';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription</CardTitle>
      </CardHeader>
      <CardContent className="gap-4 flex flex-col">
        <div className="gap-2 flex items-center justify-between">
          <div>
            <p className="font-medium text-body-sm text-foreground">
              Current plan
            </p>
            <p className="text-caption text-foreground-tertiary">
              {isPremium ? 'Premium — thanks for supporting LifyQ.' : 'Free — no card on file.'}
            </p>
          </div>
          <Badge variant={isPremium ? 'brand' : 'neutral'}>
            {isPremium ? 'Premium' : 'Free'}
          </Badge>
        </div>

        <div className="p-4 gap-4 flex flex-col rounded-xl border border-border bg-surface-raised">
          <div className="gap-2 flex items-center">
            <Sparkles aria-hidden="true" className="size-4 text-brand-600" />
            <p className="font-semibold text-body-sm text-foreground">
              LifyQ Premium
            </p>
          </div>

          <div
            role="radiogroup"
            aria-label="Billing cycle"
            className="gap-0.5 p-0.5 flex items-center rounded-lg border border-border bg-surface"
          >
            {(['monthly', 'yearly'] as const).map((value) => {
              const active = cycle === value;
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setCycle(value)}
                  className={cn(
                    'gap-1.5 px-3 py-2 duration-base ease-standard font-medium flex flex-1 items-center justify-center rounded-md text-body-sm transition-colors',
                    active
                      ? 'bg-brand-600 text-foreground-on-brand'
                      : 'text-foreground-secondary hover:bg-surface-raised',
                  )}
                >
                  {value === 'monthly' ? 'Monthly' : 'Yearly'}
                  {value === 'yearly' && (
                    <Badge
                      variant={active ? 'neutral' : 'brand'}
                      className={cn(
                        active &&
                          'bg-white/20 border-transparent text-foreground-on-brand',
                      )}
                    >
                      Best Value
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>

          <div className="gap-1 flex flex-col">
            <div className="gap-1.5 flex items-baseline">
              <span className="font-semibold text-h2 text-foreground tabular-nums">
                {PRICING[cycle].price}
              </span>
              <span className="text-body-sm text-foreground-tertiary">
                {PRICING[cycle].suffix}
              </span>
            </div>
            {isYearly && (
              <p className="font-medium text-caption text-success">
                Save {YEARLY_SAVINGS}/year — about 2 months free compared to
                paying monthly.
              </p>
            )}
          </div>

          <div className="gap-1.5 flex flex-col">
            <p className="font-medium tracking-wider text-caption text-foreground-tertiary uppercase">
              Premium Benefits
            </p>
            <ul className="gap-1.5 flex flex-col">
              {PREMIUM_BENEFITS.map((perk) => (
                <li
                  key={perk}
                  className="gap-2 flex items-start text-caption text-foreground-secondary"
                >
                  <Check
                    aria-hidden="true"
                    className="mt-0.5 size-3.5 shrink-0 text-brand-600"
                  />
                  {perk}
                </li>
              ))}
            </ul>
          </div>

          {isPremium ? (
            <p className="text-caption text-foreground-tertiary">
              You&apos;re already on Premium.
            </p>
          ) : (
            <>
              <Button type="button" className="w-fit" disabled>
                Upgrade to Premium — {PRICING[cycle].price}
                {PRICING[cycle].suffix}
              </Button>
              <p className="text-caption text-foreground-tertiary">
                Billing isn&apos;t live yet — this is a preview of what&apos;s
                coming.
              </p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

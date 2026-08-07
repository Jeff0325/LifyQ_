import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { ResponsiveFormSheet } from '@/components/shared/ResponsiveFormSheet';
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
import {
  useCreateSubscription,
  useUpdateSubscription,
} from '@/features/subscriptions/hooks/useSubscriptions';
import {
  BILLING_CYCLES,
  SUBSCRIPTION_CATEGORIES,
  SUBSCRIPTION_CATEGORY_LABELS,
  type Subscription,
  type SubscriptionFormValues,
  subscriptionFormSchema,
} from '@/features/subscriptions/types';
import { useToast } from '@/hooks/useToast';

const BILLING_CYCLE_LABELS: Record<(typeof BILLING_CYCLES)[number], string> = {
  monthly: 'Monthly',
  yearly: 'Yearly',
};

const DEFAULT_VALUES: SubscriptionFormValues = {
  serviceName: '',
  cost: 0,
  billingCycle: 'monthly',
  nextRenewalAt: '',
  category: 'other',
};

export interface SubscriptionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscription?: Subscription;
}

export function SubscriptionFormDialog({
  open,
  onOpenChange,
  subscription,
}: SubscriptionFormDialogProps) {
  const isEditing = !!subscription;
  const createSubscription = useCreateSubscription();
  const updateSubscription = useUpdateSubscription();
  const { toast } = useToast();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SubscriptionFormValues>({
    resolver: zodResolver(subscriptionFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (open) {
      reset(
        subscription
          ? {
              serviceName: subscription.serviceName,
              cost: subscription.cost,
              billingCycle: subscription.billingCycle,
              nextRenewalAt: subscription.nextRenewalAt,
              category: subscription.category,
            }
          : DEFAULT_VALUES,
      );
    }
  }, [open, subscription, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (isEditing) {
        await updateSubscription.mutateAsync({
          id: subscription.id,
          input: values,
        });
        toast({ variant: 'success', title: 'Subscription updated' });
      } else {
        await createSubscription.mutateAsync(values);
        toast({ variant: 'success', title: 'Subscription added' });
      }
      onOpenChange(false);
    } catch {
      toast({
        variant: 'danger',
        title: isEditing
          ? "Couldn't update subscription"
          : "Couldn't add subscription",
        description: 'Please try again.',
      });
    }
  });

  return (
    <ResponsiveFormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Edit subscription' : 'New subscription'}
      footer={
        <>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="subscription-form"
            disabled={isSubmitting}
          >
            {isEditing ? 'Save changes' : 'Add subscription'}
          </Button>
        </>
      }
    >
      <form
        id="subscription-form"
        onSubmit={onSubmit}
        className="gap-4 flex flex-col"
      >
        <div className="gap-1.5 flex flex-col">
          <Label htmlFor="sub-name">Service</Label>
          <Input
            id="sub-name"
            placeholder="Netflix"
            aria-invalid={!!errors.serviceName}
            {...register('serviceName')}
          />
          {errors.serviceName && (
            <p className="text-caption text-danger">
              {errors.serviceName.message}
            </p>
          )}
        </div>

        <div className="gap-4 grid grid-cols-2">
          <div className="gap-1.5 flex flex-col">
            <Label htmlFor="sub-cost">Cost</Label>
            <Input
              id="sub-cost"
              type="number"
              step="0.01"
              aria-invalid={!!errors.cost}
              {...register('cost', { setValueAs: (v) => Number(v) })}
            />
          </div>
          <div className="gap-1.5 flex flex-col">
            <Label htmlFor="sub-cycle">Billing cycle</Label>
            <Controller
              control={control}
              name="billingCycle"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="sub-cycle">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BILLING_CYCLES.map((cycle) => (
                      <SelectItem key={cycle} value={cycle}>
                        {BILLING_CYCLE_LABELS[cycle]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        <div className="gap-4 grid grid-cols-2">
          <div className="gap-1.5 flex flex-col">
            <Label htmlFor="sub-renewal">Next renewal</Label>
            <Input
              id="sub-renewal"
              type="date"
              aria-invalid={!!errors.nextRenewalAt}
              {...register('nextRenewalAt')}
            />
            {errors.nextRenewalAt && (
              <p className="text-caption text-danger">
                {errors.nextRenewalAt.message}
              </p>
            )}
          </div>
          <div className="gap-1.5 flex flex-col">
            <Label htmlFor="sub-category">Category</Label>
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="sub-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBSCRIPTION_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {SUBSCRIPTION_CATEGORY_LABELS[category]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
      </form>
    </ResponsiveFormSheet>
  );
}

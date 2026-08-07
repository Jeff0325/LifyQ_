import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDeleteSubscription } from '@/features/subscriptions/hooks/useSubscriptions';
import {
  type Subscription,
  SUBSCRIPTION_CATEGORY_LABELS,
} from '@/features/subscriptions/types';
import { useToast } from '@/hooks/useToast';

export interface SubscriptionCardProps {
  subscription: Subscription;
  onEdit: (subscription: Subscription) => void;
}

export function SubscriptionCard({
  subscription,
  onEdit,
}: SubscriptionCardProps) {
  const deleteSubscription = useDeleteSubscription();
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDelete = async () => {
    await deleteSubscription.mutateAsync(subscription.id);
    setConfirmOpen(false);
    toast({ variant: 'success', title: 'Subscription deleted' });
  };

  return (
    <Card className="min-w-0 gap-2 p-4 flex flex-col">
      <div className="gap-2 flex items-start justify-between">
        <div className="min-w-0 gap-1 flex flex-col">
          <Badge variant="neutral" className="w-fit">
            {SUBSCRIPTION_CATEGORY_LABELS[subscription.category]}
          </Badge>
          <h3 className="font-semibold truncate text-body-sm text-foreground">
            {subscription.serviceName}
          </h3>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={`More actions for ${subscription.serviceName}`}
              className="size-8 flex shrink-0 items-center justify-center rounded-md text-foreground-tertiary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <MoreVertical aria-hidden="true" className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => onEdit(subscription)}>
              <Pencil aria-hidden="true" className="size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem destructive onSelect={() => setConfirmOpen(true)}>
              <Trash2 aria-hidden="true" className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-baseline justify-between">
        <span className="font-semibold text-h3 text-foreground tabular-nums">
          ${subscription.cost.toFixed(2)}
        </span>
        <span className="text-caption text-foreground-tertiary">
          / {subscription.billingCycle === 'monthly' ? 'mo' : 'yr'}
        </span>
      </div>

      <p className="text-caption text-foreground-tertiary">
        Renews{' '}
        {new Date(`${subscription.nextRenewalAt}T00:00:00`).toLocaleDateString(
          undefined,
          { month: 'short', day: 'numeric', year: 'numeric' },
        )}
      </p>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this subscription?"
        description={`"${subscription.serviceName}" will be removed. This can't be undone.`}
        confirmLabel="Delete"
        destructive
        loading={deleteSubscription.isPending}
        onConfirm={handleDelete}
      />
    </Card>
  );
}

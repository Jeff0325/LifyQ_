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
import { useDeleteLifeRecord } from '@/features/life-records/hooks/useLifeRecords';
import {
  LIFE_RECORD_CATEGORY_LABELS,
  type LifeRecord,
} from '@/features/life-records/types';
import {
  describeExpiry,
  type ExpiryStatus,
} from '@/features/life-records/utils';
import { useToast } from '@/hooks/useToast';

const STATUS_BADGE: Record<
  ExpiryStatus,
  {
    label: string;
    variant: 'danger' | 'warning' | 'success' | 'neutral';
  } | null
> = {
  expired: { label: 'Expired', variant: 'danger' },
  expiring_soon: { label: 'Expiring soon', variant: 'warning' },
  valid: { label: 'Valid', variant: 'success' },
  none: null,
};

export interface LifeRecordCardProps {
  record: LifeRecord;
  onEdit: (record: LifeRecord) => void;
}

export function LifeRecordCard({ record, onEdit }: LifeRecordCardProps) {
  const deleteRecord = useDeleteLifeRecord();
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const status = describeExpiry(record.expiresAt);
  const statusBadge = STATUS_BADGE[status];

  const handleDelete = async () => {
    await deleteRecord.mutateAsync(record.id);
    setConfirmOpen(false);
    toast({ variant: 'success', title: 'Record deleted' });
  };

  return (
    <Card className="min-w-0 gap-2 p-4 flex flex-col">
      <div className="gap-2 flex items-start justify-between">
        <div className="min-w-0 gap-1 flex flex-col">
          <Badge variant="neutral" className="w-fit">
            {LIFE_RECORD_CATEGORY_LABELS[record.category]}
          </Badge>
          <h3 className="font-semibold truncate text-body-sm text-foreground">
            {record.title}
          </h3>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={`More actions for ${record.title}`}
              className="size-8 flex shrink-0 items-center justify-center rounded-md text-foreground-tertiary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <MoreVertical aria-hidden="true" className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => onEdit(record)}>
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

      {record.issuingAuthority && (
        <p className="text-caption text-foreground-tertiary">
          {record.issuingAuthority}
          {record.identifier && ` · ${record.identifier}`}
        </p>
      )}

      <div className="gap-2 flex items-center">
        {statusBadge && (
          <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
        )}
        {record.expiresAt && (
          <span className="text-caption text-foreground-tertiary">
            Expires{' '}
            {new Date(`${record.expiresAt}T00:00:00`).toLocaleDateString(
              undefined,
              {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              },
            )}
          </span>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this record?"
        description={`"${record.title}" will be removed. This can't be undone.`}
        confirmLabel="Delete"
        destructive
        loading={deleteRecord.isPending}
        onConfirm={handleDelete}
      />
    </Card>
  );
}

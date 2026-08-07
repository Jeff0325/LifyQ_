import { MoreVertical, Pencil, Pill, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { MedicineFormDialog } from '@/features/health/components/MedicineFormDialog';
import {
  useDeleteMedicine,
  useMedicines,
} from '@/features/health/hooks/useHealth';
import type { Medicine } from '@/features/health/types';
import { useToast } from '@/hooks/useToast';
import { todayIso } from '@/lib/date';

function MedicineRow({
  medicine,
  onEdit,
}: {
  medicine: Medicine;
  onEdit: (medicine: Medicine) => void;
}) {
  const deleteMedicine = useDeleteMedicine();
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const expired = !!medicine.expiresAt && medicine.expiresAt < todayIso();

  const handleDelete = async () => {
    await deleteMedicine.mutateAsync(medicine.id);
    setConfirmOpen(false);
    toast({ variant: 'success', title: 'Medicine deleted' });
  };

  return (
    <Card className="min-w-0 gap-2 p-4 flex flex-col">
      <div className="gap-2 flex items-start justify-between">
        <div className="min-w-0 flex flex-col">
          <h3 className="font-semibold truncate text-body-sm text-foreground">
            {medicine.name}
          </h3>
          {medicine.dosage && (
            <p className="text-caption text-foreground-tertiary">
              {medicine.dosage}
            </p>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={`More actions for ${medicine.name}`}
              className="size-8 flex shrink-0 items-center justify-center rounded-md text-foreground-tertiary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <MoreVertical aria-hidden="true" className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => onEdit(medicine)}>
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
      {expired && <Badge variant="danger">Expired</Badge>}
      {medicine.expiresAt && !expired && (
        <p className="text-caption text-foreground-tertiary">
          Expires{' '}
          {new Date(`${medicine.expiresAt}T00:00:00`).toLocaleDateString(
            undefined,
            {
              month: 'short',
              day: 'numeric',
            },
          )}
        </p>
      )}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this medicine?"
        description={`"${medicine.name}" will be removed. This can't be undone.`}
        confirmLabel="Delete"
        destructive
        loading={deleteMedicine.isPending}
        onConfirm={handleDelete}
      />
    </Card>
  );
}

export function MedicinesSection() {
  const { data: medicines, isLoading, isError, refetch } = useMedicines();
  const [formOpen, setFormOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | undefined>(
    undefined,
  );

  const openCreate = () => {
    setEditingMedicine(undefined);
    setFormOpen(true);
  };

  const openEdit = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    setFormOpen(true);
  };

  return (
    <div className="gap-3 flex flex-col">
      <div className="flex items-center justify-end">
        <Button size="sm" onClick={openCreate}>
          <Plus aria-hidden="true" />
          Add medicine
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-24 w-full rounded-xl" />
      ) : isError ? (
        <ErrorState
          title="Couldn't load medicines"
          onRetry={() => void refetch()}
        />
      ) : !medicines || medicines.length === 0 ? (
        <EmptyState
          icon={Pill}
          title="No medicines yet"
          description="Track a prescription or supplement to catch it before it expires."
          module="health"
          action={<Button onClick={openCreate}>Add medicine</Button>}
        />
      ) : (
        <div className="gap-3 sm:grid-cols-2 grid grid-cols-1">
          {medicines.map((medicine) => (
            <MedicineRow
              key={medicine.id}
              medicine={medicine}
              onEdit={openEdit}
            />
          ))}
        </div>
      )}

      <MedicineFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        medicine={editingMedicine}
      />
    </div>
  );
}

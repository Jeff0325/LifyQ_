import { zodResolver } from '@hookform/resolvers/zod';
import {
  CalendarHeart,
  MoreVertical,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { ResponsiveFormSheet } from '@/components/shared/ResponsiveFormSheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useCreateHealthEvent,
  useDeleteHealthEvent,
  useHealthEvents,
  useUpdateHealthEvent,
} from '@/features/health/hooks/useHealth';
import {
  HEALTH_EVENT_TYPES,
  type HealthEvent,
  type HealthEventFormValues,
  healthEventFormSchema,
} from '@/features/health/types';
import { useToast } from '@/hooks/useToast';

const EVENT_TYPE_LABELS: Record<HealthEvent['type'], string> = {
  vaccination: 'Vaccination',
  doctor_visit: 'Doctor Visit',
};

const DEFAULT_VALUES: HealthEventFormValues = {
  type: 'doctor_visit',
  title: '',
  date: '',
  provider: '',
  notes: '',
  nextDueDate: '',
};

function EventRow({
  event,
  onEdit,
}: {
  event: HealthEvent;
  onEdit: (event: HealthEvent) => void;
}) {
  const deleteEvent = useDeleteHealthEvent();
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDelete = async () => {
    await deleteEvent.mutateAsync(event.id);
    setConfirmOpen(false);
    toast({ variant: 'success', title: 'Event deleted' });
  };

  return (
    <div className="gap-3 px-1 py-3 flex items-center border-b border-border-subtle">
      <div className="min-w-0 flex-1">
        <div className="gap-2 flex items-center">
          <Badge variant="neutral">{EVENT_TYPE_LABELS[event.type]}</Badge>
          <p className="truncate text-body-sm text-foreground">{event.title}</p>
        </div>
        <p className="mt-1 text-caption text-foreground-tertiary">
          {new Date(`${event.date}T00:00:00`).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
          {event.provider && ` · ${event.provider}`}
        </p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`More actions for ${event.title}`}
            className="size-8 flex shrink-0 items-center justify-center rounded-md text-foreground-tertiary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <MoreVertical aria-hidden="true" className="size-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => onEdit(event)}>
            <Pencil aria-hidden="true" className="size-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem destructive onSelect={() => setConfirmOpen(true)}>
            <Trash2 aria-hidden="true" className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this event?"
        description={`"${event.title}" will be removed. This can't be undone.`}
        confirmLabel="Delete"
        destructive
        loading={deleteEvent.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export function HealthEventsSection() {
  const { data: events, isLoading, isError, refetch } = useHealthEvents();
  const createEvent = useCreateHealthEvent();
  const updateEvent = useUpdateHealthEvent();
  const { toast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<HealthEvent | undefined>(
    undefined,
  );
  const isEditing = !!editingEvent;

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<HealthEventFormValues>({
    resolver: zodResolver(healthEventFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (formOpen) {
      reset(
        editingEvent
          ? {
              type: editingEvent.type,
              title: editingEvent.title,
              date: editingEvent.date,
              provider: editingEvent.provider ?? '',
              notes: editingEvent.notes ?? '',
              nextDueDate: editingEvent.nextDueDate ?? '',
            }
          : DEFAULT_VALUES,
      );
    }
  }, [formOpen, editingEvent, reset]);

  const openCreate = () => {
    setEditingEvent(undefined);
    setFormOpen(true);
  };

  const openEdit = (event: HealthEvent) => {
    setEditingEvent(event);
    setFormOpen(true);
  };

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (isEditing) {
        await updateEvent.mutateAsync({ id: editingEvent.id, input: values });
        toast({ variant: 'success', title: 'Event updated' });
      } else {
        await createEvent.mutateAsync(values);
        toast({ variant: 'success', title: 'Event added' });
      }
      setFormOpen(false);
    } catch {
      toast({
        variant: 'danger',
        title: isEditing ? "Couldn't update event" : "Couldn't add event",
      });
    }
  });

  const visible = [...(events ?? [])].sort((a, b) =>
    b.date.localeCompare(a.date),
  );

  return (
    <div className="gap-3 flex flex-col">
      <div className="flex items-center justify-end">
        <Button size="sm" onClick={openCreate}>
          <Plus aria-hidden="true" />
          Add event
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-24 w-full rounded-xl" />
      ) : isError ? (
        <ErrorState
          title="Couldn't load events"
          onRetry={() => void refetch()}
        />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={CalendarHeart}
          title="No vaccinations or visits logged"
          description="Track a doctor visit or vaccination to keep the history in one place."
          module="health"
          action={<Button onClick={openCreate}>Add event</Button>}
        />
      ) : (
        <div className="flex flex-col">
          {visible.map((event) => (
            <EventRow key={event.id} event={event} onEdit={openEdit} />
          ))}
        </div>
      )}

      <ResponsiveFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        title={
          isEditing
            ? 'Edit vaccination or doctor visit'
            : 'Add vaccination or doctor visit'
        }
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setFormOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="health-event-form"
              disabled={isSubmitting}
            >
              {isEditing ? 'Save changes' : 'Add'}
            </Button>
          </>
        }
      >
        <form
          id="health-event-form"
          onSubmit={onSubmit}
          className="gap-4 flex flex-col"
        >
          <div className="gap-4 grid grid-cols-2">
            <div className="gap-1.5 flex flex-col">
              <Label htmlFor="event-type">Type</Label>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="event-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {HEALTH_EVENT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {EVENT_TYPE_LABELS[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="gap-1.5 flex flex-col">
              <Label htmlFor="event-date">Date</Label>
              <Input
                id="event-date"
                type="date"
                aria-invalid={!!errors.date}
                {...register('date')}
              />
            </div>
          </div>
          <div className="gap-1.5 flex flex-col">
            <Label htmlFor="event-title">Title</Label>
            <Input
              id="event-title"
              placeholder="Annual physical"
              aria-invalid={!!errors.title}
              {...register('title')}
            />
            {errors.title && (
              <p className="text-caption text-danger">{errors.title.message}</p>
            )}
          </div>
          <div className="gap-4 grid grid-cols-2">
            <div className="gap-1.5 flex flex-col">
              <Label htmlFor="event-provider">Provider</Label>
              <Input id="event-provider" {...register('provider')} />
            </div>
            <div className="gap-1.5 flex flex-col">
              <Label htmlFor="event-next-due">Next due</Label>
              <Input
                id="event-next-due"
                type="date"
                {...register('nextDueDate')}
              />
            </div>
          </div>
        </form>
      </ResponsiveFormSheet>
    </div>
  );
}

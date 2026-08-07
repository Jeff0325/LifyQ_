import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { ResponsiveFormSheet } from '@/components/shared/ResponsiveFormSheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LowConfidenceNotice } from '@/features/assistant/components/LowConfidenceNotice';
import {
  useCreateEvent,
  useUpdateEvent,
} from '@/features/calendar/hooks/useEvents';
import {
  type CalendarEvent,
  type EventFormValues,
  eventFormSchema,
} from '@/features/calendar/types';
import { todayIso } from '@/features/calendar/utils';
import { useToast } from '@/hooks/useToast';

export interface EventFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: CalendarEvent;
  /** Pre-fill the date when creating from a specific day (e.g. the date strip). */
  defaultDate?: string;
  /** Pre-fills a fresh (non-editing) form, or overrides fields on top of an
   * edited event — the ICE confirm-before-save seam, matching every other
   * domain's FormDialog. */
  initialValues?: Partial<EventFormValues>;
  description?: string;
  lowConfidenceFields?: Set<string>;
  onSaved?: (label: string) => void;
}

const EVENT_FIELD_LABELS: Record<string, string> = {
  title: 'title',
  date: 'date',
  startTime: 'start time',
};

export function EventFormDialog({
  open,
  onOpenChange,
  event,
  defaultDate,
  initialValues,
  description,
  lowConfidenceFields,
  onSaved,
}: EventFormDialogProps) {
  const isEditing = !!event;
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: '',
      date: defaultDate ?? todayIso(),
      startTime: '',
      endTime: '',
      location: '',
    },
  });

  useEffect(() => {
    if (open) {
      reset(
        event
          ? {
              title: event.title,
              date: event.date,
              startTime: event.startTime ?? '',
              endTime: event.endTime ?? '',
              location: event.location ?? '',
              ...initialValues,
            }
          : {
              title: '',
              date: defaultDate ?? todayIso(),
              startTime: '',
              endTime: '',
              location: '',
              ...initialValues,
            },
      );
    }
  }, [open, event, defaultDate, initialValues, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (isEditing) {
        await updateEvent.mutateAsync({ id: event.id, input: values });
        toast({ variant: 'success', title: 'Event updated' });
      } else {
        await createEvent.mutateAsync(values);
        toast({ variant: 'success', title: 'Event created' });
      }
      onSaved?.(values.title);
      onOpenChange(false);
    } catch {
      toast({
        variant: 'danger',
        title: isEditing ? "Couldn't update event" : "Couldn't create event",
        description: 'Please try again.',
      });
    }
  });

  return (
    <ResponsiveFormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Edit event' : 'New event'}
      description={description}
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
          <Button type="submit" form="event-form" disabled={isSubmitting}>
            {isEditing ? 'Save changes' : 'Create event'}
          </Button>
        </>
      }
    >
      <form id="event-form" onSubmit={onSubmit} className="gap-4 flex flex-col">
        <LowConfidenceNotice
          fields={lowConfidenceFields}
          labels={EVENT_FIELD_LABELS}
        />
        <div className="gap-1.5 flex flex-col">
          <Label htmlFor="event-title">Title</Label>
          <Input
            id="event-title"
            placeholder="Product roadmap review"
            aria-invalid={!!errors.title}
            {...register('title')}
          />
          {errors.title && (
            <p className="text-caption text-danger">{errors.title.message}</p>
          )}
        </div>

        <div className="gap-1.5 flex flex-col">
          <Label htmlFor="event-date">Date</Label>
          <Input
            id="event-date"
            type="date"
            aria-invalid={!!errors.date}
            {...register('date')}
          />
          {errors.date && (
            <p className="text-caption text-danger">{errors.date.message}</p>
          )}
        </div>

        <div className="gap-4 grid grid-cols-2">
          <div className="gap-1.5 flex flex-col">
            <Label htmlFor="event-start">Start time</Label>
            <Input id="event-start" type="time" {...register('startTime')} />
          </div>
          <div className="gap-1.5 flex flex-col">
            <Label htmlFor="event-end">End time</Label>
            <Input
              id="event-end"
              type="time"
              aria-invalid={!!errors.endTime}
              {...register('endTime')}
            />
            {errors.endTime && (
              <p className="text-caption text-danger">
                {errors.endTime.message}
              </p>
            )}
          </div>
        </div>

        <div className="gap-1.5 flex flex-col">
          <Label htmlFor="event-location">Location</Label>
          <Input
            id="event-location"
            placeholder="Optional"
            {...register('location')}
          />
        </div>
      </form>
    </ResponsiveFormSheet>
  );
}

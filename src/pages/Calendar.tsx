import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';

import { PageContainer } from '@/components/shared/PageContainer';
import { ErrorState } from '@/components/shared/ErrorState';
import { Button } from '@/components/ui/button';
import { useJarvisPageContext } from '@/features/assistant/hooks/useJarvisPageContext';
import {
  CalendarSkeleton,
  DailyAgenda,
  DateStrip,
  EventFormDialog,
  UpcomingEvents,
  useEvents,
} from '@/features/calendar';
import type { CalendarEvent } from '@/features/calendar/types';
import { formatFriendlyDate, todayIso } from '@/features/calendar/utils';

export function Calendar() {
  const [selectedDate, setSelectedDate] = useState(todayIso());
  const [formOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | undefined>(
    undefined,
  );
  const { data: events, isLoading, isError, refetch } = useEvents();
  useJarvisPageContext('Calendar', 'your calendar', 'calendar-event');

  const markedDates = useMemo(
    () => new Set((events ?? []).map((event) => event.date)),
    [events],
  );
  const dayEvents = useMemo(
    () => (events ?? []).filter((event) => event.date === selectedDate),
    [events, selectedDate],
  );

  const openCreate = () => {
    setEditingEvent(undefined);
    setFormOpen(true);
  };

  const openEdit = (event: CalendarEvent) => {
    setEditingEvent(event);
    setFormOpen(true);
  };

  return (
    <PageContainer size="lg" className="gap-5 flex flex-col">
      <div className="gap-3 flex items-center justify-between">
        <h2 className="font-semibold text-h2 text-foreground">Calendar</h2>
        <Button onClick={openCreate} size="sm">
          <Plus aria-hidden="true" />
          New event
        </Button>
      </div>

      {isLoading ? (
        <CalendarSkeleton />
      ) : isError ? (
        <ErrorState
          title="Couldn't load your calendar"
          onRetry={() => void refetch()}
        />
      ) : (
        <div className="gap-6 lg:grid-cols-[1fr_320px] grid grid-cols-1">
          <div className="gap-4 flex flex-col">
            <DateStrip
              selectedDate={selectedDate}
              onSelect={setSelectedDate}
              markedDates={markedDates}
            />
            <div>
              <h3 className="mb-2 font-semibold text-h3 text-foreground">
                {formatFriendlyDate(selectedDate)}
              </h3>
              <DailyAgenda
                events={dayEvents}
                onEdit={openEdit}
                onCreate={openCreate}
              />
            </div>
          </div>

          <div className="p-4 lg:sticky lg:top-20 h-fit rounded-xl border border-border bg-surface">
            <h3 className="mb-3 font-semibold text-h3 text-foreground">
              Upcoming
            </h3>
            <UpcomingEvents events={events ?? []} />
          </div>
        </div>
      )}

      <EventFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        event={editingEvent}
        defaultDate={selectedDate}
      />
    </PageContainer>
  );
}

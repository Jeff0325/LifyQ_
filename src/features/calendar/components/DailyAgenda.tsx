import { CalendarPlus } from 'lucide-react';

import { EmptyState } from '@/components/shared/EmptyState';
import { StaggerItem, StaggerList } from '@/components/shared/motion';
import { Button } from '@/components/ui/button';
import { EventListItem } from '@/features/calendar/components/EventListItem';
import type { CalendarEvent } from '@/features/calendar/types';
import { sortEventsByTime } from '@/features/calendar/utils';

export interface DailyAgendaProps {
  events: CalendarEvent[];
  onEdit: (event: CalendarEvent) => void;
  onCreate: () => void;
}

export function DailyAgenda({ events, onEdit, onCreate }: DailyAgendaProps) {
  if (events.length === 0) {
    return (
      <EmptyState
        icon={CalendarPlus}
        module="calendar"
        title="Nothing scheduled"
        description="This day is wide open."
        action={
          <Button size="sm" onClick={onCreate}>
            Add event
          </Button>
        }
        className="py-10"
      />
    );
  }

  return (
    <StaggerList className="flex flex-col">
      {sortEventsByTime(events).map((event) => (
        <StaggerItem key={event.id}>
          <EventListItem event={event} onEdit={onEdit} />
        </StaggerItem>
      ))}
    </StaggerList>
  );
}

import {
  createSupabaseRepository,
  orUndefined,
} from '@/data/createSupabaseRepository';
import type { Repository } from '@/data/types';
import type {
  CalendarEvent,
  CreateEventInput,
  UpdateEventInput,
} from '@/features/calendar/types';

export type EventsRepository = Repository<
  CalendarEvent,
  CreateEventInput,
  UpdateEventInput
>;

function fromRow(row: Record<string, unknown>): CalendarEvent {
  return {
    id: row.id as string,
    title: row.title as string,
    date: row.date as string,
    startTime: orUndefined(row.start_time as string | null),
    endTime: orUndefined(row.end_time as string | null),
    location: orUndefined(row.location as string | null),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export const eventsRepository: EventsRepository = createSupabaseRepository<
  CalendarEvent,
  CreateEventInput,
  UpdateEventInput
>({
  table: 'calendar_events',
  fromRow,
  orderBy: { column: 'date', ascending: true },
  toInsertRow: (input) => ({
    title: input.title,
    date: input.date,
    start_time: input.startTime,
    end_time: input.endTime,
    location: input.location,
  }),
  toUpdateRow: (input) => ({
    ...(input.title !== undefined && { title: input.title }),
    ...(input.date !== undefined && { date: input.date }),
    ...(input.startTime !== undefined && { start_time: input.startTime }),
    ...(input.endTime !== undefined && { end_time: input.endTime }),
    ...(input.location !== undefined && { location: input.location }),
  }),
});
